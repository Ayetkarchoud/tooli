// Small public pages linked from the landing footer: About, Contact, Privacy.
// <Info page="about" /> (routes in App.jsx). Same frame as the login pages.

import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Mail, MapPin, MessagesSquare } from 'lucide-react'
import { fadeUp, stagger, useEntrance } from '@/lib/motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Logo from '../components/Logo.jsx'
import Mascot from '../components/Mascot.jsx'
import { PAGE_TITLE } from '../components/PageHeader.jsx'
import ThemeSwitcher from '../components/ThemeSwitcher.jsx'

const PAGES = {
  about: {
    pose: 'waving',
    title: 'About tooli',
    intro: 'tooli helps students in Tunisia learn with less stress and more confidence.',
    sections: [
      ['Why we built it', 'Good help shouldn’t depend on where you live or how late it is. tooli puts an AI tutor, the best partner courses and top professors in one friendly place.'],
      ['What you can do', 'Ask any question and get a step-by-step answer, follow partner courses with your progress saved, and book private classes with VIP professors.'],
      ['Who we are', 'A small team of students and teachers from Monastir who wish this existed when we were preparing the bac.'],
    ],
  },
  contact: {
    pose: 'explaining',
    title: 'Contact us',
    intro: 'A question, an idea or a problem? We read every message and answer within two working days.',
    sections: [],
  },
  privacy: {
    pose: 'thinking',
    title: 'Privacy',
    intro: 'Short and honest: what we keep, and why.',
    sections: [
      ['This is a demo', 'For now tooli runs without a server: your name, settings and progress are saved only in this browser. Clear your browser data and they’re gone.'],
      ['What we will store', 'Your account (name, email, a securely hashed password), your profile, progress, bookings and tutor chats, only to make tooli work for you.'],
      ['What we never do', 'We never sell your data and never show you ads based on it. You’ll be able to download or delete everything from your settings.'],
    ],
  },
}

export default function Info({ page }) {
  const info = PAGES[page]
  const entrance = useEntrance()

  return (
    <div className="flex min-h-screen flex-col [background:radial-gradient(circle_at_12%_0%,var(--color-primary-soft),transparent_42%),var(--color-bg)]">
      <div className="mx-auto flex w-full max-w-[880px] flex-wrap items-center justify-between gap-3 px-6 py-4 max-xs:px-4">
        <Link to="/" className="-ml-2.5 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-semibold text-foreground no-underline hover:bg-accent">
          <ArrowLeft size={16} aria-hidden="true" /> Back to home
        </Link>
        <ThemeSwitcher />
      </div>

      <motion.main className="mx-auto w-full max-w-[880px] flex-1 px-6 pb-16 max-xs:px-4" variants={stagger(0.08)} {...entrance}>
        <motion.div variants={fadeUp} className="mb-8 flex items-center gap-5">
          <Mascot pose={info.pose} size={88} title="" aria-hidden="true" className="shrink-0 max-xs:w-[64px] max-xs:h-auto" />
          <div>
            <Link to="/" aria-label="tooli home" className="mb-2 inline-flex rounded-md">
              <Logo height={26} />
            </Link>
            <h1 className={PAGE_TITLE}>{info.title}</h1>
            <p className="mt-1.5 text-muted-foreground">{info.intro}</p>
          </div>
        </motion.div>

        {page === 'contact' ? (
          <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
            <Card className="gap-2 p-6">
              <Mail className="text-primary-text" aria-hidden="true" />
              <h2 className="text-lg font-bold">Email</h2>
              <p className="text-muted-foreground">
                Write to <span className="font-semibold text-foreground">hello@tooli.example</span> (demo address).
              </p>
            </Card>
            <Card className="gap-2 p-6">
              <MapPin className="text-primary-text" aria-hidden="true" />
              <h2 className="text-lg font-bold">Where we are</h2>
              <p className="text-muted-foreground">Monastir, Tunisia. Working on tooli from the POLYTECH campus.</p>
            </Card>
            <Card className="gap-3 p-6 sm:col-span-2">
              <MessagesSquare className="text-primary-text" aria-hidden="true" />
              <h2 className="text-lg font-bold">Need help with your studies right now?</h2>
              <p className="text-muted-foreground">The AI tutor answers day and night, step by step.</p>
              <Button asChild className="self-start">
                <Link to="/signup">Try tooli for free</Link>
              </Button>
            </Card>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            {info.sections.map(([heading, text]) => (
              <motion.section key={heading} variants={fadeUp}>
                <Card className="gap-2 p-6">
                  <h2 className="text-lg font-bold">{heading}</h2>
                  <p className="leading-relaxed text-muted-foreground">{text}</p>
                </Card>
              </motion.section>
            ))}
          </div>
        )}
      </motion.main>
    </div>
  )
}
