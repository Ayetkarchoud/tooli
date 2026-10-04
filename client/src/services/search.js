// Search across courses, professors and tips (FAKE for now: see docs/api.md).
// The fake version asks each service; the real API answers in one call.

import { listCourses } from './courses.js'
import { listProfessors } from './professors.js'
import { getLearningTips } from './tutor.js'

// → { courses: [...], professors: [...], tips: [...] } (empty lists for an empty query)
// TODO(backend): api.get('/search', { q })
export async function search(q) {
  const query = (q ?? '').trim()
  if (!query) return { courses: [], professors: [], tips: [] }
  const [courses, professors, tips] = await Promise.all([
    listCourses({ q: query }),
    listProfessors({ q: query }),
    getLearningTips({ q: query }),
  ])
  return { courses, professors, tips }
}
