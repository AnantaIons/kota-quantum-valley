"""Diagrams for Course 4 Chapter 1. Run: python3 content/os/chapters/KQV-OS-C001/diagrams/make.py"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '../../../../programming/tools'))
from flow import Flow

W, H = 440, 452
d = Flow(W, H)
L, BW = 14, W - 28
d.text(L, 16, 'user mode: EL0 on ARM64, ring 3 on x86', 'lab small t1', 'start')
third = (BW - 16) / 3
for k, name in enumerate(['your program', 'a shell', 'a web server']):
    d.box(L + k * (third + 8), 26, third, 44, [name, 'process'], 'c1', 'f1')
d.box(L, 84, BW, 40, ['C library: printf, malloc, fopen ...'], 'c1', 'f3')
d.f.add(f'<line class="c2 dash" x1="{L}" y1="146" x2="{L + BW}" y2="146"/>')
d.text(L, 140, 'system call: syscall on x86-64, svc on ARM64', 'lab small t2', 'start')
d.arrow(W - 60, 124, W - 60, 166, 'c2')
d.text(L, 182, 'kernel mode: EL1 on ARM64, ring 0 on x86', 'lab small t3', 'start')
half = (BW - 8) / 2
d.box(L, 192, half, 52, ['scheduler', 'shares the processors'], 'c3', 'f3')
d.box(L + half + 8, 192, half, 52, ['memory manager', 'one map per process'], 'c3', 'f3')
d.box(L, 252, half, 52, ['file systems, network', 'one interface: read, write'], 'c3', 'f3')
d.box(L + half + 8, 252, half, 52, ['device drivers', 'talk to the registers'], 'c3', 'f3')
d.arrow(W / 2, 304, W / 2, 330, 'c5')
d.box(L, 332, BW, 52, ['hardware', 'processor, MMU, timer, memory, storage, devices'], 'c5', 'f2')
d.text(W / 2, 410, 'interrupts (timer, devices) also enter the kernel,', 'lab small t5')
d.text(W / 2, 426, 'which is how the scheduler takes the processor back', 'lab small t5')
d.save(os.path.join(HERE, 'p1-layers.svg'), 'The layers of a Linux system. Processes and the C library run in user mode. A system call instruction crosses into kernel mode, where the scheduler, the memory manager, the file systems and the device drivers run, directly above the hardware. Interrupts also enter the kernel.')
