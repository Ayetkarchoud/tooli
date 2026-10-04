// Load data from a service, with loading / error states and a retry.
//   const { data, error, loading, reload } = useAsync(() => getCourse(courseId), [courseId])
// `deps` works like useEffect's: when they change, the data is loaded again.
// Answers that arrive after the page moved on (old deps, unmounted) are ignored.
// While reloading (new deps or reload()), the OLD data stays in `data` on purpose: pages keep showing it
// (e.g. dimmed) instead of flashing a skeleton. Check `!data` to know if it's the very first load.

import { useCallback, useEffect, useState } from 'react'

export function useAsync(load, deps) {
  const [state, setState] = useState({ data: undefined, error: null, loading: true })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let current = true
    setState((s) => ({ ...s, error: null, loading: true }))
    load().then(
      (data) => current && setState({ data, error: null, loading: false }),
      (error) => current && setState({ data: undefined, error, loading: false }),
    )
    return () => {
      current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `deps` is the caller's dependency list
  }, [...deps, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])
  return { ...state, reload }
}
