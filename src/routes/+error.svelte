<script>
  import { page } from '$app/stores'
  import Logo from '$lib/Logo.svelte'
</script>

<div class="error-page">
  <a href="/" class="brand">
    <Logo size={22} />
    <span class="wordmark">CONTOUR</span>
  </a>
  <p class="code">{$page.status}</p>
  <p class="message">
    {$page.status === 404 ? 'page not found' : ($page.error?.message ?? 'something went wrong')}
  </p>
  <a href="/" class="back">back to start</a>
</div>

<style>
  .error-page {
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 40px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    margin-bottom: 64px;
  }

  .wordmark {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 10px;
    letter-spacing: 0.42em;
    color: rgba(245,245,245,0.5);
    text-transform: uppercase;
  }

  .code {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 96px;
    font-weight: 200;
    letter-spacing: -0.02em;
    color: rgba(245,245,245,0.06);
    line-height: 1;
    margin-bottom: 16px;
  }

  .message {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 11px;
    letter-spacing: 0.18em;
    color: rgba(245,245,245,0.2);
    text-transform: lowercase;
    margin-bottom: 48px;
  }

  .back {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 10px;
    letter-spacing: 0.14em;
    color: rgba(245,245,245,0.25);
    text-decoration: none;
    text-transform: lowercase;
    border-bottom: 1px solid rgba(245,245,245,0.1);
    padding-bottom: 2px;
    transition: color 0.15s, border-color 0.15s;
  }

  .back:hover {
    color: rgba(245,245,245,0.6);
    border-color: rgba(245,245,245,0.3);
  }
</style>
