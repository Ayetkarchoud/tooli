// Friendly full-width message with the mascot: empty lists, errors, "not found", success.
//   <MascotMessage pose="oops" title="Course not found" text="…" action={<Button …/>} />
// Presets: <NotFoundState /> and <ErrorState onRetry={reload} /> below.

import { Link } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
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
export function NotFoundState({ title = 'We couldn’t find that', text, backTo = '/dashboard', backLabel = 'Back to dashboard' }) {
  return (
    <MascotMessage
      pose="oops"
      title={title}
      text={text ?? 'It may have been moved or removed, or the link has a typo.'}
      action={
        <Button asChild>
          <Link to={backTo}>{backLabel}</Link>
        </Button>
      }
    />
  )
}

// A service call failed
export function ErrorState({ onRetry, text = 'Something went wrong while loading this. Check your connection and try again.' }) {
  return (
    <MascotMessage
      pose="oops"
      title="Oops, that didn’t load"
      text={text}
      role="alert"
      action={
        onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw aria-hidden="true" /> Try again
          </Button>
        )
      }
    />
  )
}
