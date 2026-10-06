// VIP professors, their availability, reviews and bookings
// (FAKE for now: see docs/api.md for the real endpoints). All names below are fictional.
// subject, levels, city and languages are ids (the UI translates them); bios and reviews come in en / fr / ar.

import i18n from '../lib/i18n.js'
import { formatSlotStart } from '../lib/time.js'
import { copy, daysAgo, matches, pick, wait } from './fake.js'
import { addNotification } from './notifications.js'

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

// Session lengths a student can book, in minutes
export const SESSION_LENGTHS = [60, 90, 120]

// title: 'prof' | 'dr'. languages: 'ar' | 'fr' | 'en' (languages the professor teaches in).
// weekly: the professor's usual free times, day = 'mon' … 'sun', time = 'HH:MM' in Tunis time (Africa/Tunis).
// The API turns this into real ISO date-times (see getAvailability) and never sends `weekly` itself.
const PROFESSORS = [
  {
    id: 'amel-exemple', title: 'prof', firstName: 'Amel', lastName: 'Exemple',
    subject: 'mathematics', levels: ['bac', 'prepa'], city: 'tunis', languages: ['ar', 'fr'],
    bio: {
      en: 'Maths teacher for 15 years in a pilot high school. I help bac students turn exercises they fear into points they are sure of.',
      fr: 'Prof de maths depuis 15 ans en lycée pilote. J’aide les bacheliers à transformer les exercices qui leur font peur en points assurés.',
      ar: 'أستاذة رياضيات منذ 15 سنة في معهد نموذجي. أساعد تلاميذ الباكالوريا على تحويل التمارين التي يخافونها إلى نقاط مضمونة.',
    },
    rating: 4.9, reviews: 128, pricePerHour: 45,
    weekly: { mon: ['17:00', '18:30'], wed: ['16:00'], sat: ['09:00', '10:30', '14:00'] },
  },
  {
    id: 'karim-demo', title: 'dr', firstName: 'Karim', lastName: 'Demo',
    subject: 'physics', levels: ['bac', 'university'], city: 'sousse', languages: ['ar', 'fr', 'en'],
    bio: {
      en: 'PhD in physics. I explain mechanics and electricity with everyday examples, then we practise until it clicks.',
      fr: 'Docteur en physique. J’explique la mécanique et l’électricité avec des exemples du quotidien, puis on s’entraîne jusqu’au déclic.',
      ar: 'دكتور في الفيزياء. أشرح الميكانيك والكهرباء بأمثلة من الحياة اليومية، ثمّ نتدرّب حتى يتّضح كلّ شيء.',
    },
    rating: 4.8, reviews: 96, pricePerHour: 50,
    weekly: { tue: ['18:00'], thu: ['17:30', '19:00'], sun: ['10:00'] },
  },
  {
    id: 'sonia-sample', title: 'prof', firstName: 'Sonia', lastName: 'Sample',
    subject: 'english', levels: ['bac', 'university', 'all-levels'], city: 'monastir', languages: ['en', 'fr', 'ar'],
    bio: {
      en: 'Cambridge-certified English teacher. Speaking practice, exam preparation and a lot of confidence building.',
      fr: 'Prof d’anglais certifiée Cambridge. Expression orale, préparation aux examens et beaucoup de confiance en soi.',
      ar: 'أستاذة إنجليزية حاصلة على شهادة كامبريدج. تدرّب على المحادثة واستعداد للامتحانات والكثير من الثقة بالنفس.',
    },
    rating: 4.7, reviews: 143, pricePerHour: 40,
    weekly: { mon: ['19:00'], fri: ['17:00', '18:00'], sat: ['11:00'] },
  },
  {
    id: 'youssef-fictif', title: 'prof', firstName: 'Youssef', lastName: 'Fictif',
    subject: 'computer-science', levels: ['bac', 'university'], city: 'sfax', languages: ['ar', 'fr', 'en'],
    bio: {
      en: 'Software engineer and teacher. Algorithms for the bac info section, Python and web projects for everyone else.',
      fr: 'Ingénieur logiciel et enseignant. Algorithmique pour la section info du bac, Python et projets web pour tous les autres.',
      ar: 'مهندس برمجيات وأستاذ. خوارزميات لشعبة الإعلامية في الباكالوريا، وبايثون ومشاريع ويب للجميع.',
    },
    rating: 4.8, reviews: 74, pricePerHour: 45,
    weekly: { wed: ['18:00', '19:30'], sat: ['15:00'] },
  },
  {
    id: 'leila-modele', title: 'dr', firstName: 'Leila', lastName: 'Modèle',
    subject: 'chemistry', levels: ['prepa', 'university'], city: 'tunis', languages: ['fr', 'ar'],
    bio: {
      en: 'Former prépa teacher. Thermodynamics and organic chemistry for concours, with clear method sheets after every session.',
      fr: 'Ancienne prof de prépa. Thermodynamique et chimie organique pour les concours, avec une fiche méthode claire après chaque séance.',
      ar: 'أستاذة سابقة في الأقسام التحضيرية. التحريك الحراري والكيمياء العضوية للمناظرات، مع بطاقة منهجية واضحة بعد كلّ حصّة.',
    },
    rating: 4.9, reviews: 61, pricePerHour: 60,
    weekly: { tue: ['17:00'], thu: ['18:00'], sun: ['09:30', '11:00'] },
  },
  {
    id: 'mehdi-essai', title: 'prof', firstName: 'Mehdi', lastName: 'Essai',
    subject: 'biology', levels: ['bac'], city: 'monastir', languages: ['ar', 'fr'],
    bio: {
      en: 'SVT teacher who loves diagrams. Genetics, immunology and neurology explained with drawings you will remember.',
      fr: 'Prof de SVT fan de schémas. Génétique, immunologie et neurologie expliquées avec des dessins qu’on n’oublie pas.',
      ar: 'أستاذ علوم الحياة والأرض يعشق الرسوم. الوراثة والمناعة وعلم الأعصاب بشرح مرسوم لا يُنسى.',
    },
    rating: 4.6, reviews: 88, pricePerHour: 35,
    weekly: { mon: ['16:30'], thu: ['16:30', '18:00'] },
  },
  {
    id: 'ines-test', title: 'prof', firstName: 'Inès', lastName: 'Test',
    subject: 'french', levels: ['bac', 'all-levels'], city: 'bizerte', languages: ['fr', 'ar'],
    bio: {
      en: 'French teacher. Essays, text commentary and oral practice, one clear method at a time.',
      fr: 'Professeure de français. Dissertation, commentaire et oral, une méthode claire à la fois.',
      ar: 'أستاذة لغة فرنسية. المقال وشرح النصّ والتعبير الشفوي، بمنهجية واضحة في كلّ مرّة.',
    },
    rating: 4.7, reviews: 52, pricePerHour: 35,
    weekly: {}, // fully booked this week
  },
  {
    id: 'walid-maquette', title: 'dr', firstName: 'Walid', lastName: 'Maquette',
    subject: 'mathematics', levels: ['prepa', 'university'], city: 'nabeul', languages: ['fr', 'en'],
    bio: {
      en: 'University lecturer in applied maths. Analysis, linear algebra and statistics, with a focus on rigorous proofs.',
      fr: 'Maître de conférences en maths appliquées. Analyse, algèbre linéaire et statistiques, avec des preuves rigoureuses.',
      ar: 'محاضر جامعي في الرياضيات التطبيقية. التحليل والجبر الخطّي والإحصاء، مع التركيز على البراهين الدقيقة.',
    },
    rating: 4.8, reviews: 67, pricePerHour: 55,
    weekly: { wed: ['17:00'], fri: ['18:30'], sun: ['15:00'] },
  },
]

// Fictional reviews: [author, rating, { en, fr, ar }, days ago]
const REVIEW_TEXTS = [
  ['Yasmine B.', 5, {
    en: 'Super clear and patient. I finally understood what I had been stuck on for weeks.',
    fr: 'Super claire et patiente. J’ai enfin compris ce qui me bloquait depuis des semaines.',
    ar: 'واضحة جدًّا وصبورة. فهمت أخيرًا ما كان يعطّلني منذ أسابيع.',
  }, 3],
  ['Omar K.', 5, {
    en: 'Every session starts with what I actually need. My marks went up in one term.',
    fr: 'Chaque séance part de ce dont j’ai vraiment besoin. Mes notes ont monté en un trimestre.',
    ar: 'كلّ حصّة تنطلق ممّا أحتاجه فعلًا. ارتفعت أعدادي في ثلاثية واحدة.',
  }, 10],
  ['Nour H.', 4, {
    en: 'Great explanations and useful summary sheets. Sessions sometimes run a little late.',
    fr: 'Très bonnes explications et fiches de résumé utiles. Les séances finissent parfois un peu en retard.',
    ar: 'شرح ممتاز وملخّصات مفيدة. أحيانًا تتأخّر الحصص قليلًا.',
  }, 18],
  ['Sami T.', 5, {
    en: 'Friendly, well prepared and always on time. Highly recommended before exams.',
    fr: 'Sympa, bien préparé et toujours à l’heure. Je recommande vivement avant les examens.',
    ar: 'لطيف ومستعدّ جيّدًا ودائمًا في الموعد. أنصح به بشدّة قبل الامتحانات.',
  }, 27],
  ['Rania M.', 4, {
    en: 'Very good method. I would love a few more practice exercises to do alone.',
    fr: 'Très bonne méthode. J’aimerais juste quelques exercices en plus à faire seule.',
    ar: 'منهجية جيّدة جدًّا. أتمنّى فقط بعض التمارين الإضافية لأحلّها وحدي.',
  }, 40],
]

// Error messages the fake API returns, in the student's language
const ERRORS = {
  notFound: { en: 'Professor not found.', fr: 'Professeur introuvable.', ar: 'الأستاذ غير موجود.' },
  length: { en: 'Please choose 1 h, 1 h 30 or 2 h.', fr: 'Choisis 1 h, 1 h 30 ou 2 h.', ar: 'اختر ساعة أو ساعة ونصف أو ساعتين.' },
  unavailable: {
    en: 'This time isn’t available. Please pick one from the list.',
    fr: 'Ce créneau n’est pas disponible. Choisis-en un dans la liste.',
    ar: 'هذا الموعد غير متاح. اختر موعدًا من القائمة.',
  },
  overlap: {
    en: 'This class would overlap another booking. Please pick another time or a shorter session.',
    fr: 'Ce cours chevaucherait une autre réservation. Choisis un autre créneau ou une séance plus courte.',
    ar: 'هذه الحصّة تتداخل مع حجز آخر. اختر موعدًا آخر أو حصّة أقصر.',
  },
}

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

// FAKE: the class the welcome notification talks about ("Saturday at 10:30" with Prof. Amel),
// so the dashboard's "Your week" shows a next class. Next Saturday in Tunis time, 1 h.
{
  const today = tunisToday()
  const daysToSaturday = (6 - new Date(`${today}T00:00:00Z`).getUTCDay() + 7) % 7 || 7
  const start = Date.parse(`${addDays(today, daysToSaturday)}T10:30:00${TUNIS_OFFSET}`)
  BOOKINGS.push({
    id: 'bk-seed',
    profId: 'amel-exemple',
    startsAt: toTunisISO(start),
    endsAt: toTunisISO(start + 60 * 60_000),
    durationMinutes: 60,
    price: 45,
    status: 'confirmed',
  })
}

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

// What the API sends for a professor: bio in the requested language, no `weekly`, plus the next free start (ISO) or null
function publicProfessor(prof) {
  const { weekly, bio, ...rest } = prof // eslint-disable-line no-unused-vars
  return { ...rest, bio: pick(bio), nextSlot: freeSlots(prof)[0] ?? null }
}

// "Prof. Amel Exemple" in a given language (fake notifications only; the UI uses lib/people.js)
const nameIn = (prof, lng) => `${i18n.t(`titles.${prof.title}`, { lng })} ${prof.firstName} ${prof.lastName}`

// price range: 'under-40' | '40-50' | 'over-50'
const PRICE_RANGES = {
  'under-40': (p) => p < 40,
  '40-50': (p) => p >= 40 && p <= 50,
  'over-50': (p) => p > 50,
}

// subject, city, language = ids. q matches the name, the subject and the city (in the current language too).
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
        (!q ||
          matches(`${p.firstName} ${p.lastName} ${p.subject} ${i18n.t(`subjects.${p.subject}`)} ${i18n.t(`cities.${p.city}`)}`, q)),
    )
      .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
      .map(publicProfessor),
  )
}

// Ids for the filter chips (the UI translates and sorts them)
// TODO(backend): api.get('/professors/filters')
export async function getProfessorFilters() {
  await wait()
  const unique = (list) => [...new Set(list)].sort()
  return {
    subjects: unique(PROFESSORS.map((p) => p.subject)),
    cities: unique(PROFESSORS.map((p) => p.city)),
    languages: ['ar', 'fr', 'en'].filter((l) => PROFESSORS.some((p) => p.languages.includes(l))),
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
  if (!found) throw new Error(pick(ERRORS.notFound))
  return { timeZone: 'Africa/Tunis', slots: freeSlots(found, durationMinutes) }
}

// Reviews are shown in the language they were written in by the real API; the fake has them in all 3.
// TODO(backend): api.get(`/professors/${profId}/reviews`)
export async function getProfessorReviews(profId) {
  await wait()
  // Deterministic fake: each professor gets the same 3–5 reviews every time
  const count = 3 + (profId.length % 3)
  return REVIEW_TEXTS.slice(0, count).map(([author, rating, text, ago], i) => ({
    id: `${profId}-r${i + 1}`,
    author,
    rating,
    text: pick(text),
    createdAt: daysAgo(ago),
  }))
}

// Book a class starting at `startsAt` (ISO date-time). Resolves with the booking; overlapping
// times disappear from the availability and a notification is created.
// TODO(backend): api.post(`/professors/${profId}/bookings`, { startsAt, durationMinutes })
export async function bookSlot(profId, { startsAt, durationMinutes }) {
  await wait(700, 1100)
  const prof = PROFESSORS.find((p) => p.id === profId)
  if (!prof) throw new Error(pick(ERRORS.notFound))
  if (!SESSION_LENGTHS.includes(durationMinutes)) throw new Error(pick(ERRORS.length))
  const start = Date.parse(startsAt)
  if (!weeklySlots(prof).includes(start)) throw new Error(pick(ERRORS.unavailable))
  if (!isFree(prof, start, durationMinutes)) throw new Error(pick(ERRORS.overlap))

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
  // Written when it's read, so it follows the language the student uses at that moment
  addNotification({
    type: 'booking',
    link: `/dashboard/professors/${profId}`,
    text: (lng) => {
      const name = nameIn(prof, lng)
      const when = formatSlotStart(booking.startsAt, lng)
      return pick(
        {
          en: { title: 'Class booked', body: `Your session with ${name} is booked: ${when}.` },
          fr: { title: 'Cours réservé', body: `Ta séance avec ${name} est réservée : ${when}.` },
          ar: { title: 'تمّ حجز الحصّة', body: `حصّتك مع ${name} محجوزة: ${when}.` },
        },
        lng,
      )
    },
  })
  return copy(booking)
}

// FAKE only (used by services/week.js): the student's next upcoming class, with the professor's name
export function fakeNextBooking() {
  const next = BOOKINGS.filter((b) => Date.parse(b.startsAt) > Date.now()).sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0]
  if (!next) return null
  const prof = PROFESSORS.find((p) => p.id === next.profId)
  return copy({ ...next, professor: { id: prof.id, title: prof.title, firstName: prof.firstName, lastName: prof.lastName, subject: prof.subject } })
}
