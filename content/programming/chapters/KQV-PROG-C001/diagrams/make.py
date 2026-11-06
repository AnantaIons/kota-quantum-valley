"""Diagrams for Course 3 Chapter 1. Run: python3 content/programming/chapters/KQV-PROG-C001/diagrams/make.py"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '../../../tools'))
from flow import Flow

W, H = 440, 520
d = Flow(W, H)
L, R, BW = 14, 232, 194          # column left edges and box width
cx, px = L + BW / 2, R + BW / 2
d.text(cx, 16, 'C: before running, once', 'lab small t3'); d.text(px, 16, 'Python: every time you run', 'lab small t1')
c_steps = [(['hello.c', 'your text'], 'c5', 'f3'), (['preprocessor', 'gcc -E: pastes #include'], 'c3', 'f3'), (['compiler', 'gcc -S: C to assembly'], 'c3', 'f3'),
           (['assembler', 'gcc -c: machine code (.o)'], 'c3', 'f3'), (['linker', 'joins hello.o and libc'], 'c3', 'f3'), (['hello', 'a program of machine code'], 'c3', 'f1')]
y = 28
for k, (lines, tone, fill) in enumerate(c_steps):
    d.box(L, y, BW, 44, lines, tone, fill)
    if k < len(c_steps) - 1:
        d.arrow(cx, y + 44, cx, y + 58, 'c3')
    y += 58
c_end = y - 14
p_steps = [(['hello.py', 'your text'], 'c5', 'f3'), (['bytecode compiler', 'whole file, first'], 'c1', 'f3'), (['bytecode', 'LOAD_NAME, CALL, ...'], 'c1', 'f3'),
           (['interpreter loop', 'CPython, written in C'], 'c1', 'f1')]
y = 28
for k, (lines, tone, fill) in enumerate(p_steps):
    d.box(R, y, BW, 44, lines, tone, fill)
    if k < len(p_steps) - 1:
        d.arrow(px, y + 44, px, y + 58, 'c1')
    y += 58
p_end = y - 14
ky = 392
d.arrow(cx, c_end, cx, ky - 2, 'c3', 'processor runs it', 6)
d.arrow(px, p_end, px, ky - 2, 'c1', 'runs each instruction', 6)
d.box(L, ky, W - 2 * L, 52, ['write(1, "Hello, Kota!\\n", 13)', 'the same system call from both programs'], 'c2', small=None)
d.arrow(W / 2, ky + 52, W / 2, ky + 72, 'c5')
d.box(L, ky + 74, W - 2 * L, 40, ['kernel puts 13 bytes on your screen'], 'c5', 'f2')
d.save(os.path.join(HERE, 'p1-pipeline.svg'), 'C is translated before it runs, in four stages: preprocessor, compiler, assembler and linker, giving a program of machine code. Python compiles the whole file to bytecode each time it runs, then the CPython interpreter loop carries out each instruction. Both end in the same write system call to the kernel.')
