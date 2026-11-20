import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { apiFetch, getStarCount } from '../lib/api'
import ProjectCard from '../components/ProjectCard'
import VolumetricBackground from '../components/VolumetricBackground'
import GlassIconTile from '../components/GlassIconTile'

export default function StarredProjectsPage() {
  useDocumentTitle('Starred Projects', 'Projects you have starred on DevNest.')
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetchStarredProjects() {
      try {
        const response = await apiFetch('/api/v1/projects/starred/me')
        if (cancelled) return
        if (response.ok) {
          const data = await response.json()
          setProjects(Array.isArray(data) ? data : data.data || [])
        } else {
          setError('Failed to load your starred projects. Please try again.')
        }
      } catch {
        if (!cancelled) setError('Could not connect to the server.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchStarredProjects()
    return () => {
      cancelled = true
    }
  }, [])

  const mappedProjects = useMemo(
    () =>
      projects
        .filter(Boolean)
        .map((p) => {
          const displayLanguage =
            p.language || (p.languages?.length > 0 ? p.languages[0] : null) || 'Code'
          return {
            ...p,
            repo: p.title || p.name || 'Untitled Project',
            projectimgUrl: p.projectimgUrl || null,
            links: p.links || [],
            badges: p.isPublic === false ? ['PRIVATE'] : [],
            language: displayLanguage,
            languageColor: p.languageColor || '#3cd2bf',
            stars: getStarCount(p),
            author: p.user?.username || p.owner?.username || 'developer',
            authorUsername: p.user?.username || p.owner?.username || 'developer',
            authorAvatar: p.user?.avatarUrl || p.owner?.avatarUrl,
            updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Recently',
          }
        }),
    [projects],
  )

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <VolumetricBackground variant="profile" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 lg:py-18 w-full">
        <div className="mb-10">
          <Link to="/profile" className="btn-glass-pill text-xs font-mono px-4 py-1.5 rounded-full">
            ← Back to Profile
          </Link>
          <div className="mt-6 flex items-center gap-4">
            <GlassIconTile size="lg" accent={true}>
              <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </GlassIconTile>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Starred Projects
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-mono bg-accent/15 text-accent dark:text-accent-light border border-accent/30 rounded-full">
                  {mappedProjects.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-mono">
                A curated collection of projects you&apos;ve bookmarked on DevNest.
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-64 rounded-2xl glass-panel animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="py-16 text-center text-rose-500 font-mono text-sm glass-panel rounded-2xl">
            {error}
          </div>
        ) : mappedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mappedProjects.map((project, idx) => (
              <div
                key={project.id}
                className="animate-fade-up h-full"
                style={{ animationDelay: `${Math.min(idx * 55, 330)}ms` }}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 px-6 text-center glass-panel rounded-3xl flex flex-col items-center gap-3">
            <GlassIconTile size="lg" accent={true}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </GlassIconTile>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-mono">
              You haven&apos;t starred any projects yet.
            </p>
            <Link to="/explore" className="btn-3d-pill text-xs font-bold px-5 py-2.5 rounded-full mt-2">
              Explore the community →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
