import { useSearchParams } from 'react-router-dom'
import Placeholder from './Placeholder.jsx'

// PLACEHOLDER: search results (built in the next step). ?q= comes from the top bar.
export default function Search() {
  const [params] = useSearchParams()
  const q = params.get('q')?.trim()

  return (
    <Placeholder
      title={q ? `Results for “${q}”` : 'Search'}
      text="Courses, professors and study tips that match your search will show up here."
    />
  )
}
