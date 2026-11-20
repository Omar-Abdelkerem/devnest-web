import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import ProjectGrid from '../components/ProjectGrid'
import VolumetricBackground from '../components/VolumetricBackground'
import GlassIconTile from '../components/GlassIconTile'
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
          languageColor: p.languageColor || '#3cd2bf',
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
    <div className="relative w-full min-h-screen overflow-hidden">
      <VolumetricBackground variant="profile" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 lg:py-16 w-full flex flex-col">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-start gap-4">
            <GlassIconTile size="lg" accent={true}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </GlassIconTile>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Explore Community
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Search for developers, live demos, and engineering projects across DevNest.
              </p>
            </div>
          </div>

          {/* Frosted Glass Search Bar */}
          <div className="w-full md:w-88 relative">
            <label htmlFor="explore-search" className="sr-only">
              Search developers or projects
            </label>
            <svg
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
              placeholder="Search handle or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input rounded-full pl-10 pr-4 py-2.5 text-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl glass-panel animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="py-16 text-center text-rose-500 font-mono text-sm glass-panel rounded-2xl">
            {error}
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            {searchedUser && (
              <div className="mb-10">
                <h2 className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                  Developer Found
                </h2>
                <Link
                  to={`/${searchedUser.username}`}
                  className="glass-panel-interactive flex items-center gap-4 p-4 rounded-2xl w-full md:w-96 group"
                >
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 dark:bg-white/[0.08] flex items-center justify-center border border-slate-300 dark:border-white/[0.14] shrink-0">
                    {searchedUser.avatarUrl ? (
                      <img
                        src={searchedUser.avatarUrl}
                        alt={`${searchedUser.username} avatar`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-accent-light">
                        {searchedUser.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-accent dark:group-hover:text-accent-light transition-colors truncate">
                      {searchedUser.name || searchedUser.username}
                    </h3>
                    <p className="text-xs text-accent dark:text-accent-light font-mono">
                      @{searchedUser.username}
                    </p>
                    {searchedUser.location && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {searchedUser.location}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-400 group-hover:text-accent-light transition-colors">
                    →
                  </span>
                </Link>
              </div>
            )}

            {mappedProjects.length > 0 && (
              <div>
                {searchedUser && (
                  <h2 className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                    Projects Found
                  </h2>
                )}
                <ProjectGrid projects={mappedProjects} />
              </div>
            )}

            {!searchedUser && mappedProjects.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center glass-panel rounded-3xl gap-3">
                <GlassIconTile size="lg" accent={true}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </GlassIconTile>
                <p className="text-slate-600 dark:text-slate-400 font-mono text-sm">
                  {searchQuery.trim()
                    ? `Could not find any user or project matching "${searchQuery}"`
                    : 'No public projects published yet.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
