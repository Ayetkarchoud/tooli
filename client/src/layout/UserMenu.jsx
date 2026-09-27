// Avatar button in the top bar + its small dropdown: Settings, Log out.

import { useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Settings } from 'lucide-react'
import { useAuth } from '../auth/authContext.js'
import { getInitials } from '../data/mock.js'
import { SETTINGS_NAV } from './navItems.js'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const buttonRef = useRef(null)
  const menuId = useId()

  // Close on outside click, or on Escape (focus goes back to the avatar)
  useEffect(() => {
    if (!open) return
    const onPointer = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')

  return (
    <div className="user-menu" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className="avatar"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account menu for ${fullName}`}
        onClick={() => setOpen((o) => !o)}
      >
        {getInitials(user)}
      </button>

      {open && (
        <div id={menuId} className="user-dropdown">
          <div className="user-dropdown-head">
            <strong>{fullName}</strong>
            <span>{user.email}</span>
          </div>
          <Link to={SETTINGS_NAV.to} className="user-dropdown-item" onClick={() => setOpen(false)}>
            <Settings size={18} aria-hidden="true" /> Settings
          </Link>
          <button type="button" className="user-dropdown-item" onClick={handleLogout}>
            <LogOut size={18} aria-hidden="true" /> Log out
          </button>
        </div>
      )}
    </div>
  )
}
