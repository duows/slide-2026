"""Recorta as fotos (tira o fundo) e aplica tratamento estilo GTA.

Uso:  python scripts/recortar.py
Saída: src/assets/henrique/*.png (base reta = foto cortada embaixo)
"""
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter
from rembg import new_session, remove

IMGS = Path(r"G:\Meu Drive\NOITE DO POWERPOINT\IMGS")
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "assets" / "henrique"
OUT.mkdir(parents=True, exist_ok=True)

GENERAL = new_session("isnet-general-use")
PORTRAIT = new_session("birefnet-portrait")  # melhor pra gente


def biggest(img: Image.Image) -> Image.Image:
    """Mantém só o maior pedaço contínuo (tira sujeira solta do fundo)."""
    import numpy as np
    from scipy import ndimage
    a = np.array(img.getchannel("A"))
    lab, n = ndimage.label(a > 40)
    if n > 1:
        sizes = ndimage.sum(np.ones_like(a), lab, range(1, n + 1))
        keep = 1 + int(np.argmax(sizes))
        a = np.where(lab == keep, a, 0).astype("uint8")
        a = np.array(Image.fromarray(a).filter(ImageFilter.GaussianBlur(0.6)))
    img.putalpha(Image.fromarray(a))
    return img


def gradient(size):
    """Gradiente laranja -> rosa -> roxo na diagonal (paleta do site)."""
    w, h = size
    stops = [(0.0, (255, 155, 85)), (0.55, (201, 52, 155)), (1.0, (59, 20, 107))]
    small = Image.new("RGB", (64, 64))
    px = small.load()
    for y in range(64):
        for x in range(64):
            t = (x + y) / 126
            for (a, ca), (b, cb) in zip(stops, stops[1:]):
                if a <= t <= b:
                    k = (t - a) / (b - a)
                    px[x, y] = tuple(round(ca[i] + (cb[i] - ca[i]) * k) for i in range(3))
                    break
    return small.resize((w, h), Image.BILINEAR)


def gta(img: Image.Image, strength=0.45) -> Image.Image:
    """Tratamento de cor: mais contraste/saturação + soft light na paleta."""
    rgb, alpha = img.convert("RGB"), img.getchannel("A")
    graded = ImageChops.soft_light(rgb, gradient(rgb.size))
    rgb = Image.blend(rgb, graded, strength)
    from PIL import ImageEnhance
    rgb = ImageEnhance.Contrast(rgb).enhance(1.08)
    rgb = ImageEnhance.Color(rgb).enhance(1.15)
    out = rgb.convert("RGBA")
    out.putalpha(alpha)
    return out


def trim(img: Image.Image, keep_right=False, keep_bottom=True) -> Image.Image:
    """Corta as sobras transparentes (mantém a base e, se pedir, a direita)."""
    l, t, r, b = img.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox()
    return img.crop((l, max(0, t - 6), img.width if keep_right else r, img.height if keep_bottom else b))


def shadow(img: Image.Image, pad=50) -> Image.Image:
    """Sombra embutida no PNG (pra não precisar de filter no CSS)."""
    w, h = img.size
    canvas = Image.new("RGBA", (w + pad * 2, h + pad), (0, 0, 0, 0))
    a = img.getchannel("A").point(lambda v: v * 0.55)
    sh = Image.new("RGBA", img.size, (26, 8, 51, 255))
    sh.putalpha(a)
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    layer.paste(sh, (pad + 18, pad + 22), sh)
    layer = layer.filter(ImageFilter.GaussianBlur(18))
    canvas.alpha_composite(layer)
    canvas.alpha_composite(img, (pad, pad))
    return canvas


def fade_left(img: Image.Image, frac=0.22) -> Image.Image:
    """Esfuma a borda esquerda (braço cortado pela foto)."""
    w, h = img.size
    ramp = Image.linear_gradient("L").rotate(90, expand=True)
    ramp = ramp.resize((max(1, int(w * frac)), h))
    m = Image.new("L", (w, h), 255)
    m.paste(ramp, (0, 0))
    img.putalpha(ImageChops.multiply(img.getchannel("A"), m))
    return img


def cut(src: Path, name: str, box=None, keep_right=False, add_shadow=False, grade=True, people=True, fade=False, keep_all=False):
    img = Image.open(src).convert("RGB")
    if box:
        img = img.crop(box)
    cutout = remove(img, session=PORTRAIT if people else GENERAL, post_process_mask=True)
    if not keep_all:
        cutout = biggest(cutout)
    cutout = trim(cutout, keep_right, keep_bottom=people or name.startswith("dicaprio"))
    if fade:
        cutout = fade_left(cutout)
    if grade:
        cutout = gta(cutout)
    if add_shadow:
        cutout = shadow(cutout)
    cutout.save(OUT / name, optimize=True)
    print("ok", name, cutout.size)


# Loading 1: protagonista (pizzaria) - cortado na mesa, colado na direita
cut(IMGS / "IMG-20261118-WA0019.jpg", "henrique-protagonista.png", (0, 380, 738, 1110), keep_right=True, fade=True)
# Loading 2: academia sério
cut(IMGS / "IMG-20261118-WA0018.jpg", "henrique-academia-serio.png")
# Slide academia: punho
cut(IMGS / "IMG-20261118-WA0020.jpg", "henrique-academia-punho.png", (0, 440, 738, 1600))
# DiCaprio (Efetivado), com sombra embutida
cut(ROOT / "src/assets/memes/dicaprio.jpg", "dicaprio-recortado.png", add_shadow=True, grade=False)
# Ganso (a frase "peace was never an option" vai como texto no slide), sem tratamento de cor, com sombra embutida
cut(IMGS / "51rQpEfPreL.jpg", "ganso-recortado.png", add_shadow=True, grade=False, people=False)

# Violão: só o quadro do vídeo (vai em polaroid, sem recorte)
Image.open(IMGS / "IMG-20261118-WA0021.jpg").crop((0, 592, 738, 1006)).convert("RGB").save(
    OUT / "henrique-violao.jpg", quality=90)
print("ok henrique-violao.jpg")
