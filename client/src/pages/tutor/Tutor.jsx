import { useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import Placeholder from '../Placeholder.jsx'

// PLACEHOLDER: the tutor chat is built in the next step. ?q= is a question sent from the dashboard.
export default function Tutor() {
  const [params] = useSearchParams()
  const question = params.get('q')?.trim()

  return (
    <Placeholder title="AI tutor" text="Ask any question and get a clear answer, any time.">
      {question && (
        <Card className="max-w-xl gap-1 p-5">
          <span className="text-sm text-muted-foreground">Your question</span>
          <p className="text-base font-semibold">{question}</p>
        </Card>
      )}
    </Placeholder>
  )
}
