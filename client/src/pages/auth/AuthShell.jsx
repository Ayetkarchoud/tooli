// Shared frame for /login and /signup: back link, theme switcher, centered card with logo + mascot.

import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Logo from '../../components/Logo.jsx'
import Mascot from '../../components/Mascot.jsx'
import ThemeSwitcher from '../../components/ThemeSwitcher.jsx'
import './Auth.css'

export default function AuthShell({ pose, mascotTitle, title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-topbar">
        <Link to="/" className="auth-back">
          <ArrowLeft size={16} aria-hidden="true" /> Back to home
        </Link>
        <ThemeSwitcher />
      </div>

      <main className="auth-main">
        <div className="card auth-card">
          <div className="auth-brand">
            <Link to="/" aria-label="tooli home" className="auth-logo">
              <Logo height={34} />
            </Link>
            <Mascot pose={pose} size={76} title={mascotTitle} />
          </div>

          <h1>{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>

          {children}

          <p className="auth-switch">{footer}</p>
        </div>
      </main>
    </div>
  )
}
