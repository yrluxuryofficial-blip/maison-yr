// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // URL real del deploy en Cloudflare Pages. Cuando se conecte el dominio
  // definitivo maisonyr.com, cambiar de vuelta a 'https://maisonyr.com'.
  site: 'https://maison-yr.pages.dev',
  output: 'static',
  trailingSlash: 'never',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/test'),
    }),
  ],
  build: {
    assets: '_astro',
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      cssCodeSplit: true,
    },
  },
});
