---
id: KQV-PROG-C002
course: "Course 3: Programming in C and Python"
chapter_number: 2
title: "Bits, Bytes and Number Systems"
subtitle: "How a computer stores every number and every letter as a pattern of bits, why C's integers wrap around and Python's never do, and how to decode the bytes of a Hindi word by hand."
language: en
version: 0.1.0
status: code_checked
publication_status: published
---

# Chapter 2 · Bits, Bytes and Number Systems

In Chapter 1, both programs ended by asking the kernel to write 13 bytes. Here they are as numbers:

```python
# peek.py
print(list("Hello, Kota!\n".encode()))
```

```console
$ python3 peek.py
[72, 101, 108, 108, 111, 44, 32, 75, 111, 116, 97, 33, 10]
```

Every letter is a number: `H` is 72, a space is 32, the new line is 10. And every number, inside the machine, is a row of **bits**, each 0 or 1. This chapter is about those rows: how to read and write them, how they represent negative numbers, why `int` has a largest value in C and not in Python, and how a single rupee sign `₹` becomes three bytes.

> **Driving question:** How does a row of 0s and 1s become a number, a negative number or a letter, and what goes wrong when it runs out of room?

## 2.1 · What this chapter covers

By the end of this chapter you should be able to:

- convert between decimal, binary, hexadecimal and octal, by hand and in code;
- say how many values fit in $n$ bits, and find the sizes and limits of C's integer types;
- explain why unsigned arithmetic in C wraps around modulo $2^n$, and why Python integers never overflow;
- represent negative numbers in two's complement, and prove that the processor's adder works for them unchanged;
- recognise signed overflow as undefined behaviour in C, and detect it with a sanitizer;
- read the bytes of a number in memory and explain byte order;
- encode and decode text in ASCII and UTF-8, by hand and in both languages.

**You need:** Chapter 1. A few programs use a loop or a small function before Chapters 8 and 9 explain them; each is described in words.

## 2.2 · Bits and bytes

A **bit** is one of two states: a transistor on or off, a voltage high or low, written 1 or 0. One bit can tell two things apart. Two bits make four patterns, `00`, `01`, `10`, `11`; each extra bit doubles the count.

**Counting rule.** $n$ bits have exactly $2^n$ patterns.

A **byte** is 8 bits, so it has $2^8=256$ patterns. Memory is organised in bytes: every byte has an **address**, a number saying where it is. A 4-byte `int` is 32 bits, $2^{32}=4{,}294{,}967{,}296$ patterns.

## 2.3 · Number systems

Decimal is **positional**: in 4057 each digit is multiplied by a power of ten, $4\cdot10^3+0\cdot10^2+5\cdot10^1+7\cdot10^0$. Any whole number $b\ge2$ can be the base. Computers use three:

| Base | Name | Digits | Written in code as |
|---|---|---|---|
| 2 | binary | `0 1` | `0b101101` (Python; C23 and gcc) |
| 16 | hexadecimal | `0`–`9`, `a`–`f` (10 to 15) | `0x2d` |
| 8 | octal | `0`–`7` | `0o55` (Python), `055` (C) |

**Binary to decimal.** Add the powers of two where there is a 1:

$$
101101_2=1\cdot32+0\cdot16+1\cdot8+1\cdot4+0\cdot2+1\cdot1=45.
$$

**Decimal to binary.** Divide by 2 repeatedly and read the remainders from the bottom up:

| Division | Quotient | Remainder |
|---|---|---|
| 45 ÷ 2 | 22 | 1 |
| 22 ÷ 2 | 11 | 0 |
| 11 ÷ 2 | 5 | 1 |
| 5 ÷ 2 | 2 | 1 |
| 2 ÷ 2 | 1 | 0 |
| 1 ÷ 2 | 0 | 1 |

Reading upwards: $45=101101_2$. (Why it works: each division peels off the last binary digit, exactly as dividing by 10 peels off the last decimal digit.)

**Binary to hexadecimal.** Since $16=2^4$, every hex digit is exactly 4 bits. Group the bits in fours from the right: $10\,1101_2 = 0010\ 1101_2 = \texttt{2d}_{16}$. This is why programmers use hex: one byte is always exactly two hex digits, `00` to `ff`.

```c
// bases.c
#include <stdio.h>

/* Print the lowest `width` bits of `value`, most significant first. */
void print_bits(unsigned value, int width)
{
    for (int i = width - 1; i >= 0; i--)
        putchar((value >> i) & 1 ? '1' : '0');
}

int main(void)
{
    unsigned numbers[] = {0, 5, 45, 127, 128, 255};
    for (int k = 0; k < 6; k++) {
        unsigned n = numbers[k];
        printf("%3u  0x%02x  0o%03o  0b", n, n, n);
        print_bits(n, 8);
        printf("\n");
    }
    return 0;
}
```

```python
# bases.py
for n in [0, 5, 45, 127, 128, 255]:
    print(f"{n:3}  0x{n:02x}  0o{n:03o}  0b{n:08b}")

print(int("101101", 2), int("2d", 16), int("55", 8))
print(0b101101, 0x2d, 0o55)
```

```console
$ gcc -Wall -Wextra -std=c17 -o bases bases.c && ./bases
  0  0x00  0o000  0b00000000
  5  0x05  0o005  0b00000101
 45  0x2d  0o055  0b00101101
127  0x7f  0o177  0b01111111
128  0x80  0o200  0b10000000
255  0xff  0o377  0b11111111
$ python3 bases.py
  0  0x00  0o000  0b00000000
  5  0x05  0o005  0b00000101
 45  0x2d  0o055  0b00101101
127  0x7f  0o177  0b01111111
128  0x80  0o200  0b10000000
255  0xff  0o377  0b11111111
45 45 45
45 45 45
```

In C, `printf` prints hex with `%x` and octal with `%o`, but in C17 there is no binary conversion (C23 adds `%b`), so `print_bits` builds it one bit at a time: `(value >> i) & 1` shifts bit number `i` to the end and keeps only that bit (Section 2.7 explains `>>` and `&`). In Python, the format codes `x`, `o` and `b` do it all, and `int(text, base)` converts back.

## 2.4 · Integers that run out of room

C's integer types have **fixed sizes**. The C standard only sets minimums; on 64-bit Linux and macOS the sizes are:

```c
// sizes.c
#include <stdio.h>
#include <limits.h>
#include <stdint.h>

int main(void)
{
    printf("char %zu, short %zu, int %zu, long %zu, long long %zu bytes\n",
           sizeof(char), sizeof(short), sizeof(int), sizeof(long), sizeof(long long));
    printf("unsigned char: 0 to %u\n", UCHAR_MAX);
    printf("int: %d to %d\n", INT_MIN, INT_MAX);
    printf("unsigned long long: 0 to %llu\n", ULLONG_MAX);
    printf("uint8_t %zu, int32_t %zu, uint64_t %zu bytes\n",
           sizeof(uint8_t), sizeof(int32_t), sizeof(uint64_t));
    return 0;
}
```

```console
$ gcc -Wall -Wextra -std=c17 -o sizes sizes.c && ./sizes
char 1, short 2, int 4, long 8, long long 8 bytes
unsigned char: 0 to 255
int: -2147483648 to 2147483647
unsigned long long: 0 to 18446744073709551615
uint8_t 1, int32_t 4, uint64_t 8 bytes
```

`sizeof` gives a size in bytes; `%zu` prints it. `<limits.h>` names the limits, and `<stdint.h>` gives types with an exact width: `uint8_t` is always 8 bits, `int32_t` always 32. (On 64-bit Windows, `long` is 4 bytes, not 8. Code that must work everywhere uses the `<stdint.h>` types, which is why firmware is full of `uint8_t` and `uint32_t`.)

**Unsigned arithmetic wraps around.** An unsigned type with $n$ bits holds $0$ to $2^n-1$, and the C standard defines its arithmetic as **arithmetic modulo $2^n$**: a result that does not fit is reduced by $2^n$ until it does.

```c
// wrap.c
#include <stdio.h>
#include <stdint.h>

int main(void)
{
    uint8_t level = 250;
    level = level + 10;
    printf("250 + 10 in uint8_t = %u\n", level);
    uint8_t zero = 0;
    zero = zero - 1;
    printf("0 - 1 in uint8_t = %u\n", zero);
    return 0;
}
```

```python
# wrap.py
print("250 + 10 =", 250 + 10, " mod 256:", (250 + 10) % 256)
print("0 - 1 =", 0 - 1, " mod 256:", (0 - 1) % 256)
print("2 ** 100 =", 2 ** 100)
```

```console
$ gcc -Wall -Wextra -std=c17 -o wrap wrap.c && ./wrap
250 + 10 in uint8_t = 4
0 - 1 in uint8_t = 255
$ python3 wrap.py
250 + 10 = 260  mod 256: 4
0 - 1 = -1  mod 256: 255
2 ** 100 = 1267650600228229401496703205376
```

$260-256=4$ and $-1+256=255$. Python's integers have **no fixed size**: Python allocates more memory as a number grows, so `2 ** 100` is exact. To imitate C's 8-bit arithmetic in Python you write `% 256` (or `& 0xff`) yourself. The price is memory and speed: on Python 3.13, `sys.getsizeof(1)` is 28 bytes, and `sys.getsizeof(2 ** 1000)` is 160, against 4 bytes for every C `int`.

## 2.5 · Negative numbers: two's complement

How should a row of bits represent $-5$? The obvious idea, a **sign bit** in front of the size, has two flaws: it has two zeros (`00000000` and `10000000`), and adding a negative number needs different circuitry from adding a positive one. Every modern processor uses **two's complement** instead.

**Definition.** An $n$-bit pattern $b_{n-1}\dots b_1b_0$ has the **unsigned value** $u=\sum_{i=0}^{n-1}b_i2^i$ and the **two's complement value**

$$
s=-b_{n-1}2^{n-1}+\sum_{i=0}^{n-2}b_i2^i .
$$

The top bit counts as $-2^{n-1}$ instead of $+2^{n-1}$. For 8 bits: `01111111` is $127$, `10000000` is $-128$, `11111111` is $-128+127=-1$. The range is $-2^{n-1}$ to $2^{n-1}-1$: for 8 bits, $-128$ to $127$.

**To negate: flip every bit and add 1.** For $5=00000101$: flip to $11111010$, add 1, get $11111011$, which is $-128+64+32+16+8+2+1=-5$.

```c
// twos.c
#include <stdio.h>
#include <stdint.h>

void print_bits(unsigned value, int width)
{
    for (int i = width - 1; i >= 0; i--)
        putchar((value >> i) & 1 ? '1' : '0');
}

int main(void)
{
    int8_t values[] = {5, -5, 127, -128, -1};
    for (int k = 0; k < 5; k++) {
        int8_t v = values[k];
        printf("%5d  ", v);
        print_bits((uint8_t)v, 8);
        printf("  as unsigned: %3u\n", (uint8_t)v);
    }
    uint8_t five = 5;
    uint8_t minus_five = (uint8_t)(~five + 1);
    printf("~5 + 1 = %u, which is -5 as int8_t: %d\n", minus_five, (int8_t)minus_five);
    return 0;
}
```

```python
# twos.py
for v in [5, -5, 127, -128, -1]:
    u = v & 0xFF                     # the low 8 bits: the same pattern C stores
    print(f"{v:5}  {u:08b}  as unsigned: {u:3}")

u = (~5 + 1) & 0xFF
print("~5 + 1 =", u, "which is -5 as int8:", int.from_bytes(bytes([u]), "big", signed=True))
```

```console
$ gcc -Wall -Wextra -std=c17 -o twos twos.c && ./twos
    5  00000101  as unsigned:   5
   -5  11111011  as unsigned: 251
  127  01111111  as unsigned: 127
 -128  10000000  as unsigned: 128
   -1  11111111  as unsigned: 255
~5 + 1 = 251, which is -5 as int8_t: -5
$ python3 twos.py
    5  00000101  as unsigned:   5
   -5  11111011  as unsigned: 251
  127  01111111  as unsigned: 127
 -128  10000000  as unsigned: 128
   -1  11111111  as unsigned: 255
~5 + 1 = 251 which is -5 as int8: -5
```

(`(uint8_t)v` is a **cast**: it reinterprets the value as the unsigned type. In Python, `v & 0xFF` keeps the low 8 bits of `v`; Python treats a negative integer as if it had infinitely many 1s on the left, so this gives exactly C's pattern.)

![The 4-bit wheel. The same sixteen patterns read as unsigned numbers 0 to 15 (inside) or as two's complement numbers −8 to 7 (outside). Adding 1 always moves one step clockwise; going from 0111 to 1000 jumps from 7 to −8, which is signed overflow.](diagram:p2-wheel)

Why does every processor use this? Because of a theorem.

**Theorem 2.1 (the same adder works for both).** *For every $n$-bit pattern, $s\equiv u\pmod{2^n}$. Consequently, if the processor adds, subtracts or multiplies two patterns as unsigned numbers modulo $2^n$, the resulting pattern is also the correct two's complement answer whenever that answer lies in the range $-2^{n-1}$ to $2^{n-1}-1$. And flipping every bit and adding 1 gives $-s$.*

*Proof.* From the two formulas, $u-s=b_{n-1}2^{n-1}-(-b_{n-1}2^{n-1})=b_{n-1}2^n$, a multiple of $2^n$. So $s\equiv u\pmod{2^n}$.

Take patterns $x,y$ with unsigned values $u_x,u_y$ and signed values $s_x,s_y$. The processor produces the pattern $p$ whose unsigned value is $(u_x+u_y)\bmod 2^n$. Its signed value $s_p$ satisfies $s_p\equiv u_p\equiv u_x+u_y\equiv s_x+s_y\pmod{2^n}$. No two different integers in the signed range are congruent modulo $2^n$, because the range consists of exactly $2^n$ consecutive integers. Both $s_p$ and $s_x+s_y$ are congruent, so if $s_x+s_y$ is in range, $s_p=s_x+s_y$. The same argument works for $-$ and $\times$, since congruences can be subtracted and multiplied.

For negation, flipping every bit of a pattern with unsigned value $u$ gives the unsigned value $(2^n-1)-u$, since each bit $b_i$ becomes $1-b_i$. Adding 1 gives $2^n-u\equiv-u\equiv-s\pmod{2^n}$, and by the same uniqueness argument this pattern's signed value is $-s$ whenever $-s$ is in range. ∎

So one circuit adds both signed and unsigned numbers; only the *interpretation* of the result differs. The single exception to negation is $-2^{n-1}$ (for 8 bits, $-128$), whose negative $128$ is out of range: flipping and adding 1 gives $-128$ back.

## 2.6 · Signed overflow is undefined behaviour in C

For unsigned types, C defines the wrap-around. For **signed** types it does not: if a signed result is out of range, the program has **undefined behaviour**, meaning the C standard places no requirement at all on what happens. In practice the hardware usually wraps (Theorem 2.1), but the compiler is allowed to assume overflow never happens, and optimisers do use that assumption, so code that relies on wrapping can be silently "optimised" into something else. Here is an overflow, and gcc's **undefined behaviour sanitizer** catching it:

```c
// ovf.c
#include <stdio.h>
#include <limits.h>

int main(void)
{
    int big = INT_MAX;
    int next = big + 1;
    printf("%d + 1 = %d\n", big, next);
    return 0;
}
```

```console
$ gcc -Wall -Wextra -std=c17 -o ovf ovf.c && ./ovf
2147483647 + 1 = -2147483648
$ gcc -Wall -Wextra -std=c17 -fsanitize=undefined -o ovf ovf.c && ./ovf
ovf.c:8:9: runtime error: signed integer overflow: 2147483647 + 1 cannot be represented in type 'int'
2147483647 + 1 = -2147483648
```

The first run *looks* fine, which is exactly the danger. Build with `-fsanitize=undefined` while developing (Chapter 18 does this systematically). If you really want wrapping signed arithmetic, use an unsigned type, or compile with `-fwrapv`, which makes gcc define signed overflow as wrapping. Python has no such problem: its integers never overflow.

## 2.7 · Working with bits

Six operators work on the bits directly, the same in both languages:

| Operator | Meaning | `12` is `1100`, `10` is `1010` |
|---|---|---|
| `a & b` | AND: 1 where both are 1 | `12 & 10 = 8` (`1000`) |
| `a \| b` | OR: 1 where either is 1 | `12 \| 10 = 14` (`1110`) |
| `a ^ b` | XOR: 1 where they differ | `12 ^ 10 = 6` (`0110`) |
| `~a` | NOT: flip every bit | `~12` is `-13` (two's complement) |
| `a << k` | shift left by $k$: multiply by $2^k$ | `12 << 2 = 48` |
| `a >> k` | shift right by $k$: divide by $2^k$ | `12 >> 2 = 3` |

The everyday uses are **masks**: `x & (1 << k)` tests bit `k`, `x | (1 << k)` sets it, `x & ~(1 << k)` clears it, and `x ^ (1 << k)` flips it. Embedded C is full of these, because hardware is controlled by setting individual bits in registers (Chapter 44).

Two differences between the languages matter. Shifting a negative number right is **implementation-defined** in C (gcc copies the sign bit, giving $-7\gg1=-4$); in Python `>>` always rounds down, so `-7 >> 1` is `-4` too, by definition. And in C, shifting by the type's width or more (such as `1 << 32` on a 32-bit `int`) is undefined, while Python happily computes `1 << 100`.

## 2.8 · Byte order

A 4-byte integer occupies 4 consecutive addresses. Which byte comes first? On x86 and on ARM as normally configured (phones, Raspberry Pi, Apple M-series), the **least significant byte comes first**: this is **little-endian** order. Network protocols use the opposite, **big-endian** order, also called *network byte order*.

```c
// endian.c
#include <stdio.h>
#include <stdint.h>
#include <string.h>

int main(void)
{
    uint32_t x = 0x12345678;
    unsigned char bytes[4];
    memcpy(bytes, &x, 4);              /* copy the 4 bytes of x as they lie in memory */
    printf("in memory:");
    for (int i = 0; i < 4; i++)
        printf(" %02x", bytes[i]);
    printf("\n");
    return 0;
}
```

```python
# endian.py
import sys

x = 0x12345678
print("in memory:", x.to_bytes(4, sys.byteorder).hex(" "))
print("little-endian:", x.to_bytes(4, "little").hex(" "))
print("big-endian:   ", x.to_bytes(4, "big").hex(" "))
print("this machine is", sys.byteorder + "-endian")
```

```console
$ gcc -Wall -Wextra -std=c17 -o endian endian.c && ./endian
in memory: 78 56 34 12
$ python3 endian.py
in memory: 78 56 34 12
little-endian: 78 56 34 12
big-endian:    12 34 56 78
this machine is little-endian
```

`memcpy` copies raw bytes from one place to another, and `&x` is the address of `x` (Chapter 16). Byte order matters whenever bytes leave the program: in files, over a network, or across a serial line to a microcontroller, where both sides must agree on the order.

## 2.9 · Text: ASCII and UTF-8

A character is stored as a number. **ASCII** (1963) assigns the numbers 0 to 127 to the English letters, digits, punctuation and control codes: `A` to `Z` are 65 to 90, `a` to `z` are 97 to 122, `0` to `9` are 48 to 57, and the new line is 10. In C, a `char` *is* a small integer, so you can do arithmetic with letters.

```c
// chars.c
#include <stdio.h>

int main(void)
{
    char c = 'A';
    printf("%c is %d\n", c, c);
    printf("%c + 1 is %c\n", c, c + 1);
    printf("'7' - '0' is %d\n", '7' - '0');
    printf("%c with bit 5 set is %c\n", c, c | 0x20);
    return 0;
}
```

```python
# chars.py
c = "A"
print(c, "is", ord(c))
print(c, "+ 1 is", chr(ord(c) + 1))
print("'7' - '0' is", ord("7") - ord("0"))
print(c, "with bit 5 set is", chr(ord(c) | 0x20))
```

```console
$ gcc -Wall -Wextra -std=c17 -o chars chars.c && ./chars
A is 65
A + 1 is B
'7' - '0' is 7
A with bit 5 set is a
$ python3 chars.py
A is 65
A + 1 is B
'7' - '0' is 7
A with bit 5 set is a
```

`'7' - '0'` turns a digit character into its value, because the digits are consecutive. Upper and lower case differ by exactly 32, which is bit 5 (`0x20`), so setting that bit lower-cases an ASCII letter. Python keeps characters and numbers apart: `ord` gives a character's number and `chr` turns a number back into a character.

**Unicode** gives every character in every script a number, its **code point**, written `U+` and hex: `A` is U+0041, `₹` is U+20B9, `क` is U+0915. There are over a million possible code points, far more than a byte holds. **UTF-8** stores each code point in 1 to 4 bytes:

| Code points | Bytes | Bit pattern |
|---|---|---|
| U+0000 to U+007F | 1 | `0xxxxxxx` |
| U+0080 to U+07FF | 2 | `110xxxxx 10xxxxxx` |
| U+0800 to U+FFFF | 3 | `1110xxxx 10xxxxxx 10xxxxxx` |
| U+10000 to U+10FFFF | 4 | `11110xxx 10xxxxxx 10xxxxxx 10xxxxxx` |

The `x` positions hold the code point's bits, high bits first. **Encoding `₹` by hand:** U+20B9 is `0010 0000 1011 1001` in binary, 16 bits, so it needs 3 bytes. Split the bits 4 + 6 + 6: `0010`, `000010`, `111001`. Fill them in: `11100010`, `10000010`, `10111001`, which is `e2 82 b9`.

![Encoding ₹ (U+20B9) in UTF-8. The 16 bits of the code point are split 4 + 6 + 6 and placed into the free positions of a three-byte pattern, giving e2 82 b9.](diagram:p2-utf8)

Two features make UTF-8 the standard for text everywhere. ASCII text is unchanged (every ASCII byte means the same thing in UTF-8), and you can always tell where a character starts: continuation bytes, and only they, begin with `10`.

```c
// utf8.c
#include <stdio.h>
#include <string.h>

int main(void)
{
    const char *word = "Kota ₹ क";
    printf("strlen = %zu bytes:", strlen(word));
    for (size_t i = 0; i < strlen(word); i++)
        printf(" %02x", (unsigned char)word[i]);
    printf("\n");
    return 0;
}
```

```python
# utf8.py
word = "Kota ₹ क"
data = word.encode("utf-8")
print("len =", len(word), "characters,", len(data), "bytes:", data.hex(" "))
print([hex(ord(ch)) for ch in word])
print("e2 82 b9 is", bytes([0xE2, 0x82, 0xB9]).decode("utf-8"))
```

```console
$ gcc -Wall -Wextra -std=c17 -o utf8 utf8.c && ./utf8
strlen = 12 bytes: 4b 6f 74 61 20 e2 82 b9 20 e0 a4 95
$ python3 utf8.py
len = 8 characters, 12 bytes: 4b 6f 74 61 20 e2 82 b9 20 e0 a4 95
['0x4b', '0x6f', '0x74', '0x61', '0x20', '0x20b9', '0x20', '0x915']
e2 82 b9 is ₹
```

The same 12 bytes in both languages. But C's `strlen` counts **bytes**, while Python's `len` counts **characters** (code points), because a Python `str` is a sequence of code points and only becomes bytes when you `encode` it. Chapter 13 builds on this difference.

## 2.10 · Toolkit

1. **Convert:** repeated division by the base (decimal to base $b$); add the place values (base $b$ to decimal); group bits in fours for hex.
2. **Print bases:** `%x`, `%o` in C, plus a loop for binary; `f"{n:x}"`, `f"{n:o}"`, `f"{n:b}"`, `int(text, base)` in Python.
3. **Sizes and limits:** `sizeof`, `<limits.h>`; use `<stdint.h>` types when the width matters.
4. **Unsigned = modulo $2^n$.** Imitate it in Python with `% 2**n` or `& (2**n - 1)`.
5. **Two's complement:** top bit counts $-2^{n-1}$; negate by flipping and adding 1; one adder serves both interpretations (Theorem 2.1).
6. **Signed overflow is undefined in C:** catch it with `-fsanitize=undefined`.
7. **Masks:** test `x & (1 << k)`, set `|`, clear `& ~`, flip `^`.
8. **Byte order:** check with `memcpy` into bytes, or `sys.byteorder`; agree on an order whenever bytes leave the program.
9. **Text:** `ord`, `chr`, `.encode()`, `.decode()`; in C, a `char` is a byte, and a UTF-8 character can be several of them.

## 2.11 · Misconceptions to avoid

**"`int` is 32 bits."** On today's common systems it is, but C only promises at least 16. Use `int32_t` when you need exactly 32.

**"Overflow wraps around in C."** Only for unsigned types. Signed overflow is undefined behaviour, and the compiler may assume it never happens.

**"Python integers are 64-bit."** They have no size limit; the price is memory and speed.

**"`~x` is `-x`."** In two's complement, `~x` is $-x-1$. Negation is `~x + 1`.

**"One character is one byte."** Only for ASCII. In UTF-8, `₹` is 3 bytes and many emoji are 4.

**"Hex is a different kind of number."** It is the same number written in a different base; the bits in memory are identical whichever way you print them.

## 2.12 · Problem ladder

### Tier 1 · First steps

**P1.1** Convert 45, 100 and 255 to binary and hexadecimal by hand, then check with Python.

**P1.2** Convert `0b11010` and `0xC8` to decimal.

**P1.3** How many different values can 10 bits hold? What is the largest unsigned value?

**P1.4** What is $0110_2+0101_2$ in binary? Check in decimal.

**P1.5** Find the ASCII codes of `Z`, `z` and `9`.

### Answers: Tier 1

**P1.1** $45=101101_2=\texttt{2d}$, $100=1100100_2=\texttt{64}$, $255=11111111_2=\texttt{ff}$.

```console
$ python3 -c "print(bin(45), hex(45), bin(100), hex(100), bin(255), hex(255))"
0b101101 0x2d 0b1100100 0x64 0b11111111 0xff
```

**P1.2** $11010_2=16+8+2=26$; $\texttt{c8}=12\cdot16+8=200$.

**P1.3** $2^{10}=1024$ values; the largest unsigned value is $1023$.

**P1.4** Add column by column with carries: $0110+0101=1011_2$; in decimal $6+5=11$ ✓.

**P1.5** 90, 122 and 57.

### Tier 2 · School and college exams

**P2.1** Convert 156 to octal and hexadecimal, and $\texttt{3f}_{16}$ to binary.

**P2.2** Write $-20$ in 8-bit two's complement. Check by adding it to $+20$.

**P2.3** What is the range of a 16-bit signed integer? Of a 16-bit unsigned integer?

**P2.4** Write a program in both languages that reads nothing and prints the numbers 1, 2, 4, …, 128 together with their binary forms. (Use a loop like the one in `bases.c`.)

**P2.5** Encode `€` (U+20AC) in UTF-8 by hand. How many bytes?

### Answers: Tier 2

**P2.1** $156=234_8$ ($2\cdot64+3\cdot8+4$) $=\texttt{9c}_{16}$; $\texttt{3f}=0011\,1111_2$.

**P2.2** $20=00010100$; flip: $11101011$; add 1: $11101100$. Check: $00010100+11101100=1\,00000000$, and the ninth bit falls off in 8 bits, leaving $00000000$ ✓ (Theorem 2.1 at work).

**P2.3** Signed: $-32768$ to $32767$; unsigned: $0$ to $65535$.

**P2.4**

```c
// powers.c
#include <stdio.h>

void print_bits(unsigned value, int width)
{
    for (int i = width - 1; i >= 0; i--)
        putchar((value >> i) & 1 ? '1' : '0');
}

int main(void)
{
    for (unsigned p = 1; p <= 128; p = p * 2) {
        printf("%3u ", p);
        print_bits(p, 8);
        printf("\n");
    }
    return 0;
}
```

```python
# powers.py
p = 1
while p <= 128:
    print(f"{p:3} {p:08b}")
    p = p * 2
```

```console
$ gcc -Wall -Wextra -std=c17 -o powers powers.c && ./powers
  1 00000001
  2 00000010
  4 00000100
  8 00001000
 16 00010000
 32 00100000
 64 01000000
128 10000000
$ python3 powers.py | tail -n 2
 64 01000000
128 10000000
```

Each power of two is a single 1 moving left: multiplying by 2 is a shift left by one.

**P2.5** U+20AC is `0010 0000 1010 1100`: 3 bytes. Split 4 + 6 + 6: `0010`, `000010`, `101100`, giving `11100010 10000010 10101100` = `e2 82 ac`.

```console
$ python3 -c "print('€'.encode().hex(' '))"
e2 82 ac
```

### Tier 3 · Interviews and contests

**P3.1** Write a function that counts the 1 bits in an unsigned integer, using the fact that `n & (n - 1)` clears the lowest 1 bit. Why does that fact hold?

**P3.2** Show that a positive integer $n$ is a power of two exactly when `n & (n - 1) == 0`.

**P3.3** Swap two integers without a third variable, using XOR. Why does it work, and why should you not do this in real code?

**P3.4** Without looking anything up, write a C program that prints whether the machine is little-endian or big-endian.

**P3.5** What does `(unsigned char)300` equal in C? What is `300 & 0xFF` in Python?

### Answers: Tier 3

**P3.1** Write $n$ in binary as `...b 1 0...0` with $k$ zeros after its lowest 1. Then $n-1$ is `...b 0 1...1`: the borrow turns the lowest 1 into 0 and the zeros after it into 1s, leaving the higher bits `...b` alone. ANDing keeps `...b` and zeros everything else, so exactly the lowest 1 is cleared. Each loop step removes one 1 bit, so the loop runs once per 1 bit (Kernighan's method).

```c
// popcount.c
#include <stdio.h>

int count_ones(unsigned n)
{
    int count = 0;
    while (n != 0) {
        n = n & (n - 1);
        count++;
    }
    return count;
}

int main(void)
{
    printf("%d %d %d\n", count_ones(0), count_ones(45), count_ones(4294967295u));
    return 0;
}
```

```python
# popcount.py
def count_ones(n):
    count = 0
    while n != 0:
        n = n & (n - 1)
        count += 1
    return count

print(count_ones(0), count_ones(45), count_ones(2**32 - 1))
print((45).bit_count())
```

```console
$ gcc -Wall -Wextra -std=c17 -o popcount popcount.c && ./popcount
0 4 32
$ python3 popcount.py
0 4 32
4
```

(Python 3.10 added `int.bit_count()`; gcc has `__builtin_popcount`, which compiles to one instruction on processors that have it.)

**P3.2** A power of two has exactly one 1 bit; by P3.1, clearing it leaves 0. Conversely, if `n & (n - 1)` is 0 then $n$ had exactly one 1 bit (removing the lowest left nothing), so $n=2^k$. The condition $n>0$ is needed because `0 & (0 - 1)` is also 0.

**P3.3** `a ^= b; b ^= a; a ^= b;`. Using $x\oplus x=0$ and $x\oplus0=x$: after the first line $a=a_0\oplus b_0$; the second gives $b=b_0\oplus a_0\oplus b_0=a_0$; the third gives $a=a_0\oplus b_0\oplus a_0=b_0$. In real code it is slower than a temporary variable on modern processors, harder to read, and, if `a` and `b` are the same memory location, it sets it to 0.

**P3.4** Look at the first byte of the integer 1:

```c
// order.c
#include <stdio.h>
#include <string.h>

int main(void)
{
    unsigned one = 1;
    unsigned char first;
    memcpy(&first, &one, 1);
    printf("%s-endian\n", first == 1 ? "little" : "big");
    return 0;
}
```

```console
$ gcc -Wall -Wextra -std=c17 -o order order.c && ./order
little-endian
```

**P3.5** Both are 44: $300-256=44$. Converting to an 8-bit unsigned type keeps only the low 8 bits.

### Tier 5 · Systems and professional

**P5.1** Prove that for an $n$-bit pattern, the two's complement value is $s=u-b_{n-1}2^n$, and deduce the range of $s$.

**P5.2** Write a UTF-8 decoder in C: given the bytes `e0 a4 95`, compute the code point by hand-written bit operations and print it in `U+` form. Then make it reject the invalid sequence `c0 af`, which encodes `/` in two bytes instead of one. Why must decoders reject such "overlong" encodings?

**P5.3** A sensor sends a 16-bit signed temperature in hundredths of a degree, most significant byte first. The two bytes received are `fe 0c`. What temperature is it? Write the conversion in C and in Python.

**P5.4** In firmware, why is `uint32_t` preferred to `int` for a hardware register, and what goes wrong if a register value is stored in a signed type and shifted right?

### Answers: Tier 5

**P5.1** $u=\sum_{i=0}^{n-1}b_i2^i$ and $s=u-2b_{n-1}2^{n-1}=u-b_{n-1}2^n$. If $b_{n-1}=0$ then $s=u\in[0,2^{n-1}-1]$; if $b_{n-1}=1$ then $u\in[2^{n-1},2^n-1]$, so $s\in[-2^{n-1},-1]$. Together, $s$ takes each value from $-2^{n-1}$ to $2^{n-1}-1$ exactly once.

**P5.2** For a 3-byte sequence the code point is `(b0 & 0x0F) << 12 | (b1 & 0x3F) << 6 | (b2 & 0x3F)`. An overlong encoding is one that uses more bytes than needed, detected by checking the result against the smallest code point of its length.

```c
// decode.c
#include <stdio.h>

/* Decode one UTF-8 character of 1 to 3 bytes. Returns the code point, or -1 if invalid. */
long decode(const unsigned char *b, int n)
{
    if (n == 1 && b[0] < 0x80)
        return b[0];
    for (int i = 1; i < n; i++)
        if ((b[i] & 0xC0) != 0x80)              /* continuation bytes must be 10xxxxxx */
            return -1;
    if (n == 2 && (b[0] & 0xE0) == 0xC0) {
        long cp = (long)(b[0] & 0x1F) << 6 | (b[1] & 0x3F);
        return cp >= 0x80 ? cp : -1;             /* reject overlong forms */
    }
    if (n == 3 && (b[0] & 0xF0) == 0xE0) {
        long cp = (long)(b[0] & 0x0F) << 12 | (long)(b[1] & 0x3F) << 6 | (b[2] & 0x3F);
        return cp >= 0x800 ? cp : -1;
    }
    return -1;
}

int main(void)
{
    unsigned char ka[] = {0xE0, 0xA4, 0x95};
    unsigned char bad[] = {0xC0, 0xAF};
    printf("U+%04lX\n", decode(ka, 3));
    printf("%ld\n", decode(bad, 2));
    return 0;
}
```

```console
$ gcc -Wall -Wextra -std=c17 -o decode decode.c && ./decode
U+0915
-1
$ python3 -c "print(bytes([0xE0, 0xA4, 0x95]).decode())"
क
$ python3 -c "bytes([0xC0, 0xAF]).decode()" 2>&1 | tail -n 1
UnicodeDecodeError: 'utf-8' codec can't decode byte 0xc0 in position 0: invalid start byte
```

Overlong encodings must be rejected because they give one character two spellings. A program that checks text for a dangerous character such as `/` by looking for its one-byte form would miss the two-byte form, while a later decoder turns it back into `/`. Real attacks on web servers used exactly this, which is why the Unicode standard forbids overlong forms.

**P5.3** `fe 0c` big-endian is $\texttt{fe0c}=65036$ unsigned; as 16-bit two's complement, $65036-65536=-500$, so $-5.00$ °C.

```c
// temp.c
#include <stdio.h>
#include <stdint.h>

int main(void)
{
    uint8_t rx[2] = {0xFE, 0x0C};
    int16_t raw = (int16_t)((uint16_t)rx[0] << 8 | rx[1]);
    printf("raw %d, temperature %.2f C\n", raw, raw / 100.0);
    return 0;
}
```

```python
# temp.py
rx = bytes([0xFE, 0x0C])
raw = int.from_bytes(rx, "big", signed=True)
print(f"raw {raw}, temperature {raw / 100:.2f} C")
```

```console
$ gcc -Wall -Wextra -std=c17 -o temp temp.c && ./temp
raw -500, temperature -5.00 C
$ python3 temp.py
raw -500, temperature -5.00 C
```

The C version builds the 16-bit pattern as unsigned first and only then converts to `int16_t`. (Converting an out-of-range value to a signed type is implementation-defined in C17; gcc keeps the bit pattern, and C23 requires it.)

**P5.4** A register is a pattern of bits, often with the top bit meaningful, so it should be an unsigned type of the exact width: `uint32_t` is exactly 32 bits on every platform, while `int` may be 16 bits on a small microcontroller. In a signed type, a set top bit makes the value negative; shifting it right then copies the sign bit (on gcc) instead of inserting zeros, so a field extracted with `(reg >> 28) & 0xF` still works but `reg >> 28` alone gives a negative number, and comparisons such as `reg > threshold` go wrong.

## 2.13 · Mastery check

1. Convert 200 to binary and hex.
2. How many patterns do 12 bits have?
3. What is `0 - 1` in `uint16_t`?
4. Write $-1$ and $-128$ in 8-bit two's complement.
5. Why can the same adder circuit add signed and unsigned numbers?
6. What does `-fsanitize=undefined` do, and why does it matter for `int` but not for `unsigned`?
7. Write the bytes of `0x0A0B0C0D` in little-endian order.
8. How many bytes does `"क"` take in UTF-8, and what does `strlen` return for it?

### Answers: Mastery check

1. $11001000_2=\texttt{c8}$.
2. $2^{12}=4096$.
3. 65535.
4. `11111111` and `10000000`.
5. Theorem 2.1: two's complement values are congruent to the unsigned values modulo $2^n$, so the result pattern is right in both readings whenever the answer is in range.
6. It checks at run time for undefined behaviour such as signed overflow and reports it. Unsigned overflow is defined (it wraps), so there is nothing to report.
7. `0d 0c 0b 0a`.
8. 3 bytes (`e0 a4 95`); `strlen` returns 3.

## 2.14 · Where this leads

Chapter 3 turns from bits to **variables**: what a variable is in C (a named box of fixed size at an address) and in Python (a name attached to an object), and why that difference explains both C's speed and some of Python's most surprising bugs.
