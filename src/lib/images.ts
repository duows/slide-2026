import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>(
  ['/src/assets/**/*.{png,jpg,jpeg,webp,avif}', '!/src/assets/anim/**'],
  { eager: true },
);

const byName = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(files)) {
  const base = path.split('/').pop()!.replace(/\.[^.]+$/, '');
  byName.set(base, mod.default);
}

/** Acha uma imagem de src/assets pelo nome do arquivo (sem extensão). */
export function img(name: string): ImageMetadata {
  const found = byName.get(name.replace(/\.[^.]+$/, ''));
  if (!found) {
    throw new Error(
      `[slides.ts] Imagem "${name}" não encontrada em src/assets. Disponíveis: ${[...byName.keys()].join(', ')}`,
    );
  }
  return found;
}

/* Animados (WebP animado em src/assets/anim): vão como <img> puro, sem conversão. */
const animFiles = import.meta.glob<string>('/src/assets/anim/*.webp', { eager: true, query: '?url', import: 'default' });
const animByName = new Map<string, string>();
for (const [path, url] of Object.entries(animFiles)) {
  animByName.set(path.split('/').pop()!.replace(/\.[^.]+$/, ''), url);
}
/** URL de uma imagem animada pelo nome, ou undefined se não for animada. */
export function anim(name: string): string | undefined {
  return animByName.get(name.replace(/\.[^.]+$/, ''));
}

/* Vídeos curtos (src/assets/video/*.mp4): tocam mudos em loop. */
const videoFiles = import.meta.glob<string>('/src/assets/video/*.mp4', { eager: true, query: '?url', import: 'default' });
const videoByName = new Map<string, string>();
for (const [path, url] of Object.entries(videoFiles)) {
  videoByName.set(path.split('/').pop()!.replace(/\.[^.]+$/, ''), url);
}
export function video(name: string): string | undefined {
  return videoByName.get(name.replace(/\.[^.]+$/, ''));
}
