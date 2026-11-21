# Retrospectiva 2026

Apresentação em Astro + GSAP, estilo tela de loading do GTA VI. Palco fixo 1920x1080, funciona offline depois do build.

## Rodar

```bash
npm install
npm run dev       # desenvolvimento
npm run build     # gera dist/ (abre direto o dist/index.html, sem servidor)
npm run preview   # serve o dist/
```

## Controles

- Avançar: seta direita, espaço, Enter, PageDown ou clique
- Voltar: seta esquerda, PageUp ou clique direito
- `F`: tela cheia · `Home`/`End`: primeiro/último slide
- `#5` no fim da URL abre direto no slide 5

## Editar

Todo o conteúdo fica em `src/data/slides.ts`. Imagens em `src/assets` (pelo nome do arquivo, sem extensão).
Scripts de preparo de imagem: `scripts/recortar.py` e `scripts/memes_extra.py`.
