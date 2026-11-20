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
import { getSavedPinnedMap, savePinnedState } from '../lib/projectOrder'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ImageLightbox from '../components/ImageLightbox'
import ContactCTA from '../components/ContactCTA'

export default function ProjectDetailsPage() {
  const { projectId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [authorProfile, setAuthorProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('readme')

  const [isStarred, setIsStarred] = useState(false)
  const [starCount, setStarCount] = useState(0)
  const [isTogglingStar, setIsTogglingStar] = useState(false)
  const [isPinned, setIsPinned] = useState(false)

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

          const { slug } = getProjectAuthor(projData)
          const savedPins = getSavedPinnedMap(slug)
          const pinnedStatus =
            projData.id in savedPins
              ? Boolean(savedPins[projData.id])
              : Boolean(projData.isPinned)
          setIsPinned(pinnedStatus)

          // Fetch author public profile for full Contact CTA metadata
          if (slug) {
            apiFetch(`/api/v1/user/${encodeURIComponent(slug)}`)
              .then(async (uRes) => {
                if (!cancelled && uRes.ok) {
                  const uData = await uRes.json()
                  const fetchedUser = uData.user || uData.data?.user || uData.data || uData
                  setAuthorProfile(fetchedUser)
                }
              })
              .catch(() => {})
          }
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

  const handleTogglePin = async () => {
    if (!project) return
    const { slug } = getProjectAuthor(project)
    const nextPinned = !isPinned
    setIsPinned(nextPinned)
    savePinnedState(slug || user?.username, project.id, nextPinned)

    try {
      await apiFetch(`/api/v1/projects/${project.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isPinned: nextPinned }),
      })
    } catch {
      // Local pin state already saved
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
        <div className="h-10 w-1/2 rounded-lg glass-panel animate-pulse" />
        <div className="h-64 w-full rounded-xl glass-panel animate-pulse" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
        <p className="text-rose-500 font-mono text-sm">{error}</p>
        <Link
          to="/explore"
          className="btn-3d-pill font-semibold px-5 py-2 rounded-lg text-sm"
        >
          ← Explore Projects
        </Link>
      </div>
    )
  }

  const { slug: authorSlug, name: authorName, avatar: authorAvatar } = getProjectAuthor(project)
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

  const developerContactData = {
    ...(project.owner || project.user || {}),
    ...(authorProfile || {}),
    ...(isOwner && user ? user : {}),
    handle: authorSlug || authorName || 'developer',
    username: authorSlug || authorName || 'developer',
    name: authorProfile?.name || authorName || authorSlug || 'developer',
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16 w-full min-h-screen">
      <div className="mb-8">
        <Link
          to={authorTo || '/explore'}
          className="text-sm font-mono text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          ← Back to {authorSlug ? `@${authorSlug}` : 'Explore'}
        </Link>
      </div>

      {/* Optional Project Cover Banner — click to open full-screen Lightbox */}
      {project.projectimgUrl && (
        <>
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            aria-label="Open full-size project cover image"
            className="block mb-10 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.08] shadow-sm aspect-[16/9] max-h-[440px] w-full bg-slate-100 dark:bg-[#0d0f16] cursor-zoom-in group"
          >
            <img
              src={project.projectimgUrl}
              alt={`${project.title || 'Project'} cover`}
              fetchPriority="high"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </button>
          <ImageLightbox
            src={project.projectimgUrl}
            alt={`${project.title || 'Project'} cover`}
            isOpen={isLightboxOpen}
            onClose={() => setIsLightboxOpen(false)}
          />
        </>
      )}

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-10 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words">
              {project.title || project.name || 'Untitled Project'}
            </h1>
            {isPinned && (
              <span className="px-2.5 py-0.5 text-xs font-mono bg-accent/15 text-accent dark:text-accent-light border border-accent/30 rounded-full uppercase tracking-wider font-bold shrink-0">
                ★ Pinned
              </span>
            )}
            {!project.isPublic && (
              <span className="px-2.5 py-0.5 text-xs font-mono bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.1] rounded uppercase tracking-wider font-bold shrink-0">
                Private
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-slate-500 dark:text-slate-400">Built by</span>
            {authorTo ? (
              <Link to={authorTo} className="text-sm font-mono font-semibold text-accent dark:text-accent-light hover:underline">
                @{authorSlug}
              </Link>
            ) : (
              <span className="text-sm font-mono font-semibold text-accent dark:text-accent-light">
                @{authorName || 'developer'}
              </span>
            )}
          </div>

          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl break-words">
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
                  className="btn-glass-pill px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-medium"
                >
                  <span>{link.name}</span>
                  <span aria-hidden="true" className="opacity-70">↗</span>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap md:flex-col gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleToggleStar}
            disabled={isTogglingStar}
            className={`px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-60 ${
              isStarred ? 'btn-3d-pill' : 'btn-glass-pill'
            }`}
          >
            ★ {isStarred ? 'Starred' : 'Star'} ({starCount})
          </button>

          {isOwner && (
            <>
              <button
                type="button"
                onClick={handleTogglePin}
                className={`px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer ${
                  isPinned ? 'btn-3d-pill' : 'btn-glass-pill'
                }`}
              >
                {isPinned ? '★ Pinned to Top' : '☆ Pin to Top'}
              </button>
              <Link
                to={`/project/${project.id}/edit`}
                className="btn-glass-pill px-5 py-2 rounded-lg text-sm font-semibold text-center"
              >
                Edit Project
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10 pt-8 w-full">
        <div className="lg:col-span-3 flex flex-col gap-6 min-w-0">
          <div className="flex gap-6 border-b border-slate-200/80 dark:border-white/[0.08]" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'readme'}
              onClick={() => setActiveTab('readme')}
              className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 ${
                activeTab === 'readme'
                  ? 'border-accent text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Readme
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'discussions'}
              onClick={() => setActiveTab('discussions')}
              className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
                activeTab === 'discussions'
                  ? 'border-accent text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Discussions
              <span className="bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-mono border border-slate-200 dark:border-white/[0.08]">
                {comments.length}
              </span>
            </button>
          </div>

          <div className="glass-panel p-6 sm:p-8 rounded-xl min-h-[300px] w-full overflow-hidden">
            {activeTab === 'readme' && (
              <div className="prose prose-sm dark:prose-invert max-w-full w-full overflow-x-auto break-words text-slate-800 dark:text-slate-200">
                {project.readme ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {project.readme.replace(/^[ \t]+/gm, '')}
                  </ReactMarkdown>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-center">
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
                    <div className="text-center py-12 border-b border-slate-200/70 dark:border-white/[0.08]">
                      <p className="text-slate-500 dark:text-slate-400 font-mono text-sm">No comments yet.</p>
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
                          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-white/[0.08] flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0 border border-slate-300 dark:border-white/[0.12] overflow-hidden">
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
                          <div className="flex-1 min-w-0 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] rounded-lg p-4 break-words">
                            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                              {commentProfileTo ? (
                                <Link
                                  to={commentProfileTo}
                                  className="text-sm font-bold text-slate-900 dark:text-white hover:text-accent truncate transition-colors"
                                >
                                  {commentDisplayName}
                                </Link>
                              ) : (
                                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                  {commentDisplayName}
                                </span>
                              )}

                              {isProjectAuthorComment && (
                                <span className="bg-accent/10 text-accent dark:text-accent-light border border-accent/25 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-wider shrink-0">
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
                                    className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {user ? (
                  <form onSubmit={handlePostComment} className="flex flex-col gap-2.5 pt-6 border-t border-slate-200/70 dark:border-white/[0.08] w-full">
                    <label htmlFor="new-comment" className="sr-only">
                      Leave a comment
                    </label>
                    <textarea
                      id="new-comment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Leave a comment..."
                      maxLength={2000}
                      className="w-full glass-input rounded-lg p-3 text-sm resize-none h-24"
                    />
                    {commentError && <p role="alert" className="text-xs font-mono text-rose-500">{commentError}</p>}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingComment || !newComment.trim()}
                        className="btn-3d-pill font-semibold px-5 py-2 rounded-lg text-sm cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingComment ? 'Posting...' : 'Comment'}
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

          {/* Direct Reach Out / Hiring CTA Banner on Every Project Page */}
          <div className="mt-4">
            <ContactCTA
              developer={developerContactData}
              isOwner={Boolean(isOwner)}
              projectTitle={project.title || project.name || 'this project'}
              variant="project"
            />
          </div>
        </div>

        <aside className="flex flex-col gap-6 min-w-0">
          {/* Author Mini-Portfolio Card */}
          <div className="glass-panel p-5 rounded-xl flex flex-col gap-4">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Creator
            </span>
            <Link
              to={authorTo || '/explore'}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 dark:bg-white/[0.08] flex items-center justify-center border border-slate-300 dark:border-white/[0.12] shrink-0">
                {authorAvatar || developerContactData.avatarUrl ? (
                  <img
                    src={authorAvatar || developerContactData.avatarUrl}
                    alt={`${authorSlug || 'Developer'} avatar`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {(authorSlug || 'D').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-accent dark:group-hover:text-accent-light transition-colors truncate">
                  @{authorSlug || authorName || 'developer'}
                </div>
                {(developerContactData.headline || developerContactData.role) && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {developerContactData.headline || developerContactData.role}
                  </div>
                )}
              </div>
            </Link>
            {authorTo && (
              <Link
                to={authorTo}
                className="btn-glass-pill w-full py-2 px-3 rounded-lg text-xs font-mono font-semibold text-center"
              >
                View full portfolio →
              </Link>
            )}
          </div>

          <div className="glass-panel p-5 rounded-xl flex flex-col gap-5">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 block">
                Languages Used
              </span>
              <div className="flex flex-wrap gap-2">
                {languageList.map((lang, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs font-mono font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.09] px-2.5 py-1 rounded-md"
                  >
                    <span className="w-2 h-2 rounded-full shrink-0 bg-accent" />
                    <span className="truncate">{lang}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-slate-200/70 dark:border-white/[0.08] pt-4">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
                Last Updated
              </span>
              <span className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate block">
                {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Recently'}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
