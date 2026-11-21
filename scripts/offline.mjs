// Pós-build: deixa o dist/ abrindo direto do disco (file://), sem servidor.
// - troca caminhos absolutos /_astro/ por relativos ./_astro/
// - embute o JS (módulos via file:// são bloqueados pelo navegador)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const file = join(dist, 'index.html');
let html = readFileSync(file, 'utf8');

html = html.replace(/<script type="module" src="([^"]+)"><\/script>/g, (tag, src) => {
  const path = join(dist, src.replace(/^\.?\//, ''));
  if (!existsSync(path)) return tag;
  const js = readFileSync(path, 'utf8');
  if (/\bimport\s*[\w{*"']|import\(/.test(js.replace(/import\.meta/g, ''))) {
    console.warn('[offline] aviso: script com imports, não embutido:', src);
    return tag;
  }
  return `<script type="module">${js.replace(/<\/script/gi, '<\/script')}</script>`;
});

html = html.replace(/(["'\s,(])\/_astro\//g, '$1./_astro/');
writeFileSync(file, html);
console.log('[offline] dist/index.html pronto pra abrir direto do disco.');
