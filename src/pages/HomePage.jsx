import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'

export default function HomePage() {
    const { user } = useAuth()
    const [featuredProject, setFeaturedProject] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        async function fetchFeaturedProject() {
            try {
                const response = await apiFetch('/api/v1/projects')

                if (response.ok) {
                    const data = await response.json()
                    const projects = Array.isArray(data) ? data : (data.data || data.projects || [])

                    // Filter to ONLY public projects
                    const publicProjects = projects.filter(p => p.isPublic !== false)

                    if (publicProjects.length > 0) {
                        // Pick a completely random project from the public list!
                        const randomIndex = Math.floor(Math.random() * publicProjects.length)
                        setFeaturedProject(publicProjects[randomIndex])
                    }
                }
            } catch (err) {
                console.error('Failed to fetch public feed:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchFeaturedProject()
    }, [])

    return (
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24 flex flex-col items-center text-center">

            {/* Hero Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-gray-600 dark:text-gray-400 mb-8">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Join the developer preview today
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight max-w-4xl leading-[1.1]">
                Your engineering work, in one place.
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mt-6 leading-relaxed">
                DevNest is a portfolio platform for engineers — show what you've built, get real feedback from peers, and build a permanent record of your technical work.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
                <Link
                    to={user ? "/profile" : "/register"}
                    className="w-full sm:w-auto bg-accent hover:bg-accent-light text-white font-semibold px-8 py-3 rounded-lg transition-colors text-base cursor-pointer shadow-lg shadow-accent/20"
                >
                    {user ? 'Go to Profile' : 'Claim your profile'}
                </Link>
                <Link
                    to="/explore"
                    className="w-full sm:w-auto bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-gray-800 dark:text-gray-200 font-semibold px-8 py-3 rounded-lg transition-colors text-base border border-neutral-200 dark:border-neutral-700 cursor-pointer"
                >
                    See What Others Build...  →
                </Link>
            </div>

            {/* Live Featured Project Preview Card */}
            <div className="w-full max-w-3xl mt-20 text-left">
                <div className="text-xs font-mono uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                    Random Live Community Project
                </div>

                {isLoading ? (
                    <div className="p-8 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-[#1a1a1a] text-center font-mono text-xs text-gray-400">
                        Loading public feed...
                    </div>
                ) : featuredProject ? (
                    <Link
                        to={`/project/${featuredProject.id}`}
                        className="block p-6 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-xl hover:border-accent transition-colors shadow-sm group"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-accent border border-neutral-200 dark:border-neutral-700">
                                FEATURED
                            </span>
                            <span className="text-sm font-mono text-gray-500 group-hover:text-accent transition-colors">
                                {featuredProject.title || featuredProject.name || 'Untitled'}
                            </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mt-2 line-clamp-2">
                            {featuredProject.description || 'No description provided.'}
                        </p>
                        <div className="flex items-center gap-4 mt-4 text-xs font-mono text-gray-500">
                            {featuredProject.language && (
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: featuredProject.languageColor || '#dea584' }}></span>
                                    {featuredProject.language}
                                </span>
                            )}
                            <span>★ {featuredProject._count?.stars || 0} stars</span>
                        </div>
                    </Link>
                ) : (
                    <div className="p-8 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-[#1a1a1a] text-center font-mono text-xs text-gray-500">
                        No public projects found in the database yet. Create one and make it public to feature it here!
                    </div>
                )}
            </div>

        </div>
    )
}