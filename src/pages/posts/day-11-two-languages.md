---
layout: ../../layouts/Post.astro
title: "Day 11: Two languages, one machine, and why qubits are hard to simulate"
description: "Course 3, Programming in C and Python, opens. The idea of the day: every extra qubit doubles the memory a simulation needs."
date: 2026-11-07
category: journey
day: 11
---

Today Course 3 opened: programming in C and Python, taught side by side in every chapter. Quantum software is written in Python; the firmware that controls the qubits is written in C. Learning both together shows what each language hides.

## What I built

- **A courses page** that lists every course on the site in one place.
- **Course 3, Chapters 0 to 2**: setting up, a first program followed all the way down to the operating system, and how bits and bytes store numbers and text. Every program on these pages is compiled and run, and its output compared line by line, before a page goes live.
- **Two new resume templates**, and a way to fill the resume maker from an existing resume (PDF, Word or text).
- **A plan for the next course**, on operating systems and embedded Linux, with every lab runnable on a laptop.

## The idea of the day: the memory wall

The two "Hello" programs in Chapter 1, one in C and one in Python, look very different, but both end by asking the operating system to do the same thing: write 13 bytes to the screen. Underneath, everything is bytes. That makes it easy to count what a quantum simulation costs.

A simulator stores one complex amplitude for every possible result. With n qubits there are 2ⁿ results. One complex number in double precision takes 16 bytes. So:

- 10 qubits: 2¹⁰ × 16 bytes = 16 KiB
- 30 qubits: 2³⁰ × 16 bytes = 16 GiB, about a good laptop's memory
- 40 qubits: 2⁴⁰ × 16 bytes = 16 TiB, a large supercomputer's job
- 50 qubits: 16 PiB, beyond almost any machine on earth

Every extra qubit doubles the memory. This is the simplest honest answer to "why build a quantum computer at all": past about 50 qubits, a classical computer cannot even store the state in this direct way, let alone update it.

The full chapter: [Bits, Bytes and Number Systems](/programming/bits-and-bytes/).

## What's next

More chapters in Courses 2 and 3, and the operating systems course.
