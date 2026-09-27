import { NotFoundState } from '../components/MascotMessage.jsx'
import Page from '../components/Page.jsx'

// Unknown address inside /dashboard/* (the app layout stays around it)
export default function MissingPage() {
  return (
    <Page>
      <NotFoundState title="Page not found" text="This page doesn’t exist. Let’s get you back on track." />
    </Page>
  )
}
