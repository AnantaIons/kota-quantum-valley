"""Diagrams for Course 4 Chapter 0. Run: python3 content/os/chapters/KQV-OS-C000/diagrams/make.py"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '../../../../programming/tools'))
from flow import Flow

W, H = 440, 400
d = Flow(W, H)
L, BW = 14, W - 28
d.box(L, 14, BW, 50, ['where-arm', 'ARM64 instructions: add, ldr, svc ...'], 'c2', 'f2')
d.arrow(W / 2, 64, W / 2, 86, 'c2', 'every block of instructions', 8)
d.box(L, 88, BW, 64, ['qemu-aarch64 (a normal x86 program)', 'translates each ARM block into x86 instructions', 'and keeps the translation for next time'], 'c1', 'f1')
d.arrow(W / 2 - 70, 152, W / 2 - 70, 196, 'c3', 'x86 instructions', 8)
d.arrow(W / 2 + 70, 152, W / 2 + 70, 196, 'c1', 'system calls', 8)
d.box(L, 198, BW / 2 - 6, 60, ['the laptop processor', 'runs the translation'], 'c3', 'f3')
d.box(L + BW / 2 + 6, 198, BW / 2 - 6, 60, ['the laptop Linux kernel', 'answers uname, write ...'], 'c3', 'f3')
d.text(W / 2, 290, 'user-mode emulation: one program, the host kernel', 'lab small t5')
d.box(L, 304, BW, 74, ['Part 7: system emulation (qemu-system-aarch64)', 'a whole ARM computer: processor, memory, devices,', 'and its own ARM Linux kernel'], 'c5', 'f2', small=None)
d.save(os.path.join(HERE, 'p0-qemu.svg'), 'In user-mode emulation, qemu-aarch64 translates the ARM program\'s instructions into x86 instructions for the laptop processor, and passes its system calls to the laptop\'s Linux kernel. In system emulation, used from Part 7, QEMU imitates a whole ARM computer with its own kernel.')
