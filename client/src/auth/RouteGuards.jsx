import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { safeNext, useAuth } from './authContext.js'

// Members only: visitors are sent to /login?next=<the page they wanted>
export function PrivateRoute() {
  const { isLoggedIn } = useAuth()
  const { pathname, search } = useLocation()

  if (!isLoggedIn) {
    return <Navigate to={`/login?next=${encodeURIComponent(pathname + search)}`} replace />
  }
  return <Outlet />
}

// Visitors only ("/", "/login", "/signup"): members go straight to their dashboard
// (or to the "next" page they were heading to before logging in)
export function PublicOnlyRoute() {
  const { isLoggedIn } = useAuth()
  const [params] = useSearchParams()

  if (isLoggedIn) {
    return <Navigate to={safeNext(params.get('next'))} replace />
  }
  return <Outlet />
}
