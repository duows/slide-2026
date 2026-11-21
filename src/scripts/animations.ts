import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(MotionPathPlugin);

export interface Enter {
  tl: gsap.core.Timeline;
  loops: gsap.core.Animation[];
}

const rand = gsap.utils.random;

/**
 * Entrada em curva S: o elemento vem de (fx, fy) desenhando um S até o lugar,
 * girando e assentando. Só transform + opacity.
 */
function sCurve(tl: gsap.core.Timeline, el: Element, fx: number, fy: number, at: number, opts: { rot?: number; dur?: number; scale?: number } = {}) {
  const { rot = fx > 0 ? 22 : -22, dur = 1.35, scale = 1.12 } = opts;
  tl.fromTo(el, { x: fx, y: fy, rotation: rot, scale, opacity: 0 }, {
    motionPath: {
      path: [
        { x: fx, y: fy },
        { x: fx * 0.45, y: -fy * 0.35 - 120 },
        { x: -fx * 0.08, y: fy * 0.1 + 40 },
        { x: 0, y: 0 },
      ],
      curviness: 1.3,
    },
    rotation: 0,
    scale: 1,
    duration: dur,
    ease: 'camera',
  }, at);
  tl.to(el, { opacity: 1, duration: 0.35, ease: 'power1.out' }, at);
}

function count(
  tl: gsap.core.Timeline,
  el: Element,
  from: number,
  to: number,
  duration: number,
  at: number | string,
  suffix = '',
  ease = 'power2.out',
) {
  const o = { v: from };
  tl.fromTo(
    o,
    { v: from },
    {
      v: to,
      duration,
      ease,
      onUpdate: () => { el.textContent = `${Math.round(o.v)}${suffix}`; },
      onStart: () => { el.textContent = `${from}${suffix}`; },
    },
    at,
  );
  el.textContent = `${from}${suffix}`;
}

function glitch(counter: HTMLElement) {
  const [a, b, main] = Array.from(counter.children) as HTMLElement[];
  const g = gsap.timeline();
  g.set([a, b], { opacity: 0.9 });
  for (let i = 0; i < 7; i++) {
    g.to(a, { x: rand(-22, 22), y: rand(-8, 8), duration: 0.045, ease: 'none' })
      .to(b, { x: rand(-22, 22), y: rand(-8, 8), duration: 0.045, ease: 'none' }, '<')
      .to(main, { x: rand(-10, 10), skewX: rand(-14, 14), duration: 0.045, ease: 'none' }, '<');
  }
  g.to([a, b, main], { x: 0, y: 0, skewX: 0, duration: 0.06 }).set([a, b], { opacity: 0 });
  return g;
}

/** Monta (do zero) a animação de entrada de um slide. */
export function enterSlide(slide: HTMLElement, delay = 0): Enter {
  const q = <T extends Element = HTMLElement>(sel: string) => Array.from(slide.querySelectorAll<T & HTMLElement>(sel));
  const a = (name: string) => q(`[data-a="${name}"]`);
  const loops: gsap.core.Animation[] = [];
  const tl = gsap.timeline({ delay });
  const kind = slide.dataset.kind;

  // Fundo: drift lento contínuo
  q('[data-drift]').forEach((d) => {
    loops.push(
      gsap.fromTo(d, { x: -24, y: -12, scale: 1.05 }, {
        x: 24, y: 12, scale: 1.09, duration: 16, ease: 'sine.inOut', yoyo: true, repeat: -1,
      }),
    );
  });

  // Texto padrão
  if (a('eyebrow').length) tl.fromTo(a('eyebrow'), { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0);
  if (a('line').length) tl.fromTo(a('line'), { yPercent: 115, rotation: 5 }, { yPercent: 0, rotation: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12 }, 0.08);
  if (a('fade').length) tl.fromTo(a('fade'), { x: -70, skewX: 12, opacity: 0 }, { x: 0, skewX: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.14 }, 0.4);

  // Meme
  const meme = a('meme')[0];
  let memeEnd = 0;
  let memeStart = 0;
  if (meme) {
    const type = meme.dataset.entrance;
    memeStart = type === 'drop' ? 0.45 : type === 'rise' ? 0.35 : 0.3;
    if (type === 'drop') {
      sCurve(tl, meme, 900, 520, 0.45);
      memeEnd = 1.8;
    } else if (type === 'rise') {
      tl.fromTo(meme, { yPercent: 75, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.3, ease: 'power3.out' }, 0.35);
      memeEnd = 1.45;
    } else if (type === 'run') {
      const bob = meme.querySelector('[data-bob]');
      tl.fromTo(meme, { x: 1500, opacity: 1 }, { x: 0, duration: 1.25, ease: 'power2.out' }, 0.3);
      if (bob) tl.fromTo(bob, { y: 0, rotation: -5 }, { y: -34, rotation: 5, duration: 0.125, ease: 'sine.inOut', yoyo: true, repeat: 9 }, 0.3);
      memeEnd = 1.5;
    }
    const float = meme.querySelector('[data-float]');
    if (float) {
      loops.push(gsap.fromTo(float, { y: 0, rotation: 0 }, { y: -18, rotation: 1.6, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    }
    const bob = meme.querySelector('[data-bob]');
    if (bob) {
      loops.push(gsap.to(bob, { y: -10, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: delay + memeEnd + 0.2 }));
    }
  }

  // Segunda polaroid: cai 400ms depois da principal
  const meme2 = a('meme2')[0];
  if (meme2) {
    const t2 = memeStart + 0.4;
    sCurve(tl, meme2, 700, -560, t2, { rot: -18 });
    memeEnd = Math.max(memeEnd, t2 + 1.35);
    const f2 = meme2.querySelector('[data-float]');
    if (f2) loops.push(gsap.fromTo(f2, { y: 0, rotation: 0 }, { y: -14, rotation: -1.4, duration: 3.9, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
  }

  // Frase do meme (ganso)
  if (a('quote').length) tl.fromTo(a('quote'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, memeEnd - 0.2);

  // Badge (emoji): pula como carimbo
  a('badge').forEach((b) => {
    tl.fromTo(b, { scale: 2.4, rotation: 25, opacity: 0 }, { scale: 1, rotation: -8, opacity: 1, duration: 0.45, ease: 'back.out(2.2)' }, memeEnd + 0.1);
    loops.push(gsap.fromTo(b, { rotation: -8 }, { rotation: 6, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: delay + memeEnd + 0.8 }));
  });

  // Sticker: carimbo
  a('sticker').forEach((s) => {
    tl.fromTo(s, { scale: 2.8, rotation: -26, opacity: 0 }, { scale: 1, rotation: -6, opacity: 1, duration: 0.36, ease: 'power4.in' }, memeEnd + 0.15);
    tl.fromTo(s, { x: -10 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.3)' }, '>');
    if (meme) tl.fromTo(meme, { x: 0 }, { x: 8, duration: 0.05, yoyo: true, repeat: 3, ease: 'none' }, '<-0.5');
  });

  // ---------- Específicos ----------
  if (kind === 'title') {
    const blur = a('big-blur')[0];
    const big = a('big')[0];
    tl.fromTo(blur, { opacity: 0, scale: 1.55 }, { opacity: 0.95, scale: 1, duration: 1.2, ease: 'power3.out' }, 0);
    tl.to(blur, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, 0.9);
    tl.fromTo(big, { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 1.4, ease: 'expo.out' }, 0.3);
    tl.fromTo(a('letter'), { yPercent: 118 }, { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.07 }, 0.9);
    tl.fromTo(a('sub'), { opacity: 0, y: 24, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out' }, 1.7);
    loops.push(gsap.fromTo(big, { y: 0 }, { y: -12, duration: 3.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: delay + 1.8 }));
  }

  if (kind === 'character') {
    tl.fromTo(a('card'), { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0.35);
    a('stat').forEach((stat, i) => {
      const v = Number(stat.dataset.value);
      const fill = stat.querySelector('[data-a="fill"]')!;
      const num = stat.querySelector('[data-a="stat-num"]')!;
      const t = 0.95 + i * 0.4;
      if (v <= 100) {
        tl.fromTo(fill, { scaleX: 0 }, { scaleX: v / 100, duration: 1.3, ease: 'power2.out' }, t);
        count(tl, num, 0, v, 1.3, t, '%');
      } else {
        const track = stat.querySelector('[data-a="track"]')!;
        const stamp = stat.querySelector('[data-a="stamp"]')!;
        gsap.set(stamp, { opacity: 0 });
        tl.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power1.in' }, t);
        count(tl, num, 0, 100, 1.2, t, '%', 'power1.in');
        tl.to(fill, { scaleX: 1.25, duration: 0.45, ease: 'power4.out' }, '>');
        count(tl, num, 100, v, 0.45, '<', '%', 'power4.out');
        tl.fromTo(track, { x: 0, y: 0 }, { x: 9, y: -3, duration: 0.045, yoyo: true, repeat: 11, ease: 'none' }, '<');
        tl.fromTo(stamp, { scale: 3.2, rotation: -28, opacity: 0 }, { scale: 1, rotation: -10, opacity: 1, duration: 0.3, ease: 'power4.in' }, '>-0.25');
        tl.fromTo(track, { x: 0 }, { x: -6, duration: 0.05, yoyo: true, repeat: 5, ease: 'none' }, '>');
        const shake = gsap.timeline({ repeat: -1, repeatDelay: 2.2, delay: delay + t + 3.5 });
        shake.fromTo(track, { x: 0 }, { x: 4, duration: 0.05, yoyo: true, repeat: 7, ease: 'none' });
        loops.push(shake);
      }
    });
  }

  const counter = a('counter')[0];
  if (counter) {
    const main = counter.querySelector('.counter-main')!;
    const to = Number(counter.dataset.to);
    const suffix = counter.dataset.suffix ?? '';
    gsap.set(counter.children, { x: 0, y: 0, skewX: 0 });
    gsap.set([counter.children[0], counter.children[1]], { opacity: 0 });
    tl.fromTo(counter, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.7);
    count(tl, main, 0, to, 2.2, 0.9, suffix, 'power3.out');
    tl.add(glitch(counter), '>');
    const loopTl = gsap.timeline({ repeat: -1, repeatDelay: 2.4, delay: delay + 5 });
    loopTl.add(glitch(counter));
    loops.push(loopTl);
  }

  if (kind === 'feed') {
    a('post').forEach((post, i) => {
      const t = 0.55 + i * 0.5;
      sCurve(tl, post, i % 2 ? 1100 : -1100, i < 2 ? -300 : 300, t, { rot: i % 2 ? 8 : -8, dur: 1.2, scale: 1.05 });
      const likes = post.querySelector('[data-a="likes"]')!;
      const heart = post.querySelector('[data-a="heart"]')!;
      count(tl, likes, 0, Number(post.dataset.likes), 1.4, t + 0.45, '', 'power2.out');
      const pic = post.querySelector('[data-a="post-img"]');
      if (pic) tl.fromTo(pic, { scale: 0.4, opacity: 0, rotation: i % 2 ? -3 : 3 }, { scale: 1, opacity: 1, rotation: i % 2 ? -3 : 3, duration: 0.6, ease: 'back.out(2)' }, t + 0.35);
      tl.fromTo(heart, { scale: 1 }, { scale: 1.6, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out' }, t + 1.75);
    });
  }

  if (kind === 'stats') {
    const fmt = (v: number, dec: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    a('wr-tile').forEach((tile, i) => {
      const t = 0.45 + i * 0.22;
      tl.fromTo(tile, { scale: 0.4, rotation: i % 2 ? 14 : -14, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 1.1, ease: 'camera' }, t);
      const num = tile.querySelector<HTMLElement>('[data-a="wr-num"]')!;
      const to = Number(num.dataset.to);
      const dec = Number(num.dataset.decimals ?? 0);
      const suffix = num.dataset.suffix ?? '';
      const o = { v: 0 };
      num.textContent = fmt(0, dec) + suffix;
      tl.fromTo(o, { v: 0 }, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: () => { num.textContent = fmt(dec ? o.v : Math.round(o.v), dec) + suffix; } }, t + 0.3);
      const shape = tile.querySelector('[data-a="wr-shape"]');
      if (shape) {
        tl.fromTo(shape, { scale: 0 }, { scale: 1, duration: 0.9, ease: 'back.out(1.4)' }, t + 0.15);
        loops.push(gsap.to(shape, { rotation: i % 2 ? -360 : 360, duration: 26 + i * 4, ease: 'none', repeat: -1 }));
      }
    });
  }

  if (kind === 'achievements') {
    a('ach').forEach((toast, i) => {
      const t = 0.5 + i * 0.22;
      tl.fromTo(toast, { x: i % 2 ? 900 : -900, opacity: 0 }, { x: 0, opacity: 1, duration: 0.75, ease: 'power4.out' }, t);
      const icon = toast.querySelector('[data-a="ach-icon"]');
      if (icon) tl.fromTo(icon, { scale: 0.3, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2.5)' }, t + 0.35);
      const shine = toast.querySelector('[data-a="ach-shine"]');
      if (shine) tl.fromTo(shine, { x: -200 }, { x: 1000, duration: 0.9, ease: 'power2.inOut' }, t + 0.45);
      const fill = toast.querySelector<HTMLElement>('[data-a="ach-fill"]');
      if (fill) tl.fromTo(fill, { scaleX: 0 }, { scaleX: Number(fill.dataset.to) / 100, duration: 1.4, ease: 'power3.out' }, t + 0.5);
    });
    const score = a('ach-score')[0];
    const total = a('ach-total')[0];
    if (score && total) {
      const end = 0.5 + a('ach').length * 0.22;
      tl.fromTo(score, { y: 60, scale: 0.9, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.6)' }, 0.6);
      count(tl, total, 0, Number(total.dataset.to), 2.2, 1, '', 'power2.out');
      tl.fromTo(score, { scale: 1 }, { scale: 1.06, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' }, end + 0.4);
    }
  }

  if (kind === 'gallery') {
    a('gitem').forEach((it, i) => {
      const from = [[-900, 500], [0, -900], [900, 500], [-900, -400], [900, -400]][i % 5];
      sCurve(tl, it, from[0], from[1], 0.5 + i * 0.28, { rot: i % 2 ? 20 : -20 });
      const f = it.querySelector('[data-gfloat]');
      if (f) loops.push(gsap.fromTo(f, { y: 0 }, { y: -12, duration: 3 + i * 0.35, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: delay + 2 + i * 0.2 }));
    });
  }

  if (kind === 'goals') {
    tl.fromTo(a('goal'), { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.18 }, 0.4);
    tl.fromTo(a('goal-inner'), { rotationY: 180 }, { rotationY: 0, duration: 1.2, ease: 'power3.inOut', stagger: 0.35 }, 0.9);
    a('goal-inner').forEach((g, i) => {
      loops.push(gsap.fromTo(g, { y: 0 }, { y: -14, duration: 2.8 + i * 0.3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: delay + 2.5 + i * 0.2 }));
    });
  }

  const dancer = a('dancer')[0];
  if (dancer) tl.fromTo(dancer, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'back.out(1.4)' }, 1.2);

  const progress = a('progress')[0];
  if (progress) {
    const num = a('progress-num')[0];
    const stop = Number(progress.dataset.to) / 100;
    const upd = () => { num.textContent = `${Math.round((gsap.getProperty(progress, 'scaleX') as number) * 100)}%`; };
    num.textContent = '0%';
    tl.fromTo(progress, { scaleX: 0 }, { scaleX: stop * 0.34, duration: 0.9, ease: 'power2.out', onUpdate: upd }, 0.9)
      .to(progress, { scaleX: stop * 0.55, duration: 0.7, ease: 'power2.inOut', onUpdate: upd }, '>0.35')
      .to(progress, { scaleX: stop * 0.82, duration: 1.0, ease: 'power2.inOut', onUpdate: upd }, '>0.5')
      .to(progress, { scaleX: stop * 0.95, duration: 0.8, ease: 'power2.inOut', onUpdate: upd }, '>0.6')
      .to(progress, { scaleX: stop, duration: 1.4, ease: 'power3.out', onUpdate: upd }, '>0.4');
  }

  return { tl, loops };
}
