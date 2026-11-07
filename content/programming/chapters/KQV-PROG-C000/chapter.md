---
id: KQV-PROG-C000
course: "Course 3: Programming in C and Python"
chapter_number: 0
title: "How This Course Works, and Setting Up"
subtitle: "Why we learn C and Python side by side, what you will be able to build, and how to get both languages running on your computer or phone."
language: en
version: 0.1.0
status: code_checked
publication_status: published
---

# Chapter 0 · How This Course Works, and Setting Up

Here is the same small program written twice. Both add up the numbers from 1 to 100.

```c
// first.c
#include <stdio.h>

int main(void)
{
    int total = 0;
    for (int n = 1; n <= 100; n++)
        total = total + n;
    printf("1 + 2 + ... + 100 = %d\n", total);
    return 0;
}
```

```python
# first.py
total = 0
for n in range(1, 101):
    total = total + n
print("1 + 2 + ... + 100 =", total)
```

```console
$ gcc -Wall -Wextra -std=c17 -o first first.c
$ ./first
1 + 2 + ... + 100 = 5050
$ python3 first.py
1 + 2 + ... + 100 = 5050
```

Same answer, different shapes. The C version declares that `total` is an `int`, wraps everything in a function called `main`, uses braces and semicolons, and has to be **compiled** into a separate program (`first`) before it can run. The Python version is shorter, uses indentation instead of braces, and runs directly.

Every difference you can see has a reason underneath, and those reasons are what this course is about. By the end you will be able to explain each one: what `int` means in the computer's memory, what the compiler did, why the Python version needs no declarations, and why the C version runs about twenty times faster on long loops.

> **Driving question:** Why learn two languages at once, and what do I need to start?

## 0.1 · Why C and Python, together

**C** was created in the early 1970s and is still the language closest to the machine that most programmers ever use. Operating system kernels such as Linux, the firmware inside meters, cars and phones, and the standard Python interpreter itself (CPython) are written mainly in C. In C you decide how much memory each value gets and where it lives, and the compiler turns your code into the processor's own instructions. Nothing is hidden, which makes C both powerful and unforgiving.

**Python** is designed to be easy to read and quick to write. It manages memory for you, has huge libraries, and is the main language of data science, machine learning and quantum software: IBM's Qiskit, which Course 1 uses, is a Python library. The price is speed and control: a Python loop runs far more slowly than the same loop in C, and you cannot see where your data sits in memory.

Most courses teach one of them. We teach both, **side by side, in every chapter**, for three reasons:

1. **Each language explains the other.** Python's convenience is built out of things C makes you do by hand. When you have written a growable array in C, you understand what Python's `list` is doing for you, and what it costs.
2. **Real work uses both.** Scientific and quantum software is typically a fast core in C (or C++) with a Python interface on top. Chapter 49 builds exactly that: a quantum simulator with a C engine and a Python front end.
3. **You learn the idea, not the syntax.** Seeing the same loop written twice makes it obvious which parts are the idea (repeat this 100 times) and which are one language's spelling of it.

![Where the two languages sit. Python programs run on an interpreter that is itself a C program; C programs are compiled to the processor's own instructions. Both reach the hardware through the operating system.](diagram:p0-stack)

## 0.2 · What you will be able to do

The course has ten parts. Each answers one question.

| Part | Question | You will build |
|---|---|---|
| 0. Start here | Why two languages, and how do I set up? | A working setup |
| 1. How a program runs | What happens between typing code and seeing output? | Programs that compute and print |
| 2. Control flow and functions | How does a program decide, repeat and organise itself? | Games, calculators, recursive puzzles |
| 3. Data and memory | Where does data live, and who owns it? | Text tools, file formats, your own growable array |
| 4. Algorithms and data structures | How do we solve problems fast and prove it? | Sorting, hash tables, graph search, contest solutions |
| 5. Building real software | How do professionals build, test and share code? | A tested, version-controlled library |
| 6. Numerical and scientific computing | How do we compute with real numbers correctly? | Complex arithmetic, matrices, Monte Carlo |
| 7. Systems and performance | How does code meet the hardware? | Fast code, C called from Python, embedded C |
| 8. Programming for quantum | How do we simulate and control qubits? | A state-vector quantum simulator in both languages |
| 9. Capstone and beyond | Can you build something real, end to end? | A complete quantum simulator library |

The full chapter list is on the course page.

## 0.3 · How every chapter works

- **Side by side.** C and Python versions of each idea sit next to each other (one above the other on a phone). C is labelled in blue, Python in gold.
- **Real output.** Every program on every page is compiled or run by our test suite before the chapter is published, and the output printed under it is the real output. Commands are shown as you would type them in a terminal, after a `$` sign:
  ```console
  $ python3 first.py
  1 + 2 + ... + 100 = 5050
  ```
  You type `python3 first.py`; the line under it is what the computer prints. When output depends on your machine (file paths, memory addresses, timings), the page shows `...` in its place.
- **Underneath.** Each chapter explains what happens in memory, in the compiler or interpreter, or in the operating system, wherever it matters.
- **A problem ladder.** Problems climb through five tiers, as far as the topic reaches:

| Tier | Level |
|---|---|
| P1 | First steps: check the idea with short exercises |
| P2 | School and college exams: Class 11–12 Computer Science, first-year programming |
| P3 | Interviews and contests: coding-interview and contest problems |
| P4 | Olympiad: Indian Computing Olympiad, IOI and ICPC style |
| P5 | Systems and professional: university systems courses and industry practice |

Every problem has a full solution, folded away until you have tried it.

## 0.4 · Setting up

You need two things: a **C compiler** and **Python 3**. Both are free. Pick your system.

**Linux (Ubuntu or Debian).** Open a terminal and run:

```console
$ sudo apt install build-essential python3
```

`build-essential` contains `gcc`, the GNU C compiler, and the tools it needs.

**macOS.** Open Terminal and run `xcode-select --install`. This installs Apple's command-line tools, which include the `clang` compiler; on a Mac the command `gcc` also runs `clang`, and everything in this course works with it. Install Python 3 from [python.org](https://www.python.org/downloads/).

**Windows.** Install Python 3 from [python.org](https://www.python.org/downloads/), and tick **Add python.exe to PATH** on the installer's first screen. For C, either:

- install **WSL** (Windows Subsystem for Linux) by running `wsl --install` in PowerShell as administrator, restart, and then follow the Linux steps inside the Ubuntu window; or
- install **MSYS2** from [msys2.org](https://www.msys2.org/), open the *MSYS2 UCRT64* terminal, and run `pacman -S mingw-w64-ucrt-x86_64-gcc`.

On Windows the compiled program is called `first.exe`, and you run it as `first` or `.\first.exe`. Python may be started with `py` or `python` instead of `python3`.

**Android phone.** Install **Termux** (see [termux.dev](https://termux.dev/) for current download options), open it and run `pkg install clang python`. In Termux, type `clang` wherever this course writes `gcc`; the options are the same.

**Check that it works.** Run these two commands. You should see version numbers (yours may be newer than ours):

```console
$ gcc --version
gcc (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0
...
$ python3 --version
Python 3.13.18
```

*Which versions do we test with?* Every program in this course is checked with gcc 13 and Python 3.13 on 64-bit Linux. Anything from gcc 9 or clang 10, and Python 3.10, onwards will run them; error messages may be worded slightly differently.

## 0.5 · Your daily workflow

1. **Make a folder** for the course and open a terminal in it.
2. **Write code in a plain-text editor.** Any editor that saves plain text works. VS Code is free and popular; Notepad works too. Word processors do not: they save formatting along with the text.
3. **Save** the C program as `first.c` and the Python program as `first.py`.
4. **Compile and run the C program:**
   ```console
   $ gcc -Wall -Wextra -std=c17 -o first first.c
   $ ./first
   1 + 2 + ... + 100 = 5050
   ```
   - `gcc` is the compiler; `first.c` is the input.
   - `-o first` names the output program `first`.
   - `-std=c17` asks for the 2017 version of the C standard, which this course uses.
   - `-Wall -Wextra` turn on warnings. Always use them: a warning is the compiler telling you that your program is legal but probably not what you meant.
   - `./first` runs the program in the current folder (`.` means "this folder").
5. **Run the Python program:** `python3 first.py`. There is no separate compile step that you see; Chapter 1 shows what Python does instead.

## 0.6 · Reading error messages

You will make mistakes, and the error message is the computer telling you exactly where. Learn to read them now. Here are the most common first mistakes, with the real messages.

**A missing semicolon in C.** Change line 8 of `first.c` to `total = total + n` without the `;`, save it as `nosemi.c`, and compile:

```c
// nosemi.c: this does not compile, on purpose
#include <stdio.h>

int main(void)
{
    int total = 0;
    for (int n = 1; n <= 100; n++)
        total = total + n
    printf("1 + 2 + ... + 100 = %d\n", total);
    return 0;
}
```

```console
$ gcc -Wall -Wextra -std=c17 -o nosemi nosemi.c
nosemi.c: In function ‘main’:
nosemi.c:8:26: error: expected ‘;’ before ‘printf’
    8 |         total = total + n
      |                          ^
      |                          ;
    9 |     printf("1 + 2 + ... + 100 = %d\n", total);
      |     ~~~~~~
```

Read it left to right: file `nosemi.c`, **line 8, column 26**, an *error*, and what the compiler expected. It even shows the fix (`;`) under the caret. Because there was an error, no program was produced: there is nothing to run.

**A missing colon in Python.**

```python
# colon.py: this has an error, on purpose
total = 0
for n in range(1, 101)
    total = total + n
print(total)
```

```console
$ python3 colon.py
  File ".../colon.py", line 3
    for n in range(1, 101)
                          ^
SyntaxError: expected ':'
```

**Wrong indentation in Python.** Python uses indentation to know what is inside the loop, so it must be consistent:

```python
# indent.py: this has an error, on purpose
total = 0
for n in range(1, 101):
total = total + n
print(total)
```

```console
$ python3 indent.py
  File ".../indent.py", line 4
    total = total + n
    ^^^^^
IndentationError: expected an indented block after 'for' statement on line 3
```

Three rules make error messages easy:

1. **Read the first error first.** One mistake can confuse the compiler into reporting several more; fix the first and compile again.
2. **Look at the line number, and the line before it.** A missing `;` or `:` is often reported on the next line, where the compiler first notices something is wrong.
3. **Copy the exact message into a search engine** if it still makes no sense. Someone has seen it before.

## 0.7 · Problems

### Tier 1 · First steps

**P1.1** Install a C compiler and Python 3, and run `gcc --version` and `python3 --version`. Write down the versions you have.

**P1.2** Type `first.c` and `first.py` by hand (do not copy and paste), compile and run them, and check you get 5050.

**P1.3** Change both programs to add the numbers from 1 to 1000. What do they print?

**P1.4** In `first.c`, remove the line `#include <stdio.h>` and compile. What does the compiler say, and why?

**P1.5** In `first.py`, add the line `print("start")` at the very top, and misspell the last `print` as `pirnt`. Run it. Is the mistake found before the program starts, or while it runs?

**P1.6** Explain in one sentence each what `-o first`, `-Wall` and `./first` do.

### Answers: Tier 1

**P1.1** Any recent versions work: gcc 9 or later (or clang 10 or later) and Python 3.10 or later.

**P1.2** Typing builds the habit of noticing every character: braces, semicolons, colons and indentation all matter.

**P1.3** Change `100` to `1000` (and `101` to `1001` in Python, because `range(1, 1001)` stops just before 1001). Both print 500500.

```c
// first1000.c
#include <stdio.h>

int main(void)
{
    int total = 0;
    for (int n = 1; n <= 1000; n++)
        total = total + n;
    printf("1 + 2 + ... + 1000 = %d\n", total);
    return 0;
}
```

```python
# first1000.py
total = 0
for n in range(1, 1001):
    total = total + n
print("1 + 2 + ... + 1000 =", total)
```

```console
$ gcc -Wall -Wextra -std=c17 -o first1000 first1000.c
$ ./first1000
1 + 2 + ... + 1000 = 500500
$ python3 first1000.py
1 + 2 + ... + 1000 = 500500
```

**P1.4** gcc complains that `printf` has not been declared: "implicit declaration of function ‘printf’", with a note suggesting `#include <stdio.h>`. With gcc 13 this is a warning and the program still compiles; from gcc 14 onwards it is an error. Either way, treat it as a mistake. The `#include` line is what tells the compiler that `printf` exists and what arguments it takes; Chapter 1 shows exactly what it pastes into your file.

**P1.5** While it runs. `start` is printed, the loop runs, and only when Python reaches the last line does it stop with `NameError: name 'pirnt' is not defined. Did you mean: 'print'?`. A misspelled name is not a grammar mistake, so Python cannot know it is wrong until it tries to look the name up. Compare the missing colon in Section 0.6, which stopped the program before anything ran. Chapter 1 explains the difference between these two kinds of error.

**P1.6** `-o first` names the compiled program `first`; `-Wall` turns on the compiler's main warnings; `./first` runs the program called `first` in the current folder.

## 0.8 · Where this leads

Chapter 1 takes the simplest possible program, one that prints a single line, and follows it all the way down: through the C preprocessor, compiler, assembler and linker, through Python's bytecode compiler and interpreter, to the single operating-system call that both programs end in.
