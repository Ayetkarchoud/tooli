// Public home page for visitors: what tooli is, and how to join.
// No personal content here; everything personal lives in /dashboard.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fadeUp, liftOnHover, stagger, useEntrance, useInView } from '@/lib/motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Logo from '../components/Logo.jsx'
import Mascot from '../components/Mascot.jsx'
import ThemeSwitcher from '../components/ThemeSwitcher.jsx'
import { SERVICES, servicePath } from '../data/services.js'

const MotionCard = motion.create(Card)

const STEPS = [
  { title: 'Create your free account', text: 'Sign up in under a minute. All you need is an email address.' },
  { title: 'Choose a service', text: 'Ask the AI tutor, follow a partner course or book a VIP professor.' },
  { title: 'Start learning', text: 'Learn at your own pace and watch your progress grow week after week.' },
]

// Same width + side padding for every landing block
const WRAP = 'mx-auto w-full max-w-[1160px] px-6 max-md:px-4'

function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the mobile menu with Escape
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const close = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-[color-mix(in_srgb,var(--color-bg)_88%,transparent)] backdrop-blur-[10px]">
      <div className="mx-auto flex max-w-[1160px] items-center gap-4 px-6 py-3 max-md:flex-wrap max-md:px-4">
        <Link to="/" className="inline-flex rounded-md" aria-label="tooli home">
          <Logo height={34} />
        </Link>

        <Button
          type="button"
          variant="tile"
          size="icon-lg"
          className="ml-auto bg-card md:hidden"
          aria-expanded={menuOpen}
          aria-controls="landing-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </Button>

        <div
          id="landing-menu"
          className={cn(
            'ml-auto flex items-center gap-5',
            'max-md:basis-full max-md:flex-col max-md:items-stretch max-md:gap-4 max-md:pt-2 max-md:pb-3',
            !menuOpen && 'max-md:hidden',
          )}
        >
          <ThemeSwitcher className="max-md:justify-center" />
          <div className="flex items-center gap-1.5 max-md:grid max-md:grid-cols-2 max-md:gap-2.5">
            <Button asChild variant="ghost" className="max-md:inset-ring-[1.5px] max-md:inset-ring-border">
              <Link to="/login" onClick={close}>
                Log in
              </Link>
            </Button>
            <Button asChild>
              <Link to="/signup" onClick={close}>
                Sign up
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

function ServiceTeaser({ service }) {
  const { slug, title, pitch, icon: Icon, soon } = service

  return (
    <MotionCard
      variants={fadeUp}
      {...liftOnHover}
      className={cn('h-full gap-2.5 p-[22px] text-foreground', soon && 'border-dashed')}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className={cn('grid size-12 place-items-center rounded-xl bg-accent text-primary-text', soon && 'opacity-70')}>
          <Icon size={24} aria-hidden="true" />
        </span>
        {soon && <Badge variant="highlight">Soon</Badge>}
      </div>
      <h3 className="text-[17px] font-bold">{title}</h3>
      <p className="flex-1 text-sm leading-[1.6] text-muted-foreground">{pitch}</p>
      {!soon && (
        <Button
          asChild
          variant="ghost"
          className="mt-1.5 h-auto self-start bg-accent px-3.5 py-2 hover:bg-[color-mix(in_srgb,var(--color-primary)_28%,transparent)]"
        >
          <Link to={`/login?next=${encodeURIComponent(servicePath(slug))}`} aria-label={`Log in to start: ${title}`}>
            Log in to start <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      )}
    </MotionCard>
  )
}

function SectionHead({ id, title, sub }) {
  return (
    <>
      <h2 id={id} className="text-[clamp(24px,3.4vw,32px)] font-extrabold tracking-[-0.01em]">
        {title}
      </h2>
      <p className="mt-1.5 mb-7 text-muted-foreground">{sub}</p>
    </>
  )
}

export default function Landing() {
  const entrance = useEntrance()
  const inView = useInView()

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <LandingHeader />

      <main className="flex-1">
        <motion.section
          className={cn(
            WRAP,
            'grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-10 pt-16 pb-[72px]',
            'max-md:grid-cols-[minmax(0,1fr)] max-md:gap-2 max-md:pt-7 max-md:pb-10 max-md:text-center',
          )}
          variants={stagger(0.12)}
          {...entrance}
        >
          <motion.div variants={fadeUp}>
            <Badge asChild variant="highlight" className="mb-[18px] inline-block px-3.5 py-[5px] text-[13px]">
              <p>Your study buddy, always on</p>
            </Badge>
            <h1 className="text-[clamp(34px,5.6vw,58px)] leading-[1.08] font-extrabold tracking-[-0.02em]">
              Learn smarter with{' '}
              <span className="px-1 text-primary-text [background:linear-gradient(transparent_70%,var(--color-accent-soft)_70%)]">
                tooli
              </span>
            </h1>
            <p className="mt-[18px] max-w-[520px] text-[17px] leading-[1.65] text-muted-foreground max-md:mx-auto max-md:text-base">
              An AI tutor, courses from our partners and live classes with top professors, all in one friendly place.
            </p>
            <div className="mt-[30px] flex flex-wrap gap-3 max-md:justify-center">
              <Button asChild size="lg" className="max-xs:flex-[1_1_100%]">
                <Link to="/signup">Sign up for free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="max-xs:flex-[1_1_100%]">
                <Link to="/login">Log in</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="relative grid min-h-[300px] place-items-center max-md:-order-1 max-md:min-h-[220px]">
            <span
              className="absolute aspect-square w-[min(340px,100%)] rounded-full [background:radial-gradient(circle_at_30%_30%,var(--color-accent-soft),transparent_60%),var(--color-primary-soft)] max-md:w-[220px]"
              aria-hidden="true"
            />
            <Mascot pose="waving" size={240} title="tooli mascot waving hello" className="relative max-md:h-auto max-md:w-[170px]" />
          </motion.div>
        </motion.section>

        <section className={cn(WRAP, 'pt-10 pb-14')} aria-labelledby="services-title">
          <SectionHead id="services-title" title="Our services" sub="Everything you need to move forward, whatever your level." />
          <motion.div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-xs:grid-cols-1" variants={stagger(0.1)} {...inView}>
            {SERVICES.map((s) => (
              <ServiceTeaser key={s.title} service={s} />
            ))}
          </motion.div>
        </section>

        <section className={cn(WRAP, 'pt-10 pb-14')} aria-labelledby="how-title">
          <SectionHead id="how-title" title="How it works" sub="Three steps and you are ready." />
          <motion.ol className="grid grid-cols-3 gap-4 max-md:grid-cols-1" variants={stagger(0.12)} {...inView}>
            {STEPS.map((step, i) => (
              <motion.li
                key={step.title}
                variants={fadeUp}
                {...liftOnHover}
                className="relative rounded-2xl border border-border bg-card px-[22px] py-6"
              >
                <span
                  className="mb-4 grid size-10 place-items-center rounded-full bg-primary text-[17px] font-extrabold text-primary-foreground"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <h3 className="mb-1.5 text-[17px] font-bold">{step.title}</h3>
                <p className="text-sm leading-[1.6] text-muted-foreground">{step.text}</p>
              </motion.li>
            ))}
          </motion.ol>
        </section>

        <section className={WRAP} aria-labelledby="cta-title">
          <motion.div
            variants={fadeUp}
            {...inView}
            className="mb-16 flex items-center gap-7 rounded-3xl border border-border px-9 py-7 [background:radial-gradient(circle_at_90%_10%,var(--color-accent-soft),transparent_45%),var(--color-primary-soft)] max-md:mb-10 max-md:flex-col max-md:gap-4 max-md:px-5 max-md:text-center"
          >
            <Mascot pose="celebrating" size={150} title="tooli mascot celebrating" className="shrink-0" />
            <div className="flex-1">
              <h2 id="cta-title" className="text-[clamp(24px,3.2vw,30px)] font-extrabold">
                Ready to start?
              </h2>
              <p className="mt-1.5 text-muted-foreground">Join tooli today. It is free, and your first question is only a click away.</p>
            </div>
            <Button asChild size="lg">
              <Link to="/signup">Sign up for free</Link>
            </Button>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className={cn(WRAP, 'flex flex-wrap items-center gap-x-7 gap-y-4 py-[22px] max-md:flex-col max-md:text-center')}>
          <Logo height={26} />
          <nav className="flex gap-5" aria-label="Footer">
            {/* TODO: real pages */}
            {['About', 'Contact', 'Privacy'].map((label) => (
              <a key={label} href={`#${label.toLowerCase()}`} className="text-sm text-muted-foreground no-underline hover:text-foreground">
                {label}
              </a>
            ))}
          </nav>
          <p className="ml-auto text-[13px] text-muted-foreground max-md:ml-0">© {new Date().getFullYear()} tooli</p>
        </div>
      </footer>
    </div>
  )
}
