// Partner courses (FAKE for now: see docs/api.md for the real endpoints).
// All platforms, courses and numbers below are fictional.

import { copy, daysAgo, matches, wait } from './fake.js'

// The 4 partner platforms. `cover` = palette token used for the card cover:
// var(--palette-<cover>). `url` = where "Start" will send the student.
const PLATFORMS = [
  { id: 'learnsphere', name: 'LearnSphere', cover: 'blue', url: 'https://learnsphere.example' },
  { id: 'codenest', name: 'CodeNest', cover: 'violet', url: 'https://codenest.example' },
  { id: 'lingualab', name: 'LinguaLab', cover: 'red', url: 'https://lingualab.example' },
  { id: 'bacboost', name: 'BacBoost', cover: 'green', url: 'https://bacboost.example' },
]

const LEVELS = ['Bac', 'Prépa', 'University', 'All levels']

// Build a course: lesson = [title, minutes, done?]. Duration and progress are computed.
function course({ id, platform, title, subject, level, rating, reviews, publishedDaysAgo, description, outcomes, lessons }) {
  const list = lessons.map(([lessonTitle, minutes, done = false], i) => ({
    id: `${id}-l${i + 1}`,
    title: lessonTitle,
    minutes,
    done,
  }))
  return withProgress({
    id,
    platform: PLATFORMS.find((p) => p.id === platform),
    title,
    subject,
    level,
    rating,
    reviews,
    publishedAt: daysAgo(publishedDaysAgo),
    description,
    outcomes,
    durationMinutes: list.reduce((sum, l) => sum + l.minutes, 0),
    lessons: list,
  })
}

// progress: null = not started, 0–100 = share of lessons done
function withProgress(c) {
  const done = c.lessons.filter((l) => l.done).length
  c.progress = done ? Math.round((done / c.lessons.length) * 100) : null
  return c
}

const COURSES = [
  course({
    id: 'algebra-basics', platform: 'learnsphere', title: 'Algebra basics: equations and inequalities',
    subject: 'Mathematics', level: 'Bac', rating: 4.8, reviews: 412, publishedDaysAgo: 120,
    description: 'Master the equations and inequalities that come up in every bac maths exam, with short videos and exercises.',
    outcomes: ['Solve linear equations and systems with confidence', 'Work with inequalities and intervals', 'Handle absolute values without traps', 'Tackle bac-style exercises step by step'],
    lessons: [['Linear equations', 18, true], ['Systems of two equations', 22, true], ['Inequalities and intervals', 20, true], ['Absolute values', 16], ['Bac exam practice', 30]],
  }),
  course({
    id: 'derivatives-bac', platform: 'bacboost', title: 'Derivatives for the bac, step by step',
    subject: 'Mathematics', level: 'Bac', rating: 4.9, reviews: 638, publishedDaysAgo: 30,
    description: 'From “what is a derivative?” to full function studies, with past bac exercises corrected in detail.',
    outcomes: ['Understand what a derivative measures', 'Apply every derivative rule quickly', 'Find tangent lines', 'Study the variations of a function'],
    lessons: [['What a derivative means', 15], ['Derivative rules', 25], ['Tangent lines', 20], ['Variations of a function', 28], ['Past bac exercises', 35]],
  }),
  course({
    id: 'python-beginners', platform: 'codenest', title: 'Python for beginners',
    subject: 'Computer science', level: 'All levels', rating: 4.7, reviews: 1204, publishedDaysAgo: 200,
    description: 'Write your first programs in Python and finish with a small quiz game you can show your friends.',
    outcomes: ['Write and run Python programs', 'Use variables, conditions and loops', 'Organise code with functions', 'Build a complete mini project'],
    lessons: [['Your first program', 12, true], ['Variables and types', 18, true], ['Conditions', 20], ['Loops', 24], ['Functions', 26], ['Mini project: quiz game', 40]],
  }),
  course({
    id: 'english-b2-speaking', platform: 'lingualab', title: 'English B2: speaking with confidence',
    subject: 'English', level: 'All levels', rating: 4.6, reviews: 356, publishedDaysAgo: 75,
    description: 'Speak English more fluently with guided speaking practice, pronunciation tips and exam simulations.',
    outcomes: ['Introduce yourself and give opinions naturally', 'Tell stories in the past', 'Join debates and discussions', 'Prepare for an oral exam'],
    lessons: [['Talking about yourself', 15, true], ['Giving your opinion', 20], ['Storytelling in the past', 22], ['Debates and discussions', 25], ['Oral exam simulation', 30], ['Pronunciation clinic', 18], ['Final speaking challenge', 20], ['Review', 12]],
  }),
  course({
    id: 'physics-mechanics', platform: 'learnsphere', title: 'Mechanics: forces and motion',
    subject: 'Physics', level: 'Bac', rating: 4.7, reviews: 289, publishedDaysAgo: 60,
    description: 'Newton’s laws, free fall and energy explained with everyday examples and bac-style problems.',
    outcomes: ['Apply Newton’s three laws', 'Describe free fall and projectile motion', 'Use energy conservation', 'Draw clear force diagrams'],
    lessons: [["Newton's laws", 24], ['Free fall', 20], ['Projectile motion', 26], ['Energy and work', 22]],
  }),
  course({
    id: 'svt-genetics', platform: 'bacboost', title: 'SVT: genetics made simple',
    subject: 'Biology', level: 'Bac', rating: 4.8, reviews: 377, publishedDaysAgo: 14,
    description: 'Genes, heredity and genetic crosses made visual, with the exact problem types of the SVT bac.',
    outcomes: ['Explain DNA, genes and alleles', 'Apply Mendel’s laws', 'Solve genetic cross problems', 'Answer bac-style questions'],
    lessons: [['DNA and genes', 18], ['Mendel and heredity', 22], ['Genetic crosses', 26], ['Bac-style problems', 30]],
  }),
  course({
    id: 'prepa-analysis', platform: 'learnsphere', title: 'Prépa analysis: sequences and series',
    subject: 'Mathematics', level: 'Prépa', rating: 4.9, reviews: 198, publishedDaysAgo: 45,
    description: 'Rigorous sequences and series for prépa students, with classic concours exercises and full proofs.',
    outcomes: ['Prove limits of sequences', 'Use monotonic and adjacent sequences', 'Study convergence of series', 'Write clean concours-level proofs'],
    lessons: [['Limits of sequences', 30], ['Monotonic sequences', 28], ['Series and convergence', 35], ['Classic concours exercises', 45]],
  }),
  course({
    id: 'prepa-chemistry', platform: 'bacboost', title: 'Prépa chemistry: thermodynamics',
    subject: 'Chemistry', level: 'Prépa', rating: 4.6, reviews: 143, publishedDaysAgo: 90,
    description: 'The first and second principles, enthalpy and equilibrium, with method sheets for every type of exercise.',
    outcomes: ['Apply the first and second principles', 'Compute enthalpy and entropy changes', 'Predict chemical equilibrium', 'Use a clear method for each exercise'],
    lessons: [['First principle', 30], ['Enthalpy', 28], ['Second principle and entropy', 32], ['Chemical equilibrium', 34]],
  }),
  course({
    id: 'web-html-css', platform: 'codenest', title: 'Build your first website with HTML and CSS',
    subject: 'Computer science', level: 'All levels', rating: 4.8, reviews: 954, publishedDaysAgo: 7,
    description: 'Go from a blank page to a published personal website, one small step at a time.',
    outcomes: ['Structure pages with HTML', 'Style them with CSS', 'Build layouts with flexbox', 'Publish your site online'],
    lessons: [['How the web works', 10], ['HTML structure', 20], ['Styling with CSS', 25], ['Layouts with flexbox', 28], ['Publish your site', 15]],
  }),
  course({
    id: 'uni-statistics', platform: 'learnsphere', title: 'Statistics for university students',
    subject: 'Mathematics', level: 'University', rating: 4.5, reviews: 221, publishedDaysAgo: 150,
    description: 'Descriptive statistics, probability and hypothesis tests, with real datasets and clear intuition first.',
    outcomes: ['Describe and visualise data', 'Reason with probabilities', 'Use the normal distribution', 'Run and interpret hypothesis tests'],
    lessons: [['Describing data', 22], ['Probability basics', 26], ['Normal distribution', 28], ['Hypothesis tests', 32]],
  }),
  course({
    id: 'french-bac-essay', platform: 'lingualab', title: 'Français: réussir la dissertation du bac',
    subject: 'French', level: 'Bac', rating: 4.7, reviews: 305, publishedDaysAgo: 21,
    description: 'Une méthode claire pour analyser le sujet, construire un plan et rédiger une dissertation solide.',
    outcomes: ['Analyse any essay subject', 'Build a clear plan', 'Write a strong introduction and conclusion', 'Choose convincing arguments and examples'],
    lessons: [['Understanding the subject', 18], ['Building a plan', 22], ['Writing the introduction', 20], ['Arguments and examples', 26], ['Conclusion and review', 16]],
  }),
  course({
    id: 'uni-algorithms', platform: 'codenest', title: 'Algorithms and data structures',
    subject: 'Computer science', level: 'University', rating: 4.8, reviews: 467, publishedDaysAgo: 100,
    description: 'The algorithms and data structures every computer science student needs, with visual explanations.',
    outcomes: ['Measure complexity with big O', 'Implement the main sorting algorithms', 'Use stacks, queues, lists and trees', 'Explore graphs'],
    lessons: [['Complexity and big O', 25], ['Sorting algorithms', 30], ['Stacks, queues and lists', 28], ['Trees', 32], ['Graphs', 35]],
  }),
]

// FAKE: when lessons were marked done (ms). Starts with 3 lessons earlier this week.
const LESSONS_DONE_AT = [1, 2, 4].map((d) => Date.now() - d * 86_400_000)

// FAKE only (used by services/week.js)
export const fakeLessonsDoneSince = (ms) => LESSONS_DONE_AT.filter((t) => t >= ms).length

const SORTS = {
  popular: (a, b) => b.reviews - a.reviews,
  newest: (a, b) => b.publishedAt.localeCompare(a.publishedAt),
  shortest: (a, b) => a.durationMinutes - b.durationMinutes,
}

// sort: 'popular' (default) | 'newest' | 'shortest'. platform = platform id.
// TODO(backend): api.get('/courses', { subject, level, platform, q, sort })
export async function listCourses({ subject, level, platform, q, sort = 'popular' } = {}) {
  await wait()
  return copy(
    COURSES.filter(
      (c) =>
        (!subject || c.subject === subject) &&
        (!level || c.level === level) &&
        (!platform || c.platform.id === platform) &&
        (!q || matches(`${c.title} ${c.subject} ${c.platform.name}`, q)),
    ).sort(SORTS[sort] ?? SORTS.popular),
  )
}

// Everything the filter chips need, in display order
// TODO(backend): api.get('/courses/filters')
export async function getCourseFilters() {
  await wait()
  return copy({
    subjects: [...new Set(COURSES.map((c) => c.subject))].sort(),
    levels: LEVELS,
    platforms: PLATFORMS.map(({ id, name }) => ({ id, name })),
  })
}

// Returns null when the course doesn't exist (the API answers 404)
// TODO(backend): api.get(`/courses/${courseId}`)
export async function getCourse(courseId) {
  await wait()
  const found = COURSES.find((c) => c.id === courseId)
  return found ? copy(found) : null
}

// Courses the user has started but not finished, most advanced first
// TODO(backend): api.get('/courses/continue')
export async function getContinueLearning() {
  await wait()
  return copy(COURSES.filter((c) => c.progress > 0 && c.progress < 100).sort((a, b) => b.progress - a.progress))
}

// Mark a lesson done (or not done) and get the updated course back
// TODO(backend): api.put(`/courses/${courseId}/lessons/${lessonId}`, { done })
export async function setLessonDone(courseId, lessonId, done) {
  await wait()
  const found = COURSES.find((c) => c.id === courseId)
  const lesson = found?.lessons.find((l) => l.id === lessonId)
  if (!lesson) throw new Error('Lesson not found.')
  lesson.done = done
  if (done) LESSONS_DONE_AT.push(Date.now())
  else LESSONS_DONE_AT.pop()
  return copy(withProgress(found))
}
