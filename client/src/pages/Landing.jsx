// Public home page for visitors: what tooli is, and how to join.
// No personal content here; everything personal lives in /dashboard.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import Mascot from '../components/Mascot.jsx'
import ThemeSwitcher from '../components/ThemeSwitcher.jsx'
import { SERVICES, servicePath } from '../data/services.js'
import './Landing.css'

const STEPS = [
  { title: 'Create your free account', text: 'Sign up in under a minute. All you need is an email address.' },
  { title: 'Choose a service', text: 'Ask the AI tutor, follow a partner course or book a VIP professor.' },
  { title: 'Start learning', text: 'Learn at your own pace and watch your progress grow week after week.' },
]

function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the mobile menu with Escape
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <header className={`landing-header${menuOpen ? ' is-open' : ''}`}>
      <div className="landing-header-row">
        <Link to="/" className="landing-logo" aria-label="tooli home">
          <Logo height={34} />
        </Link>

        <button
          type="button"
          className="menu-btn"
          aria-expanded={menuOpen}
          aria-controls="landing-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
        </button>

        <div id="landing-menu" className="landing-menu">
          <ThemeSwitcher />
          <div className="landing-auth">
            <Link to="/login" className="btn btn-text" onClick={() => setMenuOpen(false)}>
              Log in
            </Link>
            <Link to="/signup" className="btn" onClick={() => setMenuOpen(false)}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

function ServiceTeaser({ service }) {
  const { slug, title, pitch, icon: Icon, soon } = service

  return (
    <article className={`card teaser${soon ? ' is-soon' : ''}`}>
      <div className="teaser-top">
        <span className="teaser-icon">
          <Icon size={24} aria-hidden="true" />
        </span>
        {soon && <span className="soon-badge">Soon</span>}
      </div>
      <h3>{title}</h3>
      <p>{pitch}</p>
      {!soon && (
        <Link
          to={`/login?next=${encodeURIComponent(servicePath(slug))}`}
          className="teaser-link"
          aria-label={`Log in to start: ${title}`}
        >
          Log in to start <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </article>
  )
}

export default function Landing() {
  return (
    <div className="landing">
      <LandingHeader />

      <main>
        <section className="hero landing-wrap">
          <div className="hero-copy">
            <p className="hero-kicker">Your study buddy, always on</p>
            <h1>
              Learn smarter with <span className="hero-brand">tooli</span>
            </h1>
            <p className="hero-lead">
              An AI tutor, courses from our partners and live classes with top professors, all in one friendly place.
            </p>
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-lg">
                Sign up for free
              </Link>
              <Link to="/login" className="btn btn-lg btn-outline">
                Log in
              </Link>
            </div>
          </div>
          <div className="hero-art">
            <span className="hero-halo" aria-hidden="true" />
            <Mascot pose="waving" size={240} title="tooli mascot waving hello" />
          </div>
        </section>

        <section className="landing-section landing-wrap" aria-labelledby="services-title">
          <h2 id="services-title" className="landing-title">Our services</h2>
          <p className="landing-sub">Everything you need to move forward, whatever your level.</p>
          <div className="teaser-grid">
            {SERVICES.map((s) => (
              <ServiceTeaser key={s.title} service={s} />
            ))}
          </div>
        </section>

        <section className="landing-section landing-wrap" aria-labelledby="how-title">
          <h2 id="how-title" className="landing-title">How it works</h2>
          <p className="landing-sub">Three steps and you are ready.</p>
          <ol className="steps">
            {STEPS.map((step, i) => (
              <li key={step.title} className="step">
                <span className="step-num" aria-hidden="true">{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="landing-wrap" aria-labelledby="cta-title">
          <div className="cta-band">
            <Mascot pose="celebrating" size={150} title="tooli mascot celebrating" />
            <div className="cta-copy">
              <h2 id="cta-title">Ready to start?</h2>
              <p>Join tooli today. It is free, and your first question is only a click away.</p>
            </div>
            <Link to="/signup" className="btn btn-lg">
              Sign up for free
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-wrap footer-row">
          <Logo height={26} />
          <nav className="footer-links" aria-label="Footer">
            {/* TODO: real pages */}
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <a href="#privacy">Privacy</a>
          </nav>
          <p className="footer-copy">© {new Date().getFullYear()} tooli</p>
        </div>
      </footer>
    </div>
  )
}
