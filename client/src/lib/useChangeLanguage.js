// Switch the language: applies at once (Arabic → right-to-left), is remembered in the browser
// ('tooli-lang', by the i18next detector) and, when logged in, saved in the profile.
//   const changeLanguage = useChangeLanguage();  changeLanguage('ar')

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { updateProfile } from '@/services/user'
import { useAuth } from '../auth/authContext.js'

export function useChangeLanguage() {
  const { i18n, t } = useTranslation()
  const { isLoggedIn, updateUser } = useAuth()

  return useCallback(
    async (code) => {
      if (code === i18n.resolvedLanguage) return
      await i18n.changeLanguage(code)
      if (!isLoggedIn) return
      updateUser({ language: code })
      try {
        await updateProfile({ language: code })
      } catch {
        // The page is already in the new language; only the profile copy failed
        toast.error(t('settings.language.saveError'))
      }
    },
    [i18n, isLoggedIn, updateUser, t],
  )
}
