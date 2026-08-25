import { useState, useEffect } from 'react'
import ProjectGrid from '../components/ProjectGrid'
import { apiFetch, getProjectAuthor } from '../lib/api'

export default function ExplorePage() {
    const [projects, setProjects] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // 1. Debounce timer to prevent spamming the backend
        const delayDebounceFn = setTimeout(() => {
            async function fetchProjects() {
                setIsLoading(true)
                try {
                    // 2. Attach the search query to the URL if it exists
                    const queryParam = searchQuery.trim()
                        ? `?search=${encodeURIComponent(searchQuery.trim())}`
                        : ''

                    const response = await apiFetch(`/api/v1/projects${queryParam}`)

                    if (response.ok) {
                        const data = await response.json()
                        setProjects(Array.isArray(data) ? data : (data.data || data.projects || []))
                    }
                } catch (err) {
                    console.error('Failed to fetch projects:', err)
                } finally {
                    setIsLoading(false)
                }
            }
            fetchProjects()
        }, 300) // 300ms delay before firing the fetch

        // Cleanup function resets the timer if the user types again
        return () => clearTimeout(delayDebounceFn)
    }, [searchQuery])

    // Format data for the Grid (Removed client-side filter since backend handles it now)
    const mappedProjects = projects.map(p => {
        const author = getProjectAuthor(p)
        return {
            id: p.id,
            repo: p.title || p.name || 'Untitled',
            description: p.description,
            tags: p.tags || [],
            badges: p.isPublic ? [] : ['PRIVATE'],
            language: p.language || 'Code',
            languageColor: p.languageColor || '#dea584',
            stars: p._count?.stars || 0,
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
        <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16 w-full min-h-screen flex flex-col">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Explore Projects</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Discover what the community is building.</p>
                </div>

                {/* Search Bar */}
                <div className="w-full md:w-80 relative">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input
                        type="text"
                        placeholder="Search projects, features, or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-neutral-700 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent text-gray-900 dark:text-gray-100 transition-shadow"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 font-mono text-sm">
                    {searchQuery ? 'Searching...' : 'Loading feed...'}
                </div>
            ) : mappedProjects.length > 0 ? (
                <ProjectGrid projects={mappedProjects} />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-300 dark:border-neutral-800 rounded-xl">
                    <p className="text-gray-500 font-mono text-sm">No projects found matching "{searchQuery}"</p>
                </div>
            )}
        </div>
    )
}