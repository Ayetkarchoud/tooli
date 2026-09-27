import { Route, Routes } from 'react-router-dom'
import { PrivateRoute, PublicOnlyRoute } from './auth/RouteGuards.jsx'
import AppLayout from './layout/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Landing from './pages/Landing.jsx'
import MascotPreview from './pages/MascotPreview.jsx'
import NotFound from './pages/NotFound.jsx'
import Placeholder from './pages/Placeholder.jsx'
import Login from './pages/auth/Login.jsx'
import Signup from './pages/auth/Signup.jsx'

export default function App() {
  return (
    <Routes>
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

      {/* dev: preview every mascot pose (public) */}
      <Route path="mascot" element={<MascotPreview />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
