<script>
  import { PUBLIC_BASE_URL } from '$env/static/public'

  let { isLoading, isExporting, exportProgress, exportSupported, hasRenderer, error, onreplay, onexport, onexportframe } = $props()

  const pct = $derived(exportProgress > 0 ? ` ${Math.round(exportProgress * 100)}%` : '…')
</script>

<div class="bottom">
  <div class="actions">
    <button class="action-btn" onclick={onreplay} disabled={isLoading} type="button">
      <span class="action-icon">↺</span>
      <span class="action-label">replay</span>
    </button>

    <button
      class="action-btn"
      onclick={onexportframe}
      disabled={isLoading || !hasRenderer}
      type="button"
    >
      <span class="action-icon">□</span>
      <span class="action-label">save frame</span>
    </button>

    {#if exportSupported}
      <button
        class="action-btn action-primary"
        onclick={onexport}
        disabled={isExporting || isLoading || !hasRenderer}
        type="button"
      >
        <span class="action-icon">↓</span>
        <span class="action-label">{isExporting ? `encoding${pct}` : 'export .mp4'}</span>
      </button>
    {:else}
      <button class="action-btn" disabled type="button">
        <span class="action-icon">↓</span>
        <span class="action-label">export unavailable</span>
      </button>
    {/if}
  </div>

  {#if error}<p class="err">{error}</p>{/if}

  <div class="footer-links">
    <a class="url" href="https://{PUBLIC_BASE_URL}" target="_blank" rel="noopener">{PUBLIC_BASE_URL}</a>
    <span class="sep" aria-hidden="true">·</span>
    <a class="url" href="https://christianecg.com" target="_blank" rel="noopener">christianecg.com</a>
    <span class="sep" aria-hidden="true">·</span>
    <a class="url" href="https://avelor.es" target="_blank" rel="noopener">avelor.es</a>
  </div>
</div>

<style>
  .bottom {
    margin-top: auto;
    width: 100%;
    max-width: 580px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }

  .actions {
    display: flex;
    gap: 12px;
    width: 100%;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px 16px;
    border: 1px solid rgba(245,245,245,0.1);
    background: rgba(245,245,245,0.03);
    color: rgba(245,245,245,0.4);
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: lowercase;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s, background 0.2s;
  }

  .action-btn:hover:not(:disabled) {
    color: rgba(245,245,245,0.85);
    border-color: rgba(245,245,245,0.25);
    background: rgba(245,245,245,0.06);
  }

  .action-btn:disabled { opacity: 0.3; cursor: default; }

  .action-btn.action-primary {
    color: rgba(245,245,245,0.75);
    border-color: rgba(245,245,245,0.2);
  }

  .action-btn.action-primary:hover:not(:disabled) {
    color: #f5f5f5;
    border-color: rgba(245,245,245,0.5);
    background: rgba(245,245,245,0.08);
  }

  .action-icon { font-size: 14px; line-height: 1; opacity: 0.7; }
  .action-label { letter-spacing: 0.1em; }

  .err {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 10px;
    letter-spacing: 0.06em;
    color: rgba(220,80,60,0.65);
  }

  .footer-links {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .url {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 9px;
    letter-spacing: 0.14em;
    color: rgba(245,245,245,0.1);
    text-decoration: none;
    text-transform: lowercase;
    transition: color 0.15s;
  }

  .url:hover { color: rgba(245,245,245,0.35); }

  .sep {
    font-size: 9px;
    color: rgba(245,245,245,0.08);
  }
</style>
