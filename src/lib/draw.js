import { CANVAS_W, CANVAS_H } from './segments.js'

function partialCubic(ctx, x0, y0, x1, y1, x2, y2, x3, y3, t) {
  const mt = 1 - t
  const b1x = mt*x0+t*x1, b1y = mt*y0+t*y1
  const b2x = mt*x1+t*x2, b2y = mt*y1+t*y2
  const b3x = mt*x2+t*x3, b3y = mt*y2+t*y3
  const c1x = mt*b1x+t*b2x, c1y = mt*b1y+t*b2y
  const c2x = mt*b2x+t*b3x, c2y = mt*b2y+t*b3y
  const ex  = mt*c1x+t*c2x, ey  = mt*c1y+t*c2y
  ctx.moveTo(x0, y0)
  ctx.bezierCurveTo(b1x, b1y, c1x, c1y, ex, ey)
  return { x: ex, y: ey }
}

function drawLogoMark(ctx, cx, size) {
  const s = size / 56
  ctx.save()
  ctx.translate(cx - 24 * s, 0)
  ctx.scale(s, s)
  ctx.lineCap = 'round'

  ctx.strokeStyle = 'rgba(255,255,255,0.22)'
  ctx.lineWidth = 1 / s
  ctx.beginPath(); ctx.moveTo(6, 42); ctx.lineTo(6, 10); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(42, 14); ctx.lineTo(42, 44); ctx.stroke()

  ctx.strokeStyle = 'rgba(255,255,255,0.38)'
  ctx.lineWidth = 1.1 / s
  ctx.beginPath(); ctx.arc(6, 10, 2.2, 0, Math.PI*2); ctx.stroke()
  ctx.beginPath(); ctx.arc(42, 44, 2.2, 0, Math.PI*2); ctx.stroke()

  ctx.strokeStyle = 'rgba(255,255,255,0.82)'
  ctx.lineWidth = 2.2 / s
  ctx.beginPath(); ctx.moveTo(6, 42); ctx.bezierCurveTo(6, 10, 42, 44, 42, 14); ctx.stroke()

  ctx.fillStyle = 'rgba(255,255,255,0.82)'
  ctx.beginPath(); ctx.arc(6, 42, 3, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(42, 14, 3, 0, Math.PI*2); ctx.fill()
  ctx.restore()
}

function drawWatermark(ctx, watermark) {
  const wmBaseY = CANVAS_H - 56
  const logoSize = 22
  const iconW = logoSize * (48 / 56)
  const gap = 7
  const textW = 'CONTOUR'.length * 8.5
  const startX = (CANVAS_W - (iconW + gap + textW)) / 2

  ctx.save()
  ctx.translate(0, wmBaseY)
  drawLogoMark(ctx, startX + iconW / 2, logoSize)

  ctx.fillStyle = 'rgba(255,255,255,0.42)'
  ctx.font = '11px sans-serif'
  try { ctx.letterSpacing = '0.28em' } catch {}
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('CONTOUR', startX + iconW + gap, logoSize / 2)

  ctx.fillStyle = 'rgba(255,255,255,0.16)'
  ctx.font = '10px monospace'
  try { ctx.letterSpacing = '0em' } catch {}
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(watermark, CANVAS_W / 2, logoSize + 6)
  ctx.restore()
}

export function drawFrame(ctx, segments, progress, fontName, watermark, trail = []) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
  ctx.fillStyle = '#080808'
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  // Font name in its own typeface
  ctx.save()
  ctx.font = `26px '${fontName}', serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.fillText(fontName, CANVAS_W / 2, CANVAS_H * 0.18)
  ctx.restore()

  // Ambient glow, peaks at 50% progress
  const glowIntensity = Math.sin(progress * Math.PI) * 0.07
  if (glowIntensity > 0.001) {
    const grad = ctx.createRadialGradient(
      CANVAS_W/2, CANVAS_H*0.54, 0,
      CANVAS_W/2, CANVAS_H*0.54, CANVAS_W*0.75,
    )
    grad.addColorStop(0, `rgba(255,255,255,${glowIntensity.toFixed(3)})`)
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
  }

  let cursorX = 0, cursorY = 0, hasCursor = false

  for (const seg of segments) {
    if (seg.tStart >= progress) break
    const local = seg.tEnd > seg.tStart
      ? Math.min(1, (progress - seg.tStart) / (seg.tEnd - seg.tStart))
      : 1
    const done = local >= 1

    if (seg.type === 'C') {
      // Dashed handles
      ctx.save()
      ctx.strokeStyle = 'rgba(255,255,255,0.13)'
      ctx.lineWidth = 0.75
      ctx.setLineDash([2, 5])
      ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(seg.x0, seg.y0); ctx.lineTo(seg.x1, seg.y1); ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(done ? seg.x3 : cursorX, done ? seg.y3 : cursorY)
      ctx.lineTo(seg.x2, seg.y2); ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()

      ctx.fillStyle = 'rgba(255,255,255,0.28)'
      ctx.beginPath(); ctx.arc(seg.x1, seg.y1, 2.5, 0, Math.PI*2); ctx.fill()
      ctx.beginPath(); ctx.arc(seg.x2, seg.y2, 2.5, 0, Math.PI*2); ctx.fill()

      ctx.strokeStyle = 'rgba(245,245,245,0.92)'
      ctx.lineWidth = 1.75
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'
      ctx.beginPath()
      const end = partialCubic(ctx, seg.x0, seg.y0, seg.x1, seg.y1, seg.x2, seg.y2, seg.x3, seg.y3, local)
      ctx.stroke()

      ctx.fillStyle = '#f5f5f5'
      ctx.beginPath(); ctx.arc(seg.x0, seg.y0, 2, 0, Math.PI*2); ctx.fill()
      if (done) {
        ctx.beginPath(); ctx.arc(seg.x3, seg.y3, 2, 0, Math.PI*2); ctx.fill()
        cursorX = seg.x3; cursorY = seg.y3; hasCursor = false
      } else {
        cursorX = end.x; cursorY = end.y; hasCursor = true
      }

    } else if (seg.type === 'L') {
      const ex = seg.x0 + local * (seg.x1 - seg.x0)
      const ey = seg.y0 + local * (seg.y1 - seg.y0)

      ctx.strokeStyle = 'rgba(245,245,245,0.92)'
      ctx.lineWidth = 1.75; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(seg.x0, seg.y0); ctx.lineTo(ex, ey); ctx.stroke()

      ctx.fillStyle = '#f5f5f5'
      ctx.beginPath(); ctx.arc(seg.x0, seg.y0, 2, 0, Math.PI*2); ctx.fill()
      if (done) {
        ctx.beginPath(); ctx.arc(seg.x1, seg.y1, 2, 0, Math.PI*2); ctx.fill()
        cursorX = seg.x1; cursorY = seg.y1; hasCursor = false
      } else {
        cursorX = ex; cursorY = ey; hasCursor = true
      }
    }
  }

  // Comet trail
  if (trail.length > 1) {
    for (let i = 0; i < trail.length; i++) {
      const t = i / (trail.length - 1)
      if (t < 0.05) continue
      ctx.save()
      ctx.shadowColor = '#ffffff'
      ctx.shadowBlur = t * 10
      ctx.globalAlpha = t * 0.5
      ctx.fillStyle = '#ffffff'
      ctx.beginPath(); ctx.arc(trail[i].x, trail[i].y, 0.8 + t * 3.2, 0, Math.PI*2); ctx.fill()
      ctx.restore()
    }
  }

  // Cursor
  if (hasCursor) {
    ctx.save()
    const corona = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, 55)
    corona.addColorStop(0, 'rgba(255,255,255,0.07)')
    corona.addColorStop(1, 'transparent')
    ctx.fillStyle = corona
    ctx.fillRect(cursorX - 55, cursorY - 55, 110, 110)

    ctx.shadowColor = '#ffffff'
    ctx.fillStyle = '#ffffff'
    ctx.shadowBlur = 28; ctx.globalAlpha = 0.25
    ctx.beginPath(); ctx.arc(cursorX, cursorY, 9, 0, Math.PI*2); ctx.fill()
    ctx.shadowBlur = 14; ctx.globalAlpha = 0.55
    ctx.beginPath(); ctx.arc(cursorX, cursorY, 5, 0, Math.PI*2); ctx.fill()
    ctx.shadowBlur = 6;  ctx.globalAlpha = 1
    ctx.beginPath(); ctx.arc(cursorX, cursorY, 3, 0, Math.PI*2); ctx.fill()
    ctx.restore()
  }

  drawWatermark(ctx, watermark)
}
