import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import ProjectCard from '../components/ProjectCard'

export default function StarredProjectsPage() {
    const [projects, setProjects] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchStarredProjects() {
            try {
                // Hitting the new backend endpoint we just created
                const response = await apiFetch('/api/v1/projects/starred/me', {
                    method: 'GET',
                })

                if (response.ok) {
                    const data = await response.json()
                    const actualProjects = Array.isArray(data) ? data : (data.data || [])
                    setProjects(actualProjects)
                } else {
                    setError('Failed to load your starred projects. Please try again.')
                }
            } catch (err) {
                console.error('Fetch error:', err)
                setError('Could not connect to the server.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchStarredProjects()
    }, [])

    // Map projects to ensure they have the correct data structure for ProjectCard
    const mappedProjects = projects.map(p => {
        if (!p) return null

        const displayLanguage = p.language ||
            (p.languages && p.languages.length > 0 ? p.languages[0] : null) ||
            'Code'

        return {
            ...p,
            repo: p.title || p.name || 'Untitled Project',
            badges: p.isPublic === false ? ['PRIVATE'] : [],
            language: displayLanguage,
            languageColor: p.languageColor || '#2a8a7e',
            stars: p._count?.stars || 0,
            author: p.user?.username || p.owner?.username || 'developer',
            authorAvatar: p.user?.avatarUrl || p.owner?.avatarUrl,
            updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Recently'
        }
    }).filter(Boolean)

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20 w-full min-h-screen bg-white dark:bg-[#161616]">
            <div className="mb-8">
                <Link to="/profile" className="text-sm font-mono text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">← Back to Profile</Link>
                <div className="mt-6 flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Starred Projects</h1>
                    <span className="px-2.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-neutral-700 rounded-full">
                        {mappedProjects.length}
                    </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-mono">
                    A collection of projects you've saved for later.
                </p>
            </div>

            {isLoading ? (
                <div className="py-20 text-center text-gray-500 font-mono text-sm">
                    Loading your stars...
                </div>
            ) : error ? (
                <div className="py-20 text-center text-red-500 font-mono text-sm border border-red-500/20 rounded-lg bg-red-500/5">
                    {error}
                </div>
            ) : mappedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mappedProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center border border-dashed border-gray-300 dark:border-neutral-800 rounded-xl text-gray-500 text-sm font-mono bg-gray-50 dark:bg-[#1a1a1a]">
                    <div className="text-4xl mb-4 text-gray-300 dark:text-neutral-700">★</div>
                    You haven't starred any projects yet.
                    <div className="mt-4">
                        <Link to="/explore" className="text-accent hover:underline font-semibold">
                            Explore the community
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}