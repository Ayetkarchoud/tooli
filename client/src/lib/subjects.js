// One icon per school subject (course covers, filters…): <SubjectIcon subject="physics" className="size-6" />
// Subjects are ids ('mathematics', 'computer-science'…); their names come from t(`subjects.${id}`).
import { createElement } from 'react'
import { Atom, BookOpen, Calculator, Code2, FlaskConical, Languages, Leaf, PenLine } from 'lucide-react'

const ICONS = {
  mathematics: Calculator,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Leaf,
  'computer-science': Code2,
  english: Languages,
  french: PenLine,
}

export const SUBJECT_IDS = Object.keys(ICONS)

export function SubjectIcon({ subject, ...props }) {
  return createElement(ICONS[subject] ?? BookOpen, props)
}
