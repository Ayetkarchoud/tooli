// VIP: hero, plans (TND / month) with the highlighted one standing out, "payment coming soon" dialog,
// the student's current plan if any, and a short FAQ.

import { useState } from 'react'
import { motion } from 'motion/react'
import { BellRing, Check, Crown } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { formatTND } from '@/lib/money'
import { fadeUp, hoverLift, stagger, useEntrance } from '@/lib/motion'
import { formatDate } from '@/lib/time'
import { usePageTitle } from '@/lib/usePageTitle'
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

// Questions and answers: vip.faq.<key>.q / .a
const FAQ = ['cancel', 'pay', 'professor', 'refund', 'parents']

function PlanCard({ plan, isCurrent, onChoose }) {
  const { t } = useTranslation()
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
          className="absolute start-6 -top-3 h-auto px-3 py-1 text-xs font-bold shadow-sm"
        >
          {isCurrent ? t('vip.yourPlan') : t('vip.popular')}
        </Badge>
      )}

      <div>
        <h3 className="text-xl font-bold">{plan.name}</h3>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-4xl font-extrabold tracking-tight whitespace-nowrap">{formatTND(plan.pricePerMonth)}</span>
          <span className="text-muted-foreground">{t('vip.perMonth')}</span>
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
          <Crown aria-hidden="true" /> {t('vip.currentPlan')}
        </Button>
      ) : (
        <Button size="lg" variant={featured ? 'default' : 'outline'} className="w-full" onClick={() => onChoose(plan)}>
          {t('vip.choose', { plan: plan.name })}
        </Button>
      )}
    </motion.li>
  )
}

export default function Vip() {
  const { t } = useTranslation()
  usePageTitle(t('vip.docTitle'))
  const plans = useAsync(getVipPlans, [])
  const status = useAsync(getVipStatus, [])
  const [chosen, setChosen] = useState(null)
  const [joining, setJoining] = useState(false)

  const notifyMe = async () => {
    setJoining(true)
    try {
      await joinVipWaitlist(chosen.id)
      toast.success(t('vip.notified'), { description: t('vip.notifiedText', { plan: chosen.name }) })
      setChosen(null)
    } catch {
      toast.error(t('errors.generic'), { description: t('tutor.sendErrorText') })
    } finally {
      setJoining(false)
    }
  }
  const entrance = useEntrance()

  const currentPlanId = status.data?.active ? status.data.planId : null

  return (
    <Page>
      <motion.section
        className="mb-10 flex flex-col items-center gap-6 rounded-3xl border border-border px-6 py-10 text-center [background:radial-gradient(circle_at_85%_10%,var(--color-accent-soft),transparent_45%),var(--color-primary-soft)] md:flex-row md:text-start"
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
          <h1 className="text-[clamp(28px,4.4vw,42px)] leading-tight font-extrabold tracking-[-0.02em]">{t('vip.title')}</h1>
          <p className="mt-2 max-w-xl text-lg text-muted-foreground">
            {t('vip.subtitle')}
          </p>
          {currentPlanId && plans.data && (
            <p className="mt-3 font-semibold" role="status">
              {status.data.renewsOn
                ? t('vip.onPlanUntil', {
                    plan: plans.data.find((p) => p.id === currentPlanId)?.name,
                    date: formatDate(status.data.renewsOn),
                  })
                : t('vip.onPlan', { plan: plans.data.find((p) => p.id === currentPlanId)?.name })}
            </p>
          )}
        </motion.div>
      </motion.section>

      <section aria-labelledby="plans-title" className="mb-14">
        <h2 id="plans-title" className="mb-6 text-center text-2xl font-extrabold">
          {t('vip.pick')}
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
        <p className="mt-4 text-center text-sm text-muted-foreground">{t('vip.pricesNote')}</p>
      </section>

      <section aria-labelledby="faq-title" className="mx-auto max-w-3xl">
        <h2 id="faq-title" className="mb-4 text-2xl font-extrabold">
          {t('vip.faqTitle')}
        </h2>
        <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-5">
          {FAQ.map((key) => (
            <AccordionItem key={key} value={`faq-${key}`}>
              <AccordionTrigger className="py-4 text-start text-base font-semibold hover:no-underline">
                {t(`vip.faq.${key}.q`)}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-[15px] leading-relaxed text-muted-foreground">
                {t(`vip.faq.${key}.a`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <Dialog open={Boolean(chosen)} onOpenChange={(open) => !open && setChosen(null)}>
        <DialogContent className="gap-5 p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{t('vip.dialog.title')}</DialogTitle>
            <DialogDescription className="text-[15px] leading-relaxed">
              {chosen && t('vip.dialog.text', { plan: chosen.name, price: formatTND(chosen.pricePerMonth) })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="-mx-6 -mb-6 gap-2 rounded-b-2xl p-4 px-6">
            <DialogClose asChild>
              <Button variant="outline">{t('common.close')}</Button>
            </DialogClose>
            <Button onClick={notifyMe} disabled={joining}>
              <BellRing aria-hidden="true" /> {t('vip.dialog.notify')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  )
}
