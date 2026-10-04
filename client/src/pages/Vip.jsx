// VIP: hero, plans (TND / month) with the highlighted one standing out, "payment coming soon" dialog,
// the student's current plan if any, and a short FAQ.

import { useState } from 'react'
import { motion } from 'motion/react'
import { BellRing, Check, Crown } from 'lucide-react'
import { toast } from 'sonner'
import { formatTND } from '@/lib/money'
import { fadeUp, hoverLift, stagger, useEntrance } from '@/lib/motion'
import { useAsync } from '@/lib/useAsync'
import { cn } from '@/lib/utils'
import { getVipPlans, getVipStatus, joinVipWaitlist } from '@/services/vip'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Mascot from '../components/Mascot.jsx'
import { ErrorState } from '../components/MascotMessage.jsx'
import Page from '../components/Page.jsx'
import { CardGridSkeleton } from '../components/PageLoader.jsx'

const FAQ = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Plans are monthly with no commitment: cancel from your settings and you keep VIP until the end of the month you paid for.',
  },
  {
    q: 'How will I pay?',
    a: 'Online payment is coming soon, by bank card (Tunisian and international) and e-dinar. Until then, you pay VIP professors directly after each class.',
  },
  {
    q: 'What is a VIP professor?',
    a: 'An experienced teacher hand-picked by tooli for their results and reviews. You book private classes with them at times that suit you.',
  },
  {
    q: 'Can I get a refund?',
    a: 'If something goes wrong in your first 7 days, contact us and we refund the month, no questions asked. Unused private hours can be moved to the next month.',
  },
  {
    q: 'Are there plans for parents?',
    a: 'Yes: the Intensive plan sends a weekly progress report to a parent. Family plans for several children are on the way.',
  },
]

function PlanCard({ plan, isCurrent, onChoose }) {
  const featured = plan.highlighted && !isCurrent
  return (
    <motion.li
      variants={fadeUp}
      {...hoverLift}
      className={cn(
        'relative flex flex-col gap-5 rounded-3xl border bg-card p-6',
        featured ? 'border-2 border-primary shadow-lift' : 'border-border',
        isCurrent && 'border-2 border-highlight',
      )}
    >
      {(featured || isCurrent) && (
        <Badge
          variant={isCurrent ? 'highlight' : 'default'}
          className="absolute -top-3 left-6 h-auto px-3 py-1 text-xs font-bold shadow-sm"
        >
          {isCurrent ? 'Your plan' : 'Most popular'}
        </Badge>
      )}

      <div>
        <h3 className="text-xl font-bold">{plan.name}</h3>
        <p className="mt-2 flex items-baseline gap-1.5">
          <span className="text-4xl font-extrabold tracking-tight">{formatTND(plan.pricePerMonth)}</span>
          <span className="text-muted-foreground">/ month</span>
        </p>
      </div>

      <ul className="flex flex-1 flex-col gap-2.5 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2.5">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent text-primary-text" aria-hidden="true">
              <Check size={13} strokeWidth={3} />
            </span>
            {f}
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <Button variant="outline" size="lg" disabled className="w-full">
          <Crown aria-hidden="true" /> Your current plan
        </Button>
      ) : (
        <Button size="lg" variant={featured ? 'default' : 'outline'} className="w-full" onClick={() => onChoose(plan)}>
          Choose {plan.name}
        </Button>
      )}
    </motion.li>
  )
}

export default function Vip() {
  const plans = useAsync(getVipPlans, [])
  const status = useAsync(getVipStatus, [])
  const [chosen, setChosen] = useState(null)
  const [joining, setJoining] = useState(false)

  const notifyMe = async () => {
    setJoining(true)
    try {
      await joinVipWaitlist(chosen.id)
      toast.success('We’ll notify you', { description: `You’ll be the first to know when ${chosen.name} opens.` })
      setChosen(null)
    } catch {
      toast.error('That didn’t work', { description: 'Check your connection and try again.' })
    } finally {
      setJoining(false)
    }
  }
  const entrance = useEntrance()

  const currentPlanId = status.data?.active ? status.data.planId : null

  return (
    <Page>
      <motion.section
        className="mb-10 flex flex-col items-center gap-6 rounded-3xl border border-border px-6 py-10 text-center [background:radial-gradient(circle_at_85%_10%,var(--color-accent-soft),transparent_45%),var(--color-primary-soft)] md:flex-row md:text-left"
        variants={stagger(0.08)}
        {...entrance}
      >
        <motion.div variants={fadeUp} className="shrink-0">
          <Mascot pose="celebrating" size={150} title="" aria-hidden="true" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <Badge variant="highlight" className="mb-3 gap-1 text-xs">
            <Crown aria-hidden="true" /> tooli VIP
          </Badge>
          <h1 className="text-[clamp(28px,4.4vw,42px)] leading-tight font-extrabold tracking-[-0.02em]">Learn faster with tooli VIP</h1>
          <p className="mt-2 max-w-xl text-lg text-muted-foreground">
            Private classes with the best professors in Tunisia, a revision plan made for you, and a tutor that never sleeps.
          </p>
          {currentPlanId && plans.data && (
            <p className="mt-3 font-semibold" role="status">
              You’re on <span className="text-primary-text">{plans.data.find((p) => p.id === currentPlanId)?.name}</span>
              {status.data.renewsOn && <> until {new Date(`${status.data.renewsOn}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</>}.
            </p>
          )}
        </motion.div>
      </motion.section>

      <section aria-labelledby="plans-title" className="mb-14">
        <h2 id="plans-title" className="mb-6 text-center text-2xl font-extrabold">
          Pick your plan
        </h2>
        {plans.loading && !plans.data ? (
          <CardGridSkeleton count={3} className="h-[420px] rounded-3xl" />
        ) : plans.error ? (
          <ErrorState onRetry={plans.reload} />
        ) : (
          <motion.ul className="grid gap-6 pt-3 md:grid-cols-3" variants={stagger(0.08)} {...entrance}>
            {plans.data.map((plan) => (
              <PlanCard key={plan.id} plan={plan} isCurrent={plan.id === currentPlanId} onChoose={setChosen} />
            ))}
          </motion.ul>
        )}
        <p className="mt-4 text-center text-sm text-muted-foreground">Prices in Tunisian dinars, per month. Cancel anytime.</p>
      </section>

      <section aria-labelledby="faq-title" className="mx-auto max-w-3xl">
        <h2 id="faq-title" className="mb-4 text-2xl font-extrabold">
          Questions, answered
        </h2>
        <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-5">
          {FAQ.map((item, i) => (
            <AccordionItem key={item.q} value={`faq-${i}`}>
              <AccordionTrigger className="py-4 text-left text-base font-semibold hover:no-underline">{item.q}</AccordionTrigger>
              <AccordionContent className="pb-4 text-[15px] leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <Dialog open={Boolean(chosen)} onOpenChange={(open) => !open && setChosen(null)}>
        <DialogContent className="gap-5 p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Online payment is coming soon</DialogTitle>
            <DialogDescription className="text-[15px] leading-relaxed">
              We’re setting up secure payment by card and e-dinar for the {chosen?.name} plan ({chosen && formatTND(chosen.pricePerMonth)} / month).
              Leave us a sign and we’ll let you know the day it opens. Until then, you can already book VIP professors and pay them after class.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="-mx-6 -mb-6 gap-2 rounded-b-2xl p-4 px-6">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button onClick={notifyMe} disabled={joining}>
              <BellRing aria-hidden="true" /> Notify me
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  )
}
