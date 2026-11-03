// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Your live domain. Change it here (and in public/CNAME + public/robots.txt) if you buy a different one.
export default defineConfig({
  site: 'https://kotaquantumvalley.in',
  integrations: [sitemap()],
});
