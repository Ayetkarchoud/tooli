import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Lightbulb, RefreshCw, SendHorizontal, Star } from 'lucide-react'
import Mascot from '../components/Mascot.jsx'
import { useAuth } from '../auth/authContext.js'
import { continueCourses, getInitials, learningTips, vipProfessors } from '../data/mock.js'
import { SERVICES, servicePath } from '../data/services.js'
import './Dashboard.css'

const SUGGESTIONS = ['Explain photosynthesis simply', 'How do I solve 2x + 5 = 13?', 'Tips to learn English faster']

function getGreeting(hour) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function randomTipIndex(exclude) {
  let i = Math.floor(Math.random() * learningTips.length)
  while (learningTips.length > 1 && i === exclude) i = Math.floor(Math.random() * learningTips.length)
  return i
}

// Stagger the fade-in of each section (see .reveal in Dashboard.css)
const reveal = (i, className = '') => ({ className: `reveal ${className}`.trim(), style: { '--i': i } })

function AskBar() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')

  const ask = (q) => {
    const text = q.trim()
    if (text) navigate(`/dashboard/tutor?q=${encodeURIComponent(text)}`)
  }

  return (
    <div className="ask-card">
      <div className="ask-head">
        <h2>Ask tooli anything</h2>
        <p className="muted">Homework, exams, a tricky concept: get a clear answer in seconds.</p>
      </div>

      <form
        className="ask-form"
        onSubmit={(e) => {
          e.preventDefault()
          ask(question)
        }}
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question…"
          aria-label="Your question for tooli"
        />
        <button type="submit" className="ask-send" disabled={!question.trim()} aria-label="Send question">
          <SendHorizontal size={20} aria-hidden="true" />
          <span>Ask</span>
        </button>
      </form>

      <div className="ask-chips">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" className="chip" onClick={() => ask(s)}>
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function ServiceCard({ service, number }) {
  const { slug, title, text, icon: Icon, cta, soon } = service

  const body = (
    <>
      <div className="service-top">
        <span className="service-icon">
          <Icon size={22} aria-hidden="true" />
        </span>
        {soon ? <span className="soon-badge">Soon</span> : <span className="step-number">{number}</span>}
      </div>
      <div className="service-body">
        <h3>{title}</h3>
        <p className="muted">{text}</p>
      </div>
      {!soon && (
        <span className="service-cta">
          {cta} <ArrowRight size={16} aria-hidden="true" />
        </span>
      )}
    </>
  )

  if (soon) {
    return (
      <div className="card service-card is-soon">
        {body}
      </div>
    )
  }

  return (
    <Link to={servicePath(slug)} className="card service-card is-link">
      {body}
    </Link>
  )
}

function ContinueLearning() {
  return (
    <div className="card course-list">
      {continueCourses.map((c) => (
        <div key={c.id} className="course-row">
          <div className="course-info">
            <span className="course-platform">{c.platform}</span>
            <h3>{c.title}</h3>
          </div>
          <Link to={c.to} className="pill-link">
            Resume <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <div className="progress">
            <div
              className="progress-track"
              role="progressbar"
              aria-valuenow={c.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${c.title} progress`}
            >
              <span className="progress-fill" style={{ width: `${c.progress}%` }} />
            </div>
            <span className="progress-value">{c.progress}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function TipOfTheDay() {
  const [index, setIndex] = useState(() => randomTipIndex())

  return (
    <div className="card tip-card">
      <Lightbulb className="corner-icon" size={128} aria-hidden="true" />
      <p className="tip-text" aria-live="polite">{learningTips[index]}</p>
      <button type="button" className="pill-link" onClick={() => setIndex((i) => randomTipIndex(i))}>
        <RefreshCw size={14} aria-hidden="true" /> New tip
      </button>
    </div>
  )
}

function ProfessorCard({ prof }) {
  return (
    <article className="card prof-card">
      <span className="prof-avatar" aria-hidden="true">{getInitials(prof)}</span>
      <div>
        <h3>
          {prof.title} {prof.firstName} {prof.lastName}
        </h3>
        <p className="muted">{prof.subject}</p>
      </div>
      <p className="prof-rating">
        <Star size={16} className="star" fill="currentColor" aria-hidden="true" />
        <strong>{prof.rating.toFixed(1)}</strong>
        <span className="muted">({prof.reviews} reviews)</span>
      </p>
      <Link to="/dashboard/professors" className="btn prof-btn">
        Book a class
      </Link>
    </article>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const now = new Date()
  const today = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="page dashboard">
      <header {...reveal(0)}>
        <div className="greeting">
          <Mascot pose="waving" size={64} />
          <div>
            <h1>
              {getGreeting(now.getHours())}, {user.firstName}
            </h1>
            <p className="greeting-date">{today}</p>
          </div>
        </div>
      </header>

      <section {...reveal(1)}>
        <AskBar />
      </section>

      <section {...reveal(2)}>
        <h2 className="section-title">Our services</h2>
        <div className="services-grid">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.title} service={s} number={i + 1} />
          ))}
        </div>
      </section>

      <div {...reveal(3, 'split')}>
        <section>
          <h2 className="section-title">Continue learning</h2>
          <ContinueLearning />
        </section>
        <section>
          <h2 className="section-title">Tip of the day</h2>
          <TipOfTheDay />
        </section>
      </div>

      <section {...reveal(4)}>
        <div className="section-head">
          <h2 className="section-title">Top VIP professors</h2>
          <Link to="/dashboard/professors" className="see-all">
            See all <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div className="prof-grid">
          {vipProfessors.map((p) => (
            <ProfessorCard key={p.id} prof={p} />
          ))}
        </div>
      </section>
    </div>
  )
}
