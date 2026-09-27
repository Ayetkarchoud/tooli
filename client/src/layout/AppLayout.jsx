import { Link, NavLink, Outlet } from 'react-router-dom'
import { Bell, Crown, Search } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import ThemeSwitcher from '../components/ThemeSwitcher.jsx'
import UserMenu from './UserMenu.jsx'
import { MAIN_NAV, SETTINGS_NAV } from './navItems.js'
import './AppLayout.css'

const linkClass = ({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`
const tabClass = ({ isActive }) => `tab-link${isActive ? ' is-active' : ''}`

export default function AppLayout() {
  const SettingsIcon = SETTINGS_NAV.icon

  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <Link to="/dashboard" className="sidebar-logo" aria-label="tooli dashboard">
          <Logo height={40} />
        </Link>

        <nav className="nav-list" aria-label="Main">
          {MAIN_NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="vip-card">
            <span className="vip-icon">
              <Crown size={18} aria-hidden="true" />
            </span>
            <strong>Go VIP</strong>
            <p>Unlock private sessions with top professors.</p>
            <Link to="/dashboard/professors" className="vip-btn">Upgrade</Link>
          </div>

          <NavLink to={SETTINGS_NAV.to} className={linkClass}>
            <SettingsIcon size={20} aria-hidden="true" />
            <span>{SETTINGS_NAV.label}</span>
          </NavLink>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <Link to="/dashboard" className="topbar-logo" aria-label="tooli dashboard">
            <Logo height={28} />
          </Link>

          <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
            <Search size={18} className="search-icon" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search courses, professors…"
              aria-label="Search courses and professors"
            />
          </form>

          <div className="topbar-actions">
            <ThemeSwitcher />
            <button type="button" className="icon-btn" aria-label="Notifications">
              <Bell size={20} aria-hidden="true" />
              <span className="badge-dot" />
            </button>
            <UserMenu />
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="tabbar" aria-label="Main">
        {MAIN_NAV.map(({ to, short, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={tabClass}>
            <Icon size={22} aria-hidden="true" />
            <span>{short}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
