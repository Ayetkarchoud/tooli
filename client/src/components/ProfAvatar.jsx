// Initials avatar with a soft coloured ring. The ring colour comes from the palette tokens,
// picked from the person's id so each professor always keeps the same colour.

import { getInitials } from '@/lib/people'
import { cn } from '@/lib/utils'

const RING_COLOURS = ['blue', 'violet', 'green', 'red', 'yellow']

function colourFor(id = '') {
  let sum = 0
  for (const ch of id) sum += ch.charCodeAt(0)
  return `var(--palette-${RING_COLOURS[sum % RING_COLOURS.length]})`
}

export default function ProfAvatar({ person, size = 56, className }) {
  const colour = colourFor(person.id)

  return (
    <span
      aria-hidden="true"
      className={cn('grid shrink-0 place-items-center rounded-full font-bold text-foreground', className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.32,
        background: `color-mix(in srgb, ${colour} 16%, var(--color-surface))`,
        boxShadow: `0 0 0 3px var(--color-surface), 0 0 0 ${Math.max(5, size / 11)}px color-mix(in srgb, ${colour} 55%, transparent)`,
      }}
    >
      {getInitials(person)}
    </span>
  )
}
