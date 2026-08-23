import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProjectDetailsPage() {
    const { projectId } = useParams()
    const { user } = useAuth()
    const [project, setProject] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('readme') // State for managing tabs

    useEffect(() => {
        async function fetchProject() {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
                const response = await fetch(`${baseUrl}/api/v1/projects/${projectId}`, {
                    credentials: 'include'
                })

                if (response.ok) {
                    const data = await response.json()
                    setProject(data.data || data.project || data)
                } else {
                    setError('Project not found, or you do not have permission to view it.')
                }
            } catch (err) {
                console.error('Failed to fetch project:', err)
                setError('Could not connect to the server.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchProject()
    }, [projectId])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#161616] flex items-center justify-center text-gray-400 font-mono text-sm">
                Loading project details...
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#161616] flex flex-col items-center justify-center gap-4 text-gray-400 font-mono text-sm">
                <p className="text-red-500">{error || 'Project not found'}</p>
                <Link to="/profile" className="text-accent hover:underline">← Back to Profile</Link>
            </div>
        )
    }

    const isOwner = user && (user.id === project.userId || user.username === project.owner?.username)

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 lg:py-20 w-full min-h-screen">
            <div className="mb-8">
                <Link to="/profile" className="text-sm font-mono text-gray-500 hover:text-white transition-colors">
                    ← Back to profile
                </Link>
            </div>

            {/* ── Header Section ────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 border-b border-gray-200 dark:border-neutral-800">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {project.title || project.name || 'Untitled Project'}
                        </h1>
                        {!project.isPublic && (
                            <span className="px-2 py-0.5 text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-gray-500 border border-neutral-200 dark:border-neutral-700 rounded">
                                PRIVATE
                            </span>
                        )}
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 leading-relaxed max-w-2xl">
                        {project.description}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row md:flex-col gap-3 shrink-0">
                    {isOwner && (
                        <button className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-semibold transition-colors border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                            Edit Project
                        </button>
                    )}
                </div>
            </div>

            {/* ── Body Section ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pt-8">

                {/* Main Content (Tabs & Data) */}
                <div className="md:col-span-3 flex flex-col gap-6">

                    {/* Tabs Navigation */}
                    <div className="flex gap-6 border-b border-gray-200 dark:border-neutral-800">
                        <button
                            onClick={() => setActiveTab('readme')}
                            className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 ${activeTab === 'readme'
                                    ? 'border-accent text-gray-900 dark:text-white'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Readme
                        </button>
                        <button
                            onClick={() => setActiveTab('discussions')}
                            className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${activeTab === 'discussions'
                                    ? 'border-accent text-gray-900 dark:text-white'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Discussions
                            <span className="bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
                                0
                            </span>
                        </button>
                    </div>

                    {/* Tabs Content */}
                    <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 p-6 rounded-xl min-h-[300px]">
                        {activeTab === 'readme' && (
                            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {/* 
                  If you have a project.readme field in the DB, render it here. 
                  Otherwise, show the empty state requested.
                */}
                                {project.readme ? (
                                    <div>{project.readme}</div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                                        <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">There is no readme for this project.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'discussions' && (
                            <div className="flex flex-col h-full">
                                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center border-b border-gray-200 dark:border-neutral-800 mb-6">
                                    <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                    <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">No comments yet. Be the first to start a discussion!</p>
                                </div>

                                {/* Mock Comment Input Box */}
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded bg-emerald-900 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                                        {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            placeholder="Leave a comment..."
                                            className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent resize-none h-20"
                                        ></textarea>
                                        <div className="flex justify-end mt-2">
                                            <button className="bg-accent hover:bg-accent-light text-white font-semibold px-4 py-1.5 rounded-md text-sm transition-colors cursor-pointer">
                                                Comment
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Meta Sidebar (Right Column) */}
                <aside className="flex flex-col gap-6">
                    <div>
                        <h3 className="text-sm font-mono text-gray-500 mb-2">Language</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 font-medium bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 px-3 py-2 rounded-lg">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: project.languageColor || '#dea584' }}></span>
                            {project.language || 'Not specified'}
                        </div>
                    </div>

                    {project.tags && project.tags.length > 0 && (
                        <div>
                            <h3 className="text-sm font-mono text-gray-500 mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.tags.map(tag => (
                                    <span key={tag} className="text-xs font-mono px-2 py-1 rounded bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-neutral-700">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-mono text-gray-500 mb-2">Stats</h3>
                        <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-2">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                                {project._count?.stars || 0} stars
                            </span>
                            <span className="flex items-center gap-2">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.5a2.5 2.5 0 012.5 2.5c0 1.12-.74 2.07-1.75 2.39v2.11L18 14.73V19.5a2.5 2.5 0 11-1.5 0v-4.2l-4.5-4.5v-2.41a2.5 2.5 0 110-4.89zM6 19.5a2.5 2.5 0 11-1.5 0v-4.2l5.25-5.25v-2.41a2.5 2.5 0 111.5 0v2.41l-5.25 5.25V19.5z"></path></svg>
                                {project.forks || 0} forks
                            </span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-mono text-gray-500 mb-2">Last Updated</h3>
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                            {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Recently'}
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    )
}