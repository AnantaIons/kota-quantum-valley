# Course 2 content: Mathematics for Quantum Science

This folder is the course's source of truth. It is kept apart from the website code in `src/`,
so chapters can be written, checked and versioned without touching page templates.

## Layout

```
content/mathematics/
  course.json                     course identity, 9 learner stages, 18 domains (1,100 planned chapters)
  ledger/D06-complex-numbers.json the 75-chapter Complex Numbers pilot ledger (status: proposed)
  chapters/<ID>/
    chapter.md                    the chapter text (Markdown, equations in $...$ and $$...$$)
    metadata.json                 id, slug, level, prerequisites, objectives, status, version …
    review.json                   every check run, with PASS / FIXED / FAIL / NEEDS HUMAN REVIEW
    tests/                        scripts that recompute the chapter's numbers and identities
```

Chapter IDs never change once given: `KQV-MATH-CH000` for Chapter 0, then
`KQV-MATH-D##-C###` (for example `KQV-MATH-D06-C001`).

## Writing a chapter

- Front matter in `chapter.md` must match `metadata.json` (id, status, version).
- Use `$...$` for inline maths and `$$...$$` for display maths (KaTeX syntax).
- Cite sources as `[F1]`, `[Q1]` in the text and start each reference with `**[F1]**`;
  the page links them automatically.
- A level-3 heading that starts with "Answers" is folded until the learner opens it.
- Paragraphs starting with `**What mathematics solved:**` or `**Where the answer stops:**`
  are shown as notes.

## Status and publishing

`proposed → outlined → drafted → mathematically_checked → source_checked → expert_reviewed →
approved → published → revised`

- Text generation alone never raises a status. A status changes only with a matching entry in
  `review.json`.
- A chapter gets a web page only from `mathematically_checked` onwards, and only goes live after
  the founder approves the branch.
- Chapters flagged `expert-review` in a ledger need a qualified human reviewer before publication.
- Hindi versions are written separately and reviewed before publishing; they are never
  machine-published.

## Checks

`npm run check:maths` (also run before every build) verifies: 18 domains adding to 1,100,
ledger counts and ID format, no duplicate IDs, titles or slugs, every prerequisite exists,
no prerequisite cycles, front matter matches metadata, every equation renders, and no
published-status chapter has a failed check.
