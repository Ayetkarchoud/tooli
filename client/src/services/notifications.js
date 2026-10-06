// Notifications (FAKE for now: see docs/api.md for the real endpoints).
// type: 'course' | 'booking' | 'tip' | 'system'. `link` = where clicking it goes (or null).
// title and body come in the requested language (the fake stores en / fr / ar).

import { copy, currentLanguage, daysAgo, hoursAgo, minutesAgo, pick, wait } from './fake.js'

// text: { en: { title, body }, fr: …, ar: … } or a function (lang) → { title, body }
const NOTIFICATIONS = [
  {
    id: 'n1', type: 'booking', read: false, createdAt: minutesAgo(25),
    link: '/dashboard/professors/amel-exemple',
    text: {
      en: { title: 'Class confirmed', body: 'Your session with Prof. Amel Exemple is booked for Saturday at 10:30.' },
      fr: { title: 'Cours confirmé', body: 'Ta séance avec Prof. Amel Exemple est réservée pour samedi à 10:30.' },
      ar: { title: 'تمّ تأكيد الحصّة', body: 'حصّتك مع الأستاذة آمال Exemple محجوزة يوم السبت على الساعة 10:30.' },
    },
  },
  {
    id: 'n2', type: 'course', read: false, createdAt: hoursAgo(5),
    link: '/dashboard/courses/algebra-basics',
    text: {
      en: { title: 'New lesson available', body: '“Absolute values” is now open in Algebra basics. You are 60% through the course!' },
      fr: { title: 'Nouvelle leçon disponible', body: '« Valeurs absolues » est ouverte dans Bases de l’algèbre. Tu as déjà fait 60 % du cours !' },
      ar: { title: 'درس جديد متاح', body: 'درس «القيمة المطلقة» متاح الآن في أساسيات الجبر. أنهيت 60% من الدرس!' },
    },
  },
  {
    id: 'n3', type: 'tip', read: false, createdAt: daysAgo(1),
    link: null,
    text: {
      en: { title: 'Tip of the day', body: 'Test yourself instead of re-reading. Recalling an answer makes it stick far better.' },
      fr: { title: 'L’astuce du jour', body: 'Teste-toi au lieu de relire. Retrouver une réponse de mémoire la fixe bien mieux.' },
      ar: { title: 'نصيحة اليوم', body: 'اختبر نفسك بدل إعادة القراءة. تذكّر الإجابة من الذاكرة يثبّتها أكثر بكثير.' },
    },
  },
  {
    id: 'n4', type: 'course', read: true, createdAt: daysAgo(2),
    link: '/dashboard/courses/python-beginners',
    text: {
      en: { title: 'Keep your streak going', body: 'You haven’t opened Python for beginners in 3 days. Ten minutes today?' },
      fr: { title: 'Garde le rythme', body: 'Tu n’as pas ouvert Python pour débutants depuis 3 jours. Dix minutes aujourd’hui ?' },
      ar: { title: 'حافظ على نسقك', body: 'لم تفتح درس بايثون للمبتدئين منذ 3 أيام. عشر دقائق اليوم؟' },
    },
  },
  {
    id: 'n5', type: 'system', read: true, createdAt: daysAgo(5),
    link: '/dashboard',
    text: {
      en: { title: 'Welcome to tooli!', body: 'Ask the AI tutor, follow partner courses or book a VIP professor. We’re happy you’re here.' },
      fr: { title: 'Bienvenue sur tooli !', body: 'Pose tes questions au tuteur IA, suis des cours partenaires ou réserve un prof VIP. On est contents de t’avoir ici.' },
      ar: { title: 'مرحبًا بك في tooli!', body: 'اسأل المرشد الذكي، تابع دروس شركائنا أو احجز أستاذًا VIP. سعداء بوجودك معنا.' },
    },
  },
  {
    id: 'n6', type: 'booking', read: true, createdAt: daysAgo(8),
    link: '/dashboard/professors/karim-demo',
    text: {
      en: { title: 'How was your class?', body: 'Rate your session with Dr. Karim Demo to help other students choose.' },
      fr: { title: 'Comment s’est passé ton cours ?', body: 'Note ta séance avec Dr Karim Demo pour aider les autres élèves à choisir.' },
      ar: { title: 'كيف كانت حصّتك؟', body: 'قيّم حصّتك مع الدكتور كريم Demo لتساعد بقية التلاميذ على الاختيار.' },
    },
  },
]

// What the API sends: title and body in the requested language
function publicNotification({ text, ...rest }) {
  const lang = currentLanguage()
  const { title, body } = typeof text === 'function' ? text(lang) : pick(text, lang)
  return { ...rest, title, body }
}

// FAKE only: lets other fake services create a notification (e.g. after a booking).
// `text` like above. The real backend creates these itself, so there is no endpoint for it.
export function addNotification({ type, text, link = null }) {
  NOTIFICATIONS.push({ id: `n${Date.now()}`, type, read: false, createdAt: new Date().toISOString(), text, link })
}

// Newest first
// TODO(backend): api.get('/notifications')
export async function listNotifications() {
  await wait()
  return copy([...NOTIFICATIONS].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(publicNotification))
}

// TODO(backend): (await api.get('/notifications/unread-count')).count
export async function getUnreadCount() {
  await wait()
  return NOTIFICATIONS.filter((n) => !n.read).length
}

// TODO(backend): api.post(`/notifications/${id}/read`)
export async function markAsRead(id) {
  await wait()
  const found = NOTIFICATIONS.find((n) => n.id === id)
  if (found) found.read = true
}

// TODO(backend): api.post('/notifications/read-all')
export async function markAllAsRead() {
  await wait()
  NOTIFICATIONS.forEach((n) => {
    n.read = true
  })
}
