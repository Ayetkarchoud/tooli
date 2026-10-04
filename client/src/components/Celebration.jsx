// Inline "well done!" banner: the mascot celebrates, a small confetti burst, a message and a close button.
// Confetti and the pop-in are skipped for reduced-motion users. Announced to screen readers (role="status").
//   <Celebration title="Lesson done!" text="3 of 5 lessons" onClose={…} action={<Button…/>} />

import { motion, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Confetti from './Confetti.jsx'
import Mascot from './Mascot.jsx'

export default function Celebration({ title, text, action, onClose }) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      role="status"
      className="relative flex items-center gap-4 rounded-2xl border-2 border-highlight bg-card p-4 pr-12 [background:linear-gradient(120deg,var(--color-accent-soft),transparent_60%),var(--color-surface)]"
      initial={reduce ? false : { opacity: 0, scale: 0.96, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
    >
      <div className="relative grid shrink-0 place-items-center">
        <Confetti count={18} />
        <Mascot pose="celebrating" size={64} title="" aria-hidden="true" className="relative" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-extrabold">{title}</p>
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onClose && (
        <Button variant="ghost" size="icon-sm" className="absolute top-2 right-2" onClick={onClose} aria-label="Close">
          <X aria-hidden="true" />
        </Button>
      )}
    </motion.div>
  )
}
