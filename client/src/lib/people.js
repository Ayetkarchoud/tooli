// "Ayet Karchoud" → "AK" (for avatars)
export function getInitials(person) {
  return [person.firstName, person.lastName]
    .map((name) => (name ?? '').trim())
    .filter(Boolean)
    .map((name) => name[0].toUpperCase())
    .join('')
}

export const fullName = (person) => [person.title, person.firstName, person.lastName].filter(Boolean).join(' ')
