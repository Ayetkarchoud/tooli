import Logo from './components/Logo.jsx'
import ThemeSwitcher from './components/ThemeSwitcher.jsx'

// Placeholder home: the real dashboard design comes next
const SERVICES = [
  { icon: '💬', title: 'AI tutor', text: 'Ask any question and get an answer.' },
  { icon: '📚', title: 'Partner courses', text: 'The best e-learning platforms, in one place.' },
  { icon: '⭐', title: 'VIP professors', text: 'Learn with the best professors in Tunisia.' },
]

export default function App() {
  return (
    <>
      <header className="topbar">
        <Logo height={36} />
        <ThemeSwitcher />
      </header>

      <main className="page">
        <h1>Welcome to tooli</h1>
        <p className="muted">Everything you need to learn, in one place.</p>

        <div className="services">
          {SERVICES.map((s) => (
            <article key={s.title} className="service-card">
              <span className="service-icon">{s.icon}</span>
              <h2>{s.title}</h2>
              <p className="muted">{s.text}</p>
              <button type="button" className="btn">Open</button>
            </article>
          ))}
        </div>
      </main>
    </>
  )
}
