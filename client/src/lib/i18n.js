// Translations: English, French, Arabic (right-to-left).
//   const { t } = useTranslation();  t('dashboard.title')
// Files: src/locales/{en,fr,ar}.json, one section per page/feature. Each language is a separate
// download, fetched only when used (Vite splits the dynamic import).
//
// Language order: the user's saved choice → the browser language (fr / ar / en) → French
// (most Tunisian students study in French). index.html applies the same rules before React starts,
// so <html lang> and <html dir> are right from the first paint.

import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next'

export const LANGUAGES = [
  { code: 'en', name: 'English', locale: 'en-GB', dir: 'ltr' },
  { code: 'fr', name: 'Français', locale: 'fr-TN', dir: 'ltr' },
  // Arabic with Latin digits (0-9), as on Tunisian websites and school documents
  { code: 'ar', name: 'العربية', locale: 'ar-TN-u-nu-latn', dir: 'rtl' },
]
export const DEFAULT_LANGUAGE = 'fr'
export const LANGUAGE_KEY = 'tooli-lang' // keep in sync with index.html's pre-load script

const supported = LANGUAGES.map((l) => l.code)
const info = (code) => LANGUAGES.find((l) => l.code === code) ?? LANGUAGES.find((l) => l.code === DEFAULT_LANGUAGE)

// The language in use right now ('en' | 'fr' | 'ar')
export const currentLanguage = () => (supported.includes(i18n.resolvedLanguage) ? i18n.resolvedLanguage : DEFAULT_LANGUAGE)
// Intl locale for dates, numbers and prices
export const localeOf = (lang = currentLanguage()) => info(lang).locale
export const dirOf = (lang = currentLanguage()) => info(lang).dir

function applyToDocument(lang) {
  const root = document.documentElement
  root.lang = lang
  root.dir = dirOf(lang)
}

// Resolves once the first language file is loaded (main.jsx waits for it before the first render)
export const i18nReady = i18n
  .use(resourcesToBackend((lang) => import(`../locales/${lang}.json`)))
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: supported,
    fallbackLng: DEFAULT_LANGUAGE,
    nonExplicitSupportedLngs: true, // "fr-FR" → fr, "ar-TN" → ar
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_KEY,
      caches: ['localStorage'],
      // "en-GB", "ar-TN" → "en", "ar": that short code is what gets saved (index.html reads it too)
      convertDetectedLanguage: (lng) => lng.slice(0, 2).toLowerCase(),
    },
    interpolation: { escapeValue: false }, // React already escapes
    returnNull: false,
  })

// <html lang dir> follow the language actually shown (currentLanguage() maps anything unknown to French)
i18n.on('languageChanged', () => applyToDocument(currentLanguage()))
i18nReady.then(() => applyToDocument(currentLanguage()))

export default i18n
