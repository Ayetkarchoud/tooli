import { Link } from 'react-router-dom'
import { useAuth } from '../auth/authContext.js'
import Mascot from '../components/Mascot.jsx'

export default function NotFound() {
  const { isLoggedIn } = useAuth()

  return (
    <main className="page not-found">
      <Mascot pose="oops" title="tooli mascot looking confused" />
      <h1>Page not found</h1>
      <p className="muted">This page doesn't exist. Let's get you back on track.</p>
      <Link to={isLoggedIn ? '/dashboard' : '/'} className="btn">
        {isLoggedIn ? 'Back to dashboard' : 'Back to home'}
      </Link>
    </main>
  )
}
