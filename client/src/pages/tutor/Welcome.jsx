// Empty new chat: the mascot says hi and suggests questions by subject.

import { motion } from 'motion/react'
import { Atom, Calculator, Code2, GraduationCap, Languages, Leaf } from 'lucide-react'
import { fadeUp, liftOnHover, stagger, useEntrance } from '@/lib/motion'
import Mascot from '../../components/Mascot.jsx'

const SUGGESTIONS = [
  { subject: 'Maths', icon: Calculator, question: 'How do I solve 2x + 5 = 13, step by step?' },
  { subject: 'Physics', icon: Atom, question: 'What does Newton’s second law really mean?' },
  { subject: 'Biology', icon: Leaf, question: 'Explain photosynthesis like I’m 12.' },
  { subject: 'Languages', icon: Languages, question: 'How can I speak English with more confidence?' },
  { subject: 'Coding', icon: Code2, question: 'How does a loop work in Python?' },
  { subject: 'Exam prep', icon: GraduationCap, question: 'Make me a revision plan for the bac.' },
]

export default function Welcome({ firstName, onAsk, disabled }) {
  const entrance = useEntrance()

  return (
    <motion.div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-8 text-center" variants={stagger(0.06)} {...entrance}>
      <motion.div variants={fadeUp} className="relative grid place-items-center">
        <span
          className="absolute size-40 rounded-full [background:radial-gradient(circle_at_30%_30%,var(--color-accent-soft),transparent_60%),var(--color-primary-soft)]"
          aria-hidden="true"
        />
        <Mascot pose="waving" size={132} title="" aria-hidden="true" className="relative" />
      </motion.div>

      <motion.p variants={fadeUp} className="mt-5 font-semibold text-primary-text">
        Hi {firstName}! I’m your tutor.
      </motion.p>
      <motion.h2 variants={fadeUp} className="mt-1 text-[clamp(24px,4vw,34px)] leading-tight font-extrabold tracking-[-0.01em]">
        What do you want to learn today?
      </motion.h2>
      <motion.p variants={fadeUp} className="mt-2 max-w-md text-muted-foreground">
        Ask me anything. I explain step by step, and you can ask for a simpler version or an example anytime.
      </motion.p>

      <motion.ul variants={stagger(0.05)} className="mt-8 grid w-full grid-cols-2 gap-3 text-left md:grid-cols-3" aria-label="Suggested questions">
        {SUGGESTIONS.map(({ subject, icon: Icon, question }) => (
          <motion.li key={subject} variants={fadeUp}>
            <motion.button
              type="button"
              disabled={disabled}
              onClick={() => onAsk(question)}
              className="group flex h-full w-full flex-col gap-2.5 rounded-2xl border border-border bg-card p-4 text-left transition-[border-color,box-shadow] hover:border-primary hover:shadow-lift disabled:opacity-60"
              {...liftOnHover}
            >
              <span className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-lg bg-accent text-primary-text">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="text-sm font-bold">{subject}</span>
              </span>
              <span className="text-sm leading-snug text-muted-foreground group-hover:text-foreground">{question}</span>
            </motion.button>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  )
}
