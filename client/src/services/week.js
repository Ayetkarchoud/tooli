// "Your week" on the dashboard (FAKE for now: see docs/api.md for the real endpoint).
// Built from the other fake services, so it reacts to what you do in the demo
// (ask the tutor, mark a lesson done, book a class).

import { localDateKey } from '../lib/time.js'
import { fakeLessonsDoneSince } from './courses.js'
import { wait } from './fake.js'
import { fakeNextBooking } from './professors.js'
import { fakeQuestionsSince } from './tutor.js'

// FAKE: which days of this week (Mon → Sun) the student studied before today
const STUDIED_PATTERN = [true, true, false, true, false, true, false]

// → {
//   days: [{ date: 'YYYY-MM-DD', studied: true | false | null }] Monday → Sunday (null = still to come),
//   questionsAsked, lessonsDone (this week), nextClass: booking + professor, or null
// }
// TODO(backend): api.get('/users/me/week')
export async function getWeekSummary() {
  await wait()
  const now = new Date()
  const mondayOffset = (now.getDay() + 6) % 7 // 0 = Monday
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const weekStart = monday.getTime()

  const studiedToday = fakeQuestionsSince(todayStart) > 0 || fakeLessonsDoneSince(todayStart) > 0
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
    const studied = i < mondayOffset ? STUDIED_PATTERN[i] : i === mondayOffset ? studiedToday : null
    return { date: localDateKey(date), studied }
  })

  return {
    days,
    questionsAsked: fakeQuestionsSince(weekStart),
    lessonsDone: fakeLessonsDoneSince(weekStart),
    nextClass: fakeNextBooking(),
  }
}
