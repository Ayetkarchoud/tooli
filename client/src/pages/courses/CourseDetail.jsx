import { useParams } from 'react-router-dom'
import { useAsync } from '@/lib/useAsync'
import { getCourse } from '@/services/courses'
import LoadState from '../../components/LoadState.jsx'
import Placeholder from '../Placeholder.jsx'

// PLACEHOLDER: one course (built in the next step)
export default function CourseDetail() {
  const { courseId } = useParams()
  const result = useAsync(() => getCourse(courseId), [courseId])

  return (
    <LoadState
      result={result}
      notFound={{ title: 'Course not found', backTo: '/dashboard/courses', backLabel: 'See all courses' }}
    >
      {(course) => (
        <Placeholder
          title={course.title}
          text={`${course.platform.name} · ${course.level} · ${course.lessons.length} lessons. The full course page is coming next.`}
        />
      )}
    </LoadState>
  )
}
