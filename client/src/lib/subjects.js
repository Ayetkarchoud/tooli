// One icon per school subject (course covers, filters…): <SubjectIcon subject="Physics" className="size-6" />
import { createElement } from 'react'
import { Atom, BookOpen, Calculator, Code2, FlaskConical, Languages, Leaf, PenLine } from 'lucide-react'

const ICONS = {
  Mathematics: Calculator,
  Physics: Atom,
  Chemistry: FlaskConical,
  Biology: Leaf,
  'Computer science': Code2,
  English: Languages,
  French: PenLine,
}

export function SubjectIcon({ subject, ...props }) {
  return createElement(ICONS[subject] ?? BookOpen, props)
}
