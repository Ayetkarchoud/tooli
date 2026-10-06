// Small public pages linked from the landing footer: About, Contact, Privacy.
// <Info page="about" /> (routes in App.jsx). Same frame as the login pages.

import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Mail, MapPin, MessagesSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/lib/usePageTitle'
import { fadeUp, stagger, useEntrance } from '@/lib/motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Logo from '../components/Logo.jsx'
import Mascot from '../components/Mascot.jsx'
import { PAGE_TITLE } from '../components/PageHeader.jsx'
import LanguageSwitcher from '../components/LanguageSwitcher.jsx'
import ThemeSwitcher from '../components/ThemeSwitcher.jsx'

// Texts: info.<page>.heading / .intro / .sections.<key>.title + .text
const PAGES = {
  about: { pose: 'waving', sections: ['why', 'what', 'who'] },
  contact: { pose: 'explaining', sections: [] },
  privacy: { pose: 'thinking', sections: ['demo', 'store', 'never'] },
}

export default function Info({ page }) {
  const { t } = useTranslation()
  const info = PAGES[page]
  const entrance = useEntrance()
  usePageTitle(t(`info.${page}.title`))

  return (
    <div className="flex min-h-screen flex-col [background:radial-gradient(circle_at_12%_0%,var(--color-primary-soft),transparent_42%),var(--color-bg)]">
      <div className="mx-auto flex w-full max-w-[880px] flex-wrap items-center justify-between gap-3 px-6 py-4 max-xs:px-4">
        <Link to="/" className="-ms-2.5 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-semibold text-foreground no-underline hover:bg-accent">
          <ArrowLeft size={16} aria-hidden="true" className="rtl:-scale-x-100" /> {t('common.backToHome')}
        </Link>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>

      <motion.main className="mx-auto w-full max-w-[880px] flex-1 px-6 pb-16 max-xs:px-4" variants={stagger(0.08)} {...entrance}>
        <motion.div variants={fadeUp} className="mb-8 flex items-center gap-5">
          <Mascot pose={info.pose} size={88} title="" aria-hidden="true" className="shrink-0 max-xs:w-[64px] max-xs:h-auto" />
          <div>
            <Link to="/" aria-label={t('landing.homeLink')} className="mb-2 inline-flex rounded-md">
              <Logo height={26} />
            </Link>
            <h1 className={PAGE_TITLE}>{t(`info.${page}.heading`)}</h1>
            <p className="mt-1.5 text-muted-foreground">{t(`info.${page}.intro`)}</p>
          </div>
        </motion.div>

        {page === 'contact' ? (
          <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
            <Card className="gap-2 p-6">
              <Mail className="text-primary-text" aria-hidden="true" />
              <h2 className="text-lg font-bold">{t('info.contact.email')}</h2>
              <p className="text-muted-foreground">
                {t('info.contact.writeTo')}{' '}
                <span className="font-semibold text-foreground" dir="ltr">
                  hello@tooli.example
                </span>{' '}
                {t('info.contact.demoAddress')}
              </p>
            </Card>
            <Card className="gap-2 p-6">
              <MapPin className="text-primary-text" aria-hidden="true" />
              <h2 className="text-lg font-bold">{t('info.contact.where')}</h2>
              <p className="text-muted-foreground">{t('info.contact.whereText')}</p>
            </Card>
            <Card className="gap-3 p-6 sm:col-span-2">
              <MessagesSquare className="text-primary-text" aria-hidden="true" />
              <h2 className="text-lg font-bold">{t('info.contact.help')}</h2>
              <p className="text-muted-foreground">{t('info.contact.helpText')}</p>
              <Button asChild className="self-start">
                <Link to="/signup">{t('info.contact.try')}</Link>
              </Button>
            </Card>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            {info.sections.map((key) => (
              <motion.section key={key} variants={fadeUp}>
                <Card className="gap-2 p-6">
                  <h2 className="text-lg font-bold">{t(`info.${page}.sections.${key}.title`)}</h2>
                  <p className="leading-relaxed text-muted-foreground">{t(`info.${page}.sections.${key}.text`)}</p>
                </Card>
              </motion.section>
            ))}
          </div>
        )}
      </motion.main>
    </div>
  )
}
