/**
 * ProjectGrid.jsx — Renders a grid of ProjectCard components
 *
 * Upgraded to support auto-fetching. 
 * If no projects are passed as a prop, it assumes it is on the landing page
 * and fetches the latest public projects from the backend.
 */

import { useState, useEffect } from 'react'
import ProjectCard from './ProjectCard'
import { apiFetch, getProjectAuthor, getStarCount } from '../lib/api'

export default function ProjectGrid({ projects = null }) {
  const [fetchedProjects, setFetchedProjects] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // If an array was explicitly passed in (like from ProfilePage), 
    // skip the global fetch. We only fetch if projects is null.
    if (projects !== null) return

    async function fetchGlobalProjects() {
      setIsLoading(true)
      try {
        const response = await apiFetch('/api/v1/projects')

        if (response.ok) {
          const data = await response.json()
          setFetchedProjects(Array.isArray(data) ? data : [])
        } else {
          setError('Failed to load the public project feed.')
        }
      } catch (err) {
        console.error('Project feed error:', err)
        setError('Could not connect to the server.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGlobalProjects()
  }, [projects])

  // Decide which data source to use: the props, or our internal fetch
  const displayProjects = projects !== null ? projects : fetchedProjects

  // Loading state (only shows on the landing page when auto-fetching)
  if (projects === null && isLoading) {
    return (
      <div className="py-12 text-center text-sm font-mono text-gray-500">
        Loading public feed...
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="py-12 text-center text-sm font-mono text-red-500">
        {error}
      </div>
    )
  }

  // If there are zero projects in the database yet, just render nothing
  if (displayProjects.length === 0) return null

  // We map the data to ensure the backend JSON keys match what ProjectCard expects.
  // If the data came from ProfilePage, it already has 'repo' set, so we don't map it twice.
  const mappedProjects = displayProjects.map((p) => {
    if (p.repo) return p

    const author = getProjectAuthor(p)
    return {
      id: p.id,
      repo: p.title || p.name || 'Untitled',
      description: p.description,
      tags: p.tags || [],
      badges: p.isPublic ? [] : ['PRIVATE'],
      language: p.language || 'Code',
      languageColor: p.languageColor || '#dea584',
      stars: getStarCount(p),
      _count: p._count,
      forks: p.forks || 0,
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Recently',
      author: author.name,
      authorUsername: author.slug,
      authorHandle: author.slug,
      authorAvatar: author.avatar,
      owner: p.owner || p.user,
      user: p.user || p.owner,
    }
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
      {mappedProjects.map((project, index) => (
        <ProjectCard key={project.id || index} project={project} />
      ))}
    </div>
  )
}