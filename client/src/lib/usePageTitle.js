// Sets the browser tab title: usePageTitle('Partner courses') → "Partner courses · tooli".
// Updates when the language changes (pass an already translated title). No title → just "tooli".

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function usePageTitle(title) {
  const { t } = useTranslation()
  useEffect(() => {
    document.title = title ? t('common.docTitle', { page: title }) : 'tooli'
  }, [title, t])
}
