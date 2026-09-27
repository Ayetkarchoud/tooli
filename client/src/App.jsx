import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { PrivateRoute, PublicOnlyRoute } from './auth/RouteGuards.jsx'
import AnimatedOutlet from './components/AnimatedOutlet.jsx'

// Each page is its own file download, fetched the first time it is visited
// (the loading dots come from <Suspense> inside AnimatedOutlet).
// The member layout too: visitors on the landing page never download the menu/sheet code.
const AppLayout = lazy(() => import('./layout/AppLayout.jsx'))
const Landing = lazy(() => import('./pages/Landing.jsx'))
const Login = lazy(() => import('./pages/auth/Login.jsx'))
const Signup = lazy(() => import('./pages/auth/Signup.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Placeholder = lazy(() => import('./pages/Placeholder.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
// Dev-only page: not even built into production
const MascotPreview = import.meta.env.DEV ? lazy(() => import('./pages/MascotPreview.jsx')) : null

const topLevelPage = (pathname) => (pathname.startsWith('/dashboard') ? '/dashboard' : pathname)

export default function App() {
  return (
    <Routes>
      {/* Short fade between pages. /dashboard/* is one key here: AppLayout fades its own content */}
      <Route element={<AnimatedOutlet pageKey={topLevelPage} fullScreen />}>
        {/* Visitors only: logged-in users are sent to /dashboard */}
        <Route element={<PublicOnlyRoute />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>

        {/* Members only: visitors are sent to /login?next=... */}
        <Route path="dashboard" element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route
              path="tutor"
              element={<Placeholder title="AI tutor" text="Ask any question and get a clear answer, any time." />}
            />
            <Route
              path="courses"
              element={<Placeholder title="Partner courses" text="The best e-learning platforms, gathered in one place." />}
            />
            <Route
              path="professors"
              element={<Placeholder title="VIP professors" text="Book private sessions with the best professors in Tunisia." />}
            />
            <Route
              path="settings"
              element={<Placeholder title="Settings" text="Manage your profile, theme and notifications." />}
            />
          </Route>
        </Route>

        {/* dev only: preview every mascot pose (public). Production builds show 404 here */}
        {MascotPreview && <Route path="mascot" element={<MascotPreview />} />}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
