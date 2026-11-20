/**
 * api.js — Centralized fetch wrapper with lightweight GET caching,
 * in-flight request deduplication, automatic cache invalidation on writes,
 * and safe URL / error helpers.
 */
const envUrl = import.meta.env.VITE_API_URL || ''
const trimmedEnv = String(envUrl).trim().replace(/\/$/, '')
const rawBase =
  trimmedEnv && !/^https?:\/\//i.test(trimmedEnv)
    ? `https://${trimmedEnv}`
    : trimmedEnv

const isLocalBackend =
  !rawBase ||
  rawBase === 'http://localhost:3000' ||
  rawBase === 'http://127.0.0.1:3000' ||
  rawBase === 'https://localhost:3000'

const API_BASE = isLocalBackend ? '' : rawBase

// Lightweight client-side response cache (GET only, 30s TTL) + deduplication
const GET_CACHE_TTL_MS = 30_000
const responseCache = new Map()
const inflightRequests = new Map()

function invalidateApiCache() {
  responseCache.clear()
}

function buildSyntheticResponse(entry) {
  return new Response(entry.bodyText, {
    status: entry.status,
    statusText: entry.statusText,
    headers: entry.headers,
  })
}

async function request(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const headers = { ...options.headers }
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData

  if (
    options.body &&
    !isFormData &&
    !headers['Content-Type'] &&
    !headers['content-type']
  ) {
    headers['Content-Type'] = 'application/json'
  }

  const normalized = path.startsWith('/') ? path : `/${path}`
  const url = `${API_BASE}${normalized}`

  // Any state-changing call clears cached GETs so subsequent views see fresh data
  if (method !== 'GET' && method !== 'HEAD') {
    invalidateApiCache()
    return fetch(url, {
      ...options,
      method,
      credentials: 'include',
      headers,
    })
  }

  // Skip client cache for auth check or explicit bypass
  const skipCache =
    options.skipCache === true || normalized === '/api/v1/user/me'

  if (!skipCache) {
    const cached = responseCache.get(normalized)
    if (cached && Date.now() < cached.expiresAt) {
      return buildSyntheticResponse(cached)
    }
    if (inflightRequests.has(normalized)) {
      const entry = await inflightRequests.get(normalized)
      return buildSyntheticResponse(entry)
    }
  }

  const fetchPromise = fetch(url, {
    ...options,
    method,
    credentials: 'include',
    headers,
  }).then(async (res) => {
    const bodyText = await res.text()
    const entry = {
      status: res.status,
      statusText: res.statusText,
      headers: { 'content-type': res.headers.get('content-type') || 'application/json' },
      bodyText,
      expiresAt: Date.now() + GET_CACHE_TTL_MS,
    }
    if (!skipCache && res.ok) {
      if (responseCache.size > 100) {
        const oldest = responseCache.keys().next().value
        if (oldest) responseCache.delete(oldest)
      }
      responseCache.set(normalized, entry)
    }
    return entry
  })

  if (!skipCache) {
    inflightRequests.set(normalized, fetchPromise)
  }

  try {
    const entry = await fetchPromise
    return buildSyntheticResponse(entry)
  } finally {
    inflightRequests.delete(normalized)
  }
}

/** Safe external URL helper — blocks javascript:, data:, vbscript: XSS schemes */
function safeExternalUrl(raw) {
  if (!raw || typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const parsed = new URL(candidate)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href
    }
    return null
  } catch {
    return null
  }
}

/** Extract clean, user-friendly message & optional field errors from an API response */
async function parseApiError(response, fallback = 'Something went wrong. Please try again.') {
  try {
    const data = await response.json()
    const message =
      data?.error?.message ||
      data?.message ||
      (Array.isArray(data) && data[0]?.message) ||
      fallback
    const fields = Array.isArray(data?.error?.fields) ? data.error.fields : []
    return { message, fields }
  } catch {
    if (response.status === 405 || response.status === 404) {
      return {
        message: `API endpoint unreachable (HTTP ${response.status}). Check that the backend is running and VITE_API_URL is configured.`,
        fields: [],
      }
    }
    if (response.status >= 500) {
      return {
        message: `Server error (HTTP ${response.status}). Please try again in a moment.`,
        fields: [],
      }
    }
    return { message: fallback, fields: [] }
  }
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
  return `/${encodeURIComponent(slug)}`
}

function getStarCount(project) {
  if (!project) return 0

  const nested = project._count
  const candidates = [
    nested?.stars,
    nested?.Star,
    project.starsCount,
    project.starCount,
    Array.isArray(project.stars) ? project.stars.length : project.stars,
  ]

  for (const value of candidates) {
    const n = Number(value)
    if (Number.isFinite(n) && n >= 0) return n
  }
  return 0
}

function normalizeProjectLinks(rawLinks) {
  if (!rawLinks) return []
  let list = rawLinks
  if (typeof list === 'string') {
    try {
      list = JSON.parse(list)
    } catch {
      return []
    }
  }
  if (!Array.isArray(list)) return []
  return list
    .map((item) => {
      if (typeof item === 'string') {
        const url = safeExternalUrl(item)
        return url ? { name: url.replace(/^https?:\/\//, '').split('/')[0], url } : null
      }
      const url = safeExternalUrl(item?.url || item?.href)
      if (!url) return null
      return { name: item?.name || 'Link', url }
    })
    .filter(Boolean)
}

export {
  API_BASE,
  request as apiFetch,
  invalidateApiCache,
  safeExternalUrl,
  parseApiError,
  projectAuthor as getProjectAuthor,
  profilePath as authorProfilePath,
  getStarCount,
  normalizeProjectLinks,
}
