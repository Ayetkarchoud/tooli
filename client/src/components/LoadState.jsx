// Loading / error / not-found wrapper for pages that load ONE item by id.
//   const result = useAsync(() => getCourse(courseId), [courseId])
//   return <LoadState result={result} notFound={{ title: t('courses.notFound.title'), ... }}>{(course) => …}</LoadState>

import { useTranslation } from 'react-i18next'
import { ErrorState, NotFoundState } from './MascotMessage.jsx'
import Page from './Page.jsx'
import { PageSkeleton } from './PageLoader.jsx'

export default function LoadState({ result, notFound, children }) {
  const { t } = useTranslation()
  const { data, error, loading, reload } = result

  if (loading) {
    return (
      <div role="status">
        <PageSkeleton />
        <span className="sr-only">{t('common.loading')}</span>
      </div>
    )
  }
  if (error) {
    return (
      <Page>
        <ErrorState onRetry={reload} />
      </Page>
    )
  }
  if (data == null) {
    return (
      <Page>
        <NotFoundState {...notFound} />
      </Page>
    )
  }
  return children(data)
}
