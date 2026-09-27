// A small one-shot confetti burst in the palette colours (Motion).
// Renders nothing for reduced-motion users. Place it inside a `relative` parent.

import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

const COLOURS = ['blue', 'yellow', 'green', 'red', 'violet'].map((c) => `var(--palette-${c})`)

function makePieces(count) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5
    const distance = 90 + Math.random() * 110
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 40, // a little upward bias
      rotate: Math.random() * 540 - 270,
      colour: COLOURS[i % COLOURS.length],
      round: i % 3 === 0,
      delay: Math.random() * 0.15,
    }
  })
}

export default function Confetti({ count = 28 }) {
  const reduce = useReducedMotion()
  const [pieces] = useState(() => makePieces(count))
  if (reduce) return null

  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center overflow-visible" aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className={p.round ? 'absolute size-2 rounded-full' : 'absolute h-1.5 w-3 rounded-[2px]'}
          style={{ background: p.colour }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
          animate={{ x: [0, p.x, p.x * 1.1], y: [0, p.y, p.y + 60], opacity: [1, 1, 0], rotate: [0, p.rotate / 2, p.rotate], scale: [0.6, 1, 1] }}
          transition={{ duration: 1.6, delay: p.delay, ease: 'easeOut', times: [0, 0.55, 1] }}
        />
      ))}
    </div>
  )
}
