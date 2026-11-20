import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import ProfileSidebar from '../components/ProfileSidebar'
import ProfileTabs from '../components/ProfileTabs'
import ProjectGrid from '../components/ProjectGrid'
import { apiFetch, getStarCount, parseApiError } from '../lib/api'

export default function PublicProfilePage() {
  const { username } = useParams()
  const { user: currentUser } = useAuth()

  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [feedback, setFeedback] = useState([])
  const [profileUser, setProfileUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('projects')

  const [newFeedback, setNewFeedback] = useState('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')

  useDocumentTitle(
    profileUser?.username ? `@${profileUser.username}` : `@${username}`,
    profileUser?.bio || `Explore @${username}'s engineering projects on DevNest.`,
  )

  useEffect(() => {
    let cancelled = false

    async function fetchPublicData() {
      setIsLoading(true)
      setError(null)
      setProfileUser(null)
      setProjects([])
      setSkills([])
      setFeedback([])

      try {
        const [userRes, projectsRes, skillsRes, feedbackRes] = await Promise.all([
          apiFetch(`/api/v1/user/${encodeURIComponent(username)}`),
          apiFetch(`/api/v1/user/${encodeURIComponent(username)}/projects`),
          apiFetch(`/api/v1/user/${encodeURIComponent(username)}/skills`),
          apiFetch(`/api/v1/feedback/user/${encodeURIComponent(username)}`),
        ])

        if (cancelled) return

        if (!userRes.ok) {
          setError(`Could not find a public profile with the handle @${username}.`)
          return
        }

        const userData = await userRes.json()
        const fetchedUser = userData.user || userData.data?.user || userData.data || userData

        if (!fetchedUser || (!fetchedUser.id && !fetchedUser.username && !fetchedUser.handle)) {
          setError(`Could not find a user with the handle @${username}.`)
          return
        }

        setProfileUser(fetchedUser)

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          const list = Array.isArray(projectsData) ? projectsData : projectsData.data || projectsData.projects || []
          setProjects(Array.isArray(list) ? list : [])
        }
        if (skillsRes.ok) {
          const skillsData = await skillsRes.json()
          const list = Array.isArray(skillsData) ? skillsData : skillsData.data || skillsData.skills || []
          setSkills(Array.isArray(list) ? list : [])
        }
        if (feedbackRes.ok) {
          const feedbackData = await feedbackRes.json()
          const list = Array.isArray(feedbackData) ? feedbackData : feedbackData.data || feedbackData.feedback || []
          setFeedback(Array.isArray(list) ? list : [])
        }
      } catch {
        if (!cancelled) setError('Failed to load profile due to a network error.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    if (username) fetchPublicData()
    return () => {
      cancelled = true
    }
  }, [username])

  const handlePostFeedback = async (e) => {
    e.preventDefault()
    if (!newFeedback.trim() || !profileUser || isSubmittingFeedback) return

    setIsSubmittingFeedback(true)
    setFeedbackError('')
    try {
      const res = await apiFetch('/api/v1/feedback', {
        method: 'POST',
        body: JSON.stringify({
          recipientId: profileUser.id,
          content: newFeedback.trim(),
        }),
      })

      if (res.ok) {
        const createdFeedback = await res.json()
        const created = createdFeedback.data || createdFeedback.feedback || createdFeedback
        if (!created.author && currentUser) {
          created.author = {
            id: currentUser.id,
            username: currentUser.username,
            avatarUrl: currentUser.avatarUrl,
          }
          created.authorId = created.authorId || currentUser.id
        }
        setFeedback((prev) => [created, ...prev])
        setNewFeedback('')
      } else {
        const { message } = await parseApiError(res, 'Could not post feedback.')
        setFeedbackError(message)
      }
    } catch {
      setFeedbackError('Network error while posting feedback.')
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to remove this feedback?')) return
    const previousFeedback = [...feedback]
    setFeedback(feedback.filter((f) => f.id !== feedbackId))
    try {
      const res = await apiFetch(`/api/v1/feedback/${feedbackId}`, { method: 'DELETE' })
      if (!res.ok) setFeedback(previousFeedback)
    } catch {
      setFeedback(previousFeedback)
    }
  }

  const handle = profileUser?.username || profileUser?.handle || username

  const profileData = useMemo(() => {
    if (!profileUser) return null
    const mappedSkills = skills
      .map((s) =>
        typeof s === 'string'
          ? { name: s, level: '' }
          : { name: s?.name || s?.title || '', level: s?.level || '' },
      )
      .filter((s) => s.name)

    let links = profileUser.links || []
    if (typeof links === 'string') {
      try {
        links = JSON.parse(links)
      } catch {
        links = []
      }
    }
    if (!Array.isArray(links)) links = []

    return {
      name: profileUser.name || handle,
      handle,
      bio: profileUser.bio,
      about: profileUser.about,
      location: profileUser.location,
      age: profileUser.age,
      role: profileUser.role,
      company: profileUser.company,
      availableForWork: profileUser.availableForWork,
      joinedYear: profileUser.createdAt ? new Date(profileUser.createdAt).getFullYear() : null,
      avatarUrl: profileUser.avatarUrl,
      links,
      followers: profileUser._count?.followers || 0,
      following: profileUser._count?.following || 0,
      skills: mappedSkills,
    }
  }, [profileUser, skills, handle])

  const mappedProjects = useMemo(
    () =>
      projects
        .filter(Boolean)
        .map((p) => ({
          id: p.id,
          repo: p.title || p.name || 'Untitled Project',
          description: p.description || '',
          projectimgUrl: p.projectimgUrl || null,
          links: p.links || [],
          badges: p.isPublic === false ? ['PRIVATE'] : [],
          languages: p.languages || (p.language ? [{ name: p.language }] : []),
          language:
            p.language ||
            (p.languages?.length > 0
              ? typeof p.languages[0] === 'string'
                ? p.languages[0]
                : p.languages[0].name
              : null) ||
            'Code',
          languageColor: p.languageColor || '#2a8a7e',
          stars: getStarCount(p),
          _count: p._count,
          updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Recently',
          author: handle,
          authorUsername: handle,
          authorHandle: handle,
          authorAvatar: profileUser?.avatarUrl,
          owner: { username: handle, avatarUrl: profileUser?.avatarUrl },
          user: { username: handle, avatarUrl: profileUser?.avatarUrl },
        })),
    [projects, handle, profileUser],
  )

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 w-full">
        <div className="w-full lg:w-80 h-96 rounded-2xl glass-panel animate-pulse shrink-0" />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-xl glass-panel animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !profileUser || !profileData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Profile Unavailable</h1>
        <p className="text-slate-600 dark:text-slate-400 font-mono text-sm mb-8 max-w-md text-center">
          {error || `The user @${username} does not exist, or their profile is set to private.`}
        </p>
        <Link
          to="/explore"
          className="btn-3d-pill px-6 py-2.5 rounded-lg font-semibold text-sm"
        >
          ← Back to Explore
        </Link>
      </div>
    )
  }

  const isOwnProfile =
    currentUser && (currentUser.id === profileUser.id || currentUser.username === profileUser.username)
  const totalStars = mappedProjects.reduce((sum, p) => sum + (Number(p.stars) || 0), 0)

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 w-full">
      <ProfileSidebar
        user={profileData}
        isEmpty={false}
        isPublicView={true}
        projectCount={mappedProjects.length}
        totalStars={totalStars}
      />

      <div className="flex-1 min-w-0">
        <div className="border-b border-slate-200/80 dark:border-white/[0.08] mb-6">
          <ProfileTabs
            projectCount={mappedProjects.length}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {activeTab === 'projects' &&
          (mappedProjects.length > 0 ? (
            <div className="mt-6">
              <ProjectGrid projects={mappedProjects} />
            </div>
          ) : (
            <div className="py-12 text-center border border-dashed border-slate-300 dark:border-white/[0.12] rounded-xl text-slate-600 dark:text-slate-400 mt-6 text-sm font-mono">
              @{username} has no public projects yet.
            </div>
          ))}

        {activeTab === 'feedback' && (
          <div className="flex flex-col gap-6 mt-6">
            {currentUser && !isOwnProfile && (
              <form
                onSubmit={handlePostFeedback}
                className="glass-panel rounded-xl p-5 flex flex-col gap-3"
              >
                <label htmlFor="public-feedback-input" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Leave public feedback for @{username}
                </label>
                <textarea
                  id="public-feedback-input"
                  value={newFeedback}
                  onChange={(e) => setNewFeedback(e.target.value)}
                  placeholder="Write a constructive note, review, or words of encouragement..."
                  rows="3"
                  maxLength={500}
                  className="w-full glass-input rounded-lg p-3 text-sm resize-none"
                />
                {feedbackError && (
                  <p role="alert" className="text-xs font-mono text-rose-500">{feedbackError}</p>
                )}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingFeedback || !newFeedback.trim()}
                    className="btn-3d-pill font-semibold px-5 py-2 rounded-lg text-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingFeedback ? 'Posting...' : 'Send Feedback'}
                  </button>
                </div>
              </form>
            )}

            {feedback.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-300 dark:border-white/[0.12] rounded-xl text-slate-600 dark:text-slate-400 text-sm font-mono">
                No feedback received yet.
              </div>
            ) : (
              feedback.map((item, index) => {
                const canDeleteFeedback =
                  currentUser && (currentUser.id === item.authorId || currentUser.id === profileUser.id)
                const authorName = item.author?.username || item.user?.username || 'Unknown User'
                const authorTo = item.author?.username || item.user?.username

                return (
                  <div
                    key={item.id || index}
                    className="glass-panel rounded-xl p-5 flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/[0.08] flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 shrink-0 overflow-hidden border border-slate-300 dark:border-white/[0.12]">
                      {item.author?.avatarUrl ? (
                        <img
                          src={item.author.avatarUrl}
                          alt={`${authorName} avatar`}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        authorName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1 gap-2">
                        {authorTo ? (
                          <Link
                            to={`/${authorTo}`}
                            className="font-bold text-slate-900 dark:text-slate-100 hover:text-accent transition-colors truncate"
                          >
                            {authorName}
                          </Link>
                        ) : (
                          <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                            {authorName}
                          </span>
                        )}
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}
                          </span>
                          {canDeleteFeedback && (
                            <button
                              type="button"
                              onClick={() => handleDeleteFeedback(item.id)}
                              className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap mt-2">
                        {item.content}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
