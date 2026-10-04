// All calls to the Express backend go through here.
// In development, Vite forwards /api/* to the backend (see vite.config.js),
// so the frontend never needs the backend's full address.

const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  })
  if (!res.ok) {
    // The API answers errors as { "error": { "message": "…" } } (see docs/api.md)
    const body = await res.json().catch(() => null)
    const error = new Error(body?.error?.message || `Request failed: ${res.status}`)
    error.status = res.status // e.g. services turn 404 into null
    throw error
  }
  return res.status === 204 ? null : res.json()
}

// Add query params to a path, skipping empty ones:
//   withQuery('/courses', { subject: 'Physics', q: '', level: undefined }) → '/courses?subject=Physics'
function withQuery(path, query) {
  if (!query) return path
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue
    params.append(key, String(value))
  }
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

export const api = {
  // api.get('/courses', { subject, q }) → GET /api/courses?subject=…&q=… (empty values are left out)
  get: (path, query) => request(withQuery(path, query)),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
