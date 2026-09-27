import { useParams } from 'react-router-dom'
import { useAsync } from '@/lib/useAsync'
import { getChat } from '@/services/tutor'
import LoadState from '../../components/LoadState.jsx'
import Placeholder from '../Placeholder.jsx'

// PLACEHOLDER: one tutor conversation (built in the next step)
export default function TutorChat() {
  const { chatId } = useParams()
  const result = useAsync(() => getChat(chatId), [chatId])

  return (
    <LoadState
      result={result}
      notFound={{ title: 'Chat not found', backTo: '/dashboard/tutor', backLabel: 'Back to the tutor' }}
    >
      {(chat) => (
        <Placeholder title={chat.title} text={`${chat.messages.length} messages. The full conversation view is coming next.`} />
      )}
    </LoadState>
  )
}
