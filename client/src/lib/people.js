import i18n from './i18n.js'

// "Ayet Karchoud" → "AK" (for avatars)
export function getInitials(person) {
  return [person.firstName, person.lastName]
    .map((name) => (name ?? '').trim())
    .filter(Boolean)
    .map((name) => name[0].toUpperCase())
    .join('')
}

// "Prof. Amel Exemple" / "Pr Amel Exemple" / "الأستاذة أمل…": `title` is an id ('prof' | 'dr'), translated here
export const fullName = (person) =>
  [person.title && i18n.t(`titles.${person.title}`), person.firstName, person.lastName].filter(Boolean).join(' ')
