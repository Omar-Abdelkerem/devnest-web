import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { apiFetch, getStarCount } from '../lib/api'
import ProjectCard from '../components/ProjectCard'

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
            languageColor: p.languageColor || '#2a8a7e',
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
    <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16 w-full min-h-screen">
      <div className="mb-8">
        <Link to="/profile" className="text-sm font-mono text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          ← Back to Profile
        </Link>
        <div className="mt-5 flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Starred Projects
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-mono bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.1] rounded-full">
            {mappedProjects.length}
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 font-mono">
          A collection of projects you&apos;ve saved for later.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-56 rounded-xl glass-panel animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="py-16 text-center text-rose-500 font-mono text-sm glass-panel rounded-xl">
          {error}
        </div>
      ) : mappedProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
        <div className="py-16 text-center border border-dashed border-slate-300 dark:border-white/[0.12] rounded-xl text-slate-600 dark:text-slate-400 text-sm font-mono">
          You haven&apos;t starred any projects yet.
          <div className="mt-3">
            <Link to="/explore" className="text-accent dark:text-accent-light hover:underline font-semibold">
              Explore the community →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
