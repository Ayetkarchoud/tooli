import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { usePageTitle } from '@/lib/usePageTitle'
import { Button } from '@/components/ui/button'
import { useAuth } from '../auth/authContext.js'
import Mascot from '../components/Mascot.jsx'
import Page from '../components/Page.jsx'

export default function NotFound() {
  const { t } = useTranslation()
  const { isLoggedIn } = useAuth()
  usePageTitle(t('errors.pageNotFound'))

  return (
    <Page className="flex flex-col items-center pt-12 text-center max-[560px]:pt-12">
      <Mascot pose="oops" title={t('errors.confusedMascot')} className="mb-4" />
      <h1 className="mb-2 text-[2em] leading-tight font-bold">{t('errors.pageNotFound')}</h1>
      <p className="mb-4 text-muted-foreground">{t('errors.pageNotFoundText')}</p>
      <Button asChild>
        <Link to={isLoggedIn ? '/dashboard' : '/'}>{isLoggedIn ? t('common.backToDashboard') : t('common.backToHome')}</Link>
      </Button>
    </Page>
  )
}
