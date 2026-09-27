import Page from '../components/Page.jsx'

// Temporary page for sections that are not built yet
export default function Placeholder({ title, text }) {
  return (
    <Page as="section">
      <h1 className="mb-2 text-[2em] leading-tight font-bold">{title}</h1>
      <p className="mb-4 text-muted-foreground">{text}</p>
    </Page>
  )
}
