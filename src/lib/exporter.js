import { Muxer, ArrayBufferTarget } from 'mp4-muxer'
import { CANVAS_W, CANVAS_H, createRenderer, easeInOut } from './renderer.js'

const EXPORT_SCALE = 2
const EXPORT_FPS = 60

export function canExport() {
  return typeof VideoEncoder !== 'undefined' || typeof MediaRecorder !== 'undefined'
}

export async function exportVideo(canvas, renderer, onprogress) {
  if (typeof VideoEncoder !== 'undefined') {
    return exportMP4(renderer, onprogress)
  }
  return exportWebM(canvas, renderer)
}

async function exportMP4(renderer, onprogress) {
  const { font, text, fontName, watermark, duration } = renderer
  const w = CANVAS_W * EXPORT_SCALE
  const h = CANVAS_H * EXPORT_SCALE
  const totalMs = duration + 1400
  const totalFrames = Math.ceil(totalMs / 1000 * EXPORT_FPS)

  const offscreen = document.createElement('canvas')
  offscreen.style.cssText = 'position:fixed;left:-99999px;top:0;pointer-events:none;visibility:hidden;'
  document.body.appendChild(offscreen)

  const exportRenderer = createRenderer(offscreen, font, text, fontName, watermark, null, EXPORT_SCALE)

  const target = new ArrayBufferTarget()
  const muxer = new Muxer({
    target,
    video: { codec: 'avc', width: w, height: h },
    fastStart: 'in-memory',
  })

  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: e => { throw e },
  })

  const codecConfig = { codec: 'avc1.640034', width: w, height: h, bitrate: 12_000_000, framerate: EXPORT_FPS }
  const support = await VideoEncoder.isConfigSupported(codecConfig)
  if (!support.supported) {
    codecConfig.codec = 'avc1.42E01F'  // fallback to Baseline Profile
  }
  encoder.configure(codecConfig)

  for (let frame = 0; frame < totalFrames; frame++) {
    const timeMs = frame / EXPORT_FPS * 1000
    const raw = Math.min(timeMs / duration, 1)
    exportRenderer.drawStill(easeInOut(raw))

    const videoFrame = new VideoFrame(offscreen, {
      timestamp: Math.round(frame * 1_000_000 / EXPORT_FPS),
      duration: Math.round(1_000_000 / EXPORT_FPS),
    })
    encoder.encode(videoFrame, { keyFrame: frame % (EXPORT_FPS * 2) === 0 })
    videoFrame.close()

    // Yield to browser every 30 frames so UI stays responsive
    if (frame % 30 === 29) {
      onprogress?.(frame / totalFrames)
      await new Promise(r => setTimeout(r, 0))
    }
  }

  await encoder.flush()
  onprogress?.(1)
  muxer.finalize()
  document.body.removeChild(offscreen)

  const blob = new Blob([target.buffer], { type: 'video/mp4' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'contour.mp4'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

async function exportWebM(canvas, renderer) {
  return new Promise((resolve, reject) => {
    const mimeType = ['video/webm;codecs=vp9', 'video/webm'].find(m => MediaRecorder.isTypeSupported(m))
    if (!mimeType) { reject(new Error('MediaRecorder not supported')); return }

    const stream = canvas.captureStream(60)
    const rec = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 })
    const chunks = []

    rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'contour.webm'
      a.click()
      URL.revokeObjectURL(url)
      resolve()
    }
    rec.onerror = reject
    rec.start()
    renderer.play()
    setTimeout(() => rec.stop(), renderer.duration + 1000)
  })
}
