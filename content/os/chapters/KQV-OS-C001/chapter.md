---
id: KQV-OS-C001
course: "Course 4: Operating Systems and Embedded Linux"
chapter_number: 1
title: "What an Operating System Does"
subtitle: "From firmware that runs alone to a kernel that hides the hardware, keeps programs apart and shares the processor, watched step by step on a real Linux system."
language: en
version: 0.1.0
status: code_checked
publication_status: published
---

# Chapter 1 · What an Operating System Does

A microcontroller in an electricity meter can run without any operating system at all. One program starts at power-on, owns every byte of memory and every pin, and runs in a loop until the power goes. Many products are built that way, and built well.

A Linux system runs hundreds of programs at once, written by people who never met, on hardware none of them knows in detail. None of them can read another's memory or crash the machine, and each behaves as if it had the processor to itself. The piece of software that makes this possible is the **kernel**, the core of the operating system. This chapter watches it at work.

> **Driving question:** What does an operating system do for a program that firmware has to do for itself, and how can we see it happening?

## 1.1 · What this chapter covers

By the end of this chapter you should be able to:

- describe how firmware without an operating system is organised, and where that organisation breaks down;
- name the three jobs of an operating system (abstraction, isolation and sharing) and give a concrete example of each;
- watch a program's requests to the kernel with `strace`;
- show that two processes can use the same address for different data, and that a crash stays inside one process;
- measure how the kernel shares one processor between two programs;
- explain user mode, kernel mode and system calls, on x86 and on ARM.

**You need:** Chapter 0's lab, and C up to functions and pointers. The `fork` call used in Section 1.5 is explained there; Chapter 10 covers it in depth.

## 1.2 · Life without an operating system

Here is the shape of a typical small firmware program, the **superloop**: initialise the hardware, then repeat a fixed list of tasks forever. This version runs on the laptop, with simulated time in milliseconds instead of real hardware:

```c
// superloop.c
#include <stdio.h>

static int now = 0;    /* simulated time in milliseconds */

static void read_meter(void)
{
    printf("%3d ms  read meter\n", now);
    now += 1;
}

static void update_display(void)
{
    printf("%3d ms  update display\n", now);
    now += 2;
}

static void send_report(int slow)
{
    printf("%3d ms  send report%s\n", now, slow ? " (slow network)" : "");
    now += slow ? 40 : 3;
}

int main(void)
{
    for (int pass = 1; pass <= 3; pass++) {   /* real firmware repeats forever */
        read_meter();
        update_display();
        send_report(pass == 2);
    }
    return 0;
}
```

```console
$ gcc -Wall -o superloop superloop.c && ./superloop
  0 ms  read meter
  1 ms  update display
  3 ms  send report
  6 ms  read meter
  7 ms  update display
  9 ms  send report (slow network)
 49 ms  read meter
 50 ms  update display
 52 ms  send report
```

The meter should be read every 6 ms. On the second pass the network was slow, the report took 40 ms, and the third reading came at 49 ms instead of 12 ms, **37 ms late**. Nothing else could run while `send_report` waited, because there is only one flow of control.

This design is simple, fast and predictable when every task is short, which is why it is everywhere. Its limits show up as the product grows:

1. **One slow task delays all the others.** Firmware engineers fight this with interrupts and by splitting long tasks into small steps (Problem E3.4).
2. **Nothing is protected.** Every task can read and write all of memory. A bug in the display code can overwrite the meter's calibration data, and nothing will notice.
3. **Every program talks to the hardware directly.** Moving to a different chip means rewriting every task that touches a register.

## 1.3 · The three jobs of an operating system

An operating system answers each of those limits with one job:

| Job | Without an OS | With the Linux kernel |
|---|---|---|
| **Abstraction**: hide the hardware behind simple requests | Each task writes the UART's registers itself | A program calls `write(fd, data, n)`; the same call works for a screen, a file, a pipe, a network socket or a serial port |
| **Isolation**: keep programs apart | Any task can overwrite any memory | Each process has its own address space; a stray pointer kills only its own process |
| **Sharing**: divide the processor and memory | Tasks take turns only when each one chooses to return | The kernel's scheduler interrupts programs and switches between them many times a second |

The kernel does all three from a privileged position that ordinary programs cannot reach. A program asks for a service by making a **system call**, and the kernel does the work on its behalf. The rest of this chapter shows each job in action.

![The layers of a Linux system. Programs and the C library run in user mode (EL0 on ARM64, ring 3 on x86). The only way down is a system call (svc on ARM64, syscall on x86). The kernel runs in kernel mode (EL1, ring 0), where it schedules processes, manages memory, runs file systems and drives the hardware.](diagram:p1-layers)

## 1.4 · Abstraction: watching the requests

`strace` runs a program and prints every system call it makes. Here is `cat` showing a one-line file. The `2>&1 >/dev/null` sends `cat`'s own output away and keeps only `strace`'s report, and `tail` keeps the end, where the work happens:

```console
$ echo Kota > note.txt
$ strace -e trace=openat,read,write,close cat note.txt 2>&1 >/dev/null | tail -n 8
openat(AT_FDCWD, "note.txt", O_RDONLY)  = 3
read(3, "Kota\n", ...)               = 5
write(1, "Kota\n", 5)                   = 5
read(3, "", ...)                     = 0
close(3)                                = 0
close(1)                                = 0
close(2)                                = 0
+++ exited with 0 +++
```

Read it line by line:

1. `openat` asks the kernel to open `note.txt`. The kernel finds the file on the disk, checks the permissions, and returns a **file descriptor**, the small number `3`, that stands for the open file from now on.
2. `read(3, ...)` asks for bytes from descriptor 3 and gets 5: `Kota` and a new line. The `...` hides the buffer size `cat` asked for, which differs between versions.
3. `write(1, ...)` sends the 5 bytes to descriptor 1, **standard output**.
4. The next `read` returns 0 bytes, meaning end of file, and `cat` closes everything and exits.

`cat` never learns whether the file lives on an SSD, an SD card or a network drive, or whether descriptor 1 is a terminal, a file or a pipe: here it was `/dev/null`, a device that discards everything. That is abstraction: one small set of requests for every kind of storage and device. (The lines `strace` printed before these, cut off by `tail`, are the dynamic linker opening the C library, as in Chapter 0.)

## 1.5 · Isolation: same address, different memory

`fork()` asks the kernel to copy the running process. Afterwards there are two processes running the same program: `fork` returns `0` in the new one (the **child**) and the child's process number in the original (the **parent**). Watch what happens to one global variable:

```c
// twins.c
#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int counter = 0;

int main(void)
{
    pid_t pid = fork();
    if (pid == 0) {                     /* the child */
        counter = 100;
        printf("child:  counter = %3d at %p\n", counter, (void *)&counter);
        return 0;
    }
    wait(NULL);                         /* the parent waits for the child to finish */
    printf("parent: counter = %3d at %p\n", counter, (void *)&counter);
    return 0;
}
```

```console
$ gcc -Wall -o twins twins.c && ./twins
child:  counter = 100 at 0x...
parent: counter =   0 at 0x...
```

On every run the two addresses are **the same** (the exact number changes from run to run), yet one process sees 100 and the other 0. The address is not a place in the memory chips. It is a **virtual address**, and each process has its own map from virtual addresses to physical memory, kept by the kernel and enforced by the processor's **memory management unit** (MMU). After the fork, the child's write went into the child's own copy of the page. A process cannot even name another process's memory, let alone change it. Part 4 builds this machinery in detail.

Isolation also contains crashes. This program writes through a null pointer:

```c
// crash.c
#include <stdio.h>

int main(void)
{
    int *p = NULL;
    printf("about to write through a null pointer\n");
    fflush(stdout);
    *p = 42;
    printf("this line is never printed\n");
    return 0;
}
```

```console
$ gcc -Wall -o crash crash.c
$ ./crash; echo "exit status $?"
about to write through a null pointer
...Segmentation fault...
exit status 139
```

Address 0 is not mapped in the process, so the MMU refused the write and raised an exception; the kernel turned it into the signal `SIGSEGV`, number 11, which ended the process. The shell reports such a death as $128+11=139$. The shell itself, and every other program, carried on. On a microcontroller without memory protection, the same bug writes 42 into whatever lives at address 0, and the damage may show up much later, somewhere else.

## 1.6 · Sharing: one processor, two programs

This program does a fixed amount of work and reports how long it took, in real (wall-clock) time:

```c
// spin.c
#define _POSIX_C_SOURCE 200809L   /* ask for POSIX functions such as clock_gettime */
#include <stdio.h>
#include <time.h>

static double now(void)
{
    struct timespec t;
    clock_gettime(CLOCK_MONOTONIC, &t);
    return t.tv_sec + t.tv_nsec / 1e9;
}

int main(int argc, char **argv)
{
    const char *name = argc > 1 ? argv[1] : "spin";
    double start = now();
    volatile unsigned long x = 0;
    for (unsigned long i = 0; i < 500000000UL; i++)    /* a fixed amount of work */
        x += i;
    printf("%s finished in %.1f s\n", name, now() - start);
    return 0;
}
```

`volatile` stops the compiler from deleting the loop as useless (Course 3, Chapter 1 showed it would). `taskset -c 0` runs a program on processor core 0 only. First alone, then two copies started together on the same core:

```console
$ gcc -O2 -Wall -o spin spin.c
$ taskset -c 0 ./spin alone
alone finished in ... s
$ taskset -c 0 ./spin A & taskset -c 0 ./spin B; wait
... finished in ... s
... finished in ... s
```

On our test machine, `alone` took 1.0 s and `A` and `B` took 1.9 s each. (Your times will differ, and the two lines may come in either order.) Neither program waited for the other to finish: both ran **at the same time**, each getting about half of the core. The kernel's scheduler switches between them every few milliseconds, so each one finishes after twice its own work time. Without `taskset`, on a machine with two or more cores, both finish in about 1.0 s, because the kernel puts them on different cores. Compare the superloop, where `send_report` kept the processor until it chose to return: here neither program cooperates, and the kernel takes the processor back anyway, using a **timer interrupt**.

## 1.7 · System calls: the only way in

A program cannot do anything outside its own memory without asking the kernel: open a file, print a character, get the time, start a process, map memory. Each request is a system call with a number. The C library's header lists them; on x86-64 Linux there are a few hundred:

```console
$ grep -c "^#define __NR_" /usr/include/x86_64-linux-gnu/asm/unistd_64.h
373
$ grep -w __NR_write /usr/include/x86_64-linux-gnu/asm/unistd_64.h
#define __NR_write 1
$ grep "define __NR_write " /usr/aarch64-linux-gnu/include/asm-generic/unistd.h
#define __NR_write 64
```

(The count depends on the kernel version your headers come from; this is Ubuntu 24.04.) The same request has different numbers on different processors: `write` is call 1 on x86-64 and call 64 on ARM64. The C library hides this; your C code just calls `write`.

**`printf` is not a system call.** It is a C library function that formats text into a buffer, and calls `write` when it decides to send the buffer to the kernel. This program prints three lines:

```c
// three.c
#include <stdio.h>

int main(void)
{
    printf("one\n");
    printf("two\n");
    printf("three\n");
    return 0;
}
```

```console
$ gcc -Wall -o three three.c && strace -e trace=write ./three 2>&1 >/dev/null
write(1, "one\ntwo\nthree\n", 14)       = 14
+++ exited with 0 +++
```

Three `printf` calls, **one** system call: when standard output is not a terminal, the C library collects the output and writes it in one piece when the program exits, because every system call costs time. On a terminal it writes after every line instead, so you see each line at once. Chapter 19 measures the difference.

**Kernel mode and user mode.** What stops a program from simply jumping into the kernel's code, or writing to the MMU's registers? The processor itself. Every modern processor has privilege levels. Ordinary programs run in **user mode**, where instructions that control the hardware, the MMU or the interrupt system are forbidden and kernel memory is out of reach. The kernel runs in **kernel mode**, where everything is allowed. The only way from user mode into the kernel is a special instruction that switches mode and jumps to an entry point the kernel chose in advance: `syscall` on x86-64, `svc` ("supervisor call") on ARM64. ARM64 names its levels **exception levels**:

| Level | Runs | x86 equivalent |
|---|---|---|
| EL0 | user programs | ring 3 |
| EL1 | the operating system kernel | ring 0 |
| EL2 | a hypervisor, which runs virtual machines | VMX root mode |
| EL3 | the secure monitor, firmware that switches between the normal and the secure world | System Management Mode, roughly |

The kernel's memory is not even visible in a program's map. Every process can list its own map in `/proc/self/maps`; here are three special regions of the `grep` process itself:

```console
$ grep -E "\[(heap|stack|vdso)\]" /proc/self/maps
...[heap]
...[vdso]
...[stack]
```

Each line starts with a range of addresses such as `7ffc5b0c7000-7ffc5b0ef000` (they change on every run) and its permissions. The **heap** holds `malloc`'d memory and the **stack** holds function calls' local variables. The **vDSO** ("virtual dynamic shared object") is a small piece of kernel-provided code mapped into every process, so that frequent requests such as reading the clock can be answered without entering kernel mode at all. All of these addresses lie in the lower part of the 64-bit address space (on x86-64, below `0x0000800000000000`). On x86-64 and ARM64 Linux, the top of the address space, where addresses begin `ffff`, belongs to the kernel and does not appear in any program's map.

## 1.8 · Firmware, RTOS and Linux: a first comparison

Between the superloop and Linux sits a third design, the **real-time operating system** (RTOS), such as FreeRTOS or Zephyr: a small kernel that schedules tasks by priority and can interrupt a low-priority task the moment a high-priority one is ready, usually without separate address spaces. Chapter 3 compares the three in depth; here is the shape of the trade-off:

| | Superloop | RTOS (FreeRTOS, Zephyr) | Linux |
|---|---|---|---|
| Typical processor | small microcontroller | microcontroller | application processor with an MMU |
| Typical memory | kilobytes | tens to hundreds of kilobytes | tens of megabytes and more |
| Scheduling | fixed order, each task returns | priorities, preemption | time sharing, priorities, real-time classes |
| Memory protection | none | none, or a simple MPU | full: separate virtual address spaces |
| Drivers, files, networking | written for the product | libraries for the product | thousands, ready-made |
| Start-up time | microseconds to milliseconds | milliseconds | about a second to tens of seconds |

No design is best in general. A meter's measurement core is usually a superloop or an RTOS; the data concentrator that collects readings from thousands of meters is usually Linux. Knowing when to choose which is part of the job.

## 1.9 · Toolkit

1. **`strace -e trace=...`** shows the system calls a program makes; `2>&1 >/dev/null` keeps only the trace. Use it whenever you want to know what a program really asks the kernel.
2. **`/proc/self/maps`** (or `/proc/<pid>/maps`) shows a process's memory map.
3. **`taskset -c N`** pins a program to one core, so you can see scheduling without the other cores hiding it.
4. **`echo $?`** after a command shows its exit status; above 128 means the process was killed by signal (status − 128).
5. **The system call headers** (`asm/unistd_64.h` for x86-64, `asm-generic/unistd.h` for ARM64) give each call's number.
6. **Ask which job is involved.** For any behaviour of a Linux system, ask whether it is abstraction, isolation or sharing; the answer tells you which part of the kernel to look at.

## 1.10 · Misconceptions to avoid

**"The operating system is the desktop, the windows and the apps."** Those are programs. The operating system's core is the kernel, which has no windows at all; embedded Linux devices often have no screen.

**"An address in my program is a location in the RAM chips."** It is a virtual address, translated by the MMU through a table the kernel keeps for each process (Section 1.5).

**"`printf` talks to the screen."** `printf` fills a buffer in your process; only `write`, a system call, reaches the kernel (Section 1.7).

**"Two programs on one core run one after the other."** They take turns many times a second, so both make progress together (Section 1.6).

**"Linux is always better than firmware."** Linux brings protection and thousands of drivers, at the cost of memory, start-up time and less predictable timing. Many products need a microcontroller without Linux, and many have both.

**"A segmentation fault damages the computer."** It ends one process, which is exactly the protection working.

## 1.11 · Problem ladder

### Tier 1 · First steps

**E1.1** Name the three jobs of an operating system and give one example of each from this chapter.

**E1.2** In the superloop output, how late was the third meter reading, and what made it late?

**E1.3** In `twins.c`, the child set `counter` to 100. Why does the parent still print 0?

**E1.4** Which system calls did `cat` use to get the bytes of `note.txt` and to print them? What does the number 3 stand for?

**E1.5** A program ends and `echo $?` prints 139. What happened to it?

### Answers: Tier 1

**E1.1** Abstraction: `cat` used `openat`, `read` and `write` without knowing what kind of disk or output device was involved. Isolation: the two processes in `twins.c` had different values at the same address, and `crash` died alone. Sharing: two copies of `spin` ran together on one core, each taking about twice as long.

**E1.2** Readings were due every 6 ms, so the third was due at 12 ms; it came at 49 ms, 37 ms late. `send_report` took 40 ms because of the slow network, and in a superloop nothing else can run until a task returns.

**E1.3** After `fork` there are two processes, each with its own copy of the program's memory. The child changed its own copy; the parent's copy was never touched. The equal addresses are virtual addresses, mapped to different physical memory.

**E1.4** `read` on descriptor 3 to get the bytes and `write` on descriptor 1 to print them. 3 is the file descriptor the kernel returned from `openat`: a small number standing for the open file.

**E1.5** It was killed by signal $139-128=11$, `SIGSEGV`: it accessed memory it had no right to, typically through a bad pointer.

### Tier 2 · University exams

**E2.1** Distinguish a program from a process. Can one program be running as several processes at once?

**E2.2** Why must entering the kernel go through a special instruction such as `syscall` or `svc`, rather than an ordinary function call into the kernel's code?

**E2.3** Two processes each need 2 s of processor time, have equal priority and share one core. When does each finish, approximately, and what is the average time to completion? Compare with running them one after the other.

**E2.4** What does `fork()` return in the parent and in the child? How does `twins.c` use this?

**E2.5** What is the vDSO, and which kind of request does it speed up?

### Answers: Tier 2

**E2.1** A program is a file of instructions and data. A process is a running instance of a program: an address space, the state of its registers, its open files and other resources, managed by the kernel. Yes: every shell window runs its own process of the same program, `bash`, and `twins.c` runs as two processes after `fork`.

**E2.2** An ordinary call would let any program jump to any point in the kernel, with kernel privileges, skipping its checks. The special instruction raises the privilege level *and* jumps to a single entry point the kernel set up, which checks the request before doing anything. User code cannot change that entry point, because doing so needs kernel mode.

**E2.3** With time sharing, each gets about half the core, so both finish at about 4 s: average 4 s. One after the other, they finish at 2 s and 4 s: average 3 s. For pure computation, time sharing does not save time; its value is responsiveness, since a short or interactive task never waits behind a long one. (This is the measurement of Section 1.6.)

**E2.4** In the parent, the process number of the new child (a positive number); in the child, 0; and $-1$ in the parent if no child could be created. `twins.c` tests `pid == 0` to send the child down one branch and the parent down the other.

**E2.5** A small piece of code and data that the kernel maps into every process, so that some requests, above all reading the clock with `clock_gettime`, run entirely in user mode, without the cost of a system call.

### Tier 3 · Interviews

**E3.1** "What happens when you type `./hello` in a shell and press Enter?" Outline the answer, naming the system calls.

**E3.2** What is the difference between a segmentation fault on Linux and a HardFault on a Cortex-M microcontroller without an MPU?

**E3.3** In `twins.c`, both processes print the same address. Could they exchange data by writing to that address? If not, how could they share memory?

**E3.4** A superloop must read the meter every 10 ms, give or take 1 ms, but sending a report can take 40 ms. Give three ways to meet the deadline.

**E3.5** Is `printf` a system call? Show what happens underneath when standard output is a file, and say how it changes on a terminal.

### Answers: Tier 3

**E3.1** The shell calls `fork` (on Linux, the `clone` system call) to copy itself. The child calls `execve("./hello", ...)`: the kernel checks permissions, reads the ELF header, replaces the child's memory with the program's segments, maps the dynamic linker, and starts it; the dynamic linker loads the C library and jumps to the program's start code, which calls `main`. The program prints with `write` and ends with `exit_group`. Meanwhile the parent shell waits in `wait4`, collects the exit status, and prints the next prompt. You can see the shell's side:

```console
$ strace -e trace=clone ./twins 2>&1 | grep -m1 "^clone"
clone(child_stack=NULL, flags=CLONE_CHILD_CLEARTID|CLONE_CHILD_SETTID|SIGCHLD, child_tidptr=0x...) = ...
```

Here `twins` itself called `fork()`, and the C library made the `clone` system call.

**E3.2** On Linux the MMU checks every access against the process's own map; an invalid access raises an exception that the kernel turns into `SIGSEGV`, ending only that process, with everything else unaffected. A Cortex-M without an MPU has no per-task protection: a stray write to RAM corrupts data silently, and a HardFault happens only for accesses the bus itself rejects (such as unmapped addresses) or invalid instructions. The fault handler then usually resets the whole device.

**E3.3** No. The same virtual address maps to different physical memory in the two processes, so a write by one is invisible to the other. To share, they must ask the kernel for memory mapped into both: `mmap` with `MAP_SHARED` before the fork, or `shm_open` and `mmap` by name (Chapter 27).

**E3.4** (1) Read the meter in a **timer interrupt** every 10 ms; the interrupt preempts the report. (2) Split `send_report` into small steps, a **state machine** that does a little each pass and returns, so no pass takes longer than a few milliseconds. (3) Use an **RTOS**: a high-priority meter task preempts a low-priority network task. Moving the network transfer to hardware (DMA, or a separate communications chip) also works. *Common wrong answer:* "make the loop faster"; the problem is one long task, not the speed of the others.

**E3.5** No. As Section 1.7 showed, three `printf` calls became one `write` when output went to `/dev/null`. On a terminal the C library flushes after every new line, so the same program makes three `write` calls. The C library decides; the kernel only sees `write`.

### Tier 5 · Kernel and professional

**E5.1** Find the system call number of `write` on x86-64 and on ARM64 from the headers. In which register does each architecture pass the system call number?

**E5.2** On an ARM64 phone or a Raspberry Pi, what typically runs at EL2 and at EL3?

**E5.3** `fork` copies a process's whole memory, yet it takes only microseconds even for a large process. How?

**E5.4** Kernel addresses, at the top of the 64-bit address space, never appear in `/proc/self/maps`. Why is the kernel mapped into every process at all, if programs cannot touch it?

### Answers: Tier 5

**E5.1** Section 1.7: `write` is 1 on x86-64 and 64 on ARM64. On x86-64 the number goes in register `rax` and the instruction is `syscall`; the arguments go in `rdi`, `rsi`, `rdx`, `r10`, `r8`, `r9`. On ARM64 the number goes in `x8` and the instruction is `svc #0`; the arguments go in `x0` to `x5`. Chapter 2 makes both calls by hand.

**E5.2** EL2 runs a hypervisor when one is used: KVM in the Linux kernel, or Android's protected KVM on recent phones. EL3 runs the secure monitor, usually Trusted Firmware-A, which starts the system and switches between the normal world (Linux) and the secure world, where a trusted OS such as OP-TEE runs secure services. On a Raspberry Pi, the start-up firmware sets up these levels and Linux begins at EL2 or EL1.

**E5.3** Copy-on-write. `fork` copies only the page tables and marks every page read-only in both processes, sharing the physical memory. When either process writes to a page, the MMU raises a fault, and the kernel copies just that page and makes it writable for the writer. In `twins.c`, the child's `counter = 100` triggered exactly one such copy. Chapter 16 measures it.

**E5.4** So that a system call or an interrupt can switch to kernel mode without switching to a different page table, which would be slow. The kernel's pages are marked as accessible from kernel mode only, so user mode cannot read them, and `/proc/self/maps` lists only the user part. (After the Meltdown attacks of 2018, x86 kernels unmap most of the kernel while in user mode, a technique called kernel page-table isolation, accepting some cost for safety.)

## 1.12 · Mastery check

1. What does the kernel's scheduler do, and which hardware event lets it take the processor back from a program that never stops?
2. What is a file descriptor?
3. Which job of the operating system is shown by `crash.c`?
4. Why do `A` and `B` in Section 1.6 each take about twice as long as `alone`?
5. How many system calls did `three.c` make to print three lines into `/dev/null`, and why?
6. Name ARM64's exception levels and what runs at the first two.

### Answers: Mastery check

1. It decides which process runs next on each core and switches between them; a periodic timer interrupt hands control to the kernel even if the running program never makes a system call.
2. A small number that a process uses to refer to an open file, device, pipe or socket, returned by calls such as `openat`.
3. Isolation: the crash ended one process and nothing else.
4. Both were pinned to one core, and the scheduler gave each about half of it.
5. One `write`, because the C library buffers output that is not going to a terminal and writes it all at exit.
6. EL0 (user programs), EL1 (the kernel), EL2 (a hypervisor) and EL3 (the secure monitor).

## 1.13 · Where this leads

Chapter 2 goes down to the boundary itself: it makes system calls with no C library at all, in x86-64 and ARM64 assembly, and follows what the processor does when `syscall` or `svc` executes. Chapter 3 then compares the superloop, an RTOS and Linux properly, with numbers, and builds a tiny scheduler.
