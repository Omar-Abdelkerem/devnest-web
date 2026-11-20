import { useState, useEffect, useMemo } from 'react'
import ProjectCard from './ProjectCard'
import { apiFetch, getProjectAuthor, getStarCount } from '../lib/api'

export default function ProjectGrid({ projects = null }) {
  const [fetchedProjects, setFetchedProjects] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (projects !== null) return

    let cancelled = false
    async function fetchGlobalProjects() {
      setIsLoading(true)
      try {
        const response = await apiFetch('/api/v1/projects')
        if (cancelled) return
        if (response.ok) {
          const data = await response.json()
          setFetchedProjects(Array.isArray(data) ? data : [])
        } else {
          setError('Failed to load the public project feed.')
        }
      } catch {
        if (!cancelled) setError('Could not connect to the server.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchGlobalProjects()
    return () => {
      cancelled = true
    }
  }, [projects])

  const displayProjects = projects !== null ? projects : fetchedProjects

  const mappedProjects = useMemo(
    () =>
      displayProjects.map((p) => {
        if (p.repo) return p

        const author = getProjectAuthor(p)
        return {
          id: p.id,
          repo: p.title || p.name || 'Untitled',
          description: p.description,
          projectimgUrl: p.projectimgUrl || null,
          links: p.links || [],
          badges: p.isPublic === false ? ['PRIVATE'] : [],
          languages: p.languages || (p.language ? [p.language] : []),
          language: p.language || 'Code',
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
    [displayProjects],
  )

  if (projects === null && isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-56 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-[#1a1a1a] animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center text-sm font-mono text-red-500">
        {error}
      </div>
    )
  }

  if (mappedProjects.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
      {mappedProjects.map((project, index) => (
        <div
          key={project.id || index}
          className="animate-fade-up"
          style={{ animationDelay: `${Math.min(index * 55, 330)}ms` }}
        >
          <ProjectCard project={project} />
        </div>
      ))}
    </div>
  )
}
