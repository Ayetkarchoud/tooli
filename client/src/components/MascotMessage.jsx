// Friendly full-width message with the mascot: empty lists, errors, "not found", success.
//   <MascotMessage pose="oops" title="Course not found" text="…" action={<Button …/>} />
// Presets: <NotFoundState /> and <ErrorState onRetry={reload} /> below.

import { Link } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/lib/usePageTitle'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Mascot from './Mascot.jsx'

export default function MascotMessage({ pose = 'thinking', title, text, action, size = 120, className, role }) {
  return (
    <div className={cn('flex flex-col items-center px-4 py-10 text-center', className)} role={role}>
      <Mascot pose={pose} size={size} title="" aria-hidden="true" className="mb-4" />
      <h2 className="text-xl font-bold">{title}</h2>
      {text && <p className="mt-1.5 max-w-md text-muted-foreground">{text}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  )
}

// Unknown id / tab inside the member area
export function NotFoundState({ title, text, backTo = '/dashboard', backLabel }) {
  const { t } = useTranslation()
  usePageTitle(title ?? t('errors.notFoundTitle'))
  return (
    <MascotMessage
      pose="oops"
      title={title ?? t('errors.notFoundTitle')}
      text={text ?? t('errors.notFoundText')}
      action={
        <Button asChild>
          <Link to={backTo}>{backLabel ?? t('common.backToDashboard')}</Link>
        </Button>
      }
    />
  )
}

// A service call failed
export function ErrorState({ onRetry, text }) {
  const { t } = useTranslation()
  return (
    <MascotMessage
      pose="oops"
      title={t('errors.loadTitle')}
      text={text ?? t('errors.loadText')}
      role="alert"
      action={
        onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw aria-hidden="true" /> {t('common.tryAgain')}
          </Button>
        )
      }
    />
  )
}
