"""Diagrams for Course 3 Chapter 0. Run: python3 content/programming/chapters/KQV-PROG-C000/diagrams/make.py"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '../../../tools'))
from flow import Flow

d = Flow(440, 300)
d.text(110, 18, 'C', 'lab t3', 'middle'); d.text(330, 18, 'Python', 'lab t1', 'middle')
d.box(20, 30, 180, 120, ['your C program', 'machine code: the', "processor's own", 'instructions'], 'c3')
d.box(240, 30, 180, 52, ['your Python program', 'bytecode'], 'c1')
d.arrow(330, 82, 330, 96, 'c1')
d.box(240, 98, 180, 52, ['CPython interpreter', 'a C program, compiled'], 'c3')
d.arrow(110, 150, 110, 178, 'c5', 'system calls')
d.arrow(330, 150, 330, 178, 'c5', 'system calls')
d.box(20, 180, 400, 46, ['operating system kernel', 'Linux, Windows, macOS, Android'], 'c2')
d.arrow(220, 226, 220, 244, 'c5')
d.box(20, 246, 400, 46, ['hardware', 'processor, memory, screen, disk'], 'c5', fill='f2')
d.save(os.path.join(HERE, 'p0-stack.svg'), 'C programs are machine code that runs on the processor directly. Python programs are bytecode run by the CPython interpreter, which is itself a compiled C program. Both reach the hardware only through the operating system kernel, using system calls.')
