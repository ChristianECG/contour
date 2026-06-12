<script>
  let { size = 32, color = '#f5f5f5' } = $props()
</script>

<!--
  A cubic bezier curve with visible control handles and anchor points.
  P0=(6,42) CP1=(6,10) CP2=(42,44) P3=(42,14)
-->
<svg
  width={size}
  height={size}
  viewBox="0 0 48 56"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
>
  <!-- Handle lines -->
  <line x1="6" y1="42" x2="6" y2="10" stroke={color} stroke-width="0.9" opacity="0.28" stroke-linecap="round"/>
  <line x1="42" y1="14" x2="42" y2="44" stroke={color} stroke-width="0.9" opacity="0.28" stroke-linecap="round"/>

  <!-- Off-curve control points -->
  <circle cx="6" cy="10" r="2.2" stroke={color} stroke-width="1" opacity="0.45"/>
  <circle cx="42" cy="44" r="2.2" stroke={color} stroke-width="1" opacity="0.45"/>

  <!-- The bezier curve -->
  <path d="M 6 42 C 6 10 42 44 42 14" stroke={color} stroke-width="2.2" stroke-linecap="round"/>

  <!-- On-curve anchor points -->
  <circle cx="6" cy="42" r="3" fill={color}/>
  <circle cx="42" cy="14" r="3" fill={color}/>
</svg>
