// Builds the site search index with Pagefind after every `astro build`.
// Only elements marked data-pagefind-body are indexed (lessons, explainers, log posts, glossary).
// Each language gets its own index, chosen from <html lang>, so Hindi pages search Hindi pages.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pagefind from 'pagefind';

export default function pagefindIntegration() {
  return {
    name: 'kqv-pagefind',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const site = fileURLToPath(dir);
        const { index } = await pagefind.createIndex({
          excludeSelectors: ['pre', '.quiz', '.markdone', '.lesson-toc', '.lesson-nav', '.post-cover', '.lsec-tools'],
        });
        const { page_count, errors } = await index.addDirectory({ path: site });
        if (errors?.length) logger.warn(errors.join('\n'));
        await index.writeFiles({ outputPath: path.join(site, 'pagefind') });
        await pagefind.close();
        logger.info(`search index built for ${page_count} pages`);
      },
    },
  };
}
