// Landing hero: a tiny live preview of the AI tutor, drawn with our own components.
// A question appears, the mascot thinks, the step-by-step answer reveals, then the action chips.
// It replays every few seconds; reduced-motion users see the finished exchange, still.
// Decorative: the real content is the headline next to it, so it's hidden from screen readers.

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Lightbulb, Sparkles } from 'lucide-react'
import Mascot from '../../components/Mascot.jsx'

const STEPS = ['Remove the 5 from both sides: 2x = 8', 'Divide both sides by 2: x = 4', 'Check: 2 × 4 + 5 = 13 ✓']
// step: 0 nothing · 1 question · 2 thinking · 3 answer · 4 chips
const TIMELINE = [400, 1300, 2700, 4300]
const LOOP_MS = 9500

const pop = { initial: { opacity: 0, y: 10, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0 } }

export default function TutorPreview() {
  const reduce = useReducedMotion()
  const [step, setStep] = useState(reduce ? 4 : 0)
  const shown = reduce ? 4 : step

  useEffect(() => {
    if (reduce) return
    let timers = []
    const play = () => {
      setStep(0)
      timers = TIMELINE.map((t, i) => setTimeout(() => setStep(i + 1), t))
    }
    play()
    const loop = setInterval(play, LOOP_MS)
    return () => {
      clearInterval(loop)
      timers.forEach(clearTimeout)
    }
  }, [reduce])

  return (
    <div className="relative mx-auto w-full max-w-[400px]" aria-hidden="true">
      {/* soft glow behind the card */}
      <span className="absolute -inset-6 rounded-[40px] [background:radial-gradient(circle_at_30%_20%,var(--color-accent-soft),transparent_55%),radial-gradient(circle_at_80%_90%,var(--color-primary-soft),transparent_60%)]" />

      <div className="relative rounded-3xl border border-border bg-card p-4 shadow-[0_30px_60px_-30px_color-mix(in_srgb,var(--color-text)_45%,transparent)]">
        <div className="mb-3 flex items-center gap-2.5 border-b border-border pb-3">
          <span className="grid size-9 place-items-center rounded-full bg-accent">
            <Mascot pose="explaining" size={26} title="" animated={false} />
          </span>
          <span className="flex-1 text-left">
            <span className="block text-sm font-bold">tooli tutor</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-highlight" /> Ready to help, day and night
            </span>
          </span>
        </div>

        <div className="flex min-h-[262px] flex-col gap-3 text-left text-sm">
          <AnimatePresence>
            {shown >= 1 && (
              <motion.p
                key="q"
                {...(reduce ? {} : pop)}
                className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-primary-foreground"
              >
                How do I solve 2x + 5 = 13?
              </motion.p>
            )}

            {shown === 2 && (
              <motion.div key="thinking" {...pop} className="flex items-center gap-2">
                <Mascot pose="thinking" size={30} title="" />
                <span className="flex gap-1 rounded-2xl rounded-tl-md border border-border bg-background px-3 py-2.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="size-1.5 rounded-full bg-primary"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </span>
              </motion.div>
            )}

            {shown >= 3 && (
              <motion.div
                key="a"
                {...(reduce ? {} : pop)}
                className="max-w-[92%] rounded-2xl rounded-tl-md border border-border bg-background px-3.5 py-2.5"
              >
                <p className="mb-1.5 font-semibold">Let’s solve it step by step:</p>
                <ol className="list-decimal space-y-1 pl-5 marker:font-semibold marker:text-primary-text">
                  {STEPS.map((s, i) => (
                    <motion.li
                      key={s}
                      initial={reduce ? false : { opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: reduce ? 0 : 0.25 + i * 0.3 }}
                    >
                      {s}
                    </motion.li>
                  ))}
                </ol>
              </motion.div>
            )}

            {shown >= 4 && (
              <motion.div key="chips" {...(reduce ? {} : pop)} className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold">
                  <Sparkles size={12} /> Explain simpler
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold">
                  <Lightbulb size={12} /> Give me an example
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* the mascot peeks over the corner and waves */}
      <Mascot pose="waving" size={104} title="" className="absolute -right-6 -bottom-10 max-md:-right-2 max-md:w-[84px] max-md:h-auto" />
    </div>
  )
}
