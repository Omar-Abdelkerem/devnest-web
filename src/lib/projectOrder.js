/**
 * projectOrder.js
 *
 * Persists custom project order and pinned project IDs locally (as an instant
 * optimistic layer) alongside backend `isPinned` and `sortOrder` fields.
 */

const ORDER_PREFIX = 'devnest-project-order:'
const PINS_PREFIX = 'devnest-project-pins:'

export function getSavedProjectOrder(username) {
  if (!username) return []
  try {
    const raw = localStorage.getItem(`${ORDER_PREFIX}${username.toLowerCase()}`)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveProjectOrder(username, projectIds) {
  if (!username || !Array.isArray(projectIds)) return
  try {
    localStorage.setItem(
      `${ORDER_PREFIX}${username.toLowerCase()}`,
      JSON.stringify(projectIds.filter(Boolean)),
    )
  } catch {
    // Ignore storage quota errors
  }
}

export function getSavedPinnedMap(username) {
  if (!username) return {}
  try {
    const raw = localStorage.getItem(`${PINS_PREFIX}${username.toLowerCase()}`)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function savePinnedState(username, projectId, isPinned) {
  if (!username || !projectId) return
  try {
    const current = getSavedPinnedMap(username)
    current[projectId] = Boolean(isPinned)
    localStorage.setItem(`${PINS_PREFIX}${username.toLowerCase()}`, JSON.stringify(current))
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Sorts a list of projects respecting:
 * 1. Pinned status (backend `project.isPinned` overlaid with saved local pin map)
 * 2. Custom order (saved local order array or backend `sortOrder`)
 */
export function sortProjectsWithOrder(projects, username) {
  if (!Array.isArray(projects)) return []
  const savedOrder = getSavedProjectOrder(username)
  const orderIndexMap = new Map(savedOrder.map((id, idx) => [id, idx]))
  const pinnedMap = getSavedPinnedMap(username)

  return projects
    .map((p, originalIdx) => {
      const effectivePinned =
        p.id in pinnedMap ? Boolean(pinnedMap[p.id]) : Boolean(p.isPinned)
      return {
        ...p,
        isPinned: effectivePinned,
        _originalIdx: originalIdx,
      }
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1
      }
      const aHasSaved = orderIndexMap.has(a.id)
      const bHasSaved = orderIndexMap.has(b.id)
      if (aHasSaved && bHasSaved) {
        return orderIndexMap.get(a.id) - orderIndexMap.get(b.id)
      }
      if (aHasSaved !== bHasSaved) {
        return aHasSaved ? -1 : 1
      }
      if (
        typeof a.sortOrder === 'number' &&
        typeof b.sortOrder === 'number' &&
        a.sortOrder !== b.sortOrder
      ) {
        return a.sortOrder - b.sortOrder
      }
      return a._originalIdx - b._originalIdx
    })
}
