---
layout: ../../layouts/Post.astro
title: "Day 8: Fifty lessons, one map, and where probabilities come from"
description: "The domain kotaquantumvalley.in goes live and Course 1 becomes 50 lessons in nine parts. The idea of the day: the Born rule."
date: 2026-11-04
category: journey
day: 8
---

Today the site got its own address, kotaquantumvalley.in, and Course 1 grew from a handful of lessons into a full map of the subject.

## What I built

- **Course 1: Quantum Basics, as 50 lessons in nine parts**: Getting ready, One qubit, Many qubits, Coding with Qiskit, Quantum algorithms, Errors and correction, Hardware, Communication and sensing, and Applications and your path.
- **Quizzes for every lesson**, and a progress tracker so you can mark lessons done.
- **Site search**, so any word in any lesson can be found.
- **A free resume maker**, in English and Hindi, for students applying for internships and jobs.

Writing 50 lessons in order forced a question I had skipped: what does each lesson need from the ones before it? The parts are the answer. You cannot understand Shor's algorithm without the Fourier transform, the Fourier transform without many qubits, or many qubits without one.

## The idea of the day: where probabilities come from

A qubit's state is written with two **amplitudes**, one for 0 and one for 1:

> |ψ⟩ = a|0⟩ + b|1⟩

The amplitudes are complex numbers, not probabilities. The **Born rule** turns them into probabilities: the chance of measuring 0 is |a|², and the chance of measuring 1 is |b|². For example, with a = √3/2 and b = i/2:

> P(0) = 3/4 and P(1) = |i/2|² = 1/4

The *i* in front of the second amplitude changes nothing about these two probabilities. So why keep it? Because amplitudes add before they are squared. When two paths lead to the same result, their amplitudes can cancel, and that cancellation, **interference**, is what every quantum algorithm uses. Probabilities alone can never cancel.

The full lesson: [measurement and the Born rule](/posts/measurement-and-the-born-rule/).

## What's next

Making the site look like the subject: drawings and motion that show the ideas, not decoration.
