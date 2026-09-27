import Page from '../components/Page.jsx'

// Temporary page for sections that are not built yet (children = extra content under the text)
export default function Placeholder({ title, text, children }) {
  return (
    <Page as="section">
      <h1 className="mb-2 text-[2em] leading-tight font-bold">{title}</h1>
      <p className="mb-4 text-muted-foreground">{text}</p>
      {children}
    </Page>
  )
}
