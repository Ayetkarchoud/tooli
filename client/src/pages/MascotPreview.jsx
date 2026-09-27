// Development page (public): every mascot pose side by side.
// Switch palette / dark mode at the top to check the colours live.
import { Link } from 'react-router-dom'
import Mascot from '../components/Mascot.jsx'
import { MASCOT_POSES } from '../components/mascotPoses.jsx'
import ThemeSwitcher from '../components/ThemeSwitcher.jsx'

export default function MascotPreview() {
  return (
    <main className="page">
      <div className="preview-bar">
        <Link to="/">← Home</Link>
        <ThemeSwitcher />
      </div>

      <h1>Mascot poses</h1>
      <p className="muted">Use the palette switcher and dark mode toggle above to check every colour.</p>

      <div className="mascot-grid">
        {MASCOT_POSES.map((pose) => (
          <figure key={pose} className="card mascot-tile">
            <Mascot pose={pose} size={160} title={`tooli mascot, ${pose}`} />
            <figcaption>{pose}</figcaption>
          </figure>
        ))}
      </div>
    </main>
  )
}
