import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import ProjectGrid from '../components/ProjectGrid'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { apiFetch, getProjectAuthor, getStarCount } from '../lib/api'

export default function ExplorePage() {
  useDocumentTitle('Explore Projects & Developers', 'Search and explore open developer portfolios and engineering projects on DevNest.')

  const [projects, setProjects] = useState([])
  const [searchedUser, setSearchedUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const delayMs = searchQuery.trim() ? 300 : 0

    const delayDebounceFn = setTimeout(() => {
      async function fetchResults() {
        setIsLoading(true)
        setError('')
        setSearchedUser(null)

        try {
          const query = searchQuery.trim()

          if (!query) {
            const response = await apiFetch('/api/v1/projects')
            if (cancelled) return
            if (response.ok) {
              const data = await response.json()
              setProjects(Array.isArray(data) ? data : data.data || data.projects || [])
            } else {
              setError('Failed to load community projects.')
            }
          } else {
            const pRes = apiFetch(`/api/v1/projects?search=${encodeURIComponent(query)}`)
            const uRes = apiFetch(`/api/v1/user/${encodeURIComponent(query)}`)
            const [projectsResponse, userResponse] = await Promise.allSettled([pRes, uRes])
            if (cancelled) return

            if (projectsResponse.status === 'fulfilled' && projectsResponse.value.ok) {
              const data = await projectsResponse.value.json()
              setProjects(Array.isArray(data) ? data : data.data || data.projects || [])
            } else {
              setProjects([])
            }

            if (userResponse.status === 'fulfilled' && userResponse.value.ok) {
              const data = await userResponse.value.json()
              const fetchedUser = data.user || data.data?.user || data.data || data
              setSearchedUser(fetchedUser?.username ? fetchedUser : null)
            } else {
              setSearchedUser(null)
            }
          }
        } catch {
          if (!cancelled) setError('Could not connect to the server.')
        } finally {
          if (!cancelled) setIsLoading(false)
        }
      }
      fetchResults()
    }, delayMs)

    return () => {
      cancelled = true
      clearTimeout(delayDebounceFn)
    }
  }, [searchQuery])

  const mappedProjects = useMemo(
    () =>
      projects.map((p) => {
        const author = getProjectAuthor(p)
        return {
          id: p.id,
          repo: p.title || p.name || 'Untitled',
          description: p.description,
          projectimgUrl: p.projectimgUrl || null,
          links: p.links || [],
          badges: p.isPublic === false ? ['PRIVATE'] : [],
          languages: p.languages || (p.language ? [{ name: p.language }] : []),
          language:
            p.language ||
            (p.languages?.length > 0
              ? typeof p.languages[0] === 'string'
                ? p.languages[0]
                : p.languages[0].name
              : null) ||
            'Code',
          languageColor: p.languageColor || '#2a8a7e',
          stars: getStarCount(p),
          _count: p._count,
          updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Recently',
          author: author.name,
          authorUsername: author.slug,
          authorHandle: author.slug,
          authorAvatar: author.avatar,
          owner: p.owner || p.user,
          user: p.user || p.owner,
        }
      }),
    [projects],
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16 w-full min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Explore</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Search for developers and engineering projects in the community.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-80 relative">
          <label htmlFor="explore-search" className="sr-only">
            Search developers or projects
          </label>
          <svg
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="explore-search"
            type="search"
            placeholder="Search for a user or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-neutral-700 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100 transition-shadow"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-[#1a1a1a] animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="py-16 text-center text-red-500 font-mono text-sm">
          {error}
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          {searchedUser && (
            <div className="mb-10">
              <h2 className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
                Developer Found
              </h2>
              <Link
                to={`/${searchedUser.username}`}
                className="project-card-interactive flex items-center gap-4 p-4 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-xl hover:border-accent dark:hover:border-accent-light shadow-sm w-full md:w-96 group"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-neutral-800 flex items-center justify-center border border-gray-300 dark:border-neutral-700 shrink-0">
                  {searchedUser.avatarUrl ? (
                    <img
                      src={searchedUser.avatarUrl}
                      alt={`${searchedUser.username} avatar`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                      {searchedUser.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-accent dark:group-hover:text-accent-light transition-colors truncate">
                    {searchedUser.name || searchedUser.username}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    @{searchedUser.username}
                  </p>
                  {searchedUser.location && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {searchedUser.location}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          )}

          {mappedProjects.length > 0 && (
            <div>
              {searchedUser && (
                <h2 className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
                  Projects Found
                </h2>
              )}
              <ProjectGrid projects={mappedProjects} />
            </div>
          )}

          {!searchedUser && mappedProjects.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-300 dark:border-neutral-800 rounded-xl">
              <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                {searchQuery.trim()
                  ? `Could not find any user or project matching "${searchQuery}"`
                  : 'No public projects published yet.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
