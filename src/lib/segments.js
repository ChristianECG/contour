export const CANVAS_W = 540
export const CANVAS_H = 960

export function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

function layoutGlyphs(font, text, canvasW, canvasH) {
  const glyphs = [...text].map(ch => font.charToGlyph(ch)).filter(g => g.index !== 0)
  if (!glyphs.length) return { glyphs: [], fontSize: 0, startX: 0, baselineY: 0 }

  const ref = 200
  const refScale = ref / font.unitsPerEm
  let refWidth = glyphs.reduce((w, g, i) => {
    let adv = g.advanceWidth * refScale
    if (i < glyphs.length - 1) {
      try { adv += font.getKerningValue(g, glyphs[i + 1]) * refScale } catch {}
    }
    return w + adv
  }, 0)

  let fontSize = ref * ((canvasW * 0.8) / refWidth)
  fontSize = Math.min(fontSize, canvasH * 0.28, 320)
  fontSize = Math.max(fontSize, 48)

  const scale = fontSize / font.unitsPerEm
  let totalWidth = glyphs.reduce((w, g, i) => {
    let adv = g.advanceWidth * scale
    if (i < glyphs.length - 1) {
      try { adv += font.getKerningValue(g, glyphs[i + 1]) * scale } catch {}
    }
    return w + adv
  }, 0)

  if (totalWidth > canvasW * 0.92) {
    fontSize *= (canvasW * 0.92) / totalWidth
    const s2 = fontSize / font.unitsPerEm
    totalWidth = glyphs.reduce((w, g) => w + g.advanceWidth * s2, 0)
  }

  return {
    glyphs,
    fontSize,
    startX: (canvasW - totalWidth) / 2,
    baselineY: canvasH * 0.58,
  }
}

function approxCubicLength(x0, y0, x1, y1, x2, y2, x3, y3, steps = 16) {
  let len = 0, px = x0, py = y0
  for (let i = 1; i <= steps; i++) {
    const t = i / steps, mt = 1 - t
    const x = mt*mt*mt*x0 + 3*mt*mt*t*x1 + 3*mt*t*t*x2 + t*t*t*x3
    const y = mt*mt*mt*y0 + 3*mt*mt*t*y1 + 3*mt*t*t*y2 + t*t*t*y3
    len += Math.hypot(x - px, y - py)
    px = x; py = y
  }
  return len
}

function buildSegments(commands) {
  const segs = []
  let cx = 0, cy = 0, contourStartX = 0, contourStartY = 0

  for (const cmd of commands) {
    if (cmd.type === 'M') {
      cx = cmd.x; cy = cmd.y
      contourStartX = cx; contourStartY = cy
    } else if (cmd.type === 'L') {
      const len = Math.hypot(cmd.x - cx, cmd.y - cy)
      if (len > 0.1) segs.push({ type: 'L', x0: cx, y0: cy, x1: cmd.x, y1: cmd.y, length: len })
      cx = cmd.x; cy = cmd.y
    } else if (cmd.type === 'C') {
      segs.push({
        type: 'C', x0: cx, y0: cy,
        x1: cmd.x1, y1: cmd.y1, x2: cmd.x2, y2: cmd.y2, x3: cmd.x, y3: cmd.y,
        length: approxCubicLength(cx, cy, cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y),
      })
      cx = cmd.x; cy = cmd.y
    } else if (cmd.type === 'Q') {
      const cx1 = cx + (2/3) * (cmd.x1 - cx), cy1 = cy + (2/3) * (cmd.y1 - cy)
      const cx2 = cmd.x + (2/3) * (cmd.x1 - cmd.x), cy2 = cmd.y + (2/3) * (cmd.y1 - cmd.y)
      segs.push({
        type: 'C', x0: cx, y0: cy,
        x1: cx1, y1: cy1, x2: cx2, y2: cy2, x3: cmd.x, y3: cmd.y,
        length: approxCubicLength(cx, cy, cx1, cy1, cx2, cy2, cmd.x, cmd.y),
      })
      cx = cmd.x; cy = cmd.y
    } else if (cmd.type === 'Z') {
      const len = Math.hypot(contourStartX - cx, contourStartY - cy)
      if (len > 0.5) segs.push({ type: 'L', x0: cx, y0: cy, x1: contourStartX, y1: contourStartY, length: len })
      cx = contourStartX; cy = contourStartY
    }
  }

  return segs
}

export function extractSegments(font, text, canvasW, canvasH) {
  const { glyphs, fontSize, startX, baselineY } = layoutGlyphs(font, text, canvasW, canvasH)
  if (!glyphs.length) return []

  const scale = fontSize / font.unitsPerEm
  let x = startX
  const all = []

  for (let gi = 0; gi < glyphs.length; gi++) {
    const glyph = glyphs[gi]
    const segs = buildSegments(glyph.getPath(x, baselineY, fontSize).commands)
    for (const s of segs) s.glyphIndex = gi
    all.push(...segs)
    x += glyph.advanceWidth * scale
    if (gi < glyphs.length - 1) {
      try { x += font.getKerningValue(glyph, glyphs[gi + 1]) * scale } catch {}
    }
  }

  const total = all.reduce((s, seg) => s + seg.length, 0) || 1
  let cum = 0
  for (const seg of all) {
    seg.tStart = cum / total
    seg.tEnd = (cum + seg.length) / total
    cum += seg.length
  }

  return all
}
