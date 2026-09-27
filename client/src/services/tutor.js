// AI tutor chats + learning tips (FAKE for now: see docs/api.md for the real endpoints).
// The fake tutor picks a canned step-by-step answer by keyword.

import { copy, daysAgo, hoursAgo, matches, minutesAgo, wait } from './fake.js'

const CHATS = [
  {
    id: 'photosynthesis',
    title: 'Photosynthesis in simple words',
    updatedAt: hoursAgo(3),
    messages: [
      { id: 'm1', role: 'user', text: 'Can you explain photosynthesis simply?', createdAt: hoursAgo(3) },
      {
        id: 'm2', role: 'tutor', createdAt: hoursAgo(3),
        text: 'Sure! Think of a leaf as a tiny kitchen.\n1. Ingredients: water from the roots and CO₂ from the air.\n2. Energy: sunlight, caught by chlorophyll (the green pigment).\n3. Recipe: 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂.\n4. Result: glucose feeds the plant, oxygen goes out into the air.\nQuick check: where does the oxygen come from? (Answer: the water!)',
      },
    ],
  },
  {
    id: 'equation-2x5',
    title: 'Solving 2x + 5 = 13',
    updatedAt: daysAgo(1),
    messages: [
      { id: 'm1', role: 'user', text: 'How do I solve 2x + 5 = 13?', createdAt: daysAgo(1) },
      {
        id: 'm2', role: 'tutor', createdAt: daysAgo(1),
        text: 'Goal: get x alone.\n1. Remove the +5 on both sides: 2x = 13 − 5 = 8.\n2. Divide both sides by 2: x = 8 ÷ 2 = 4.\n3. Check: 2 × 4 + 5 = 13 ✓\nSo x = 4.',
      },
    ],
  },
  {
    id: 'bac-revision-plan',
    title: 'A revision plan for the bac',
    updatedAt: daysAgo(4),
    messages: [
      { id: 'm1', role: 'user', text: 'I have 6 weeks before the bac. How should I revise?', createdAt: daysAgo(4) },
      {
        id: 'm2', role: 'tutor', createdAt: daysAgo(4),
        text: 'Here is a simple plan:\n1. Week 1: list every chapter and mark it green, orange or red.\n2. Weeks 2–4: red chapters first, 2 subjects a day, 25-minute blocks.\n3. Week 5: past bac exams in real conditions.\n4. Week 6: light review of your summary sheets, and sleep well.\nWant me to turn this into a day-by-day schedule?',
      },
    ],
  },
]

// Canned answers: the first entry whose keywords match the question wins
const ANSWERS = [
  {
    keywords: ['equation', 'équation', 'solve', '='],
    text: 'Let’s solve it step by step.\n1. Move the numbers without x to the other side (change their sign).\n2. Group the x terms together.\n3. Divide by the number in front of x.\n4. Plug your answer back in to check it.\nSend me your exact equation and I’ll walk through it with you.',
  },
  {
    keywords: ['photosynth', 'plant', 'leaf', 'cell', 'dna', 'gene', 'svt', 'biology'],
    text: 'Good biology question! Here’s how to think about it.\n1. Start from the big picture: what goes in, what comes out.\n2. Name the place where it happens (organ, cell, organelle).\n3. Write the key equation or diagram.\n4. Finish with one real-life example.\nWhich part would you like me to go deeper on?',
  },
  {
    keywords: ['english', 'vocabulary', 'grammar', 'speak', 'french', 'essay', 'dissertation'],
    text: 'Languages get easier with small daily habits.\n1. 15 minutes a day beats 2 hours on Sunday.\n2. Learn words in sentences, not lists.\n3. Speak out loud, even alone: record yourself and listen back.\n4. Read one short article a day on a topic you like.\nShall I give you a 7-day practice plan?',
  },
  {
    keywords: ['physics', 'force', 'energy', 'newton', 'speed', 'chemistry'],
    text: 'Let’s break the problem down.\n1. Draw the situation and list what you know (with units).\n2. Write what you are looking for.\n3. Pick the law that links them (Newton, energy conservation…).\n4. Solve with letters first, numbers last, and check the units.\nSend me the exercise and we’ll do it together.',
  },
]
const DEFAULT_ANSWER =
  'Great question! Here’s a way to tackle it.\n1. Rephrase the question in your own words.\n2. Write down what you already know about it.\n3. Find the one idea you are missing: that’s what we’ll learn now.\n4. Try a small example to check you understood.\nTell me a bit more (subject and level) and I’ll give you a precise explanation.'

const LEARNING_TIPS = [
  'Study in 25-minute blocks with 5-minute breaks. Your focus stays sharp much longer.',
  'Explain a new idea out loud as if teaching a friend. Gaps in your understanding show up fast.',
  'Test yourself instead of re-reading. Recalling an answer makes it stick far better.',
  'Review your notes the next day, then after a week. Spaced reviews beat one long session.',
  'Put your phone in another room while studying. Even a silent phone pulls at your attention.',
  'Mix different types of exercises in one session. It trains you to pick the right method.',
  'Sleep is part of studying: your brain stores what you learned while you rest.',
  'Stuck on a problem? Write down exactly where you are stuck, then ask tooli about that step.',
]

// Chat list without the messages, newest first
// TODO(backend): api.get('/tutor/chats')
export async function listChats() {
  await wait()
  return copy(
    [...CHATS]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map(({ messages, ...chat }) => ({ ...chat, lastMessage: messages.at(-1)?.text ?? '' })),
  )
}

// Returns null when the chat doesn't exist (the API answers 404)
// TODO(backend): api.get(`/tutor/chats/${chatId}`)
export async function getChat(chatId) {
  await wait()
  const found = CHATS.find((c) => c.id === chatId)
  return found ? copy(found) : null
}

// Ask a question. Without chatId a new chat is created (titled after the question).
// Resolves with { chatId, question, answer } once the tutor has "thought" about it.
// TODO(backend): api.post('/tutor/messages', { chatId, question })
export async function sendMessage({ chatId, question }) {
  const text = question.trim()
  if (!text) throw new Error('Please type a question first.')
  await wait(900, 1600) // the tutor takes a moment to think

  let chat = CHATS.find((c) => c.id === chatId)
  if (!chat) {
    chat = { id: `chat-${Date.now()}`, title: text.length > 48 ? `${text.slice(0, 45)}…` : text, messages: [] }
    CHATS.push(chat)
  }
  const now = minutesAgo(0)
  const asked = { id: `m${chat.messages.length + 1}`, role: 'user', text, createdAt: now }
  const lower = text.toLowerCase()
  const answerText = ANSWERS.find((a) => a.keywords.some((k) => lower.includes(k)))?.text ?? DEFAULT_ANSWER
  const answer = { id: `m${chat.messages.length + 2}`, role: 'tutor', text: answerText, createdAt: now }
  chat.messages.push(asked, answer)
  chat.updatedAt = now
  return copy({ chatId: chat.id, question: asked, answer })
}

// Short study tips (dashboard "Tip of the day", search)
// TODO(backend): api.get(`/tips?q=${q}`)
export async function getLearningTips({ q } = {}) {
  await wait()
  return copy(LEARNING_TIPS.map((text, i) => ({ id: `tip-${i + 1}`, text })).filter((tip) => !q || matches(tip.text, q)))
}
