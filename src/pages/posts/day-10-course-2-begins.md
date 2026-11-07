---
layout: ../../layouts/Post.astro
title: "Day 10: Course 2 begins, and i is not imaginary"
description: "Course 2, Mathematics for Quantum Science, opens with five chapters on complex numbers. The idea of the day: complex numbers as pairs."
date: 2026-11-06
category: journey
day: 10
---

Today Course 2 opened: mathematics for quantum science, from Class 10 to PhD level, one topic at a time. It starts with complex numbers, because every amplitude in quantum mechanics is one.

## What I built

- **Course 2, Chapter 0 and Complex Numbers Chapters 1 to 4.** Each chapter starts from zero and ends with problems at research level. Every calculation in every chapter is re-checked by a program before the page is published.
- **Diagrams for every chapter**, drawn in code.
- **Real-time 3D objects across the site**: a glass Bloch sphere, a 3D dilution refrigerator, a Möbius strip, an orbital cloud and a few shapes from geometry.

## The idea of the day: i is just a pair

"Imaginary" is the worst name in mathematics. In 1837 William Rowan Hamilton showed that nothing imaginary is needed. Take ordinary pairs of real numbers and define

> (a, b) + (c, d) = (a + c, b + d)
>
> (a, b) × (c, d) = (ac − bd, ad + bc)

Now multiply the pair (0, 1) by itself:

> (0, 1) × (0, 1) = (0·0 − 1·1, 0·1 + 1·0) = (−1, 0)

The pair (0, 1) squares to −1. That pair *is* i. And multiplying any pair (x, y) by i gives (−y, x), which is a turn of 90° about the origin. So i is not a mysterious number; it is a quarter turn.

The same recipe can be tried with remainders instead of real numbers. With remainders after division by 3 it works: you get a number system with 9 elements. With remainders after division by 5 it fails, because 2 × 2 = 4, and 4 already behaves like −1 there. Chapter 4 proves exactly which primes work: those that leave remainder 3 when divided by 4.

The full chapter: [Complex Numbers as Ordered Pairs](/mathematics/complex-numbers-4/).

## What's next

Programming. Quantum software is written in Python, and the machines that control qubits run C.
