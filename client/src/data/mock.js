// Sample data used until the Express API is ready.
// Replace these with api.get(...) calls later (see src/api/client.js).
// All names below are fictional.

// The logged-in user comes from useAuth() (src/auth), not from here.

export function getInitials(person) {
  return [person.firstName, person.lastName]
    .map((name) => (name ?? '').trim())
    .filter(Boolean)
    .map((name) => name[0].toUpperCase())
    .join('')
}

// Partner courses the user has started
export const continueCourses = [
  { id: 'c1', platform: 'LearnSphere', title: 'Algebra basics: equations and inequalities', progress: 68, to: '/dashboard/courses' },
  { id: 'c2', platform: 'CodeNest', title: 'Python for beginners', progress: 35, to: '/dashboard/courses' },
  { id: 'c3', platform: 'LinguaLab', title: 'English B2: speaking with confidence', progress: 12, to: '/dashboard/courses' },
]

export const learningTips = [
  'Study in 25-minute blocks with 5-minute breaks. Your focus stays sharp much longer.',
  'Explain a new idea out loud as if teaching a friend. Gaps in your understanding show up fast.',
  'Test yourself instead of re-reading. Recalling an answer makes it stick far better.',
  'Review your notes the next day, then after a week. Spaced reviews beat one long session.',
  'Put your phone in another room while studying. Even a silent phone pulls at your attention.',
  'Mix different types of exercises in one session. It trains you to pick the right method.',
  'Sleep is part of studying: your brain stores what you learned while you rest.',
  'Stuck on a problem? Write down exactly where you are stuck, then ask tooli about that step.',
]

export const vipProfessors = [
  { id: 'p1', firstName: 'Amel', lastName: 'Exemple', title: 'Prof.', subject: 'Mathematics', rating: 4.9, reviews: 128 },
  { id: 'p2', firstName: 'Karim', lastName: 'Demo', title: 'Dr.', subject: 'Physics', rating: 4.8, reviews: 96 },
  { id: 'p3', firstName: 'Sonia', lastName: 'Sample', title: 'Prof.', subject: 'English', rating: 4.7, reviews: 143 },
]
