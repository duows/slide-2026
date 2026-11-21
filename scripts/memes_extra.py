"""Prepara os memes extras da pasta IMGS.

Uso:  python scripts/memes_extra.py
- estáticos  -> src/assets/memes/*.jpg
- animados   -> src/assets/anim/*.webp (WebP animado; rato sem fundo branco)
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageSequence

IMGS = Path(r"G:\Meu Drive\NOITE DO POWERPOINT\IMGS")
ROOT = Path(__file__).resolve().parent.parent
MEMES = ROOT / "src" / "assets" / "memes"
ANIM = ROOT / "src" / "assets" / "anim"
ANIM.mkdir(parents=True, exist_ok=True)


def still(src, name, box=None, size=900):
    im = Image.open(IMGS / src).convert("RGB")
    if box:
        im = im.crop(box)
    im.thumbnail((size, size))
    im.save(MEMES / name, quality=90)
    print("ok", name, im.size)


still("HXWhiO7XcAAEDyf.webp", "gta6-tv.jpg", (0, 290, 1290, 1320))
still("1611936187_10415.jpg", "paulin-bacana.jpg", (52, 30, 308, 330))
still("images (4).jpg", "rato-ventilador.jpg")
still("e1228889c9ec02fb9af968c86cdfe354.jpg", "gato-serio.jpg")
still("61fUZ8WQQRL._AC_UF894,1000_QL80_.jpg", "biggie-cheese.jpg", (60, 0, 834, 894))
# slide "Memes do ano"
still("images (6).jpg", "quero-salario.jpg")
still("images (5).jpg", "link-saldo.jpg")
still("a0493397e9231a5d5382e2de43149a64.jpg", "e-vai-tomando.jpg")
still("7eeaf225dbf54e78ab6fdc425949b51e.jpg", "hello-kitty.jpg")
still("images (2).jpg", "kurt-violao.jpg")
# PC, colação, violão na loja
still("WhatsApp Image 2026-11-18 at 16.45.45.jpeg", "colacao-natalia.jpg", size=1400)
still("WhatsApp Image 2026-11-18 at 16.44.43.jpeg", "violao-loja.jpg")
still("WhatsApp Image 2026-11-18 at 16.48.36.jpeg", "arco-iris-escritorio.jpg")


def white_to_alpha(frame: Image.Image) -> Image.Image:
    """Fundo branco -> transparente (borda suave)."""
    a = np.asarray(frame.convert("RGB")).astype(np.int16)
    minc = a.min(axis=2)
    alpha = np.clip((245 - minc) * 12, 0, 255).astype("uint8")
    m = Image.fromarray(alpha).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    out = frame.convert("RGBA")
    out.putalpha(m)
    return out


def anim(src, name, transparent=False, size=480, step=1):
    im = Image.open(IMGS / src)
    frames, durs = [], []
    for i, f in enumerate(ImageSequence.Iterator(im)):
        if i % step:
            continue
        f = f.convert("RGBA")
        if transparent:
            f = white_to_alpha(f)
        f.thumbnail((size, size))
        frames.append(f)
        durs.append(f.info.get("duration", im.info.get("duration", 50)) * step)
    frames[0].save(ANIM / name, save_all=True, append_images=frames[1:], duration=durs,
                   loop=0, quality=80, method=4, lossless=False)
    print("ok", name, len(frames), "frames", (ANIM / name).stat().st_size // 1024, "KB")


anim("rkctj76k.gif", "amongus-duto.webp")
anim("e03b0187e69933cd34a6e0b174bb77e1.gif", "rato-dancando.webp", transparent=True, step=2)


# emoji da rosa sem o fundo branco
from rembg import new_session, remove  # recorte com IA (os dentes brancos não podem sumir)
_e = remove(Image.open(IMGS / "6a3289bc42e7c14ad38aeced9d67cc72.jpg").convert("RGB"), session=new_session("isnet-general-use"))
from scipy import ndimage
_a = np.asarray(_e.getchannel("A")) > 30
_a = ndimage.binary_fill_holes(_a)  # dentes 100% opacos
_e.putalpha(Image.fromarray((_a * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.8)))
_e = _e.crop(_e.getchannel("A").getbbox())
_e.thumbnail((600, 600))
_e.save(MEMES / "emoji-rosa.png")
print("ok emoji-rosa.png", _e.size)
