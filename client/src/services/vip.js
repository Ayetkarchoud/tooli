// VIP plans and the user's subscription (FAKE for now: see docs/api.md for the real endpoints).
// Prices in Tunisian dinars (TND) per month. Plan names and features come in the requested language.

import { localDateKey } from '../lib/time.js'
import { copy, pick, wait } from './fake.js'

// Same day next month, in LOCAL time. Short months clamp the day: 31 Jan → 28 Feb (29 in leap years).
function oneMonthLater(from) {
  const year = from.getFullYear()
  const month = from.getMonth() + 1
  const lastDay = new Date(year, month + 1, 0).getDate() // day 0 of the following month = last day of `month`
  return new Date(year, month, Math.min(from.getDate(), lastDay))
}

const PLANS = [
  {
    id: 'essential', pricePerMonth: 29, highlighted: false,
    text: {
      en: { name: 'Essential', features: ['Unlimited AI tutor questions', 'All partner course summaries', '1 group class per month'] },
      fr: { name: 'Essentiel', features: ['Questions illimitées au tuteur IA', 'Tous les résumés des cours partenaires', '1 cours en groupe par mois'] },
      ar: { name: 'الأساسي', features: ['أسئلة غير محدودة للمرشد الذكي', 'كلّ ملخّصات دروس الشركاء', 'حصّة جماعية واحدة في الشهر'] },
    },
  },
  {
    id: 'plus', pricePerMonth: 59, highlighted: true,
    text: {
      en: { name: 'Plus', features: ['Everything in Essential', '2 private hours with a VIP professor', 'Personal bac or prépa revision plan', 'Priority answers from the tutor'] },
      fr: { name: 'Plus', features: ['Tout ce qu’il y a dans Essentiel', '2 heures particulières avec un prof VIP', 'Planning de révision perso pour le bac ou la prépa', 'Réponses prioritaires du tuteur'] },
      ar: { name: 'بلس', features: ['كلّ ما في الباقة الأساسية', 'ساعتان خاصّتان مع أستاذ VIP', 'خطّة مراجعة شخصية للباكالوريا أو الأقسام التحضيرية', 'أولوية في إجابات المرشد'] },
    },
  },
  {
    id: 'intensive', pricePerMonth: 119, highlighted: false,
    text: {
      en: { name: 'Intensive', features: ['Everything in Plus', '6 private hours per month', 'Weekly progress report for parents', 'Mock exams corrected by a professor'] },
      fr: { name: 'Intensif', features: ['Tout ce qu’il y a dans Plus', '6 heures particulières par mois', 'Bilan hebdomadaire pour les parents', 'Examens blancs corrigés par un prof'] },
      ar: { name: 'المكثّف', features: ['كلّ ما في باقة بلس', '6 ساعات خاصّة في الشهر', 'تقرير أسبوعي عن التقدّم للأولياء', 'امتحانات تجريبية يصحّحها أستاذ'] },
    },
  },
]

const NO_PLAN = { en: 'This plan does not exist.', fr: 'Cette formule n’existe pas.', ar: 'هذه الباقة غير موجودة.' }

// What the API sends: name and features in the requested language
const publicPlan = ({ text, ...plan }) => ({ ...plan, ...pick(text) })

let subscription = { active: false, planId: null, renewsOn: null }

// TODO(backend): api.get('/vip/plans')
export async function getVipPlans() {
  await wait()
  return copy(PLANS.map(publicPlan))
}

// TODO(backend): api.get('/vip/status')
export async function getVipStatus() {
  await wait()
  return copy(subscription)
}

// "Notify me" while online payment isn't ready: remember that the student wants this plan
// TODO(backend): api.post('/vip/waitlist', { planId })
export async function joinVipWaitlist(planId) {
  await wait()
  if (!PLANS.some((p) => p.id === planId)) throw new Error(pick(NO_PLAN))
  return { planId, joined: true }
}

// Payment is not handled yet: the real API will return a checkout step first.
// TODO(backend): api.post('/vip/subscribe', { planId })
export async function subscribe(planId) {
  await wait(600, 1000)
  if (!PLANS.some((p) => p.id === planId)) throw new Error(pick(NO_PLAN))
  subscription = { active: true, planId, renewsOn: localDateKey(oneMonthLater(new Date())) }
  return copy(subscription)
}
