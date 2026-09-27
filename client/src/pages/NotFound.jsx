import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '../auth/authContext.js'
import Mascot from '../components/Mascot.jsx'
import Page from '../components/Page.jsx'

export default function NotFound() {
  const { isLoggedIn } = useAuth()

  return (
    <Page className="flex flex-col items-center pt-12 text-center max-[560px]:pt-12">
      <Mascot pose="oops" title="tooli mascot looking confused" className="mb-4" />
      <h1 className="mb-2 text-[2em] leading-tight font-bold">Page not found</h1>
      <p className="mb-4 text-muted-foreground">This page doesn't exist. Let's get you back on track.</p>
      <Button asChild>
        <Link to={isLoggedIn ? '/dashboard' : '/'}>{isLoggedIn ? 'Back to dashboard' : 'Back to home'}</Link>
      </Button>
    </Page>
  )
}
