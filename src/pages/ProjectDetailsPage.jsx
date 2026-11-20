import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
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
import ImageLightbox from '../components/ImageLightbox'
import VolumetricBackground from '../components/VolumetricBackground'
import GlassIconTile from '../components/GlassIconTile'

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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

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
        <div className="h-10 w-1/2 rounded-xl glass-panel animate-pulse" />
        <div className="h-72 w-full rounded-2xl glass-panel animate-pulse" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="relative flex-1 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <VolumetricBackground variant="profile" />
        <div className="relative z-10 glass-panel rounded-3xl p-8 max-w-md w-full flex flex-col items-center gap-4">
          <GlassIconTile size="lg" accent={true}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
          </GlassIconTile>
          <p className="text-rose-500 font-mono text-sm">{error}</p>
          <Link
            to="/explore"
            className="btn-3d-pill font-semibold px-6 py-2.5 rounded-full text-sm"
          >
            ← Explore Projects
          </Link>
        </div>
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
    <div className="relative w-full min-h-screen overflow-hidden">
      <VolumetricBackground variant="profile" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 lg:py-16 w-full">
        <div className="mb-8">
          <Link
            to={authorTo || '/explore'}
            className="btn-glass-pill text-xs font-mono px-4 py-1.5 rounded-full"
          >
            ← Back
          </Link>
        </div>

        {/* Optional Project Cover Banner — click to open full-screen Lightbox */}
        {project.projectimgUrl && (
          <>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              aria-label="Open full-size project cover image"
              className="block mb-10 rounded-3xl p-2 glass-panel overflow-hidden aspect-[16/9] max-h-[440px] w-full cursor-zoom-in group"
            >
              <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08]">
                <img
                  src={project.projectimgUrl}
                  alt={`${project.title || 'Project'} cover`}
                  fetchPriority="high"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
            </button>
            <ImageLightbox
              src={project.projectimgUrl}
              alt={`${project.title || 'Project'} cover`}
              isOpen={isLightboxOpen}
              onClose={() => setIsLightboxOpen(false)}
            />
          </>
        )}

        {/* Project Header Glass Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3.5 mb-3 flex-wrap">
                <GlassIconTile size="md" accent={true}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </GlassIconTile>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words">
                  {project.title || project.name || 'Untitled Project'}
                </h1>
                {!project.isPublic && (
                  <span className="px-2.5 py-0.5 text-xs font-mono bg-slate-100 dark:bg-white/[0.07] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.12] rounded-full uppercase tracking-wider font-bold shrink-0">
                    Private
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-4 font-mono text-xs sm:text-sm">
                <span className="text-slate-500 dark:text-slate-400">Built by</span>
                {authorTo ? (
                  <Link to={authorTo} className="font-bold text-accent dark:text-accent-light hover:underline">
                    @{authorSlug}
                  </Link>
                ) : (
                  <span className="font-bold text-accent dark:text-accent-light">
                    @{authorName || 'developer'}
                  </span>
                )}
              </div>

              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl break-words">
                {project.description}
              </p>

              {/* Optional Project Links */}
              {projectLinks.length > 0 && (
                <div className="flex flex-wrap gap-2.5 mt-6">
                  {projectLinks.map((link, idx) => (
                    <a
                      key={`${link.url}-${idx}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-glass-pill px-4 py-2 rounded-full text-xs sm:text-sm font-mono font-semibold"
                    >
                      <svg className="w-3.5 h-3.5 text-accent dark:text-accent-light shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span>{link.name}</span>
                      <span aria-hidden="true" className="opacity-70">↗</span>
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
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-60 ${
                  isStarred ? 'btn-3d-pill' : 'btn-glass-pill'
                }`}
              >
                <span className="text-amber-400">★</span>
                <span>{isStarred ? 'Starred' : 'Star'} ({starCount})</span>
              </button>

              {isOwner && (
                <Link
                  to={`/project/${project.id}/edit`}
                  className="btn-glass-pill px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-center"
                >
                  Edit Project
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full">
          <div className="md:col-span-3 flex flex-col gap-6 min-w-0">
            {/* Sliding Glass Tabs */}
            <div className="inline-flex items-center gap-1 p-1 rounded-full glass-panel self-start" role="tablist">
              {[
                { id: 'readme', label: 'Readme', count: null },
                { id: 'discussions', label: 'Discussions', count: comments.length },
              ].map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="projectDetailTab"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute inset-0 -z-10 rounded-full bg-white dark:bg-white/[0.12] border border-slate-200/80 dark:border-accent-light/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)]"
                      />
                    )}
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span className="bg-accent/15 text-accent dark:text-accent-light border border-accent/30 px-2 py-0.2 rounded-full text-[11px] font-mono">
                        {tab.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="glass-panel p-6 sm:p-8 rounded-3xl min-h-[300px] w-full overflow-hidden">
              {activeTab === 'readme' && (
                <div className="prose prose-sm dark:prose-invert max-w-full w-full overflow-x-auto break-words text-slate-800 dark:text-slate-200">
                  {project.readme ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {project.readme.replace(/^[ \t]+/gm, '')}
                    </ReactMarkdown>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-16 text-center gap-3">
                      <GlassIconTile size="md" accent={true}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </GlassIconTile>
                      <p className="text-slate-500 dark:text-slate-400 font-mono text-sm">
                        There is no readme for this project.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'discussions' && (
                <div className="flex flex-col h-full w-full">
                  <div className="flex-1 mb-8 flex flex-col gap-5">
                    {comments.length === 0 ? (
                      <div className="text-center py-12 border-b border-slate-200/70 dark:border-white/[0.08] flex flex-col items-center gap-3">
                        <GlassIconTile size="md" accent={true}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </GlassIconTile>
                        <p className="text-slate-500 dark:text-slate-400 font-mono text-sm">
                          No comments yet. Start the technical discussion below.
                        </p>
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
                          <div key={comment.id || index} className="flex gap-3.5 items-start w-full">
                            <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-white/[0.08] flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0 border border-slate-300 dark:border-white/[0.12] overflow-hidden">
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
                            <div className="flex-1 min-w-0 bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-4 break-words">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                {commentProfileTo ? (
                                  <Link
                                    to={commentProfileTo}
                                    className="text-sm font-bold text-slate-900 dark:text-white hover:text-accent dark:hover:text-accent-light truncate transition-colors"
                                  >
                                    @{commentDisplayName}
                                  </Link>
                                ) : (
                                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                    @{commentDisplayName}
                                  </span>
                                )}

                                {isProjectAuthorComment && (
                                  <span className="bg-accent/15 text-accent dark:text-accent-light border border-accent/30 px-2 py-0.5 rounded-full text-[10px] uppercase font-mono font-bold tracking-wider shrink-0">
                                    Author
                                  </span>
                                )}

                                <div className="ml-auto flex items-center gap-4 shrink-0">
                                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Just now'}
                                  </span>
                                  {canDelete && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="text-xs font-mono font-bold text-rose-500 hover:underline cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {user ? (
                    <form onSubmit={handlePostComment} className="flex flex-col gap-3 pt-6 border-t border-slate-200/70 dark:border-white/[0.08] w-full">
                      <label htmlFor="new-comment" className="sr-only">
                        Leave a comment
                      </label>
                      <textarea
                        id="new-comment"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Leave a constructive comment or question..."
                        maxLength={2000}
                        className="w-full glass-input rounded-2xl p-3.5 text-sm resize-none h-24"
                      />
                      {commentError && <p role="alert" className="text-xs font-mono text-rose-500">{commentError}</p>}
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmittingComment || !newComment.trim()}
                          className="btn-3d-pill font-bold px-6 py-2.5 rounded-full text-xs sm:text-sm cursor-pointer disabled:opacity-50"
                        >
                          {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200/70 dark:border-white/[0.08]">
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
            <div className="glass-panel p-6 rounded-3xl flex flex-col gap-5">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block">
                  Languages Used
                </span>
                <div className="flex flex-wrap gap-2">
                  {languageList.map((lang, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] px-3 py-1.5 rounded-xl"
                    >
                      <span className="w-2 h-2 rounded-full shrink-0 bg-accent-light shadow-[0_0_8px_#3cd2bf]" />
                      <span className="truncate">{lang}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-slate-200/70 dark:border-white/[0.08] pt-4">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 block">
                  Last Updated
                </span>
                <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Recently'}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
