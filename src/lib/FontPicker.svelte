<script>
  let { fonts, selected, onselect } = $props()
</script>

<nav class="typeface-nav">
  {#each fonts as f}
    <button
      class="tf-btn"
      class:active={selected.id === f.id}
      style="font-family: '{f.name}', serif"
      onclick={() => onselect(f)}
      type="button"
    >{f.name}</button>
  {/each}
</nav>

<style>
  .typeface-nav {
    width: 100%;
    max-width: 580px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px 32px;
    margin-bottom: 56px;
  }

  .tf-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 0;
    font-size: 15px;
    line-height: 1.3;
    color: rgba(245,245,245,0.18);
    transition: color 0.2s;
  }

  .tf-btn:hover { color: rgba(245,245,245,0.5); }
  .tf-btn.active { color: rgba(245,245,245,0.9); }

  @media (max-width: 520px) {
    .tf-btn { font-size: 13px; }
    .typeface-nav { gap: 4px 20px; }
  }
</style>
