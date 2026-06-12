<script>
  import { onMount } from 'svelte'
  import { PUBLIC_BASE_URL } from '$env/static/public'
  import { FONTS } from '$lib/fonts.js'
  import { parseFont, createRenderer } from '$lib/renderer.js'
  import { exportVideo, canExport } from '$lib/exporter.js'
  import BrandHeader from '$lib/BrandHeader.svelte'
  import FontPicker from '$lib/FontPicker.svelte'
  import ActionBar from '$lib/ActionBar.svelte'

  let canvas = $state(null)
  let text = $state('Hello')
  let selectedFont = $state(FONTS[0])
  let isLoading = $state(false)
  let isExporting = $state(false)
  let exportProgress = $state(0)
  let exportSupported = $state(false)
  let error = $state('')
  let hasRenderer = $state(false)

  const fontCache = new Map()
  let renderer = null

  function syncURL() {
    const p = new URLSearchParams()
    p.set('text', text)
    if (selectedFont.id !== FONTS[0].id) p.set('font', selectedFont.id)
    history.replaceState(null, '', `?${p}`)
  }

  async function loadFont(fontDef) {
    if (!fontCache.has(fontDef.id)) {
      fontCache.set(fontDef.id, await parseFont(fontDef.url))
    }
    return fontCache.get(fontDef.id)
  }

  async function run() {
    const t = text.trim()
    if (!t || !canvas) return
    error = ''
    isLoading = true
    try {
      const font = await loadFont(selectedFont)
      renderer?.stop()
      renderer = createRenderer(canvas, font, t, selectedFont.name, PUBLIC_BASE_URL, (p) => {
        document.documentElement.style.setProperty('--render-glow', Math.sin(p * Math.PI).toFixed(3))
      })
      renderer.play()
      hasRenderer = true
      syncURL()
    } catch (e) {
      error = 'Could not render. Try different text or font.'
      console.error(e)
    } finally {
      isLoading = false
    }
  }

  async function handleExport() {
    if (!renderer || isExporting) return
    isExporting = true
    exportProgress = 0
    try {
      await exportVideo(canvas, renderer, (p) => { exportProgress = p })
    } catch (e) {
      error = 'Export failed.'
      console.error(e)
    } finally {
      isExporting = false
      exportProgress = 0
    }
  }

  function handleExportFrame() {
    if (!canvas) return
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'contour.png'
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    }, 'image/png')
  }

  onMount(() => {
    exportSupported = canExport()
    const p = new URLSearchParams(location.search)
    const urlText = p.get('text')
    const urlFont = p.get('font')
    if (urlText) text = urlText.slice(0, 12)
    if (urlFont) selectedFont = FONTS.find(f => f.id === urlFont) ?? FONTS[0]
    run()
  })
</script>

<div class="page">
  <BrandHeader />

  <div class="stage">
    <canvas bind:this={canvas}></canvas>
    {#if isLoading}<div class="loading-veil">loading</div>{/if}
  </div>

  <div class="type-row">
    <input
      bind:value={text}
      onkeydown={e => e.key === 'Enter' && run()}
      placeholder="type something"
      maxlength="12"
      spellcheck="false"
      autocomplete="off"
    />
    <button class="render-btn" onclick={run} disabled={isLoading || !text.trim()}>
      {isLoading ? '…' : '↵'}
    </button>
  </div>

  <FontPicker fonts={FONTS} selected={selectedFont} onselect={f => { selectedFont = f; run() }} />

  <ActionBar
    {isLoading}
    {isExporting}
    {exportProgress}
    {exportSupported}
    {hasRenderer}
    {error}
    onreplay={run}
    onexport={handleExport}
    onexportframe={handleExportFrame}
  />
</div>

<style>
  .page {
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 32px 36px;
  }

  .stage {
    position: relative;
    width: clamp(220px, 30vw, 300px);
    aspect-ratio: 9 / 16;
    margin-bottom: 44px;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.07),
      0 24px 64px rgba(0,0,0,0.6),
      0 4px 16px rgba(0,0,0,0.4);
  }

  .loading-veil {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 9px;
    letter-spacing: 0.22em;
    color: rgba(245,245,245,0.2);
    text-transform: lowercase;
    background: rgba(8,8,8,0.6);
  }

  .type-row {
    width: 100%;
    max-width: 580px;
    display: flex;
    align-items: baseline;
    gap: 12px;
    border-bottom: 1px solid rgba(245,245,245,0.07);
    padding-bottom: 12px;
    margin-bottom: 36px;
  }

  .type-row input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 28px;
    color: rgba(245,245,245,0.88);
    text-align: center;
    caret-color: rgba(245,245,245,0.5);
  }

  .type-row input::placeholder {
    color: rgba(245,245,245,0.1);
    font-style: italic;
  }

  .render-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 16px;
    color: rgba(245,245,245,0.25);
    padding: 0 4px;
    transition: color 0.15s;
    flex-shrink: 0;
  }

  .render-btn:hover:not(:disabled) { color: rgba(245,245,245,0.7); }
  .render-btn:disabled { opacity: 0.3; cursor: default; }

  @media (max-width: 520px) {
    .page { padding: 20px 20px 28px; }
    .stage { width: clamp(200px, 55vw, 260px); }
    .type-row input { font-size: 22px; }
  }
</style>
