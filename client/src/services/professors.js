// VIP professors (FAKE for now: see docs/api.md for the real endpoints).
// All names below are fictional.

import { copy, matches, wait } from './fake.js'

export const CITIES = ['Tunis', 'Sousse', 'Monastir', 'Sfax', 'Bizerte', 'Nabeul']

// slots: free times this week, day = 'mon' … 'sun', time = 'HH:MM' (Tunisia time)
const PROFESSORS = [
  {
    id: 'amel-exemple', title: 'Prof.', firstName: 'Amel', lastName: 'Exemple',
    subject: 'Mathematics', levels: ['Bac', 'Prépa'], city: 'Tunis', languages: ['Arabic', 'French'],
    bio: 'Maths teacher for 15 years in a pilot high school. I help bac students turn exercises they fear into points they are sure of.',
    rating: 4.9, reviews: 128, pricePerHour: 45,
    slots: [{ day: 'mon', times: ['17:00', '18:30'] }, { day: 'wed', times: ['16:00'] }, { day: 'sat', times: ['09:00', '10:30', '14:00'] }],
  },
  {
    id: 'karim-demo', title: 'Dr.', firstName: 'Karim', lastName: 'Demo',
    subject: 'Physics', levels: ['Bac', 'University'], city: 'Sousse', languages: ['Arabic', 'French', 'English'],
    bio: 'PhD in physics. I explain mechanics and electricity with everyday examples, then we practise until it clicks.',
    rating: 4.8, reviews: 96, pricePerHour: 50,
    slots: [{ day: 'tue', times: ['18:00'] }, { day: 'thu', times: ['17:30', '19:00'] }, { day: 'sun', times: ['10:00'] }],
  },
  {
    id: 'sonia-sample', title: 'Prof.', firstName: 'Sonia', lastName: 'Sample',
    subject: 'English', levels: ['Bac', 'University', 'All levels'], city: 'Monastir', languages: ['English', 'French', 'Arabic'],
    bio: 'Cambridge-certified English teacher. Speaking practice, exam preparation and a lot of confidence building.',
    rating: 4.7, reviews: 143, pricePerHour: 40,
    slots: [{ day: 'mon', times: ['19:00'] }, { day: 'fri', times: ['17:00', '18:00'] }, { day: 'sat', times: ['11:00'] }],
  },
  {
    id: 'youssef-fictif', title: 'Prof.', firstName: 'Youssef', lastName: 'Fictif',
    subject: 'Computer science', levels: ['Bac', 'University'], city: 'Sfax', languages: ['Arabic', 'French', 'English'],
    bio: 'Software engineer and teacher. Algorithms for the bac info section, Python and web projects for everyone else.',
    rating: 4.8, reviews: 74, pricePerHour: 45,
    slots: [{ day: 'wed', times: ['18:00', '19:30'] }, { day: 'sat', times: ['15:00'] }],
  },
  {
    id: 'leila-modele', title: 'Dr.', firstName: 'Leila', lastName: 'Modèle',
    subject: 'Chemistry', levels: ['Prépa', 'University'], city: 'Tunis', languages: ['French', 'Arabic'],
    bio: 'Former prépa teacher. Thermodynamics and organic chemistry for concours, with clear method sheets after every session.',
    rating: 4.9, reviews: 61, pricePerHour: 60,
    slots: [{ day: 'tue', times: ['17:00'] }, { day: 'thu', times: ['18:00'] }, { day: 'sun', times: ['09:30', '11:00'] }],
  },
  {
    id: 'mehdi-essai', title: 'Prof.', firstName: 'Mehdi', lastName: 'Essai',
    subject: 'Biology', levels: ['Bac'], city: 'Monastir', languages: ['Arabic', 'French'],
    bio: 'SVT teacher who loves diagrams. Genetics, immunology and neurology explained with drawings you will remember.',
    rating: 4.6, reviews: 88, pricePerHour: 35,
    slots: [{ day: 'mon', times: ['16:30'] }, { day: 'thu', times: ['16:30', '18:00'] }],
  },
  {
    id: 'ines-test', title: 'Prof.', firstName: 'Inès', lastName: 'Test',
    subject: 'French', levels: ['Bac', 'All levels'], city: 'Bizerte', languages: ['French', 'Arabic'],
    bio: 'Professeure de français. Dissertation, commentaire and oral practice, one clear method at a time.',
    rating: 4.7, reviews: 52, pricePerHour: 35,
    slots: [{ day: 'tue', times: ['18:30'] }, { day: 'sat', times: ['10:00', '16:00'] }],
  },
  {
    id: 'walid-maquette', title: 'Dr.', firstName: 'Walid', lastName: 'Maquette',
    subject: 'Mathematics', levels: ['Prépa', 'University'], city: 'Nabeul', languages: ['French', 'English'],
    bio: 'University lecturer in applied maths. Analysis, linear algebra and statistics, with a focus on rigorous proofs.',
    rating: 4.8, reviews: 67, pricePerHour: 55,
    slots: [{ day: 'wed', times: ['17:00'] }, { day: 'fri', times: ['18:30'] }, { day: 'sun', times: ['15:00'] }],
  },
]

// TODO(backend): api.get(`/professors?subject=${subject}&city=${city}&q=${q}`)
export async function listProfessors({ subject, city, q } = {}) {
  await wait()
  return copy(
    PROFESSORS.filter(
      (p) =>
        (!subject || p.subject === subject) &&
        (!city || p.city === city) &&
        (!q || matches(`${p.firstName} ${p.lastName} ${p.subject} ${p.city}`, q)),
    ),
  )
}

// Best rated first
// TODO(backend): api.get(`/professors/top?limit=${limit}`)
export async function getTopProfessors(limit = 3) {
  await wait()
  return copy([...PROFESSORS].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews).slice(0, limit))
}

// Returns null when the professor doesn't exist (the API answers 404)
// TODO(backend): api.get(`/professors/${profId}`)
export async function getProfessor(profId) {
  await wait()
  const found = PROFESSORS.find((p) => p.id === profId)
  return found ? copy(found) : null
}

// Book one free slot. The slot disappears from the professor's list.
// TODO(backend): api.post(`/professors/${profId}/bookings`, { day, time })
export async function bookSlot(profId, { day, time }) {
  await wait(500, 900)
  const prof = PROFESSORS.find((p) => p.id === profId)
  const slot = prof?.slots.find((s) => s.day === day)
  if (!slot || !slot.times.includes(time)) throw new Error('This time is no longer free. Please pick another one.')
  slot.times = slot.times.filter((t) => t !== time)
  return { id: `bk-${Date.now()}`, profId, day, time, price: prof.pricePerHour, status: 'confirmed' }
}
