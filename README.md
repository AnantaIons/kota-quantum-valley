# Kota Quantum Valley — website

A fast, free website for learning quantum in public. Built with [Astro](https://astro.build), hosted free on Cloudflare Pages.

## Pages

| Page | File |
|---|---|
| Home | `src/pages/index.astro` |
| Lessons | `src/pages/lessons.astro` (lists `category: lesson` posts) |
| Learning log | `src/pages/learn.astro` |
| Explainers | `src/pages/explainers.astro` |
| Careers | `src/pages/careers.astro` |
| Why Kota | `src/pages/why-kota.astro` |
| About | `src/pages/about.astro` |
| Posts | `src/pages/posts/*.md` |

## Edit the site in your browser (no code)

1. Go to **https://app.pagescms.org** → **Sign in with GitHub**.
2. Pick the `kota-quantum-valley` repo.
3. You'll see:
   - **Site settings**: your name, email, top banner text, social links.
   - **Posts & lessons**: edit any post, or **Add an entry** for a new one.
   - **Media**: upload images; insert them into posts.
4. Click **Save**. The site updates by itself in about a minute.

New lesson with slides: upload the slide images to `public/slides/lesson-7/` named `01.webp`, `02.webp`, …, add their titles to `src/data/slides.json`, then create a post with Section = `lesson`, Lesson number = 7, Slide folder = `lesson-7`.

## Add a new post by hand (alternative)

1. Copy `POST_TEMPLATE.md` into `src/pages/posts/` with a new name, e.g. `day-2-complex-numbers.md`.
2. Edit the details at the top (title, date, `category: journey` or `explainer`).
3. Write in Markdown below.
4. Commit and push. The site updates by itself in about a minute.

You can even do this from your phone on github.com: open `src/pages/posts/`, tap **Add file → Create new file**.

## Hosting: Cloudflare Pages

Cloudflare builds and publishes the site on every push to `main`.
Settings: Framework preset **Astro** · Build command `npm run build` · Output directory `dist`.

## Alternative: GitHub Pages (one time)

1. Create a new **public** repo on GitHub named exactly `<your-username>.github.io`.
   (This name puts the site at the root address, which the site's links expect.)
2. Upload these files (or `git push`).
3. In the repo: **Settings → Pages → Source: GitHub Actions**.
4. Wait for the green tick under **Actions**. Your site is live at
   `https://<your-username>.github.io/`.

### Use your own domain (recommended)

1. Buy a domain, e.g. `kotaquantumvalley.in`, from any registrar.
2. In the repo: **Settings → Pages → Custom domain** → enter it → tick **Enforce HTTPS**.
3. At your registrar, add DNS records:
   - `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` for `www` → `<your-username>.github.io`
4. If your domain is not `kotaquantumvalley.in`, change `site` in `astro.config.mjs` and the Sitemap line in `public/robots.txt`.

## Site-wide info

Name, email, banner and social links live in `src/data/site.json` (editable from the admin panel).

## Run it on your computer (optional)

```
npm install
npm run dev
```

Open http://localhost:4321.
