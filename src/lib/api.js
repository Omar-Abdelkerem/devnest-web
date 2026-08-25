/**
 * Local backends are reached through Vite's `/api` proxy so session cookies
 * stay same-origin. That is what populates `req.user` on project-by-id.
 */
const envUrl = import.meta.env.VITE_API_URL || ''
const rawBase = String(envUrl).replace(/\/$/, '')

const isLocalBackend =
  !rawBase ||
  rawBase === 'http://localhost:3000' ||
  rawBase === 'http://127.0.0.1:3000'

const API_BASE = isLocalBackend ? '' : rawBase

function request(path, options = {}) {
  const headers = { ...options.headers }
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  if (options.body && !isFormData && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json'
  }

  const normalized = path.startsWith('/') ? path : `/${path}`
  return fetch(`${API_BASE}${normalized}`, {
    ...options,
    credentials: 'include',
    headers,
  })
}

/** Unique profile slug from nested `user` / `owner` — never a display name. */
function projectAuthor(project) {
  if (!project) return { slug: null, name: null, avatar: null }

  const nested = project.owner || project.user || {}
  const slug =
    nested.username ||
    nested.handle ||
    project.authorUsername ||
    project.authorHandle ||
    null

  return {
    slug,
    name: nested.name || project.author || slug,
    avatar: nested.avatarUrl || nested.avatar || project.authorAvatar || null,
  }
}

function profilePath(slug) {
  if (!slug) return null
  return `/u/${encodeURIComponent(slug)}`
}

export {
  API_BASE,
  request as apiFetch,
  projectAuthor as getProjectAuthor,
  profilePath as authorProfilePath,
}
