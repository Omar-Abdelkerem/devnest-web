import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProjectGrid from '../components/ProjectGrid'
import { apiFetch, getProjectAuthor } from '../lib/api'

export default function ExplorePage() {
    const [projects, setProjects] = useState([])
    const [searchedUser, setSearchedUser] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Debounce timer to prevent spamming the backend
        const delayDebounceFn = setTimeout(() => {
            async function fetchResults() {
                setIsLoading(true)
                setSearchedUser(null)

                try {
                    const query = searchQuery.trim()

                    if (!query) {
                        // If no search, just load all projects normally
                        const response = await apiFetch(`/api/v1/projects`)
                        if (response.ok) {
                            const data = await response.json()
                            setProjects(Array.isArray(data) ? data : (data.data || data.projects || []))
                        }
                    } else {
                        // DUAL SEARCH: Fetch matching projects AND check if a user exists with this exact handle
                        const pRes = apiFetch(`/api/v1/projects?search=${encodeURIComponent(query)}`)
                        const uRes = apiFetch(`/api/v1/user/${encodeURIComponent(query)}`)

                        const [projectsResponse, userResponse] = await Promise.allSettled([pRes, uRes])

                        // 1. Handle Projects
                        if (projectsResponse.status === 'fulfilled' && projectsResponse.value.ok) {
                            const data = await projectsResponse.value.json()
                            setProjects(Array.isArray(data) ? data : (data.data || data.projects || []))
                        } else {
                            setProjects([])
                        }

                        // 2. Handle User Search (if the handle exactly matches a developer)
                        if (userResponse.status === 'fulfilled' && userResponse.value.ok) {
                            const data = await userResponse.value.json()
                            const fetchedUser = data.user || data.data?.user || data.data || data
                            if (fetchedUser && fetchedUser.username) {
                                setSearchedUser(fetchedUser)
                            } else {
                                setSearchedUser(null)
                            }
                        } else {
                            setSearchedUser(null)
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch results:', err)
                } finally {
                    setIsLoading(false)
                }
            }
            fetchResults()
        }, 400) // 400ms delay

        return () => clearTimeout(delayDebounceFn)
    }, [searchQuery])

    // Format data using the same bulletproof mapping as ProfilePage to ensure cards don't break
    const mappedProjects = projects.map(p => {
        const author = getProjectAuthor(p)
        return {
            id: p.id,
            repo: p.title || p.name || 'Untitled',
            description: p.description,
            tags: p.tags || [],
            badges: p.isPublic ? [] : ['PRIVATE'],
            languages: p.languages || (p.language ? [{ name: p.language }] : []), // Passes all languages to the card
            language: p.language || (p.languages && p.languages.length > 0 ? (typeof p.languages[0] === 'string' ? p.languages[0] : p.languages[0].name) : null) || 'Code',
            languageColor: p.languageColor || '#2a8a7e',
            stars: p._count?.stars ?? (Array.isArray(p.stars) ? p.stars.length : p.stars) ?? 0, // Dynamic star count
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Find</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Search for developers and projects in the community.</p>
                </div>

                {/* Search Bar */}
                <div className="w-full md:w-80 relative">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input
                        type="text"
                        placeholder="Search for a user or project..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-neutral-700 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent text-gray-900 dark:text-gray-100 transition-shadow"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 font-mono text-sm">
                    {searchQuery ? 'Searching network...' : 'Loading feed...'}
                </div>
            ) : (
                <div className="flex flex-col flex-1">

                    {/* 1. Show User Profile Card if a user matches the search */}
                    {searchedUser && (
                        <div className="mb-10">
                            <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">Developer Found</h2>
                            <Link to={`/${searchedUser.username}`} className="flex items-center gap-4 p-4 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-xl hover:border-accent dark:hover:border-accent transition-colors shadow-sm w-full md:w-96 group">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-neutral-800 flex items-center justify-center border border-gray-300 dark:border-neutral-700">
                                    {searchedUser.avatarUrl ? (
                                        <img src={searchedUser.avatarUrl} alt={searchedUser.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-lg font-bold text-gray-500">{searchedUser.username.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-accent transition-colors">{searchedUser.name || searchedUser.username}</h3>
                                    <p className="text-xs text-gray-500 font-mono">@{searchedUser.username}</p>
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* 2. Show Projects Grid */}
                    {mappedProjects.length > 0 && (
                        <div>
                            {searchedUser && <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">Projects Found</h2>}
                            <ProjectGrid projects={mappedProjects} />
                        </div>
                    )}

                    {/* 3. Empty State (No users AND no projects found) */}
                    {!searchedUser && mappedProjects.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-300 dark:border-neutral-800 rounded-xl">
                            <p className="text-gray-500 font-mono text-sm">Could not find any user or project matching "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}