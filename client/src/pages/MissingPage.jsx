import { useTranslation } from 'react-i18next'
import { NotFoundState } from '../components/MascotMessage.jsx'
import Page from '../components/Page.jsx'

// Unknown address inside /dashboard/* (the app layout stays around it)
export default function MissingPage() {
  const { t } = useTranslation()
  return (
    <Page>
      <NotFoundState title={t('errors.pageNotFound')} text={t('errors.pageNotFoundText')} />
    </Page>
  )
}
