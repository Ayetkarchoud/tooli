// Mascot pose data, used by Mascot.jsx.
// To add a pose: add an entry to POSES (arms, eyes, mouth, extras).
// Colours only through the --mascot-* tokens in src/styles/tokens.css.

export const v = (name) => `var(--mascot-${name})`

const ARM_DOWN_LEFT = { d: 'M44,132 Q28,150 32,168', hand: [32, 170] }
// Right arm down (no pose uses it yet): { d: 'M156,132 Q172,150 168,168', hand: [168, 170] }

const LINE_MOUTH = { fill: 'none', stroke: v('mouth'), strokeWidth: 4.5, strokeLinecap: 'round' }

// arms: drawn behind the body unless `front`; `wave` marks the arm that rocks.
// eyes: { ring: [[dx, dy] left, [dx, dy] right] } or { path: 'd' }.
// lift / capLift: move the body / cap up (negative = up).
export const POSES = {
  waving: {
    arms: [ARM_DOWN_LEFT, { d: 'M156,126 Q182,112 182,86', hand: [182, 82], wave: true }],
    eyes: { ring: [[3, -3], [3, -3]] },
    mouth: <path d="M89,147 Q100,155 111,147" {...LINE_MOUTH} />,
  },
  thinking: {
    arms: [ARM_DOWN_LEFT, { d: 'M156,136 Q160,168 124,164', hand: [120, 162], front: true }],
    eyes: { ring: [[-4, -4], [-4, -4]] },
    mouth: <path d="M90,150 L104,147" {...LINE_MOUTH} />,
    extras: (
      <g fill={v('note')} opacity=".55">
        <circle cx="164" cy="40" r="5" />
        <circle cx="178" cy="40" r="5" />
        <circle cx="192" cy="40" r="5" />
      </g>
    ),
  },
  explaining: {
    arms: [ARM_DOWN_LEFT, { d: 'M156,132 Q184,138 188,118', hand: [188, 114] }],
    eyes: { ring: [[2, -1], [2, -1]] },
    mouth: (
      <>
        <ellipse cx="100" cy="150" rx="9" ry="7" fill={v('ink')} />
        <ellipse cx="100" cy="153" rx="5" ry="3" fill={v('blush')} opacity=".8" />
      </>
    ),
  },
  celebrating: {
    arms: [
      { d: 'M44,124 Q20,106 20,80', hand: [20, 76] },
      { d: 'M156,124 Q180,106 180,80', hand: [180, 76] },
    ],
    eyes: { path: 'M68,120 Q80,106 92,120 M108,120 Q120,106 132,120' },
    mouth: <path d="M86,142 Q100,160 114,142 Z" fill={v('ink')} />,
    lift: -6,
    capLift: -10,
    extras: (
      <g className="mascot-confetti">
        <rect x="36" y="28" width="9" height="4" rx="1" fill={v('tassel')} transform="rotate(-25 40 30)" />
        <rect x="150" y="16" width="9" height="4" rx="1" fill={v('blush')} transform="rotate(35 154 18)" />
        <rect x="170" y="48" width="8" height="4" rx="1" fill={v('sweat')} transform="rotate(-40 174 50)" />
        <rect x="94" y="2" width="8" height="4" rx="1" fill="var(--brand-accent)" transform="rotate(15 98 4)" />
        <circle cx="68" cy="12" r="3" fill={v('sweat')} />
        <circle cx="128" cy="8" r="3" fill="var(--brand-primary)" />
        <circle cx="24" cy="52" r="3" fill={v('blush')} />
        <circle cx="186" cy="30" r="2.5" fill={v('tassel')} />
      </g>
    ),
  },
  sleepy: {
    arms: [
      { d: 'M44,134 Q34,156 40,172', hand: [42, 174] },
      { d: 'M156,134 Q166,156 160,172', hand: [158, 174] },
    ],
    eyes: { path: 'M68,120 Q80,128 92,120 M108,120 Q120,128 132,120' },
    mouth: <ellipse cx="100" cy="149" rx="4" ry="3" fill={v('ink')} />,
    extras: (
      <g className="mascot-zz" fill={v('note')} opacity=".6" fontWeight="700" fontFamily="Poppins, system-ui, sans-serif">
        <text x="158" y="44" fontSize="20">z</text>
        <text x="176" y="24" fontSize="15">z</text>
      </g>
    ),
  },
  oops: {
    arms: [ARM_DOWN_LEFT, { d: 'M156,124 Q182,104 164,86', hand: [160, 84] }],
    eyes: { ring: [[0, 4], [-3, -2]] },
    mouth: <path d="M88,150 Q94,144 100,150 Q106,156 112,150" {...LINE_MOUTH} />,
    extras: <path d="M30,96 Q24,106 30,110 Q36,106 30,96 Z" fill={v('sweat')} />,
  },
}

export const MASCOT_POSES = Object.keys(POSES)
