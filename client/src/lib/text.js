// Case- and accent-insensitive text match ("prepa" finds "Prépa")
const normalise = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
export const matches = (text, query) => normalise(text).includes(normalise(query.trim()))
