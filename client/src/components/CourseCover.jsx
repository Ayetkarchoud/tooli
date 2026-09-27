// Course cover drawn from tokens (no images): the platform's palette colour, soft shapes
// and the subject's icon. `cover` = palette name from the course's platform (blue, violet…).

import { cn } from '@/lib/utils'
import { SubjectIcon } from '@/lib/subjects'

export default function CourseCover({ cover, subject, size = 'md', className }) {
  const base = `var(--palette-${cover})`
  // Lighter at the top-left, the full colour at the bottom-right; the icon is a deep shade of the same hue
  const style = {
    background: `radial-gradient(circle at 85% 15%, color-mix(in srgb, ${base} 55%, var(--brand-white)) 0 22%, transparent 23%),
      radial-gradient(circle at 8% 110%, color-mix(in srgb, ${base} 70%, var(--brand-ink)) 0 30%, transparent 31%),
      linear-gradient(135deg, color-mix(in srgb, ${base} 70%, var(--brand-white)), ${base})`,
    color: `color-mix(in srgb, ${base} 40%, var(--brand-ink))`,
  }

  return (
    <div className={cn('relative grid place-items-center overflow-hidden', className)} style={style} aria-hidden="true">
      <SubjectIcon subject={subject} className={cn('opacity-80', size === 'lg' ? 'size-20' : size === 'sm' ? 'size-8' : 'size-12')} strokeWidth={1.75} />
    </div>
  )
}
