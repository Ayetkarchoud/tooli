// VIP professors, their availability, reviews and bookings
// (FAKE for now: see docs/api.md for the real endpoints). All names below are fictional.

import { formatSlotStart } from '../lib/time.js'
import { copy, daysAgo, matches, wait } from './fake.js'
import { addNotification } from './notifications.js'

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

// Session lengths a student can book, in minutes
export const SESSION_LENGTHS = [60, 90, 120]

// weekly: the professor's usual free times, day = 'mon' … 'sun', time = 'HH:MM' in Tunis time (Africa/Tunis).
// The API turns this into real ISO date-times (see getAvailability) and never sends `weekly` itself.
const PROFESSORS = [
  {
    id: 'amel-exemple', title: 'Prof.', firstName: 'Amel', lastName: 'Exemple',
    subject: 'Mathematics', levels: ['Bac', 'Prépa'], city: 'Tunis', languages: ['Arabic', 'French'],
    bio: 'Maths teacher for 15 years in a pilot high school. I help bac students turn exercises they fear into points they are sure of.',
    rating: 4.9, reviews: 128, pricePerHour: 45,
    weekly: { mon: ['17:00', '18:30'], wed: ['16:00'], sat: ['09:00', '10:30', '14:00'] },
  },
  {
    id: 'karim-demo', title: 'Dr.', firstName: 'Karim', lastName: 'Demo',
    subject: 'Physics', levels: ['Bac', 'University'], city: 'Sousse', languages: ['Arabic', 'French', 'English'],
    bio: 'PhD in physics. I explain mechanics and electricity with everyday examples, then we practise until it clicks.',
    rating: 4.8, reviews: 96, pricePerHour: 50,
    weekly: { tue: ['18:00'], thu: ['17:30', '19:00'], sun: ['10:00'] },
  },
  {
    id: 'sonia-sample', title: 'Prof.', firstName: 'Sonia', lastName: 'Sample',
    subject: 'English', levels: ['Bac', 'University', 'All levels'], city: 'Monastir', languages: ['English', 'French', 'Arabic'],
    bio: 'Cambridge-certified English teacher. Speaking practice, exam preparation and a lot of confidence building.',
    rating: 4.7, reviews: 143, pricePerHour: 40,
    weekly: { mon: ['19:00'], fri: ['17:00', '18:00'], sat: ['11:00'] },
  },
  {
    id: 'youssef-fictif', title: 'Prof.', firstName: 'Youssef', lastName: 'Fictif',
    subject: 'Computer science', levels: ['Bac', 'University'], city: 'Sfax', languages: ['Arabic', 'French', 'English'],
    bio: 'Software engineer and teacher. Algorithms for the bac info section, Python and web projects for everyone else.',
    rating: 4.8, reviews: 74, pricePerHour: 45,
    weekly: { wed: ['18:00', '19:30'], sat: ['15:00'] },
  },
  {
    id: 'leila-modele', title: 'Dr.', firstName: 'Leila', lastName: 'Modèle',
    subject: 'Chemistry', levels: ['Prépa', 'University'], city: 'Tunis', languages: ['French', 'Arabic'],
    bio: 'Former prépa teacher. Thermodynamics and organic chemistry for concours, with clear method sheets after every session.',
    rating: 4.9, reviews: 61, pricePerHour: 60,
    weekly: { tue: ['17:00'], thu: ['18:00'], sun: ['09:30', '11:00'] },
  },
  {
    id: 'mehdi-essai', title: 'Prof.', firstName: 'Mehdi', lastName: 'Essai',
    subject: 'Biology', levels: ['Bac'], city: 'Monastir', languages: ['Arabic', 'French'],
    bio: 'SVT teacher who loves diagrams. Genetics, immunology and neurology explained with drawings you will remember.',
    rating: 4.6, reviews: 88, pricePerHour: 35,
    weekly: { mon: ['16:30'], thu: ['16:30', '18:00'] },
  },
  {
    id: 'ines-test', title: 'Prof.', firstName: 'Inès', lastName: 'Test',
    subject: 'French', levels: ['Bac', 'All levels'], city: 'Bizerte', languages: ['French', 'Arabic'],
    bio: 'Professeure de français. Dissertation, commentaire and oral practice, one clear method at a time.',
    rating: 4.7, reviews: 52, pricePerHour: 35,
    weekly: {}, // fully booked this week
  },
  {
    id: 'walid-maquette', title: 'Dr.', firstName: 'Walid', lastName: 'Maquette',
    subject: 'Mathematics', levels: ['Prépa', 'University'], city: 'Nabeul', languages: ['French', 'English'],
    bio: 'University lecturer in applied maths. Analysis, linear algebra and statistics, with a focus on rigorous proofs.',
    rating: 4.8, reviews: 67, pricePerHour: 55,
    weekly: { wed: ['17:00'], fri: ['18:30'], sun: ['15:00'] },
  },
]

// Fictional reviews: [author, rating, text, days ago]
const REVIEW_TEXTS = [
  ['Yasmine B.', 5, 'Super clear and patient. I finally understood what I had been stuck on for weeks.', 3],
  ['Omar K.', 5, 'Every session starts with what I actually need. My marks went up in one term.', 10],
  ['Nour H.', 4, 'Great explanations and useful summary sheets. Sessions sometimes run a little late.', 18],
  ['Sami T.', 5, 'Friendly, well prepared and always on time. Highly recommended before exams.', 27],
  ['Rania M.', 4, 'Very good method. I would love a few more practice exercises to do alone.', 40],
]

// Bookings made in this session: { id, profId, startsAt, endsAt, durationMinutes, price, status }
let BOOKINGS = []

// Tunisia is UTC+1 all year (no daylight saving time since 2009)
const TUNIS_OFFSET = '+01:00'
const TUNIS_OFFSET_MS = 60 * 60_000

// Today's calendar day in Tunis, as 'YYYY-MM-DD'
const tunisToday = () => new Date(Date.now() + TUNIS_OFFSET_MS).toISOString().slice(0, 10)
// 'YYYY-MM-DD' + n days (pure calendar maths, no time zone involved)
const addDays = (day, n) => new Date(Date.parse(`${day}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10)
// A moment (ms) → ISO date-time written in Tunis time: '2026-10-05T17:00:00+01:00'
const toTunisISO = (ms) => `${new Date(ms + TUNIS_OFFSET_MS).toISOString().slice(0, 19)}${TUNIS_OFFSET}`

// Two time ranges [start, end) overlap when each one starts before the other ends
const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd

// Every weekly slot in the next `days` days (as ms), ignoring bookings. Past times are left out.
function weeklySlots(prof, days = 7) {
  const today = tunisToday()
  const now = Date.now()
  return Array.from({ length: days }, (_, offset) => {
    const day = addDays(today, offset)
    const weekday = DAY_KEYS[new Date(`${day}T00:00:00Z`).getUTCDay()]
    return (prof.weekly[weekday] ?? []).map((time) => Date.parse(`${day}T${time}:00${TUNIS_OFFSET}`))
  })
    .flat()
    .filter((start) => start > now)
}

// Can a session of `durationMinutes` start at `start` without touching any booking of this professor?
// (A 2 h booking at 09:00 blocks a 10:30 start; a 1 h 30 session at 08:00 is blocked by a booking at 09:00.)
const isFree = (prof, start, durationMinutes) =>
  !BOOKINGS.some(
    (b) => b.profId === prof.id && overlaps(start, start + durationMinutes * 60_000, Date.parse(b.startsAt), Date.parse(b.endsAt)),
  )

// Free start times for a session of `durationMinutes`, as ISO date-times in Tunis time
const freeSlots = (prof, durationMinutes = 60, days = 7) =>
  weeklySlots(prof, days)
    .filter((start) => isFree(prof, start, durationMinutes))
    .map(toTunisISO)

// What the API sends for a professor: no `weekly`, plus the next free start (ISO) or null
function publicProfessor(prof) {
  const { weekly, ...rest } = prof // eslint-disable-line no-unused-vars
  return { ...rest, nextSlot: freeSlots(prof)[0] ?? null }
}

// price range: 'under-40' | '40-50' | 'over-50'
const PRICE_RANGES = {
  'under-40': (p) => p < 40,
  '40-50': (p) => p >= 40 && p <= 50,
  'over-50': (p) => p > 50,
}

// TODO(backend): api.get('/professors', { subject, city, language, price, available: available ? 1 : undefined, q })
export async function listProfessors({ subject, city, language, price, available, q } = {}) {
  await wait()
  return copy(
    PROFESSORS.filter(
      (p) =>
        (!subject || p.subject === subject) &&
        (!city || p.city === city) &&
        (!language || p.languages.includes(language)) &&
        (!price || PRICE_RANGES[price]?.(p.pricePerHour)) &&
        (!available || freeSlots(p).length > 0) &&
        (!q || matches(`${p.firstName} ${p.lastName} ${p.subject} ${p.city}`, q)),
    )
      .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
      .map(publicProfessor),
  )
}

// Values for the filter chips, in display order
// TODO(backend): api.get('/professors/filters')
export async function getProfessorFilters() {
  await wait()
  const unique = (list) => [...new Set(list)].sort((a, b) => a.localeCompare(b))
  return {
    subjects: unique(PROFESSORS.map((p) => p.subject)),
    cities: unique(PROFESSORS.map((p) => p.city)),
    languages: unique(PROFESSORS.flatMap((p) => p.languages)),
  }
}

// Best rated first
// TODO(backend): api.get('/professors/top', { limit })
export async function getTopProfessors(limit = 3) {
  await wait()
  return copy(
    [...PROFESSORS]
      .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
      .slice(0, limit)
      .map(publicProfessor),
  )
}

// Returns null when the professor doesn't exist (the API answers 404)
// TODO(backend): api.get(`/professors/${profId}`)
export async function getProfessor(profId) {
  await wait()
  const found = PROFESSORS.find((p) => p.id === profId)
  return found ? copy(publicProfessor(found)) : null
}

// Free start times for the next 7 days for a session of `durationMinutes` (times that would
// overlap a booking are left out). → { timeZone: 'Africa/Tunis', slots: ['2026-10-05T17:00:00+01:00', …] }
// TODO(backend): api.get(`/professors/${profId}/availability`, { days: 7, durationMinutes })
export async function getAvailability(profId, { durationMinutes = 60 } = {}) {
  await wait()
  const found = PROFESSORS.find((p) => p.id === profId)
  if (!found) throw new Error('Professor not found.')
  return { timeZone: 'Africa/Tunis', slots: freeSlots(found, durationMinutes) }
}

// TODO(backend): api.get(`/professors/${profId}/reviews`)
export async function getProfessorReviews(profId) {
  await wait()
  // Deterministic fake: each professor gets the same 3–5 reviews every time
  const count = 3 + (profId.length % 3)
  return REVIEW_TEXTS.slice(0, count).map(([author, rating, text, ago], i) => ({
    id: `${profId}-r${i + 1}`,
    author,
    rating,
    text,
    createdAt: daysAgo(ago),
  }))
}

// Book a class starting at `startsAt` (ISO date-time). Resolves with the booking; overlapping
// times disappear from the availability and a notification is created.
// TODO(backend): api.post(`/professors/${profId}/bookings`, { startsAt, durationMinutes })
export async function bookSlot(profId, { startsAt, durationMinutes }) {
  await wait(700, 1100)
  const prof = PROFESSORS.find((p) => p.id === profId)
  if (!prof) throw new Error('Professor not found.')
  if (!SESSION_LENGTHS.includes(durationMinutes)) throw new Error('Please choose 1 h, 1 h 30 or 2 h.')
  const start = Date.parse(startsAt)
  if (!weeklySlots(prof).includes(start)) throw new Error('This time isn’t available. Please pick one from the list.')
  if (!isFree(prof, start, durationMinutes)) {
    throw new Error('This class would overlap another booking. Please pick another time or a shorter session.')
  }

  const booking = {
    id: `bk-${Date.now()}`,
    profId,
    startsAt: toTunisISO(start),
    endsAt: toTunisISO(start + durationMinutes * 60_000),
    durationMinutes,
    // price per hour × hours, rounded to 0.1 TND (e.g. 45 TND × 1.5 h = 67.5 TND)
    price: Math.round(prof.pricePerHour * (durationMinutes / 60) * 10) / 10,
    status: 'confirmed',
  }
  BOOKINGS = [...BOOKINGS, booking]
  addNotification({
    type: 'booking',
    title: 'Class booked',
    body: `Your session with ${prof.title} ${prof.firstName} ${prof.lastName} is booked: ${formatSlotStart(booking.startsAt)}.`,
    link: `/dashboard/professors/${profId}`,
  })
  return copy(booking)
}
