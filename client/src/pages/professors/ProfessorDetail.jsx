import { useParams } from 'react-router-dom'
import { fullName } from '@/lib/people'
import { useAsync } from '@/lib/useAsync'
import { getProfessor } from '@/services/professors'
import LoadState from '../../components/LoadState.jsx'
import Placeholder from '../Placeholder.jsx'

// PLACEHOLDER: one professor's profile + booking (built in the next step)
export default function ProfessorDetail() {
  const { profId } = useParams()
  const result = useAsync(() => getProfessor(profId), [profId])

  return (
    <LoadState
      result={result}
      notFound={{ title: 'Professor not found', backTo: '/dashboard/professors', backLabel: 'See all professors' }}
    >
      {(prof) => (
        <Placeholder
          title={fullName(prof)}
          text={`${prof.subject} · ${prof.city} · ${prof.pricePerHour} TND per hour. Booking is coming next.`}
        />
      )}
    </LoadState>
  )
}
