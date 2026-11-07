---
id: KQV-PROG-C001
course: "Course 3: Programming in C and Python"
chapter_number: 1
title: "Your First Program, and What Really Happens When It Runs"
subtitle: "One line of text, followed from your editor through the compiler or the interpreter, down to the single request both programs make to the operating system."
language: en
version: 0.1.0
status: code_checked
publication_status: published
---

# Chapter 1 · Your First Program, and What Really Happens When It Runs

The two programs in this chapter print one line. Between you pressing Enter and that line appearing, at least five other programs do work for you. For C: a preprocessor, a compiler, an assembler and a linker run before your program exists at all, and then the operating system loads it. For Python: a compiler turns your text into instructions for a virtual machine, and that virtual machine, itself a C program, carries them out.

This chapter writes the first program, changes it, breaks it on purpose, and then follows it all the way down. By the end, every one of those hidden steps will be something you have seen with your own eyes on your own computer.

> **Driving question:** What actually happens between typing a program and seeing its output?

## 1.1 · What this chapter covers

By the end of this chapter you should be able to:

- write, compile and run a program that prints text and numbers, in both languages;
- explain every line of those programs;
- tell compile-time errors from run-time errors, and say why Python can report a mistake on line 2 without running line 1;
- run the four stages of the C build yourself and inspect what each produces;
- read Python's bytecode for a small program;
- use exit codes and command-line arguments;
- explain why the same loop runs at very different speeds in the two languages, and why an optimising compiler can make a loop disappear.

**You need:** Chapter 0's setup: a working `gcc` (or `clang`) and `python3`, and a terminal.

**Levels.** Sections 1.2 to 1.6 are for complete beginners. Sections 1.7 to 1.10 go underneath, at the level of a first university systems course. The problem ladder climbs from first steps to systems and professional problems.

## 1.2 · Hello, Kota

```c
// hello.c
#include <stdio.h>

int main(void)
{
    printf("Hello, Kota!\n");
    return 0;
}
```

```python
# hello.py
print("Hello, Kota!")
```

```console
$ gcc -Wall -Wextra -std=c17 -o hello hello.c
$ ./hello
Hello, Kota!
$ python3 hello.py
Hello, Kota!
```

**The C program, line by line.**

- `// hello.c` is a **comment**. Everything after `//` on a line is ignored by the compiler. We use the first line to name the file.
- `#include <stdio.h>` pastes in the declarations of the standard input/output functions, including `printf`. It is not C code as such but an instruction to the **preprocessor**, which runs first (Section 1.7).
- `int main(void)` starts the definition of a **function** called `main`. Every C program starts running at `main`. The `int` says `main` gives back an integer when it finishes; `void` says it takes no inputs.
- `{` and `}` mark the **body** of the function: the statements it runs, in order.
- `printf("Hello, Kota!\n");` calls the function `printf` ("print formatted") with one **argument**, the text between the quotes. That text is a **string literal**. The `\n` inside it is an **escape sequence** meaning "new line". The `;` ends the statement.
- `return 0;` ends `main` and hands the number 0 back to whoever started the program. By convention 0 means "success" (Section 1.5).

**The Python program.** `print("Hello, Kota!")` calls the built-in function `print`. There is no `main`, no `#include`, no `;`, no `\n` and no `return`:

- Python runs a file from top to bottom, so the file itself plays the role of `main`.
- `print` is always available, so nothing needs including.
- A statement ends at the end of the line.
- `print` adds a new line by itself at the end.
- A Python program that reaches the end of the file finishes with "success" automatically.

So the two programs differ mainly in how much they make you say explicitly. C makes you say almost everything; Python assumes sensible defaults. Neither is "better": being explicit is exactly what lets C give you control.

## 1.3 · Printing more: escapes, numbers and columns

```c
// lines.c
#include <stdio.h>

int main(void)
{
    printf("Kota\tQuantum\tValley\n");
    printf("A backslash \\ and a quote \"\n");
    printf("6 x 7 = %d\n", 6 * 7);
    printf("%-8s|%5d|\n", "qubits", 127);
    printf("%-8s|%5d|\n", "gates", 4);
    return 0;
}
```

```python
# lines.py
print("Kota\tQuantum\tValley")
print("A backslash \\ and a quote \"")
print("6 x 7 =", 6 * 7)
print(f"{'qubits':<8}|{127:>5}|")
print(f"{'gates':<8}|{4:>5}|")
```

```console
$ gcc -Wall -Wextra -std=c17 -o lines lines.c
$ ./lines
Kota	Quantum	Valley
A backslash \ and a quote "
6 x 7 = 42
qubits  |  127|
gates   |    4|
$ python3 lines.py
Kota	Quantum	Valley
A backslash \ and a quote "
6 x 7 = 42
qubits  |  127|
gates   |    4|
```

**Escape sequences** are the same in both languages: `\n` new line, `\t` tab, `\\` a backslash, `\"` a double quote inside a double-quoted string. (In Python you may also write strings in single quotes, `'like this'`, and then `"` needs no escape.)

**Printing numbers.** C's `printf` reads its first argument, the **format string**, and replaces each **conversion** such as `%d` with the next argument: `%d` prints an `int` in decimal. The compiler checks that the arguments match the conversions (that is one of the things `-Wall` does). Python's `print` accepts any number of values, converts each to text and puts a space between them.

**Columns.** In `%-8s`, `s` means a string, `8` means "use at least 8 characters" and `-` means "left-align". In `%5d`, the number is right-aligned in 5 characters. Python's **f-strings** (an `f` before the quote) do the same: inside `{...}`, after the colon, `<8` means left-align in 8 characters and `>5` means right-align in 5.

## 1.4 · Two kinds of error

A **compile-time error** is found before the program runs. A **run-time error** happens while it runs. The two languages draw the line in different places, and the difference is worth seeing.

**C finds undeclared names before running anything.**

```c
// undeclared.c: this does not compile, on purpose
#include <stdio.h>

int main(void)
{
    printf("Starting\n");
    printf("%d\n", undefined_name);
    return 0;
}
```

```console
$ gcc -Wall -Wextra -std=c17 -o undeclared undeclared.c
undeclared.c: In function ‘main’:
undeclared.c:7:20: error: ‘undefined_name’ undeclared (first use in this function)
    7 |     printf("%d\n", undefined_name);
      |                    ^~~~~~~~~~~~~~
undeclared.c:7:20: note: each undeclared identifier is reported only once for each function it appears in
```

No program is produced, so `Starting` is never printed.

**Python finds the same mistake only when it reaches it.**

```python
# runtime.py: this fails while running, on purpose
print("Starting")
print(undefined_name)
```

```console
$ python3 runtime.py
Starting
Traceback (most recent call last):
  File ".../runtime.py", line 3, in <module>
    print(undefined_name)
          ^^^^^^^^^^^^^^
NameError: name 'undefined_name' is not defined
```

Line 2 ran and printed `Starting`. Python discovered on line 3 that the name does not exist. This error message is called a **traceback**: it lists where the program was when it failed.

**But a Python grammar mistake stops everything, even earlier lines.**

```python
# syntax.py: this does not even start, on purpose
print("Starting")
print("missing bracket"
```

```console
$ python3 syntax.py
  File ".../syntax.py", line 3
    print("missing bracket"
         ^
SyntaxError: '(' was never closed
```

`Starting` is *not* printed, although the mistake is on line 3. So Python must read the whole file before running any of it. It does: before running, Python **compiles** the whole file into instructions for its virtual machine (Section 1.8), and a grammar mistake anywhere makes that compilation fail. A misspelled name is grammatically fine, so it compiles, and fails only when the instruction "look up this name" runs.

| Mistake | C (gcc) | Python |
|---|---|---|
| Grammar (missing `;`, `:` or bracket) | Compile time | Compile time, before line 1 runs |
| Unknown name | Compile time | Run time, when the line is reached |
| Wrong type of value (Chapter 3) | Mostly compile time | Run time |

Finding mistakes early is one reason large programs are often written in languages, like C, that check more before running.

## 1.5 · Exit codes

When a program finishes, it gives the operating system a small number, its **exit status**. `main`'s `return` value becomes the exit status in C; in Python, `sys.exit(n)` ends the program with status `n`. In a terminal, `echo $?` shows the status of the last command.

```c
// status.c
#include <stdio.h>

int main(void)
{
    printf("Something went wrong\n");
    return 3;
}
```

```python
# status.py
import sys

print("Something went wrong")
sys.exit(3)
```

```console
$ gcc -Wall -Wextra -std=c17 -o status status.c
$ ./status; echo "exit status: $?"
Something went wrong
exit status: 3
$ python3 status.py; echo "exit status: $?"
Something went wrong
exit status: 3
$ ./hello; echo "exit status: $?"
Hello, Kota!
exit status: 0
```

Scripts use the status to decide what to do next. In `A && B`, the command `B` runs only if `A` succeeded (status 0):

```console
$ gcc -Wall -Wextra -std=c17 -o hello hello.c && ./hello
Hello, Kota!
```

That is why compile-and-run is usually typed as one line: if compiling fails, the old program is not run by mistake.

Two details. First, `import sys` makes the standard module `sys` available; modules are Python's equivalent of C's libraries (Chapter 27). Second, since C99 a `main` that reaches its closing `}` without a `return` returns 0 automatically, but this course always writes `return 0;` to make it visible.

## 1.6 · Command-line arguments

Words typed after a program's name are passed to it as **command-line arguments**. In C, `main` can receive them as `argc` (the count) and `argv` (the list); in Python they are in the list `sys.argv`.

```c
// args.c
#include <stdio.h>

int main(int argc, char *argv[])
{
    printf("argc = %d\n", argc);
    for (int i = 0; i < argc; i++)
        printf("argv[%d] = %s\n", i, argv[i]);
    return 0;
}
```

```python
# args.py
import sys

print("len(sys.argv) =", len(sys.argv))
for i in range(len(sys.argv)):
    print(f"sys.argv[{i}] = {sys.argv[i]}")
```

```console
$ gcc -Wall -Wextra -std=c17 -o args args.c
$ ./args Kota 2026 "quantum valley"
argc = 4
argv[0] = ./args
argv[1] = Kota
argv[2] = 2026
argv[3] = quantum valley
$ python3 args.py Kota 2026 "quantum valley"
len(sys.argv) = 4
sys.argv[0] = args.py
sys.argv[1] = Kota
sys.argv[2] = 2026
sys.argv[3] = quantum valley
```

Item 0 is the program's own name: `./args` for C, the script name `args.py` for Python (not `python3`). Quotes group words into one argument. Every argument arrives as text: `2026` here is the four characters `2`, `0`, `2`, `6`, not a number. Converting text to numbers is Chapter 5. (`char *argv[]` means "a list of strings"; Chapter 16 explains the `*`. The `for` lines are loops, Chapter 8.)

## 1.7 · Underneath C: the four stages of a build

The single command `gcc -o hello hello.c` runs four programs in turn. You can stop after each one and look.

![The two journeys of "Hello, Kota!". C is translated ahead of time, in four stages, into machine code that the processor runs directly. Python is compiled to bytecode when you run it, and the interpreter, a C program, carries the bytecode out. Both finish by asking the operating system to write the text.](diagram:p1-pipeline)

**Stage 1: preprocessing** (`gcc -E`). The preprocessor handles every line starting with `#`. For `#include <stdio.h>` it finds the file `stdio.h` and pastes its contents in, along with every file *that* includes.

```console
$ gcc -E hello.c | wc -l
821
$ gcc -E hello.c | tail -n 6
# 4 "hello.c"
int main(void)
{
    printf("Hello, Kota!\n");
    return 0;
}
```

Your 8 lines became 821 (the exact number depends on your system's C library). The end of the output is your own code; the lines starting with `#` are notes telling the compiler which file and line each part came from, so error messages can point at your file.

**Stage 2: compiling** (`gcc -S`) translates C into **assembly language**, a readable form of the processor's instructions. On a 64-bit Intel or AMD processor:

```console
$ gcc -S hello.c
$ sed -n '/^main:/,/ret/p' hello.s
main:
.LFB0:
	.cfi_startproc
	endbr64
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset 6, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register 6
	leaq	.LC0(%rip), %rax
	movq	%rax, %rdi
	call	puts@PLT
	movl	$0, %eax
	popq	%rbp
	.cfi_def_cfa 7, 8
	ret
```

Lines starting with `.` are notes for the assembler and debugger; the rest are instructions. The important ones: `leaq .LC0(%rip), %rax` and `movq %rax, %rdi` put the address of the text "Hello, Kota!" into register `rdi`, where the first argument of a function goes; `call puts@PLT` calls a function; `movl $0, %eax` puts the return value 0 into register `eax`; `ret` returns.

Look again: the program calls **`puts`, not `printf`**. The compiler noticed that `printf("Hello, Kota!\n")` has no `%` conversions and ends in a new line, so it is exactly `puts("Hello, Kota!")`, which prints a string and a new line and is simpler and faster. Compilers may make any change that does not alter what the program does; this is one of many such optimisations. (On ARM processors, such as phones and recent Macs, the instructions look different but the idea is the same.)

**Stage 3: assembling** (`gcc -c`) turns assembly into **machine code**, the actual bytes the processor reads, stored in an **object file**:

```console
$ gcc -c hello.c
$ objdump -d hello.o | sed -n '/<main>:/,$p'
0000000000000000 <main>:
   0:	f3 0f 1e fa          	endbr64
   4:	55                   	push   %rbp
   5:	48 89 e5             	mov    %rsp,%rbp
   8:	48 8d 05 00 00 00 00 	lea    0x0(%rip),%rax        # f <main+0xf>
   f:	48 89 c7             	mov    %rax,%rdi
  12:	e8 00 00 00 00       	call   17 <main+0x17>
  17:	b8 00 00 00 00       	mov    $0x0,%eax
  1c:	5d                   	pop    %rbp
  1d:	c3                   	ret
$ nm hello.o
0000000000000000 T main
                 U puts
```

The middle column is the machine code: `main` is 30 bytes. Notice `e8 00 00 00 00`: `e8` means "call", and the four zero bytes are where the address of `puts` should go. The assembler does not know it yet. `nm` lists the object file's **symbols**: `T main` means "main is defined here, in the code (text) section"; `U puts` means "puts is used here but undefined: someone else must supply it".

**Stage 4: linking** joins object files and libraries into one runnable program and fills in those missing addresses. `puts` lives in the C standard library, `libc`, which the linker connects automatically:

```console
$ gcc -o hello hello.o
$ nm hello | grep -E ' (main|puts)'
...
$ ldd hello
...
...libc.so.6 => ...
...
```

The finished program still lists `puts` as undefined (`U puts@GLIBC_...`) because it is **dynamically linked**: the library `libc.so.6` is loaded when the program starts, and shared by every program that uses it. `ldd` lists the libraries a program needs. Problem P5.3 builds a **statically linked** version instead, with the library copied inside.

## 1.8 · Underneath Python: bytecode and the interpreter

Python does not produce a separate program. When you run `python3 hello.py`, the interpreter compiles your file into **bytecode**, simple instructions for an imaginary processor called the Python virtual machine, and then runs them. You can see the bytecode with the standard module `dis` ("disassembler"):

```console
$ python3 -m dis hello.py
  0           RESUME                   0
...
  2           LOAD_NAME                0 (print)
              PUSH_NULL
              LOAD_CONST               0 ('Hello, Kota!')
              CALL                     1
              POP_TOP
              RETURN_CONST             1 (None)
```

Read it as a recipe (the exact instructions change between Python versions; this is Python 3.13):

1. `LOAD_NAME print`: look up the name `print`. This lookup happens *now*, while running, which is why a misspelled name is a run-time error (Section 1.4).
2. `LOAD_CONST 'Hello, Kota!'`: take the text.
3. `CALL 1`: call the function with 1 argument.
4. `POP_TOP`: throw away what `print` returned (it returns `None`, Python's "nothing").
5. `RETURN_CONST None`: the file is finished.

The **interpreter** that carries out these instructions is CPython, a large C program: a loop that fetches the next instruction and runs the C code for it. `print` itself is a built-in function written in C. So when Python runs, C is running underneath.

## 1.9 · Where both journeys end: one system call

A program cannot draw on the screen or touch a file by itself; only the operating system's **kernel** can. Programs ask the kernel through **system calls**. On Linux, the tool `strace` shows every system call a program makes. Here are just the `write` calls:

```console
$ strace -e trace=write ./hello > /dev/null
write(1, "Hello, Kota!\n", 13)          = 13
+++ exited with 0 +++
$ strace -e trace=write python3 hello.py > /dev/null
write(1, "Hello, Kota!\n", 13)          = 13
+++ exited with 0 +++
```

(`> /dev/null` throws away the program's normal output, so that only `strace`'s report is shown.) Both programs end in the **same** request: `write` to file descriptor 1 (standard output) these 13 bytes, and the kernel reports that 13 were written. Twelve characters plus the new line make 13.

Everything else is preparation. Counting *all* system calls (with `strace -f -c`) on our test machine gave about 30 for the C program and over 400 for Python, which has to start its interpreter, find its standard library and set up its modules before reaching line 1.

## 1.10 · Speed, and a loop that disappears

Here is the same loop, a hundred million additions, in both languages:

```c
// sum.c
#include <stdio.h>

int main(void)
{
    long long total = 0;
    for (long long i = 1; i <= 100000000; i++)
        total += i;
    printf("%lld\n", total);
    return 0;
}
```

```python
# sum.py
total = 0
for i in range(1, 100_000_001):
    total += i
print(total)
```

```console
$ gcc -std=c17 -O0 -o sum sum.c && ./sum
5000000050000000
$ python3 sum.py
5000000050000000
```

(`long long` is a 64-bit integer type, big enough for this total; `%lld` prints it. Chapter 3 explains integer sizes. `100_000_001` is Python's way of writing 100000001 readably.)

On our test machine, a 2.1 GHz Intel Xeon server, the C program took about **0.2 seconds** and the Python program about **4.5 seconds**, roughly twenty times longer. The reason is Section 1.8: for every `total += i`, Python's interpreter fetches several bytecode instructions, looks up names, and creates a new integer object, while the C program runs a handful of machine instructions.

Now ask gcc to **optimise** with `-O2`:

```console
$ gcc -std=c17 -O2 -S -o sum-O2.s sum.c
$ grep -E 'movabsq|call' sum-O2.s
	movabsq	$5000000050000000, %rdx
	call	__printf_chk@PLT
```

There is no loop left. The compiler worked out that the sum is the constant 5000000050000000 and simply prints it: the optimised program takes about 0.003 seconds, almost all of it spent starting up. (Ubuntu's gcc also replaces `printf` by `__printf_chk`, a version with extra safety checks.) The lesson for later chapters: to measure speed honestly, you must make sure the compiler cannot skip the work you are timing (Chapter 19).

## 1.11 · Toolkit

1. **Compile and run C:** `gcc -Wall -Wextra -std=c17 -o prog prog.c && ./prog`.
2. **Run Python:** `python3 prog.py`.
3. **Print:** `printf("format %d\n", value)` in C; `print(a, b)` or `print(f"{x:>5}")` in Python.
4. **Exit status:** `return n;` from `main`, or `sys.exit(n)`; check it with `echo $?`.
5. **Arguments:** `int main(int argc, char *argv[])`; `sys.argv`.
6. **See each C stage:** `gcc -E` (preprocess), `gcc -S` (assembly), `gcc -c` (object file), `nm` and `objdump -d` (inspect), `ldd` (libraries).
7. **See Python's bytecode:** `python3 -m dis file.py`.
8. **See system calls (Linux):** `strace -e trace=write ./prog`.

## 1.12 · Misconceptions to avoid

**"Python is not compiled."** It is compiled, to bytecode, every time you run it; it is just not compiled to machine code ahead of time. That compilation is why a syntax error on the last line stops the first line from running.

**"`printf` prints immediately."** It puts text into a buffer, which is written out later (Problem P3.3).

**"The compiler translates my code line by line."** It may rearrange, replace or delete code as long as the visible behaviour is the same: `printf` became `puts`, and a whole loop became one constant.

**"`argv[1]` is a number when I type a number."** Arguments are always text.

**"Exit status 0 means failure, like false."** In the shell it is the opposite: 0 means success, and any other value means some kind of failure.

**"C is fast and Python is slow, so always use C."** Python's slowness is in its interpreter loop; Python code that calls fast libraries (written in C) can be as fast as C. Chapters 34 and 42 show how.

## 1.13 · Problem ladder

### Tier 1 · First steps

**P1.1** Write a program in both languages that prints your name on one line and your city on the next.

**P1.2** Print this triangle, in both languages:

```text
*
**
***
```

**P1.3** What exactly does `printf("a\tb\\n");` print? What does `print("a\tb\\n")` print?

**P1.4** Change `print("6 x 7 =", 6 * 7)` so that there is no space between `=` and `42`.

**P1.5** Make the Python program print `Hello, Kota!` without a new line at the end. (Look up the `end` argument of `print`.)

**P1.6** A student's program prints nothing and the terminal shows `bash: ./hello: No such file or directory`. What did they forget?

### Answers: Tier 1

**P1.1**

```c
// me.c
#include <stdio.h>

int main(void)
{
    printf("Aarav\n");
    printf("Kota\n");
    return 0;
}
```

```python
# me.py
print("Aarav")
print("Kota")
```

```console
$ gcc -Wall -Wextra -std=c17 -o me me.c && ./me
Aarav
Kota
$ python3 me.py
Aarav
Kota
```

**P1.2** Three print statements, or one with `\n` inside:

```c
// stars.c
#include <stdio.h>

int main(void)
{
    printf("*\n**\n***\n");
    return 0;
}
```

```python
# stars.py
print("*\n**\n***")
```

```console
$ gcc -Wall -Wextra -std=c17 -o stars stars.c && ./stars
*
**
***
$ python3 stars.py
*
**
***
```

**P1.3** Both print `a`, a tab, `b`, a backslash and the letter `n`, and then (only `print`) a new line. `\\` is one backslash, so `\\n` is a backslash followed by `n`, not a new line. The C version leaves the cursor at the end of the line.

**P1.4** `print("6 x 7 =", 6 * 7, sep="")` prints `6 x 7 =42`. For one space or none, an f-string is clearer: `print(f"6 x 7 ={6 * 7}")`.

**P1.5** `print("Hello, Kota!", end="")`.

**P1.6** To compile: there is no file called `hello` yet, only `hello.c`. Run `gcc -Wall -Wextra -std=c17 -o hello hello.c` first. (If the file exists but is in another folder, the same message appears.)

### Tier 2 · School and college exams

**P2.1** Explain the difference between a compiler and an interpreter, using C and Python as examples. Is "C is compiled, Python is interpreted" the whole truth?

**P2.2** Predict the exact output, then check:

```c
// predict.c
#include <stdio.h>

int main(void)
{
    printf("1\n2");
    printf("3\n");
    printf("%d%d\n", 4, 5);
    printf("[%4d]\n", 6);
    return 0;
}
```

**P2.3** Write the same program in Python, producing exactly the same output.

**P2.4** For each mistake, say whether gcc reports it at compile time and whether Python reports it before running any line: (a) a missing closing bracket; (b) a misspelled function name; (c) a missing semicolon in C.

**P2.5** What exit status does a C program have if `main` reaches its closing `}` without a `return`? And a Python program that reaches the end of its file?

### Answers: Tier 2

**P2.1** A **compiler** translates the whole program into another language before it runs; an **interpreter** carries out a program's instructions directly. gcc compiles C into machine code, which the processor runs with no further help. CPython is *both*: it compiles Python source to bytecode, and its interpreter loop runs the bytecode (Section 1.8). So "Python is interpreted" is a simplification: its bytecode is interpreted.

**P2.2 and P2.3**

```python
# predict.py
print("1\n2", end="")
print("3")
print(f"{4}{5}")
print(f"[{6:>4}]")
```

```console
$ gcc -Wall -Wextra -std=c17 -o predict predict.c && ./predict
1
23
45
[   6]
$ python3 predict.py
1
23
45
[   6]
```

The first `printf` ends with `2` and no new line, so the second continues the same line: `23`. `%d%d` prints the numbers with nothing between them. `%4d` pads 6 to width 4.

**P2.4** (a) Compile time in C; in Python too, before any line runs (`SyntaxError`). (b) Compile time in C (undeclared name); in Python only when that line runs (`NameError`). (c) Compile time; Python has no semicolons to forget.

**P2.5** 0 in both cases: since C99, reaching the end of `main` returns 0, and a Python program that finishes normally exits with status 0.

### Tier 3 · Interviews and contests

**P3.1** What does this print, and why? Write a Python version that prints the same thing.

```c
// count.c
#include <stdio.h>

int main(void)
{
    int n = printf("Kota\n");
    printf("%d\n", n);
    return 0;
}
```

**P3.2** A C program ends with `return 256;`. What does `echo $?` show? What about `sys.exit(256)` in Python?

**P3.3** This program prints nothing at all, although it calls `printf` before exiting. Explain why, and fix it. Write the Python equivalent and show it behaves the same way.

```c
// nobuf.c
#include <stdio.h>
#include <unistd.h>

int main(void)
{
    printf("Hello");
    _exit(0);
}
```

**P3.4** Write a program in each language that prints its command-line arguments in reverse order, one per line, without the program name.

### Answers: Tier 3

**P3.1** `printf` returns the number of characters it printed: 5 (four letters and the new line). Python's `print` returns `None`, but `sys.stdout.write` returns the count.

```python
# count.py
import sys

n = sys.stdout.write("Kota\n")
print(n)
```

```console
$ gcc -Wall -Wextra -std=c17 -o count count.c && ./count
Kota
5
$ python3 count.py
Kota
5
```

**P3.2** Both show 0. On Linux and macOS the exit status is a single byte, so only the value modulo 256 survives: 256 becomes 0, which looks like success. Never use exit statuses above 255.

```c
// r256.c
int main(void)
{
    return 256;
}
```

```console
$ gcc -Wall -Wextra -std=c17 -o r256 r256.c && ./r256; echo $?
0
$ python3 -c "import sys; sys.exit(256)"; echo $?
0
```

**P3.3** `printf` does not write immediately: it stores text in a **buffer** in the program's memory and writes the buffer out when it is full, when a new line is printed to a terminal, or when the program exits normally. `_exit` ends the process immediately, without the normal exit steps, so the buffer is never written. Fix: call `fflush(stdout);` before `_exit`, or end normally with `return 0;`. Python buffers too, and `os._exit` skips its exit steps in the same way.

```python
# nobuf.py
import os

print("Hello", end="")
os._exit(0)
```

```console
$ gcc -Wall -Wextra -std=c17 -o nobuf nobuf.c && ./nobuf
$ python3 nobuf.py
```

Both print nothing. This matters in practice: if a program crashes, the last lines it "printed" may never appear, so printing is an unreliable way to find where a crash happened (Chapter 11 shows better ways).

**P3.4**

```c
// rev.c
#include <stdio.h>

int main(int argc, char *argv[])
{
    for (int i = argc - 1; i >= 1; i--)
        printf("%s\n", argv[i]);
    return 0;
}
```

```python
# rev.py
import sys

for a in reversed(sys.argv[1:]):
    print(a)
```

```console
$ gcc -Wall -Wextra -std=c17 -o rev rev.c && ./rev one two three
three
two
one
$ python3 rev.py one two three
three
two
one
```

`sys.argv[1:]` is the list without its first item (a **slice**, Chapter 12).

### Tier 4 · Olympiad

**P4.1** A **quine** is a program that prints its own source code exactly, without reading its own file. Write one in Python and one in C.

**P4.2** Write a single file that is a valid C program *and* a valid Python program, and prints the same line either way.

**P4.3** Print the exact product 123456789 × 987654321 in both languages. Then explain why `printf("%d\n", 123456789 * 987654321);` prints a wrong (negative) number.

### Answers: Tier 4

**P4.1** The trick is to store a template of the program in a string, and print the template with the string itself substituted into it.

```python
# quine.py
s='# quine.py%cs=%r;print(s%%(10,s))';print(s%(10,s))
```

In the template, `%c` with the number 10 becomes the line break after the first line, `%r` is replaced by the string's own representation, quotes included, and `%%` prints a single `%`. In C, characters that are awkward inside the template are supplied as numbers: 10 is a new line and 34 a double quote.

```c
// quine.c
#include <stdio.h>
int main(void){char*s="// quine.c%c#include <stdio.h>%cint main(void){char*s=%c%s%c;printf(s,10,10,34,s,34,10);return 0;}%c";printf(s,10,10,34,s,34,10);return 0;}
```

```console
$ python3 quine.py > out.py && cmp out.py quine.py && echo identical
identical
$ gcc -Wall -Wextra -std=c17 -o quine quine.c && ./quine > out.c && cmp out.c quine.c && echo identical
identical
```

(`cmp` compares two files byte by byte and prints nothing if they are equal.) Quines are the programming version of a sentence that describes itself; the idea behind them, a program that can refer to its own text, is at the heart of Kleene's recursion theorem in computability theory.

**P4.2** Python treats every line starting with `#` as a comment, and C uses `#` for preprocessor lines. So define a C macro that turns Python's `print(...)` into a complete C `main` function:

<!-- file: both.c -->
```c
#include <stdio.h>
#define print(x) int main(void) { printf("%s\n", x); return 0; }
print("Hello from C and Python")
```

```console
$ gcc -Wall -Wextra -std=c17 -o both both.c && ./both
Hello from C and Python
$ cp both.c both.py && python3 both.py
Hello from C and Python
```

For C, the preprocessor rewrites the last line as `int main(void) { printf("%s\n", "Hello from C and Python"); return 0; }`. For Python, the first two lines are comments and the last is an ordinary `print`. Save it as `both.c` and copy it to `both.py`.

**P4.3**

```c
// mul.c
#include <stdio.h>

int main(void)
{
    long long a = 123456789, b = 987654321;
    printf("%lld\n", a * b);
    return 0;
}
```

```console
$ gcc -Wall -Wextra -std=c17 -o mul mul.c && ./mul
121932631112635269
$ python3 -c "print(123456789 * 987654321)"
121932631112635269
```

In `123456789 * 987654321` both numbers are of type `int`, which on these systems holds values only up to 2,147,483,647, so the product does not fit. Overflowing `int` arithmetic is **undefined behaviour** in C: the program has no meaning at all, and in practice you usually see the true answer reduced modulo 2³², which here is negative. gcc warns about it (`-Woverflow`). Making the numbers `long long` (64 bits, up to about 9.2 × 10¹⁸) fixes it. Python integers grow as large as needed, so Python never overflows. Chapters 2 and 3 explain all of this.

### Tier 5 · Systems and professional

**P5.1** Use `gcc -c` and `nm` to list the symbols of `args.o`. Which are defined and which must come from a library? Why is `printf` there but not `puts`?

**P5.2** Change `hello.c` to print a number, `printf("Hello, Kota %d!\n", 2026);`, and look at the assembly. Does gcc still call `puts`? Why not?

**P5.3** Build a statically linked `hello` with `gcc -static` and compare its size and `ldd` report with the normal one. What are the advantages and disadvantages of each?

**P5.4** Use `strace -c` to count system calls for `./hello` and `python3 hello.py`, and explain where Python's extra calls come from.

### Answers: Tier 5

**P5.1**

```console
$ gcc -Wall -Wextra -std=c17 -c args.c && nm args.o
0000000000000000 T main
                 U printf
```

`main` is defined (`T`); `printf` must come from the C library (`U`). Here `printf` has `%d` and `%s` conversions, so it cannot be replaced by `puts`.

**P5.2**

```c
// hello2026.c
#include <stdio.h>

int main(void)
{
    printf("Hello, Kota %d!\n", 2026);
    return 0;
}
```

```console
$ gcc -S hello2026.c && grep call hello2026.s
	call	printf@PLT
```

`puts` prints a fixed string; it cannot format a number. The replacement is only allowed when the result is guaranteed to be identical, which needs a format string with no conversions that ends in `\n`.

**P5.3**

```console
$ gcc -static -o hello-static hello.c
$ ldd hello-static
	not a dynamic executable
$ ls -l hello hello-static
...
```

On our test machine the dynamic `hello` is about 16 KB and the static one about 785 KB, because the static one contains its own copy of every part of the C library it uses. Static programs run anywhere with a compatible kernel, without depending on installed libraries, which suits containers and embedded systems. Dynamic programs are small, share one copy of the library in memory, and get library security fixes without being rebuilt.

**P5.4**

```console
$ strace -f -c ./hello > /dev/null 2> c-calls.txt; tail -n 1 c-calls.txt
...total
$ strace -f -c python3 hello.py > /dev/null 2> py-calls.txt; tail -n 1 py-calls.txt
...total
```

On our test machine: about 30 calls for C, over 400 for Python. Both start the same way: the kernel runs the program and the dynamic loader opens and maps `libc` (calls such as `openat`, `mmap`, `mprotect`). Python then searches for and reads its standard library and its startup modules (many `newfstatat`, `openat`, `read` and `getdents64` calls), sets up memory for its objects, and only then compiles and runs your one line.

## 1.14 · Mastery check

1. What does `#include <stdio.h>` do, and which stage of the build carries it out?
2. Why does a syntax error on the last line of a Python file stop the first line from running?
3. Name the four stages of a C build and the `gcc` option that stops after each of the first three.
4. What do `T` and `U` mean in the output of `nm`?
5. What is printed by `printf("%-5s|%3d|\n", "ab", 7);`?
6. After `./prog; echo $?` prints `1`, did `prog` succeed?
7. Why might `gcc -O2` make a timing experiment meaningless?
8. What single system call do both "Hello, Kota!" programs make to put text on the screen?

### Answers: Mastery check

1. It pastes the declarations of the standard input/output functions into the file; the preprocessor does it, before compiling.
2. Python compiles the whole file to bytecode before running any of it, and a syntax error makes that compilation fail.
3. Preprocessing (`-E`), compiling to assembly (`-S`), assembling to an object file (`-c`), linking.
4. `T`: defined in this file's code; `U`: used here but defined elsewhere.
5. `ab   |  7|`.
6. No: a non-zero status means failure.
7. The compiler may compute the answer at compile time and remove the work you meant to time.
8. `write`, to file descriptor 1 (standard output).

## 1.15 · Where this leads

Chapter 2 looks at what the bytes in that `write` call actually are: how numbers and characters are stored as bits, why `int` has a largest value, and why Python's integers do not.
