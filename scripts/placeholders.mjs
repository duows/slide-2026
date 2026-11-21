// Gera imagens provisórias em src/assets (só cria o que ainda não existe).
// Pra trocar por uma imagem de verdade: apague o placeholder e coloque o seu
// arquivo com o MESMO nome (a extensão pode mudar: .jpg, .png, .webp, .avif).
import sharp from 'sharp';
import { existsSync, readdirSync } from 'node:fs';
import { join, parse } from 'node:path';

const root = new URL('../src/assets/', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');

const items = [
  { dir: 'fundos', name: 'rodovia-gta6', ext: 'jpg', w: 2560, h: 1440, kind: 'bg', a: '#3B146B', b: '#FF9B55', label: 'RODOVIA GTA VI (pôr do sol)' },
  { dir: 'fundos', name: 'palmeiras-gta6', ext: 'jpg', w: 2560, h: 1440, kind: 'bg', a: '#7B208F', b: '#F36A78', label: 'PALMEIRAS (teaser GTA VI)' },
  { dir: 'memes', name: 'gato-clt', ext: 'jpg', w: 1200, h: 1000, kind: 'photo', a: '#5FD3C6', b: '#3B146B', label: 'GATO CLT CANSADO' },
  { dir: 'memes', name: 'cachorro-pc', ext: 'jpg', w: 1200, h: 1000, kind: 'photo', a: '#FFB458', b: '#7B208F', label: 'CACHORRO NO PC' },
  { dir: 'memes', name: 'this-is-fine', ext: 'jpg', w: 1200, h: 1000, kind: 'photo', a: '#FF9B55', b: '#C9349B', label: 'THIS IS FINE' },
  { dir: 'memes', name: 'gatinho-violao', ext: 'jpg', w: 1200, h: 1000, kind: 'photo', a: '#F87572', b: '#3B146B', label: 'GATINHO NO VIOLÃO' },
  { dir: 'memes', name: 'cachorro-academia', ext: 'jpg', w: 1200, h: 1000, kind: 'photo', a: '#5FD3C6', b: '#C9349B', label: 'CACHORRO NA ACADEMIA' },
  { dir: 'memes', name: 'dicaprio', ext: 'jpg', w: 1000, h: 1400, kind: 'cutout', a: '#FFB458', b: '#F36A78', label: 'DICAPRIO (PNG recortado)' },
  { dir: 'memes', name: 'ganso', ext: 'png', w: 1100, h: 1300, kind: 'cutout', a: '#5FD3C6', b: '#7B208F', label: 'GANSO (PNG recortado)' },
];

function svgFor(it) {
  const { w, h, a, b, label, kind } = it;
  const text = `<text x="50%" y="${kind === 'cutout' ? '88%' : '50%'}" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="${Math.round(w / 18)}" fill="#fff"
    stroke="#000" stroke-opacity=".35" stroke-width="3">${label}</text>`;
  const grad = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>`;
  if (kind === 'cutout') {
    // silhueta "personagem" com fundo transparente
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${grad}
      <circle cx="${w / 2}" cy="${h * 0.24}" r="${w * 0.2}" fill="url(#g)"/>
      <path d="M ${w * 0.12} ${h} Q ${w * 0.12} ${h * 0.46} ${w / 2} ${h * 0.46} Q ${w * 0.88} ${h * 0.46} ${w * 0.88} ${h} Z" fill="url(#g)"/>
      ${text}</svg>`;
  }
  const stripes = kind === 'bg'
    ? Array.from({ length: 14 }, (_, i) => `<rect x="0" y="${h * 0.55 + i * 40}" width="${w}" height="6" fill="#fff" opacity="${0.04 + i * 0.01}"/>`).join('') +
      `<circle cx="${w * 0.62}" cy="${h * 0.48}" r="${h * 0.22}" fill="#FFB458" opacity=".55"/>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${grad}
    <rect width="100%" height="100%" fill="url(#g)"/>${stripes}${text}</svg>`;
}

let created = 0;
for (const it of items) {
  const dir = join(root, it.dir);
  const exists = existsSync(dir) && readdirSync(dir).some((f) => parse(f).name === it.name);
  if (exists) continue;
  const out = join(dir, `${it.name}.${it.ext}`);
  const img = sharp(Buffer.from(svgFor(it)));
  await (it.ext === 'png' ? img.png() : img.jpeg({ quality: 85 })).toFile(out);
  created++;
  console.log('placeholder criado:', `${it.dir}/${it.name}.${it.ext}`);
}
if (!created) console.log('placeholders: todas as imagens já existem.');
