---
id: KQV-OS-C000
course: "Course 4: Operating Systems and Embedded Linux"
chapter_number: 0
title: "How This Course Works, and Setting Up a Linux Lab"
subtitle: "What this course builds, how every chapter is checked, and a working Linux lab on any laptop: by the end, one C program running on two different processors."
language: en
version: 0.1.0
status: code_checked
publication_status: published
---

# Chapter 0 · How This Course Works, and Setting Up a Linux Lab

Almost every electronic device that is more than a gadget runs Linux inside: Wi-Fi routers, set-top boxes, smart TVs, the data concentrators that collect readings from thousands of electricity meters, car dashboards, drones, satellites, and the Android phone in your pocket. So do the control systems of quantum computers: the boards that generate and read the microwave pulses for superconducting qubits are FPGA chips with ARM processors running embedded Linux.

This course teaches how an operating system works and how to build, boot and program Linux on embedded hardware. It is written for someone who can write a little C. You will use Linux the way embedded engineers do, then go underneath it: processes, memory, files and devices, then booting, the kernel and device drivers, and finally real-time behaviour, debugging and secure updates.

> **Driving question:** What do I need to start, and how can a laptop stand in for a whole embedded board?

## 0.1 · What you will be able to do

By the end of the course you should be able to:

- explain what the kernel does for every running program, and watch it happen with tools such as `strace` and `/proc`;
- write C programs that use processes, threads, signals, memory mapping and every kind of inter-process communication correctly;
- talk to GPIO pins, I2C and SPI sensors and serial ports from Linux;
- build a complete embedded Linux system from source, boot it in QEMU and on a Raspberry Pi, and understand every stage from power-on to the shell prompt;
- write, load and debug kernel modules and device drivers;
- measure and improve real-time latency, and ship updates that survive power loss.

By the end of **this** chapter you will have a Linux lab with a compiler for your laptop, a compiler for ARM processors, and QEMU, and you will have run one C program on two processors.

## 0.2 · How the chapters work

Every chapter follows the same pattern:

1. **Running, not described.** Every idea is shown with a command, a C program or a QEMU lab, followed by its real output. Our test machine runs every command on every page before it is published and compares the output line by line. Where the output depends on your machine (a time, an address, a process number), the page shows `...` in its place.
2. **Underneath.** Each chapter explains what the kernel, the C library and the hardware actually do, on x86 laptops and on ARM boards.
3. **Laptop first.** Every lab works on a laptop. Where real hardware adds something, a Raspberry Pi version is given as an option.
4. **A ladder of problems.** Each chapter ends with problems in tiers, with full answers:

| Tier | Level |
|---|---|
| E1 | First steps: check the idea with short, direct exercises |
| E2 | University exams: operating systems and embedded systems courses |
| E3 | Interviews: embedded, firmware and systems engineering interviews |
| E4 | Labs and projects: build, measure and debug on Linux, QEMU and a Raspberry Pi |
| E5 | Kernel and professional: kernel source, real drivers and production practice |

**You need:** C as far as Course 3, Chapters 0 to 10 (variables, loops, functions, arrays and a first look at pointers). Later chapters say when they need more. If you have never used a terminal, Chapter 4 starts from the beginning; this chapter only asks you to type the commands shown.

## 0.3 · The machine you need

- **Any laptop or desktop**: Windows, macOS, Linux or a Chromebook. 8 GB of memory is comfortable and 4 GB is enough until Part 7.
- **About 25 GB of free disk space** by Part 7, when you build whole Linux systems from source. Until then, 5 GB is plenty.
- **An internet connection** to install the tools.
- **Optional:** a Raspberry Pi 3, 4 or 5 (or a Zero 2 W) with a microSD card. Nothing in the course requires one.

The course is tested on **Ubuntu 24.04 LTS**. Every command below is for Ubuntu (and Debian, which uses the same package manager). If you prefer another Linux distribution, the tools exist there too, but package names differ; when in doubt, run Ubuntu in a virtual machine.

## 0.4 · Getting a Linux system

**If you already run Linux**, skip to Section 0.5.

**On Windows 10 or 11**, use WSL 2, the Windows Subsystem for Linux, which runs a real Linux kernel beside Windows. Open PowerShell as administrator and run:

```console
$ wsl --install -d Ubuntu-24.04
```

Restart when asked, open "Ubuntu 24.04" from the Start menu, and choose a user name and password. Everything in this course up to Part 7 works in WSL 2; for the kernel chapters, QEMU runs inside it too.

**On a Mac**, install a virtual machine program such as UTM (free) and create an Ubuntu 24.04 virtual machine from the Ubuntu Server image for your processor: ARM64 for Apple silicon Macs (M1 and later), AMD64 for older Intel Macs. Give it 4 GB of memory and 30 GB of disk.

**On a Chromebook**, turn on the Linux development environment in Settings. It is Debian, and the commands below work unchanged.

A note on containers: a Docker container shares its host's kernel, so it is fine for Parts 1 to 6 but cannot load kernel modules. A virtual machine or WSL 2 works for the whole course.

## 0.5 · Install the tools

In the Linux terminal, update the package lists and install everything this course uses before Part 7:

```console
$ sudo apt update
$ sudo apt install build-essential gdb strace qemu-user qemu-system-arm gcc-aarch64-linux-gnu gdb-multiarch file
```

`sudo` runs a command as the administrator and asks for your password. The packages are:

| Package | What it gives you |
|---|---|
| `build-essential` | `gcc`, `make` and the C library headers for your own processor |
| `gdb`, `strace` | a debugger, and a tool that shows every request a program makes to the kernel |
| `qemu-user` | runs single programs built for another processor |
| `qemu-system-arm` | emulates whole ARM computers (used from Part 7) |
| `gcc-aarch64-linux-gnu` | a **cross-compiler**: runs on your laptop, produces programs for 64-bit ARM |
| `gdb-multiarch` | a debugger that understands ARM programs |
| `file` | says what kind of file something is |

## 0.6 · Check the tools

Ask each tool for its version. Your version numbers may be newer; that is fine.

```console
$ gcc --version | head -n 1
gcc (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0
$ aarch64-linux-gnu-gcc --version | head -n 1
aarch64-linux-gnu-gcc (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0
$ qemu-aarch64 --version | head -n 1
qemu-aarch64 version 8.2.2 (Debian 1:8.2.2+ds-0ubuntu1...)
$ qemu-system-aarch64 --version | head -n 1
QEMU emulator version 8.2.2 (Debian 1:8.2.2+ds-0ubuntu1...)
$ uname -m
x86_64
```

The `| head -n 1` keeps only the first line of each answer. `uname -m` names your laptop's processor architecture: `x86_64` on most laptops, `aarch64` on an Apple silicon Mac's virtual machine.

## 0.7 · First lab: one program, two processors

Here is a C program that asks the kernel which machine it is running on:

```c
// where.c
#include <stdio.h>
#include <sys/utsname.h>

int main(void)
{
    struct utsname u;
    uname(&u);
    printf("Hello from %s (%s)\n", u.machine, u.sysname);
    return 0;
}
```

`uname` is a request to the kernel (a **system call**, the subject of Chapters 1 and 2); it fills the structure `u` with the kernel's name and the machine type. Build and run it for the laptop:

```console
$ gcc -Wall -o where where.c && ./where
Hello from x86_64 (Linux)
```

Now build the **same file** for a 64-bit ARM processor, the kind inside a Raspberry Pi 4, almost every phone and Apple's M-series chips, and ask `file` what came out:

```console
$ aarch64-linux-gnu-gcc -Wall -o where-arm where.c
$ file where-arm
where-arm: ELF 64-bit LSB pie executable, ARM aarch64, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux-aarch64.so.1, ...
$ file where
where: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, ...
```

Both are ELF files (the program format Linux uses), both 64-bit and little-endian (LSB), but one is for `ARM aarch64` and the other for `x86-64`. The laptop's processor cannot run the ARM instructions:

```console
$ ./where-arm
...cannot execute binary file: Exec format error
```

QEMU can. `qemu-aarch64` reads the ARM instructions one block at a time and translates them into x86 instructions:

```console
$ qemu-aarch64 -L /usr/aarch64-linux-gnu ./where-arm
Hello from aarch64 (Linux)
```

The same source file, compiled twice, ran on two different processors, and the second one does not even exist in your laptop. The `-L` option tells QEMU where the ARM version of the C library lives; Section 0.8 explains why it is needed.

![What qemu-aarch64 does. The ARM program's instructions are translated into x86 instructions, but its system calls (such as uname and write) are passed to the laptop's own Linux kernel. Booting a whole ARM computer, with its own kernel, is QEMU's other mode, used from Part 7.](diagram:p0-qemu)

## 0.8 · What just happened

**Why `-L`?** The ARM program is *dynamically linked*: it does not contain the C library, and when it starts it asks for the ARM dynamic linker, `/lib/ld-linux-aarch64.so.1`, to load the library. Your laptop has only the x86 one. Without `-L`, QEMU looks for the ARM linker at that path and fails:

```console
$ qemu-aarch64 ./where-arm
qemu-aarch64: Could not open '/lib/ld-linux-aarch64.so.1': No such file or directory
```

The cross-compiler package installed the ARM libraries under `/usr/aarch64-linux-gnu`, and `-L` points QEMU there. A **statically linked** program carries its C library inside it and needs no `-L`:

```console
$ aarch64-linux-gnu-gcc -Wall -static -o where-static where.c
$ qemu-aarch64 ./where-static
Hello from aarch64 (Linux)
```

**Why does the ARM program say "Linux"?** In this mode, called **user-mode emulation**, QEMU translates only the program's own instructions. When the program makes a system call such as `uname` or `write`, QEMU converts it to the laptop's system call and the laptop's Linux kernel answers it, reporting `aarch64` because QEMU fills in the machine type. The program never knows. In Part 7, QEMU's other mode, **system emulation**, imitates a whole ARM computer with memory, devices and its own Linux kernel.

## 0.9 · Two instruction sets, side by side

What does "different instructions" mean concretely? Compile a one-line function for both processors and look at the machine code with `objdump`, the disassembler:

```c
// add.c
int add(int a, int b)
{
    return a + b;
}
```

```console
$ gcc -O2 -fcf-protection=none -c add.c -o add-x86.o
$ objdump -d add-x86.o | tail -n 2
   0:	8d 04 37             	lea    (%rdi,%rsi,1),%eax
   3:	c3                   	ret
$ aarch64-linux-gnu-gcc -O2 -c add.c -o add-arm.o
$ aarch64-linux-gnu-objdump -d add-arm.o | tail -n 2
   0:	0b010000 	add	w0, w0, w1
   4:	d65f03c0 	ret
```

Each line shows the address, the instruction's bytes in hexadecimal, and the instruction in assembly language. On x86 the addition is the 3-byte instruction `8d 04 37`, and `ret` is a single byte, `c3`: x86 instructions have **variable length**, from 1 to 15 bytes. On ARM64 every instruction is exactly **4 bytes**. The arguments arrive in different registers too: `edi` and `esi` on x86-64 (the `%rdi`, `%rsi` above), `w0` and `w1` on ARM64. Same C, completely different machine code. (`-fcf-protection=none` turns off a security instruction that Ubuntu's gcc adds at the start of every x86 function; Part 9 explains it.)

## 0.10 · Optional: a Raspberry Pi

If you have a Raspberry Pi 3, 4, 5 or Zero 2 W, set it up now and use it alongside QEMU through the course:

1. On your laptop, install **Raspberry Pi Imager** from raspberrypi.com, choose **Raspberry Pi OS Lite (64-bit)**, and in its settings set a user name, a password, your Wi-Fi network, and **enable SSH**. Write the card.
2. Put the card in the Pi and power it on. After a minute, connect from the laptop with `ssh yourname@raspberrypi.local` (use the user name you chose).
3. Copy the ARM program across with `scp where-arm yourname@raspberrypi.local:` and run it on the Pi with `./where-arm`. It should print `Hello from aarch64 (Linux)`: the file you built on the laptop runs natively on the Pi, no emulator needed, because the Pi has the ARM C library at `/lib/ld-linux-aarch64.so.1`.

(Our test machine has no Pi attached, so this section is not replayed by the tests.)

## 0.11 · When something goes wrong

| What you see | What it means and what to do |
|---|---|
| `command not found` for `gcc`, `qemu-aarch64` or `aarch64-linux-gnu-gcc` | The package is not installed. Repeat Section 0.5 and read the last lines of its output for errors. |
| `Unable to locate package` | The package lists are out of date or you are not on Ubuntu or Debian. Run `sudo apt update` first. |
| `Could not open '/lib/ld-linux-aarch64.so.1'` | You forgot `-L /usr/aarch64-linux-gnu`, or built a dynamic program without the ARM libraries installed. |
| `Exec format error` | You tried to run a program for another processor directly. Use `qemu-aarch64`. |
| `fatal error: stdio.h: No such file or directory` | The C library headers are missing: install `build-essential`. |
| WSL says the version is 1 | Run `wsl --set-version Ubuntu-24.04 2` in PowerShell. |

**On an ARM64 machine** (an Apple silicon Mac's virtual machine, or the Pi itself), your native processor is already `aarch64`, so everything above is reversed: `gcc` makes ARM programs, and to practise cross-compiling you install `gcc-x86-64-linux-gnu` and run the x86 version with `qemu-x86_64 -L /usr/x86_64-linux-gnu`.

## 0.12 · Problem ladder

### Tier 1 · First steps

**E1.1** Run `file /bin/ls`. Which words in the answer name the processor it is for?

**E1.2** What does `uname -m` print on your laptop? What would it print on a Raspberry Pi 4 running 64-bit Raspberry Pi OS?

**E1.3** Compare the sizes of `where-arm` and `where-static` with `ls -l`. Why is one so much larger?

**E1.4** Explain in two sentences why `qemu-aarch64 ./where-arm` failed without `-L` but `qemu-aarch64 ./where-static` worked.

**E1.5** Write a program that prints the size of a `long`, the size of a pointer, and whether the machine is little-endian. Run it on the laptop and under `qemu-aarch64`. Do the answers differ?

### Answers: Tier 1

**E1.1** On our machine:

```console
$ file /bin/ls
/bin/ls: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, ...
```

`x86-64` names the processor. (On a Raspberry Pi it would say `ARM aarch64`.)

**E1.2** `x86_64` on most laptops (`aarch64` in an Apple silicon virtual machine). On a Raspberry Pi 4 with 64-bit Raspberry Pi OS: `aarch64`.

**E1.3**

```console
$ ls -l where-arm where-static | awk '{print $5, $9}'
70464 where-arm
633872 where-static
```

The sizes on your machine may differ slightly. The static program contains its own copy of every part of the C library it uses, about 560 KB here, so it is about nine times larger. The dynamic one only names the library it needs.

**E1.4** A dynamically linked ARM program starts by asking for the ARM dynamic linker at `/lib/ld-linux-aarch64.so.1`, which does not exist on an x86 laptop; `-L` tells QEMU to look for it under `/usr/aarch64-linux-gnu` instead. A static program needs no dynamic linker and no shared libraries, so there is nothing to find.

**E1.5**

```c
// machine.c
#include <stdio.h>

int main(void)
{
    unsigned int one = 1;
    printf("long: %zu bytes, pointer: %zu bytes, %s-endian\n",
           sizeof(long), sizeof(void *), *(unsigned char *)&one == 1 ? "little" : "big");
    return 0;
}
```

```console
$ gcc -Wall -o machine machine.c && ./machine
long: 8 bytes, pointer: 8 bytes, little-endian
$ aarch64-linux-gnu-gcc -Wall -o machine-arm machine.c && qemu-aarch64 -L /usr/aarch64-linux-gnu ./machine-arm
long: 8 bytes, pointer: 8 bytes, little-endian
```

No difference: both are 64-bit Linux systems with the same data model (called LP64: `long` and pointers are 64 bits), and ARM64 Linux runs little-endian, like x86. The instruction sets differ completely, but the C types do not. That is why so much Linux code builds for both without change. (A 32-bit ARM board, such as the original Raspberry Pi, gives 4-byte `long` and pointers.)

## 0.13 · Where this leads

Chapter 1 uses this lab to watch the Linux kernel do its three jobs: hiding the hardware behind simple requests, keeping programs apart, and sharing one processor between many programs. Chapter 2 goes down to the instruction that crosses from a program into the kernel, on x86 and on ARM.
