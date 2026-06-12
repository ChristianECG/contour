import * as opentype from 'opentype.js'
import { CANVAS_W, CANVAS_H, easeInOut, extractSegments } from './segments.js'
import { drawFrame } from './draw.js'

export { CANVAS_W, CANVAS_H, easeInOut }

export async function parseFont(url) {
  const buffer = await fetch(url).then(r => r.arrayBuffer())
  return opentype.parse(buffer)
}

export function createRenderer(canvas, font, text, fontName, watermark, onProgress, exportScale = 1) {
  canvas.width  = CANVAS_W * exportScale
  canvas.height = CANVAS_H * exportScale
  const ctx = canvas.getContext('2d')
  if (exportScale !== 1) ctx.scale(exportScale, exportScale)

  const segments = extractSegments(font, text, CANVAS_W, CANVAS_H)
  const duration = Math.min(7000, Math.max(2000, segments.length * 80))

  let rafId = null
  let startTime = null
  const trail = []
  const TRAIL_LEN = 22

  function cursorAt(eased) {
    let x = 0, y = 0, active = false
    for (const seg of segments) {
      if (seg.tStart >= eased) break
      const local = Math.min(1, (eased - seg.tStart) / Math.max(seg.tEnd - seg.tStart, 1e-9))
      if (seg.type === 'C') {
        const mt = 1 - local
        const b1x = mt*seg.x0+local*seg.x1, b1y = mt*seg.y0+local*seg.y1
        const b2x = mt*seg.x1+local*seg.x2, b2y = mt*seg.y1+local*seg.y2
        const b3x = mt*seg.x2+local*seg.x3, b3y = mt*seg.y2+local*seg.y3
        const c1x = mt*b1x+local*b2x, c1y = mt*b1y+local*b2y
        const c2x = mt*b2x+local*b3x, c2y = mt*b2y+local*b3y
        x = mt*c1x+local*c2x; y = mt*c1y+local*c2y; active = local < 1
      } else {
        x = seg.x0 + local*(seg.x1-seg.x0)
        y = seg.y0 + local*(seg.y1-seg.y0)
        active = local < 1
      }
    }
    return { x, y, active }
  }

  function tick(ts) {
    if (!startTime) startTime = ts
    const raw = Math.min((ts - startTime) / duration, 1)
    const eased = easeInOut(raw)

    const cur = cursorAt(eased)
    if (cur.active) {
      trail.push({ x: cur.x, y: cur.y })
      if (trail.length > TRAIL_LEN) trail.shift()
    } else if (trail.length) {
      trail.shift()
    }

    drawFrame(ctx, segments, eased, fontName, watermark, trail)
    onProgress?.(raw)
    if (raw < 1 || trail.length > 0) rafId = requestAnimationFrame(tick)
  }

  return {
    duration,
    font,
    text,
    fontName,
    watermark,
    play() {
      if (rafId) cancelAnimationFrame(rafId)
      startTime = null
      rafId = requestAnimationFrame(tick)
    },
    stop() {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = null
    },
    drawStill(progress) {
      drawFrame(ctx, segments, progress, fontName, watermark)
    },
  }
}
