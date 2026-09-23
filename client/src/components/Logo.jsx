// tooli logo, drawn inline so its colours follow the palette tokens
// (--logo-ink, --logo-primary, --logo-accent, --logo-eye in tokens.css).
// Source artwork: logo/tooli-logo.af

const ink = 'var(--logo-ink)'
const primary = 'var(--logo-primary)'
const accent = 'var(--logo-accent)'
const eye = 'var(--logo-eye)'

const EYE_RING =
  'c35.323,0 64,28.677 64,64c0,35.323 -28.677,64 -64,64c-35.323,0 -64,-28.677 -64,-64c0,-35.323 28.677,-64 64,-64Zm0,32c-17.661,0 -32,14.339 -32,32c0,17.661 14.339,32 32,32c17.661,0 32,-14.339 32,-32c0,-17.661 -14.339,-32 -32,-32Z'

export default function Logo({ height = 40, title = 'tooli', ...props }) {
  return (
    <svg
      viewBox="18 16 524 278"
      height={height}
      role="img"
      aria-label={title}
      {...props}
    >
      {/* t */}
      <path
        fill={ink}
        d="M107.87,191.59l0,38.41l-19.55,0c-32.967,0 -49.45,-16.33 -49.45,-48.99l0,-42.55l-15.87,0l0,-37.49l15.87,0l0,-31.28l45.31,0l0,31.28l23.46,0l0,37.49l-23.46,0l0,43.24c0,3.527 0.805,6.057 2.415,7.59c1.61,1.533 4.332,2.3 8.165,2.3l13.11,0Z"
      />

      {/* eyes (the "oo") */}
      <circle cx="190" cy="167" r="64" fill={eye} />
      <path fill={ink} d={`M190,103${EYE_RING}`} />
      <circle cx="336" cy="167" r="64" fill={eye} />
      <path fill={ink} d={`M336,103${EYE_RING}`} />
      <circle cx="200" cy="156" r="17" fill={primary} />
      <circle cx="206" cy="150" r="5" fill={eye} />
      <circle cx="346" cy="156" r="17" fill={primary} />
      <circle cx="352" cy="150" r="5" fill={eye} />

      {/* l and i */}
      <rect x="421" y="59.8" width="45.08" height="170.2" fill={ink} />
      <path
        fill={primary}
        d="M514.61,89.01c-7.973,0 -14.375,-2.185 -19.205,-6.555c-4.83,-4.37 -7.245,-9.852 -7.245,-16.445c0,-6.747 2.415,-12.343 7.245,-16.79c4.83,-4.447 11.232,-6.67 19.205,-6.67c7.82,0 14.145,2.223 18.975,6.67c4.83,4.447 7.245,10.043 7.245,16.79c0,6.593 -2.415,12.075 -7.245,16.445c-4.83,4.37 -11.155,6.555 -18.975,6.555Zm22.31,11.96l0,129.03l-45.08,0l0,-129.03l45.08,0Z"
      />

      {/* cap + tassel */}
      <path
        fill={primary}
        stroke={primary}
        strokeWidth="14"
        strokeLinejoin="round"
        d="M134,74l129,-46l137,44l-137,40l-129,-38Z"
      />
      <path stroke={accent} strokeWidth="10" strokeLinecap="round" d="M400,74l0,30" />
      <circle cx="400" cy="112" r="12" fill={accent} />

      {/* smile */}
      <path
        fill="none"
        stroke={primary}
        strokeWidth="18"
        strokeLinecap="round"
        d="M212,260c14.918,12.669 30.265,18.912 45.989,19.498c18.192,0.678 36.889,-6.218 56.011,-19.498"
      />
    </svg>
  )
}
