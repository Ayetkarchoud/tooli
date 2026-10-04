import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { PrivateRoute, PublicOnlyRoute } from './auth/RouteGuards.jsx'
import AnimatedOutlet from './components/AnimatedOutlet.jsx'

// Each page is its own file download, fetched the first time it is visited.
// While it downloads, <Suspense> inside AnimatedOutlet shows a skeleton (member area) or dots.
// The member layout too: visitors on the landing page never download the menu/sheet code.
const AppLayout = lazy(() => import('./layout/AppLayout.jsx'))
const Landing = lazy(() => import('./pages/Landing.jsx'))
const Login = lazy(() => import('./pages/auth/Login.jsx'))
const Signup = lazy(() => import('./pages/auth/Signup.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Tutor = lazy(() => import('./pages/tutor/Tutor.jsx'))
const Courses = lazy(() => import('./pages/courses/Courses.jsx'))
const CourseDetail = lazy(() => import('./pages/courses/CourseDetail.jsx'))
const Professors = lazy(() => import('./pages/professors/Professors.jsx'))
const ProfessorDetail = lazy(() => import('./pages/professors/ProfessorDetail.jsx'))
const Vip = lazy(() => import('./pages/Vip.jsx'))
const Notifications = lazy(() => import('./pages/Notifications.jsx'))
const Search = lazy(() => import('./pages/Search.jsx'))
const Settings = lazy(() => import('./pages/settings/Settings.jsx'))
const MissingPage = lazy(() => import('./pages/MissingPage.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const Info = lazy(() => import('./pages/Info.jsx'))
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
            {/* one route for both, so the page stays mounted when a new chat gets its id */}
            <Route path="tutor/:chatId?" element={<Tutor />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:courseId" element={<CourseDetail />} />
            <Route path="professors" element={<Professors />} />
            <Route path="professors/:profId" element={<ProfessorDetail />} />
            <Route path="vip" element={<Vip />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="search" element={<Search />} />
            <Route path="settings" element={<Navigate to="/dashboard/settings/profile" replace />} />
            <Route path="settings/:tab" element={<Settings />} />
            {/* Unknown address inside the member area: friendly "not found", layout stays */}
            <Route path="*" element={<MissingPage />} />
          </Route>
        </Route>

        {/* Public info pages (landing footer), open to everyone */}
        <Route path="about" element={<Info page="about" />} />
        <Route path="contact" element={<Info page="contact" />} />
        <Route path="privacy" element={<Info page="privacy" />} />

        {/* dev only: preview every mascot pose (public). Production builds show 404 here */}
        {MascotPreview && <Route path="mascot" element={<MascotPreview />} />}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
