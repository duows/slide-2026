import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { enterSlide, type Enter } from './animations';

gsap.registerPlugin(CustomEase);
CustomEase.create('camera', 'M0,0 C0.76,0 0.24,1 1,1');

const W = 1920;
const H = 1080;
const DURATION = 1.2;

const stage = document.getElementById('stage') as HTMLElement;
const slides = Array.from(document.querySelectorAll<HTMLElement>('.slide'));
const introBlack = document.getElementById('intro-black') as HTMLElement;
const introFlash = document.getElementById('intro-flash') as HTMLElement;
const introSweep = document.getElementById('intro-sweep') as HTMLElement;
const slidesEl = document.getElementById('slides') as HTMLElement;

/* ---------- Palco escalado com tarja preta ---------- */
function fit() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // escala que dá largura/altura em pixel inteiro, centralizada em pixel inteiro
  const s = Math.min(Math.floor(vw) / W, Math.floor(vh) / H);
  const w = Math.round(W * s);
  const h = Math.round(H * s);
  stage.style.setProperty('--scale', String(w / W));
  stage.style.setProperty('--x', `${Math.floor((vw - w) / 2)}px`);
  stage.style.setProperty('--y', `${Math.floor((vh - h) / 2)}px`);
}
fit();
window.addEventListener('resize', fit);

/* ---------- Pré-carregamento (tela preta antes da abertura) ---------- */
const preload = Promise.all([
  ...Array.from(document.images).map((img) => {
    img.loading = 'eager';
    return img.decode().catch(() => undefined);
  }),
  document.fonts.ready,
]);

/* ---------- Camadas ---------- */
const layersOf = (s: HTMLElement) => Array.from(s.querySelectorAll<HTMLElement>(':scope > .layer'));
const depthOf = (l: HTMLElement) => Number(l.dataset.depth ?? 1);

/* ---------- Parallax do mouse ---------- */
const movers = new Map<HTMLElement, { x: (v: number) => void; y: (v: number) => void; d: number }>();
slides.forEach((s) =>
  layersOf(s).forEach((l) => {
    const px = l.querySelector<HTMLElement>(':scope > .px')!;
    movers.set(px, {
      x: gsap.quickTo(px, 'x', { duration: 1.4, ease: 'power3.out' }),
      y: gsap.quickTo(px, 'y', { duration: 1.4, ease: 'power3.out' }),
      d: depthOf(l),
    });
  }),
);
let mx = 0;
let my = 0;
function applyMouse(s: HTMLElement | undefined) {
  if (!s) return;
  s.querySelectorAll<HTMLElement>(':scope > .layer > .px').forEach((px) => {
    const m = movers.get(px);
    if (!m) return;
    m.x(-mx * 16 * m.d);
    m.y(-my * 10 * m.d);
  });
}
window.addEventListener('mousemove', (e) => {
  mx = (e.clientX / window.innerWidth) * 2 - 1;
  my = (e.clientY / window.innerHeight) * 2 - 1;
  applyMouse(slides[index]);
});

/* ---------- Entradas ---------- */
const running = new Map<HTMLElement, Enter>();
function startEnter(s: HTMLElement, delay: number) {
  stopEnter(s);
  running.set(s, enterSlide(s, delay));
  s.querySelectorAll('video').forEach((v) => { v.currentTime = 0; v.play().catch(() => undefined); });
  warmNeighbors(slides.indexOf(s));
}

/* Vizinhos pré-montados e com imagens já decodificadas: a próxima transição não engasga. */
function warmNeighbors(i: number) {
  slides.forEach((sl, j) => {
    const near = Math.abs(j - i) === 1;
    sl.classList.toggle('is-near', near);
    if (near) sl.querySelectorAll('img').forEach((im) => { im.decode().catch(() => undefined); });
  });
}
function stopEnter(s: HTMLElement) {
  const r = running.get(s);
  if (!r) return;
  r.tl.kill();
  r.loops.forEach((l) => l.kill());
  s.querySelectorAll('video').forEach((v) => v.pause());
  running.delete(s);
}

/* ---------- Navegação ---------- */
let index = -1; // -1 = antes da abertura
let trans: gsap.core.Timeline | null = null;
let inLoading = true;

/*
 * Transições "câmera" (todas com a curva S: cubic-bezier(.76,0,.24,1)).
 * Revezam por par de slides; voltando, a mesma transição roda ao contrário.
 * Cada camada anda proporcional à profundidade (fundo 0.15, texto 0.9, meme 1.6–2.2).
 */
type Pose = gsap.TweenVars;
interface Transition { out: (d: number, dir: number) => Pose; in: (d: number, dir: number) => Pose; fade?: boolean }
const TRANSITIONS: Record<string, Transition> = {
  // subida em parallax (a original)
  rise: {
    out: (d, dir) => ({ y: -dir * H * d }),
    in: (d, dir) => ({ y: dir * H * d }),
  },
  // pan lateral: a câmera anda pro lado
  pan: {
    out: (d, dir) => ({ x: -dir * W * d * 0.85 }),
    in: (d, dir) => ({ x: dir * W * d * 0.85 }),
  },
  // dolly: a câmera atravessa o slide (zoom pra dentro)
  dolly: {
    out: (d, dir) => ({ scale: dir > 0 ? 1 + 0.55 * d : 1 - 0.18 * Math.min(d, 1.5), y: dir > 0 ? 0 : 60 * d }),
    in: (d, dir) => ({ scale: dir > 0 ? 1 - 0.18 * Math.min(d, 1.5) : 1 + 0.55 * d, y: dir > 0 ? 60 * d : 0 }),
    fade: true,
  },
  // arco: diagonal com rotação, desenhando um S
  arc: {
    out: (d, dir) => ({ x: -dir * W * 0.55 * d, y: -H * 0.32 * d, rotation: -dir * 7 * Math.min(d, 1.4) }),
    in: (d, dir) => ({ x: dir * W * 0.55 * d, y: H * 0.32 * d, rotation: dir * 7 * Math.min(d, 1.4) }),
  },
};
const ORDER = ['rise', 'pan', 'dolly', 'arc'];
const IDENTITY: Pose = { x: 0, y: 0, scale: 1, rotation: 0 };

function goTo(next: number) {
  if (inLoading || next < 0 || next >= slides.length || next === index) return;
  if (trans) trans.progress(1);
  const dir = next > index ? 1 : -1;
  const from = slides[index];
  const to = slides[next];
  const kind = TRANSITIONS[ORDER[Math.max(index, next) % ORDER.length]];
  index = next;

  to.classList.add('is-visible');
  from.style.zIndex = '1';
  to.style.zIndex = '2';
  startEnter(to, 0.5);
  applyMouse(to);

  const fromLayers = layersOf(from);
  const toLayers = layersOf(to);
  const isBg = (l: HTMLElement) => l.classList.contains('layer--bg');
  const tl = gsap.timeline({
    defaults: { duration: DURATION, ease: 'camera' },
    onComplete: () => {
      from.classList.remove('is-visible');
      from.style.zIndex = '';
      stopEnter(from);
      gsap.set(fromLayers, { clearProps: 'transform,opacity' });
      if (trans === tl) trans = null;
    },
  });
  // camadas mais fundas saem/entram um tiquinho antes: dá a sensação de S em profundidade
  const lag = (l: HTMLElement) => (isBg(l) ? 0 : Math.min(depthOf(l), 2.2) * 0.04);
  fromLayers.forEach((l) => tl.fromTo(l, { ...IDENTITY }, { ...kind.out(depthOf(l), dir) }, lag(l)));
  toLayers.forEach((l) => tl.fromTo(l, { ...kind.in(depthOf(l), dir) }, { ...IDENTITY }, lag(l) + 0.06));
  const toBg = toLayers.find(isBg);
  if (toBg) tl.fromTo(toBg, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.inOut' }, 0.1);
  tl.fromTo(fromLayers.filter((l) => !isBg(l)), { opacity: 1 }, { opacity: 0, duration: kind.fade ? 0.55 : 0.7, ease: 'power2.in' }, kind.fade ? 0.1 : 0.35);
  if (kind.fade) tl.fromTo(toLayers.filter((l) => !isBg(l)), { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.45);
  trans = tl;
}
const next = () => goTo(index + 1);
const prev = () => goTo(index - 1);

/* ---------- Abertura triunfal: já começa no título ---------- */
function showTitle(instant = false) {
  if (!inLoading) return;
  inLoading = false;
  index = 0;
  const title = slides[0];
  title.classList.add('is-visible');
  title.style.zIndex = '2';
  applyMouse(title);
  if (instant) {
    startEnter(title, 0);
    gsap.set(introBlack, { opacity: 0, display: 'none' });
    return;
  }
  startEnter(title, 0.55);
  const layers = layersOf(title);
  const intro = gsap.timeline();
  // a tela preta abre e a câmera avança pra dentro da cena (S-curve)
  intro.to(introBlack, { opacity: 0, duration: 1.4, ease: 'power2.inOut', onComplete: () => { introBlack.style.display = 'none'; } }, 0);
  layers.forEach((l) => {
    const d = depthOf(l);
    intro.fromTo(l, { scale: 1 + 0.22 * Math.min(d, 1.6), y: 90 * d }, { scale: 1, y: 0, duration: 2.6, ease: 'camera' }, 0);
  });
  // impacto quando o "26" assenta: flash + tremida + brilho atravessando
  intro.fromTo(introFlash, { opacity: 0 }, { opacity: 0.85, duration: 0.12, ease: 'power2.out' }, 1.35)
    .to(introFlash, { opacity: 0, duration: 1.1, ease: 'power2.out' }, 1.47);
  intro.fromTo(slidesEl, { x: 0, y: 0 }, { x: 10, y: -6, duration: 0.05, yoyo: true, repeat: 7, ease: 'none', clearProps: 'transform' }, 1.38);
  intro.fromTo(introSweep, { x: -600, opacity: 0 }, { x: W + 400, opacity: 1, duration: 1.3, ease: 'power2.inOut' }, 2.2)
    .to(introSweep, { opacity: 0, duration: 0.3 }, 3.2);
}

// assim que as imagens e fontes estiverem prontas, abre direto no título
const hashStart = Number(location.hash.slice(1));
if (!(hashStart >= 1)) preload.then(() => showTitle());

/* ---------- Atalho de teste: #5 abre direto no slide 5 ---------- */
const hash = Number(location.hash.slice(1));
if (hash >= 1 && hash <= slides.length) {
  showTitle(true);
  if (hash > 1) {
    trans?.progress(1);
    goTo(hash - 1);
    trans?.progress(1);
  }
}

/* ---------- Tela cheia ---------- */
function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
  else document.documentElement.requestFullscreen().catch(() => undefined);
}

/* ---------- Teclado / clicker / mouse ---------- */
const NEXT = new Set(['ArrowRight', 'ArrowDown', ' ', 'Spacebar', 'Enter', 'PageDown']);
const PREV = new Set(['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace']);

window.addEventListener('keydown', (e) => {
  if (e.key === 'f' || e.key === 'F') {
    e.preventDefault();
    toggleFullscreen();
    return;
  }
  if (inLoading) return; // ainda carregando (tela preta)
  if (NEXT.has(e.key)) { e.preventDefault(); next(); }
  else if (PREV.has(e.key)) { e.preventDefault(); prev(); }
  else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
  else if (e.key === 'End') { e.preventDefault(); goTo(slides.length - 1); }
});

window.addEventListener('mousedown', (e) => {
  if (inLoading) return;
  if (e.button === 0) next();
  else if (e.button === 2) prev();
});
window.addEventListener('contextmenu', (e) => e.preventDefault());

// gancho de depuração (console): __deck.goTo(3)
(window as unknown as { __deck: unknown }).__deck = { gsap, goTo, showTitle, get index() { return index; } };
