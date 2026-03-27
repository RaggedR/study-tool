import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://raggedr.github.io',
  base: '/study-tool',
  integrations: [
    starlight({
      title: 'Uni Notes',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/RaggedR/study-tool' },
      ],
      sidebar: [
        {
          label: 'Notes',
          autogenerate: { directory: 'examples' },
        },
      ],
      customCss: [
        'katex/dist/katex.min.css',
        './src/styles/theme.css',
        './src/styles/components.css',
      ],
    }),
    react(),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
