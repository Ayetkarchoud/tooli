// tooli mascot: a 3D-style pebble with a graduation cap.
// Colours come only from the --mascot-* tokens in src/styles/tokens.css,
// so the body follows the active palette and dark mode automatically.
// Poses live in mascotPoses.jsx. Animations (float, blink, wave, bounce) use Motion
// and switch off for users who ask for reduced motion.

import { useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import { POSES, v } from './mascotPoses.jsx'
import { useTranslation } from 'react-i18next'

const loop = (duration, extra) => ({ duration, repeat: Infinity, ease: 'easeInOut', ...extra })
const BOUNCE_EASE = [0.3, 0, 0.4, 1]

// Keyframes for each moving part. Used only while `on` is true.
const MOVES = {
  float: { animate: { y: [0, -5, 0] }, transition: loop(3) },
  bounce: { animate: { y: [0, -10, 1, 0] }, transition: loop(1.2, { times: [0, 0.45, 0.7, 1], ease: BOUNCE_EASE }) },
  shadowFloat: { animate: { scaleX: [1, 0.86, 1] }, transition: loop(3) },
  shadowBounce: { animate: { scaleX: [1, 0.86, 1] }, transition: loop(1.2, { ease: BOUNCE_EASE }) },
  blink: { animate: { scaleY: [1, 1, 0.1, 1] }, transition: loop(4, { times: [0, 0.93, 0.955, 1] }) },
  // the raised arm rocks around its shoulder (156,126 in the viewBox)
  wave: {
    animate: { rotate: [0, -10, 0] },
    transition: loop(1.6),
    style: { transformBox: 'view-box', originX: '156px', originY: '126px' },
  },
  twinkle: { animate: { opacity: [1, 0.55, 1] }, transition: loop(1.2) },
  drift: { animate: { y: [0, -4, 0] }, transition: loop(3) },
}

// A <g> that plays MOVES[name] when `on`, and stays still otherwise
function Moving({ name, on, style, ...props }) {
  const move = on && name ? MOVES[name] : null
  return (
    <motion.g
      animate={move?.animate}
      transition={move?.transition}
      style={{ ...move?.style, ...style }}
      {...props}
    />
  )
}

const ARC_EYES = { fill: 'none', stroke: v('ink'), strokeWidth: 7, strokeLinecap: 'round' }

function RingEye({ cx, cy, dx, dy, gradient }) {
  return (
    <>
      <circle cx={cx} cy={cy} r="16" fill={gradient} stroke={v('ink')} strokeWidth="7" />
      <circle cx={cx + dx} cy={cy + dy} r="6.5" fill={v('ink')} />
      <circle cx={cx + dx + 2.5} cy={cy + dy - 2.5} r="2.2" fill={v('eye')} />
    </>
  )
}

function Arm({ arm, handFill, on }) {
  const [hx, hy] = arm.hand
  return (
    <Moving name={arm.wave && 'wave'} on={on}>
      <path d={arm.d} fill="none" stroke={v('body-dark')} strokeWidth="14" strokeLinecap="round" />
      <circle cx={hx} cy={hy} r="10" fill={handFill} stroke={v('body-dark')} strokeWidth="2" />
    </Moving>
  )
}

export default function Mascot({ pose = 'waving', size = 120, title, animated = true, className = '', ...props }) {
  const { t } = useTranslation()
  const p = POSES[pose] ?? POSES.waving
  // unique gradient ids per instance (useId output can contain ':' or '«»')
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const id = (name) => `mascot-${uid}-${name}`
  const url = (name) => `url(#${id(name)})`

  const backArms = p.arms.filter((a) => !a.front)
  const frontArms = p.arms.filter((a) => a.front)
  const reduce = useReducedMotion()
  const on = animated && !reduce
  const bounce = p.motion === 'bounce'

  return (
    <svg
      viewBox="0 0 200 226"
      width={size}
      height={(size * 226) / 200}
      role="img"
      aria-label={title ?? t('common.mascot')}
      className={cn('block overflow-visible', className)}
      {...props}
    >
      <defs>
        <linearGradient id={id('body')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={v('body-light')} />
          <stop offset="55%" stopColor={v('body')} />
          <stop offset="100%" stopColor={v('body-dark')} />
        </linearGradient>
        <linearGradient id={id('cap')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={v('cap')} />
          <stop offset="100%" stopColor={v('cap-edge')} />
        </linearGradient>
        <radialGradient id={id('shoe')} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor={v('cap')} />
          <stop offset="100%" stopColor={v('cap-dark')} />
        </radialGradient>
        <radialGradient id={id('tassel')} cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor={v('tassel')} />
          <stop offset="100%" stopColor={v('tassel-dark')} />
        </radialGradient>
        <radialGradient id={id('eye')} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor={v('eye')} />
          <stop offset="100%" stopColor={v('eye-shade')} />
        </radialGradient>
      </defs>

      {/* 1. ground shadow (stays on the ground) */}
      <motion.ellipse
        cx="100"
        cy="216"
        rx="50"
        ry="6"
        fill={v('shadow')}
        opacity=".14"
        {...(on && MOVES[bounce ? 'shadowBounce' : 'shadowFloat'])}
      />

      {/* 2. the moving mascot: pose lift outside, Motion animation inside */}
      <g transform={p.lift ? `translate(0 ${p.lift})` : undefined}>
        <Moving name={bounce ? 'bounce' : 'float'} on={on}>
          {/* legs + shoes */}
          <rect x="74" y="172" width="16" height="30" rx="8" fill={v('body-depth')} />
          <rect x="110" y="172" width="16" height="30" rx="8" fill={v('body-depth')} />
          <ellipse cx="80" cy="204" rx="15" ry="8" fill={url('shoe')} />
          <ellipse cx="120" cy="204" rx="15" ry="8" fill={url('shoe')} />

          {backArms.map((arm) => (
            <Arm key={arm.d} arm={arm} handFill={url('body')} on={on} />
          ))}

          {/* body */}
          <rect x="38" y="70" width="124" height="112" rx="46" fill={v('body-depth')} />
          <rect x="38" y="60" width="124" height="112" rx="46" fill={url('body')} />
          <ellipse cx="72" cy="80" rx="22" ry="8" fill={v('shine')} opacity=".3" transform="rotate(-18 72 80)" />

          {/* face */}
          <Moving name={p.eyes.ring && 'blink'} on={on}>
            {p.eyes.ring ? (
              <>
                <RingEye cx={80} cy={118} dx={p.eyes.ring[0][0]} dy={p.eyes.ring[0][1]} gradient={url('eye')} />
                <RingEye cx={120} cy={118} dx={p.eyes.ring[1][0]} dy={p.eyes.ring[1][1]} gradient={url('eye')} />
              </>
            ) : (
              <path d={p.eyes.path} {...ARC_EYES} />
            )}
          </Moving>
          {p.mouth}

          {frontArms.map((arm) => (
            <Arm key={arm.d} arm={arm} handFill={url('body')} on={on} />
          ))}

          {/* cap */}
          <g transform={`translate(0 ${p.capLift ?? 0}) rotate(-6 100 50)`}>
            <path d="M72,54 V64 Q100,76 128,64 V54 Z" fill={v('cap-dark')} />
            <path
              d="M52,48 L100,28 L148,48 L100,66 Z"
              fill={url('cap')}
              stroke={v('cap-edge')}
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <path d="M141,51 V74" stroke={v('tassel-dark')} strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="141" cy="79" r="7" fill={url('tassel')} />
          </g>
        </Moving>
      </g>

      {/* 3. extras, outside the moving group */}
      {p.extras && (
        <Moving name={p.extrasMotion} on={on}>
          {p.extras}
        </Moving>
      )}
    </svg>
  )
}
