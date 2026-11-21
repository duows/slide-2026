// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  build: {
    // CSS dentro do HTML: necessário pra abrir o dist direto (file://)
    inlineStylesheets: 'always',
  },
  devToolbar: { enabled: false },
});
