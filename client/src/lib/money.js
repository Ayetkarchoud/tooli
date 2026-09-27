// 45 → "45 TND", 67.5 → "67.5 TND" (Tunisian dinars)
const number = new Intl.NumberFormat('en', { maximumFractionDigits: 1 })
export const formatTND = (amount) => `${number.format(amount)} TND`
