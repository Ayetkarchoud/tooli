// Development page (public): every mascot pose side by side.
// Switch palette / dark mode at the top to check the colours live.
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import Mascot from '../components/Mascot.jsx'
import { MASCOT_POSES } from '../components/mascotPoses.jsx'
import Page from '../components/Page.jsx'
import ThemeSwitcher from '../components/ThemeSwitcher.jsx'

export default function MascotPreview() {
  return (
    <Page>
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link to="/" className="font-semibold text-foreground no-underline">
          ← Home
        </Link>
        <ThemeSwitcher />
      </div>

      <h1 className="mb-2 text-[2em] leading-tight font-bold">Mascot poses</h1>
      <p className="mb-4 text-muted-foreground">Use the palette switcher and dark mode toggle above to check every colour.</p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
        {MASCOT_POSES.map((pose) => (
          <Card key={pose} className="px-4 pt-6 pb-4">
            <figure className="flex flex-col items-center gap-3">
              <Mascot pose={pose} size={160} title={`tooli mascot, ${pose}`} />
              <figcaption className="text-base font-semibold capitalize">{pose}</figcaption>
            </figure>
          </Card>
        ))}
      </div>
    </Page>
  )
}
