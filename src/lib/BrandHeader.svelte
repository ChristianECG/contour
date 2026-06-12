<script>
  import Logo from './Logo.svelte'
</script>

<header>
  <div class="brand">
    <Logo size={18} />
    <span class="wordmark">CONTOUR</span>
  </div>
  <span class="tagline">the geometry of type</span>
</header>

<style>
  header {
    width: 100%;
    max-width: 580px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 48px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .wordmark {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 10px;
    font-weight: 400;
    letter-spacing: 0.42em;
    color: rgba(245,245,245,0.85);
    text-transform: uppercase;
  }

  .tagline {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: rgba(245,245,245,0.18);
  }
</style>
