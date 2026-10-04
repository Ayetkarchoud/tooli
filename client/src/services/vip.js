// VIP plans and the user's subscription (FAKE for now: see docs/api.md for the real endpoints).
// Prices in Tunisian dinars (TND) per month.

import { localDateKey } from '../lib/time.js'
import { copy, wait } from './fake.js'

// Same day next month, in LOCAL time. Short months clamp the day: 31 Jan → 28 Feb (29 in leap years).
function oneMonthLater(from) {
  const year = from.getFullYear()
  const month = from.getMonth() + 1
  const lastDay = new Date(year, month + 1, 0).getDate() // day 0 of the following month = last day of `month`
  return new Date(year, month, Math.min(from.getDate(), lastDay))
}

const PLANS = [
  {
    id: 'essential', name: 'Essential', pricePerMonth: 29, highlighted: false,
    features: ['Unlimited AI tutor questions', 'All partner course summaries', '1 group class per month'],
  },
  {
    id: 'plus', name: 'Plus', pricePerMonth: 59, highlighted: true,
    features: ['Everything in Essential', '2 private hours with a VIP professor', 'Personal bac or prépa revision plan', 'Priority answers from the tutor'],
  },
  {
    id: 'intensive', name: 'Intensive', pricePerMonth: 119, highlighted: false,
    features: ['Everything in Plus', '6 private hours per month', 'Weekly progress report for parents', 'Mock exams corrected by a professor'],
  },
]

let subscription = { active: false, planId: null, renewsOn: null }

// TODO(backend): api.get('/vip/plans')
export async function getVipPlans() {
  await wait()
  return copy(PLANS)
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
  if (!PLANS.some((p) => p.id === planId)) throw new Error('This plan does not exist.')
  return { planId, joined: true }
}

// Payment is not handled yet: the real API will return a checkout step first.
// TODO(backend): api.post('/vip/subscribe', { planId })
export async function subscribe(planId) {
  await wait(600, 1000)
  if (!PLANS.some((p) => p.id === planId)) throw new Error('This plan does not exist.')
  subscription = { active: true, planId, renewsOn: localDateKey(oneMonthLater(new Date())) }
  return copy(subscription)
}
