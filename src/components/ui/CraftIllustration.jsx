/**
 * Brand illustrations used until real product photos are added.
 * To use a photo, set `product.image` or pass `src` to ProductImage.
 */
function Teddy({ colors }) {
  const [body, blush, ink] = colors
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <circle cx="62" cy="68" r="28" fill={body} />
      <circle cx="138" cy="68" r="28" fill={body} />
      <circle cx="62" cy="68" r="14" fill={blush} />
      <circle cx="138" cy="68" r="14" fill={blush} />
      <ellipse cx="100" cy="118" rx="58" ry="52" fill={body} />
      <ellipse cx="100" cy="108" rx="42" ry="38" fill="#fff8f2" />
      <circle cx="82" cy="100" r="6" fill={ink} />
      <circle cx="118" cy="100" r="6" fill={ink} />
      <ellipse cx="100" cy="116" rx="8" ry="6" fill={blush} />
      <path d="M90 128c6 8 14 8 20 0" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function Bunny({ colors }) {
  const [body, blush, ink] = colors
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <ellipse cx="72" cy="52" rx="16" ry="40" fill={body} />
      <ellipse cx="128" cy="52" rx="16" ry="40" fill={body} />
      <ellipse cx="72" cy="56" rx="8" ry="26" fill={blush} />
      <ellipse cx="128" cy="56" rx="8" ry="26" fill={blush} />
      <ellipse cx="100" cy="120" rx="52" ry="50" fill={body} />
      <circle cx="82" cy="112" r="5" fill={ink} />
      <circle cx="118" cy="112" r="5" fill={ink} />
      <ellipse cx="100" cy="126" rx="7" ry="5" fill={blush} />
      <path d="M88 140c8 10 16 10 24 0" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function Flower({ colors }) {
  const [petal, center] = colors
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse
          key={deg}
          cx="100"
          cy="62"
          rx="22"
          ry="34"
          fill={petal}
          transform={`rotate(${deg} 100 100)`}
        />
      ))}
      <circle cx="100" cy="100" r="22" fill={center || '#F7EFE6'} />
    </svg>
  )
}

function Bouquet({ colors }) {
  const [a, b, c] = colors
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <path d="M100 178c-8-36-28-70-8-110" fill="none" stroke="#7D9278" strokeWidth="6" />
      <path d="M100 178c8-40 24-68 4-108" fill="none" stroke="#7D9278" strokeWidth="6" />
      <circle cx="86" cy="70" r="22" fill={a} />
      <circle cx="116" cy="62" r="20" fill={b} />
      <circle cx="104" cy="88" r="18" fill={c} />
      <circle cx="86" cy="70" r="8" fill="#F7EFE6" />
      <circle cx="116" cy="62" r="7" fill="#F7EFE6" />
    </svg>
  )
}

function Keychain({ colors }) {
  const [a, b] = colors
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <circle cx="100" cy="48" r="16" fill="none" stroke="#8a7268" strokeWidth="6" />
      <rect x="96" y="62" width="8" height="18" rx="3" fill="#8a7268" />
      <circle cx="100" cy="120" r="42" fill={a} />
      <text
        x="100"
        y="134"
        textAnchor="middle"
        fontFamily="Fraunces, serif"
        fontSize="48"
        fill={b || '#5A3D4A'}
      >
        J
      </text>
    </svg>
  )
}

function Bandana({ colors }) {
  const [a, b] = colors
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <path d="M30 90c40-28 100-28 140 0-22 28-48 52-70 70-22-18-48-42-70-70Z" fill={a} />
      <circle cx="70" cy="88" r="12" fill={b} />
      <circle cx="100" cy="78" r="12" fill="#F7EFE6" />
      <circle cx="130" cy="88" r="12" fill={b} />
    </svg>
  )
}

function Gift({ colors }) {
  const [a, b] = colors
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <rect x="48" y="86" width="104" height="78" rx="12" fill={a} />
      <rect x="92" y="86" width="16" height="78" fill={b} />
      <rect x="48" y="112" width="104" height="16" fill={b} />
      <ellipse cx="84" cy="78" rx="22" ry="16" fill={b} />
      <ellipse cx="116" cy="78" rx="22" ry="16" fill={b} />
    </svg>
  )
}

function Heart({ colors }) {
  const [a] = colors
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <path
        d="M100 162s-52-32-52-72c0-22 18-36 36-36 12 0 16 8 16 8s4-8 16-8c18 0 36 14 36 36 0 40-52 72-52 72Z"
        fill={a}
      />
    </svg>
  )
}

function Pins({ colors }) {
  const [a, b, c] = colors
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <circle cx="70" cy="88" r="22" fill={a} />
      <circle cx="100" cy="70" r="22" fill={b} />
      <circle cx="130" cy="90" r="22" fill={c} />
      <circle cx="70" cy="88" r="8" fill="#F7EFE6" />
      <circle cx="100" cy="70" r="8" fill="#F7EFE6" />
      <circle cx="130" cy="90" r="8" fill="#F7EFE6" />
    </svg>
  )
}

function Yarn({ colors }) {
  const [a, b] = colors
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <circle cx="100" cy="108" r="52" fill={a} />
      <path
        d="M60 90c30 10 50 10 80 0M58 112c32 12 52 12 84 0M70 134c24 8 36 8 60 0"
        fill="none"
        stroke={b || '#5A3D4A'}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path d="M148 80c18-22 28-38 22-58" fill="none" stroke={a} strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

const visuals = {
  teddy: Teddy,
  bunny: Bunny,
  flower: Flower,
  bouquet: Bouquet,
  keychain: Keychain,
  bandana: Bandana,
  gift: Gift,
  heart: Heart,
  pins: Pins,
  yarn: Yarn,
}

const bgMap = {
  teddy: 'from-peach/70 to-blush/80',
  bunny: 'from-ivory to-lavender/70',
  flower: 'from-lavender/80 to-blush/70',
  bouquet: 'from-peach/80 to-ivory',
  keychain: 'from-sage/60 to-blush/70',
  bandana: 'from-sage/50 to-ivory',
  gift: 'from-lavender/70 to-peach/60',
  heart: 'from-petal/80 to-blush',
  pins: 'from-peach/70 to-lavender/60',
  yarn: 'from-lavender/70 to-sage/50',
}

export default function CraftIllustration({ visual = 'yarn', palette, className = '' }) {
  const Graphic = visuals[visual] || Yarn
  const colors = palette || ['#E8B4B8', '#D9CDE8', '#5A3D4A']
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br ${bgMap[visual] || bgMap.yarn} ${className}`}>
      <div className="h-[78%] w-[78%]">
        <Graphic colors={colors} />
      </div>
    </div>
  )
}
