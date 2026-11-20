import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import {
  apiFetch,
  authorProfilePath,
  getProjectAuthor,
  getStarCount,
  normalizeProjectLinks,
} from '../lib/api'
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
  const [isTogglingStar, setIsTogglingStar] = useState(false)

  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [commentError, setCommentError] = useState('')

  useDocumentTitle(
    project?.title || 'Project Details',
    project?.description || 'Explore project architecture, live links, and community discussions on DevNest.',
  )

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        const [projRes, commentsRes] = await Promise.all([
          apiFetch(`/api/v1/projects/${projectId}`),
          apiFetch(`/api/v1/projects/${projectId}/comments`),
        ])

        if (cancelled) return

        if (projRes.ok) {
          const data = await projRes.json()
          const projData = data.data || data.project || data
          setProject(projData)
          setStarCount(getStarCount(projData))
          setIsStarred(Boolean(projData.hasStarred))
        } else {
          setError('Project not found, or you do not have permission to view it.')
          return
        }

        if (commentsRes.ok) {
          const cData = await commentsRes.json()
          setComments(Array.isArray(cData) ? cData : cData.data || [])
        }
      } catch {
        if (!cancelled) setError('Could not connect to the server.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    if (projectId) fetchData()
    return () => {
      cancelled = true
    }
  }, [projectId])

  const handleToggleStar = async () => {
    if (!user) return navigate('/login')
    if (isTogglingStar) return

    const method = isStarred ? 'DELETE' : 'POST'
    const wasStarred = isStarred

    setIsTogglingStar(true)
    setIsStarred(!wasStarred)
    setStarCount((prev) => (wasStarred ? Math.max(0, prev - 1) : prev + 1))

    try {
      const res = await apiFetch(`/api/v1/projects/${projectId}/star`, { method })
      if (!res.ok) {
        setIsStarred(wasStarred)
        setStarCount((prev) => (wasStarred ? prev + 1 : Math.max(0, prev - 1)))
      }
    } catch {
      setIsStarred(wasStarred)
      setStarCount((prev) => (wasStarred ? prev + 1 : Math.max(0, prev - 1)))
    } finally {
      setIsTogglingStar(false)
    }
  }

  const handlePostComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !user || isSubmittingComment) return
    setIsSubmittingComment(true)
    setCommentError('')

    try {
      const res = await apiFetch('/api/v1/comments', {
        method: 'POST',
        body: JSON.stringify({ projectId, content: newComment.trim() }),
      })

      if (res.ok) {
        const createdComment = await res.json()
        if (!createdComment.user) {
          createdComment.user = {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl,
          }
        }
        setComments((prev) => [...prev, createdComment])
        setNewComment('')
      } else {
        setCommentError('Could not post your comment. Please try again.')
      }
    } catch {
      setCommentError('Network error while posting comment.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return
    const previousComments = [...comments]
    setComments((prev) => prev.filter((c) => c.id !== commentId))

    try {
      const res = await apiFetch(`/api/v1/comments/${commentId}`, { method: 'DELETE' })
      if (!res.ok) setComments(previousComments)
    } catch {
      setComments(previousComments)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 w-full space-y-6">
        <div className="h-10 w-1/2 rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse" />
        <div className="h-64 w-full rounded-xl bg-gray-100 dark:bg-neutral-800 animate-pulse" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#161616] flex flex-col items-center justify-center p-6 text-center gap-4">
        <p className="text-red-500 font-mono text-sm">{error}</p>
        <Link
          to="/explore"
          className="bg-accent hover:bg-accent-light text-white font-semibold px-5 py-2 rounded-md text-sm transition-colors"
        >
          ← Explore Projects
        </Link>
      </div>
    )
  }

  const { slug: authorSlug, name: authorName } = getProjectAuthor(project)
  const authorTo = authorProfilePath(authorSlug)
  const isOwner =
    user &&
    (user.id === project.userId ||
      (authorSlug && (user.username === authorSlug || user.handle === authorSlug)))

  const rawLanguages =
    project.languages || project.projectLanguages?.map((pl) => pl.language?.name) || []
  const languageList = rawLanguages.map((l) => (typeof l === 'string' ? l : l.name)).filter(Boolean)
  if (languageList.length === 0 && project.language) languageList.push(project.language)
  if (languageList.length === 0) languageList.push('Not specified')

  const projectLinks = normalizeProjectLinks(project.links)

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16 w-full min-h-screen bg-white dark:bg-[#161616] text-gray-900 dark:text-gray-100 transition-colors">
      <div className="mb-8">
        <Link
          to={authorTo || '/explore'}
          className="text-sm font-mono text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          ← Back
        </Link>
      </div>

      {/* Optional Project Cover Banner */}
      {project.projectimgUrl && (
        <div className="animate-fade-up mb-10 rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-md aspect-[16/9] max-h-[440px] w-full bg-gray-100 dark:bg-neutral-900">
          <img
            src={project.projectimgUrl}
            alt={`${project.title || 'Project'} cover`}
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-10 border-b border-gray-200 dark:border-neutral-800">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-4 break-words">
              <span className="w-3.5 h-3.5 rounded-full bg-accent shrink-0 shadow-sm shadow-accent/50" />
              {project.title || project.name || 'Untitled Project'}
            </h1>
            {!project.isPublic && (
              <span className="px-2.5 py-1 text-xs font-mono bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 rounded uppercase tracking-wider font-bold shrink-0 mt-1">
                Private
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Built by</span>
            {authorTo ? (
              <Link to={authorTo} className="text-sm font-bold text-accent dark:text-accent-light hover:underline">
                @{authorSlug}
              </Link>
            ) : (
              <span className="text-sm font-bold text-accent dark:text-accent-light">
                @{authorName || 'developer'}
              </span>
            )}
          </div>

          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl break-words">
            {project.description}
          </p>

          {/* Optional Project Links */}
          {projectLinks.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mt-5">
              {projectLinks.map((link, idx) => (
                <a
                  key={`${link.url}-${idx}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-accent/10 text-accent dark:text-accent-light border border-accent/25 hover:bg-accent hover:text-white transition-all duration-150 hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {link.name}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-row md:flex-col gap-3 shrink-0">
          <button
            type="button"
            onClick={handleToggleStar}
            disabled={isTogglingStar}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm font-bold transition-all duration-150 active:scale-95 border shadow-sm cursor-pointer disabled:opacity-60 ${
              isStarred
                ? 'bg-accent border-accent text-white hover:bg-accent-light'
                : 'bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800'
            }`}
          >
            ★ {isStarred ? 'Starred' : 'Star'} ({starCount})
          </button>

          {isOwner && (
            <Link
              to={`/project/${project.id}/edit`}
              className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 px-5 py-2.5 rounded-md text-sm font-bold transition-colors cursor-pointer text-center shadow-sm"
            >
              Edit Project
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pt-8 w-full">
        <div className="md:col-span-3 flex flex-col gap-6 min-w-0">
          <div className="flex gap-6 border-b border-gray-200 dark:border-neutral-800" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'readme'}
              onClick={() => setActiveTab('readme')}
              className={`pb-3 text-sm font-bold transition-colors cursor-pointer border-b-2 ${
                activeTab === 'readme'
                  ? 'border-accent text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Readme
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'discussions'}
              onClick={() => setActiveTab('discussions')}
              className={`pb-3 text-sm font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
                activeTab === 'discussions'
                  ? 'border-accent text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Discussions
              <span className="bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-mono border border-gray-200 dark:border-neutral-700">
                {comments.length}
              </span>
            </button>
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 p-6 sm:p-8 rounded-xl min-h-[300px] w-full overflow-hidden shadow-sm transition-colors">
            {activeTab === 'readme' && (
              <div className="prose prose-sm dark:prose-invert max-w-full w-full overflow-x-auto break-words text-gray-800 dark:text-gray-200">
                {project.readme ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {project.readme.replace(/^[ \t]+/gm, '')}
                  </ReactMarkdown>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                    <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">
                      There is no readme for this project.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'discussions' && (
              <div className="flex flex-col h-full w-full">
                <div className="flex-1 mb-8 flex flex-col gap-6">
                  {comments.length === 0 ? (
                    <div className="text-center py-12 border-b border-gray-200 dark:border-neutral-800">
                      <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">No comments yet.</p>
                    </div>
                  ) : (
                    comments.map((comment, index) => {
                      const isProjectAuthorComment = comment.userId === project.userId
                      const canDelete = user && user.id === comment.userId
                      const commenter = comment.user || comment.author || {}
                      const commentUsername = commenter.username || commenter.handle
                      const commentProfileTo = commentUsername ? `/${commentUsername}` : null
                      const commentDisplayName = commentUsername || 'User'

                      return (
                        <div key={comment.id || index} className="flex gap-4 items-start w-full">
                          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 shrink-0 border border-gray-200 dark:border-neutral-700 overflow-hidden">
                            {commenter.avatarUrl ? (
                              <img
                                src={commenter.avatarUrl}
                                alt={`${commentDisplayName} avatar`}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              commentDisplayName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 break-words transition-colors">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              {commentProfileTo ? (
                                <Link
                                  to={commentProfileTo}
                                  className="text-sm font-bold text-gray-900 dark:text-white hover:text-accent truncate transition-colors"
                                >
                                  {commentDisplayName}
                                </Link>
                              ) : (
                                <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                  {commentDisplayName}
                                </span>
                              )}

                              {isProjectAuthorComment && (
                                <span className="bg-accent/10 text-accent dark:text-accent-light border border-accent/25 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider shrink-0">
                                  Author
                                </span>
                              )}

                              <div className="ml-auto flex items-center gap-4 shrink-0">
                                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                  {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Just now'}
                                </span>
                                {canDelete && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {user ? (
                  <form onSubmit={handlePostComment} className="flex flex-col gap-2 pt-6 border-t border-gray-200 dark:border-neutral-800 w-full">
                    <label htmlFor="new-comment" className="sr-only">
                      Leave a comment
                    </label>
                    <textarea
                      id="new-comment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Leave a comment..."
                      maxLength={2000}
                      className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none h-24 text-gray-900 dark:text-gray-100 transition-colors"
                    />
                    {commentError && <p role="alert" className="text-xs font-mono text-red-500">{commentError}</p>}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingComment || !newComment.trim()}
                        className="bg-accent hover:bg-accent-light text-white font-bold px-5 py-2.5 rounded-md text-sm transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingComment ? 'Posting...' : 'Comment'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-xs font-mono text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-neutral-800">
                    <Link to="/login" className="text-accent dark:text-accent-light hover:underline font-semibold">
                      Sign in
                    </Link>{' '}
                    to join the discussion.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-6 min-w-0">
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 p-6 rounded-xl flex flex-col gap-5 shadow-sm transition-colors">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3 block">
                Languages Used
              </span>
              <div className="flex flex-wrap gap-2">
                {languageList.map((lang, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 px-3 py-1.5 rounded-md transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-accent" />
                    <span className="truncate">{lang}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-neutral-800 pt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2 block">
                Last Updated
              </span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate block">
                {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Recently'}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
