// Partner courses (FAKE for now: see docs/api.md for the real endpoints).
// All platforms, courses and numbers below are fictional.

import { copy, matches, wait } from './fake.js'

// The 4 partner platforms. `cover` = palette token used as the card's placeholder colour:
// style={{ background: `var(--palette-${cover})` }}
export const PLATFORMS = [
  { id: 'learnsphere', name: 'LearnSphere', cover: 'blue' },
  { id: 'codenest', name: 'CodeNest', cover: 'violet' },
  { id: 'lingualab', name: 'LinguaLab', cover: 'red' },
  { id: 'bacboost', name: 'BacBoost', cover: 'green' },
]

export const LEVELS = ['Bac', 'Prépa', 'University', 'All levels']

// Build a course: lesson = [title, minutes, done?]. Duration and progress are computed.
function course({ id, platform, title, subject, level, rating, reviews, lessons }) {
  const list = lessons.map(([lessonTitle, minutes, done = false], i) => ({
    id: `${id}-l${i + 1}`,
    title: lessonTitle,
    minutes,
    done,
  }))
  const doneCount = list.filter((l) => l.done).length
  return {
    id,
    platform: PLATFORMS.find((p) => p.id === platform),
    title,
    subject,
    level,
    rating,
    reviews,
    durationMinutes: list.reduce((sum, l) => sum + l.minutes, 0),
    lessons: list,
    // null = not started, 0–100 = the user's progress
    progress: doneCount ? Math.round((doneCount / list.length) * 100) : null,
  }
}

const COURSES = [
  course({
    id: 'algebra-basics', platform: 'learnsphere', title: 'Algebra basics: equations and inequalities',
    subject: 'Mathematics', level: 'Bac', rating: 4.8, reviews: 412,
    lessons: [['Linear equations', 18, true], ['Systems of two equations', 22, true], ['Inequalities and intervals', 20, true], ['Absolute values', 16], ['Bac exam practice', 30]],
  }),
  course({
    id: 'derivatives-bac', platform: 'bacboost', title: 'Derivatives for the bac, step by step',
    subject: 'Mathematics', level: 'Bac', rating: 4.9, reviews: 638,
    lessons: [['What a derivative means', 15], ['Derivative rules', 25], ['Tangent lines', 20], ['Variations of a function', 28], ['Past bac exercises', 35]],
  }),
  course({
    id: 'python-beginners', platform: 'codenest', title: 'Python for beginners',
    subject: 'Computer science', level: 'All levels', rating: 4.7, reviews: 1204,
    lessons: [['Your first program', 12, true], ['Variables and types', 18, true], ['Conditions', 20], ['Loops', 24], ['Functions', 26], ['Mini project: quiz game', 40]],
  }),
  course({
    id: 'english-b2-speaking', platform: 'lingualab', title: 'English B2: speaking with confidence',
    subject: 'English', level: 'All levels', rating: 4.6, reviews: 356,
    lessons: [['Talking about yourself', 15, true], ['Giving your opinion', 20], ['Storytelling in the past', 22], ['Debates and discussions', 25], ['Oral exam simulation', 30], ['Pronunciation clinic', 18], ['Final speaking challenge', 20], ['Review', 12]],
  }),
  course({
    id: 'physics-mechanics', platform: 'learnsphere', title: 'Mechanics: forces and motion',
    subject: 'Physics', level: 'Bac', rating: 4.7, reviews: 289,
    lessons: [["Newton's laws", 24], ['Free fall', 20], ['Projectile motion', 26], ['Energy and work', 22]],
  }),
  course({
    id: 'svt-genetics', platform: 'bacboost', title: 'SVT: genetics made simple',
    subject: 'Biology', level: 'Bac', rating: 4.8, reviews: 377,
    lessons: [['DNA and genes', 18], ['Mendel and heredity', 22], ['Genetic crosses', 26], ['Bac-style problems', 30]],
  }),
  course({
    id: 'prepa-analysis', platform: 'learnsphere', title: 'Prépa analysis: sequences and series',
    subject: 'Mathematics', level: 'Prépa', rating: 4.9, reviews: 198,
    lessons: [['Limits of sequences', 30], ['Monotonic sequences', 28], ['Series and convergence', 35], ['Classic concours exercises', 45]],
  }),
  course({
    id: 'prepa-chemistry', platform: 'bacboost', title: 'Prépa chemistry: thermodynamics',
    subject: 'Chemistry', level: 'Prépa', rating: 4.6, reviews: 143,
    lessons: [['First principle', 30], ['Enthalpy', 28], ['Second principle and entropy', 32], ['Chemical equilibrium', 34]],
  }),
  course({
    id: 'web-html-css', platform: 'codenest', title: 'Build your first website with HTML and CSS',
    subject: 'Computer science', level: 'All levels', rating: 4.8, reviews: 954,
    lessons: [['How the web works', 10], ['HTML structure', 20], ['Styling with CSS', 25], ['Layouts with flexbox', 28], ['Publish your site', 15]],
  }),
  course({
    id: 'uni-statistics', platform: 'learnsphere', title: 'Statistics for university students',
    subject: 'Mathematics', level: 'University', rating: 4.5, reviews: 221,
    lessons: [['Describing data', 22], ['Probability basics', 26], ['Normal distribution', 28], ['Hypothesis tests', 32]],
  }),
  course({
    id: 'french-bac-essay', platform: 'lingualab', title: 'Français: réussir la dissertation du bac',
    subject: 'French', level: 'Bac', rating: 4.7, reviews: 305,
    lessons: [['Understanding the subject', 18], ['Building a plan', 22], ['Writing the introduction', 20], ['Arguments and examples', 26], ['Conclusion and review', 16]],
  }),
  course({
    id: 'uni-algorithms', platform: 'codenest', title: 'Algorithms and data structures',
    subject: 'Computer science', level: 'University', rating: 4.8, reviews: 467,
    lessons: [['Complexity and big O', 25], ['Sorting algorithms', 30], ['Stacks, queues and lists', 28], ['Trees', 32], ['Graphs', 35]],
  }),
]

// TODO(backend): api.get(`/courses?subject=${subject}&level=${level}&q=${q}`)
export async function listCourses({ subject, level, q } = {}) {
  await wait()
  return copy(
    COURSES.filter(
      (c) =>
        (!subject || c.subject === subject) &&
        (!level || c.level === level) &&
        (!q || matches(`${c.title} ${c.subject} ${c.platform.name}`, q)),
    ),
  )
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
  const doneCount = found.lessons.filter((l) => l.done).length
  found.progress = doneCount ? Math.round((doneCount / found.lessons.length) * 100) : null
  return copy(found)
}
