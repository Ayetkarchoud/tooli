// Temporary page for sections that are not built yet
export default function Placeholder({ title, text }) {
  return (
    <section className="page">
      <h1>{title}</h1>
      <p className="muted">{text}</p>
    </section>
  )
}
