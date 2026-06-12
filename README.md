<img src="https://contour.christianecg.com/og.svg" alt="Contour — the geometry of type" width="100%"/>

# Contour

**Live demo → [contour.christianecg.com](https://contour.christianecg.com)**

A browser tool that parses OpenType font binaries and animates their Bézier curves on a canvas, segment by segment. Type any word, pick a font, and watch the glyphs draw themselves — control handles, anchor points, and all. Export the animation as an MP4 or grab a still as PNG.

---

## How it works

### 1. Font parsing

[opentype.js](https://opentype.js.org/) fetches a `.ttf` binary and parses its glyph outlines into a sequence of path commands (`M`, `L`, `C`, `Q`, `Z`). Quadratic curves (`Q`) from TrueType fonts are promoted to cubics so the renderer only handles one curve type.

### 2. Segment extraction (`segments.js`)

Each glyph's path commands are flattened into a list of `{ type, x0, y0, … }` segments with an approximate arc length. From the total arc length of all glyphs, every segment gets a `[tStart, tEnd]` window in `[0, 1]` — proportional to its length — so the drawing cursor advances at a perceptually constant speed regardless of glyph complexity.

Font size is computed automatically: glyphs fill ~80 % of canvas width at up to 28 % of canvas height, capped at 320 px and never below 48 px. Kerning pairs are applied when available.

### 3. Rendering loop (`renderer.js` + `draw.js`)

`createRenderer` runs a `requestAnimationFrame` loop. Each frame:

- The eased progress `t ∈ [0, 1]` is computed with a quadratic ease-in-out.
- For cubic segments (`C`), de Casteljau subdivision draws only the completed portion of the curve, so the stroke grows smoothly from the anchor rather than jumping.
- Dashed tangent handles are drawn from each off-curve control point to its nearest on-curve endpoint.
- A comet trail (22-point history of the cursor position) is rendered with alpha and radius ramping toward the head.
- A glowing radial cursor follows the live draw point.
- An ambient radial glow peaks at 50 % progress.

Canvas is 540 × 960 (9:16). The font name is rendered as a watermark at ~18 % height in its own face.

### 4. Video export (`exporter.js`)

Primary path uses the [WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API) + [mp4-muxer](https://github.com/Vanilagy/mp4-muxer):

- An off-screen canvas is created at **2× scale** (1080 × 1920).
- Frames are rendered sequentially at 60 fps by calling `drawStill(t)` directly — no live playback, no timing drift.
- `VideoEncoder` encodes each frame as `VideoFrame`; the muxer produces an in-memory MP4 buffer downloaded as `contour.mp4`.
- Codec: AVC High Profile (`avc1.640034`) at 12 Mbps; falls back to Baseline Profile if unsupported.
- The browser yields every 30 frames so the UI stays responsive during encoding.

Fallback: if `VideoEncoder` is unavailable, `MediaRecorder` captures the live canvas stream at 60 fps and produces a WebM.

---

## Fonts

| ID | Family |
|----|--------|
| `playfair` | Playfair Display |
| `bebas` | Bebas Neue |
| `lobster` | Lobster |
| `spacemono` | Space Mono |
| `cormorant` | Cormorant Garamond |

Font files are served as static assets from `/static/fonts/`. Text and font selection are reflected in the URL (`?text=…&font=…`) so links are shareable. Parsed fonts are cached in memory for the session.

---

## Browser support

| Feature | Chrome | Firefox | Safari |
|---------|--------|---------|--------|
| Animation + PNG export | ✓ | ✓ | ✓ |
| MP4 export (WebCodecs) | ✓ 94+ | ✗ | ✓ 16.4+ |
| WebM fallback (MediaRecorder) | ✓ | ✓ | ✗ |

---

## Stack

- [SvelteKit](https://kit.svelte.dev/) (Svelte 5) with `@sveltejs/adapter-static`
- [opentype.js](https://opentype.js.org/) — font parsing
- [mp4-muxer](https://github.com/Vanilagy/mp4-muxer) — in-memory MP4 muxing
- [Vite](https://vitejs.dev/) 6

---

## Development

```bash
pnpm install
pnpm dev       # http://localhost:5173
pnpm build     # static output → ./build
pnpm preview   # serve the build locally
```

---

## License

[MIT](LICENSE) © Christian Elías
