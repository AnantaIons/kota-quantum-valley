// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Live address. When the domain is connected, change it here and in public/robots.txt.
export default defineConfig({
  site: 'https://kota-quantum-valley.chitransh-baregama.workers.dev',
  integrations: [sitemap()],
});
