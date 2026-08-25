import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch, authorProfilePath, getProjectAuthor } from '../lib/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function ProjectDetailsPage() {
    const { projectId } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [project, setProject] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('readme')

    const [isStarred, setIsStarred] = useState(false)
    const [starCount, setStarCount] = useState(0)

    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [isSubmittingComment, setIsSubmittingComment] = useState(false)

    useEffect(() => {
        async function fetchData() {
            try {
                const projRes = await apiFetch(`/api/v1/projects/${projectId}`, {
                    method: 'GET',
                })

                if (projRes.ok) {
                    const data = await projRes.json()
                    const projData = data.data || data.project || data
                    setProject(projData)
                    setStarCount(projData._count?.stars || 0)
                    setIsStarred(projData.hasStarred || false)
                } else {
                    const errText = await projRes.text()
                    console.error("Project fetch failed:", errText)
                    setError('Project not found, or you do not have permission to view it.')
                    return
                }

                const commentsRes = await apiFetch(`/api/v1/projects/${projectId}/comments`)
                if (commentsRes.ok) {
                    const cData = await commentsRes.json()
                    setComments(Array.isArray(cData) ? cData : (cData.data || []))
                }
            } catch (err) {
                console.error(err)
                setError('Could not connect to the server.')
            } finally {
                setIsLoading(false)
            }
        }
        if (projectId) {
            fetchData()
        }
    }, [projectId])

    const handleToggleStar = async () => {
        if (!user) return navigate('/login')
        const method = isStarred ? 'DELETE' : 'POST'

        const wasStarred = isStarred;

        setIsStarred(!wasStarred)
        setStarCount(prev => wasStarred ? prev - 1 : prev + 1)

        try {
            const res = await apiFetch(`/api/v1/projects/${projectId}/star`, { method })
            if (!res.ok) {
                setIsStarred(wasStarred);
                setStarCount(prev => wasStarred ? prev + 1 : prev - 1);
            }
        } catch {
            setIsStarred(wasStarred);
            setStarCount(prev => wasStarred ? prev + 1 : prev - 1);
        }
    }

    const handlePostComment = async () => {
        if (!newComment.trim() || !user) return
        setIsSubmittingComment(true)
        try {
            const res = await apiFetch('/api/v1/comments', {
                method: 'POST',
                body: JSON.stringify({ projectId, content: newComment.trim() })
            })

            if (res.ok) {
                const createdComment = await res.json()
                // Fake the user object instantly for snappy UI
                if (!createdComment.user) createdComment.user = { id: user.id, username: user.username, avatarUrl: user.avatarUrl }
                setComments([...comments, createdComment])
                setNewComment('')
            }
        } catch (err) { console.error(err) }
        finally { setIsSubmittingComment(false) }
    }

    // NEW: Delete handler
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        // Optimistic UI update
        const previousComments = [...comments];
        setComments(comments.filter(c => c.id !== commentId));

        try {
            const res = await apiFetch(`/api/v1/comments/${commentId}`, { method: 'DELETE' })
            if (!res.ok) {
                setComments(previousComments); // Revert on failure
                console.error("Failed to delete comment");
            }
        } catch (err) {
            setComments(previousComments);
            console.error("Network error deleting comment", err);
        }
    }

    if (isLoading) return <div className="min-h-screen bg-white dark:bg-[#161616] flex items-center justify-center text-gray-500 dark:text-gray-400 font-mono text-sm transition-colors">Loading project...</div>
    if (error || !project) return <div className="min-h-screen bg-white dark:bg-[#161616] flex flex-col items-center justify-center text-red-500 font-mono text-sm p-6 text-center transition-colors">{error}</div>

    const { slug: authorSlug, name: authorName } = getProjectAuthor(project)
    const authorTo = authorProfilePath(authorSlug)
    const isOwner = user && (
        user.id === project.userId ||
        (authorSlug && (user.username === authorSlug || user.handle === authorSlug))
    )

    const rawLanguages = project.languages || project.projectLanguages?.map(pl => pl.language?.name) || [];
    const languageList = rawLanguages.map(l => typeof l === 'string' ? l : l.name).filter(Boolean);
    if (languageList.length === 0 && project.language) languageList.push(project.language);
    if (languageList.length === 0) languageList.push('Not specified');

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 lg:py-20 w-full min-h-screen bg-white dark:bg-[#161616] text-gray-900 dark:text-gray-100 transition-colors">
            <div className="mb-8">
                <Link to="/profile" className="text-sm font-mono text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">← Back</Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-10 border-b border-gray-200 dark:border-neutral-800">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-4 flex-wrap">
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-4 break-words">
                            <span className="w-3.5 h-3.5 rounded-full bg-accent shrink-0 shadow-sm shadow-accent/50"></span>
                            {project.title || project.name || 'Untitled Project'}
                        </h1>
                        {!project.isPublic && (
                            <span className="px-2.5 py-1 text-xs font-mono bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-neutral-700 rounded uppercase tracking-wider font-bold shrink-0 mt-1">
                                Private
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-600 dark:text-gray-500">Built by</span>
                        {authorTo ? (
                            <Link
                                to={`/u/${project.owner?.username || project.user?.username || authorSlug}`}
                                className="text-sm font-bold text-accent hover:underline"
                            >
                                @{project.owner?.username || project.user?.username || authorSlug}
                            </Link>
                        ) : (
                            <span className="text-sm font-bold text-accent">@{authorName || 'developer'}</span>
                        )}
                    </div>

                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl break-words">{project.description}</p>
                </div>

                <div className="flex flex-row md:flex-col gap-3 shrink-0">
                    <button
                        onClick={handleToggleStar}
                        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm font-bold transition-colors border shadow-sm cursor-pointer ${isStarred
                            ? 'bg-accent border-accent text-white hover:bg-accent-light'
                            : 'bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                            }`}
                    >
                        ★ {isStarred ? 'Starred' : 'Star'} ({starCount})
                    </button>

                    {isOwner && (
                        <Link
                            to={`/project/${project.id}/edit`}
                            className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 px-5 py-2.5 rounded-md text-sm font-bold transition-colors cursor-pointer text-center shadow-sm"
                        >
                            Edit Project
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pt-8 w-full">
                <div className="md:col-span-3 flex flex-col gap-6 min-w-0">
                    <div className="flex gap-6 border-b border-gray-200 dark:border-neutral-800">
                        <button onClick={() => setActiveTab('readme')} className={`pb-3 text-sm font-bold transition-colors cursor-pointer border-b-2 ${activeTab === 'readme' ? 'border-accent text-gray-900 dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Readme</button>
                        <button onClick={() => setActiveTab('discussions')} className={`pb-3 text-sm font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${activeTab === 'discussions' ? 'border-accent text-gray-900 dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                            Discussions <span className="bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs font-mono border border-gray-200 dark:border-transparent">{comments.length}</span>
                        </button>
                    </div>

                    <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 p-8 rounded-xl min-h-[300px] w-full overflow-hidden shadow-sm transition-colors">
                        {activeTab === 'readme' && (
                            <div className="prose prose-sm dark:prose-invert max-w-full w-full overflow-x-auto break-words text-gray-800 dark:text-gray-200">
                                {project.readme ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {project.readme.replace(/^[ \t]+/gm, '')}
                                    </ReactMarkdown>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                                        <p className="text-gray-500 font-mono text-sm">There is no readme for this project.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'discussions' && (
                            <div className="flex flex-col h-full w-full">
                                <div className="flex-1 mb-8 flex flex-col gap-6">
                                    {comments.length === 0 ? (
                                        <div className="text-center py-12 border-b border-gray-200 dark:border-neutral-800"><p className="text-gray-500 font-mono text-sm">No comments yet.</p></div>
                                    ) : (
                                        comments.map((comment, index) => {
                                            // Check if comment belongs to the project owner
                                            const isProjectAuthorComment = comment.userId === project.userId;

                                            // Check if logged-in user owns this specific comment
                                            const canDelete = user && (user.id === comment.userId);

                                            return (
                                                <div key={comment.id || index} className="flex gap-4 items-start w-full">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 shrink-0 border border-gray-200 dark:border-neutral-700 overflow-hidden">
                                                        {comment.user?.avatarUrl ? (
                                                            <img src={comment.user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                                        ) : (
                                                            comment.user?.username ? comment.user.username.charAt(0).toUpperCase() : 'U'
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 break-words transition-colors">
                                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                                {comment.user?.username || 'User'}
                                                            </span>

                                                            {isProjectAuthorComment && (
                                                                <span className="bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider shrink-0">
                                                                    Author
                                                                </span>
                                                            )}

                                                            <div className="ml-auto flex items-center gap-4 shrink-0">
                                                                <span className="text-xs font-mono text-gray-500">
                                                                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Just now'}
                                                                </span>

                                                                {canDelete && (
                                                                    <button
                                                                        onClick={() => handleDeleteComment(comment.id)}
                                                                        className="text-xs font-bold text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>

                                {user && (
                                    <div className="flex gap-4 items-start pt-6 border-t border-gray-200 dark:border-neutral-800 w-full">
                                        <div className="flex-1 min-w-0">
                                            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Leave a comment..." className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent resize-none h-20 text-gray-900 dark:text-gray-100 transition-colors"></textarea>
                                            <div className="flex justify-end mt-2">
                                                <button onClick={handlePostComment} disabled={isSubmittingComment || !newComment.trim()} className="bg-accent hover:bg-accent-light text-white font-bold px-5 py-2.5 rounded-md text-sm transition-colors cursor-pointer disabled:opacity-50">
                                                    {isSubmittingComment ? 'Posting...' : 'Comment'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <aside className="flex flex-col gap-6 min-w-0">
                    <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 p-6 rounded-xl flex flex-col gap-5 shadow-sm transition-colors">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 block">Languages Used</span>
                            <div className="flex flex-wrap gap-2">
                                {languageList.map((lang, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 px-3 py-1.5 rounded-md transition-colors">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: project.languageColor || '#2a8a7e' }}></span>
                                        <span className="truncate">{lang}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="border-t border-gray-200 dark:border-neutral-800 pt-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Last Updated</span>
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate block">
                                {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Recently'}
                            </span>
                        </div>
                    </div>

                    {project.tags && project.tags.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 block">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.tags.map(tag => (
                                    <span key={tag} className="text-xs font-mono px-3 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 truncate max-w-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    )
}