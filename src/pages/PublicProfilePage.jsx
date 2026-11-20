import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import ProfileSidebar from '../components/ProfileSidebar'
import ProfileTabs from '../components/ProfileTabs'
import ProjectGrid from '../components/ProjectGrid'
import PortfolioHighlights from '../components/PortfolioHighlights'
import ContactCTA from '../components/ContactCTA'
import VolumetricBackground from '../components/VolumetricBackground'
import GlassIconTile from '../components/GlassIconTile'
import { apiFetch, getStarCount, parseApiError } from '../lib/api'
import { sortProjectsWithOrder } from '../lib/projectOrder'

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
      headline: profileUser.headline,
      bio: profileUser.bio,
      about: profileUser.about,
      location: profileUser.location,
      age: profileUser.age,
      role: profileUser.role,
      company: profileUser.company,
      education: profileUser.education,
      yearsOfExperience: profileUser.yearsOfExperience,
      workPreferences: profileUser.workPreferences,
      phone: profileUser.phone,
      whatsapp: profileUser.whatsapp,
      contactEmail: profileUser.contactEmail,
      resumeUrl: profileUser.resumeUrl,
      availableForWork: profileUser.availableForWork,
      joinedYear: profileUser.createdAt ? new Date(profileUser.createdAt).getFullYear() : null,
      avatarUrl: profileUser.avatarUrl,
      links,
      followers: profileUser._count?.followers || 0,
      following: profileUser._count?.following || 0,
      skills: mappedSkills,
    }
  }, [profileUser, skills, handle])

  const mappedProjects = useMemo(() => {
    const rawMapped = projects
      .filter(Boolean)
      .map((p) => ({
        id: p.id,
        repo: p.title || p.name || 'Untitled Project',
        description: p.description || '',
        projectimgUrl: p.projectimgUrl || null,
        links: p.links || [],
        isPinned: Boolean(p.isPinned),
        sortOrder: typeof p.sortOrder === 'number' ? p.sortOrder : 0,
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
        languageColor: p.languageColor || '#38b2a3',
        stars: getStarCount(p),
        _count: p._count,
        updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Recently',
        author: handle,
        authorUsername: handle,
        authorHandle: handle,
        authorAvatar: profileUser?.avatarUrl,
        owner: { username: handle, avatarUrl: profileUser?.avatarUrl },
        user: { username: handle, avatarUrl: profileUser?.avatarUrl },
      }))

    return sortProjectsWithOrder(rawMapped, handle)
  }, [projects, handle, profileUser])

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 w-full">
        <div className="w-full lg:w-80 h-96 rounded-3xl glass-panel animate-pulse shrink-0" />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl glass-panel animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !profileUser || !profileData) {
    return (
      <div className="relative flex-1 flex flex-col items-center justify-center py-20 px-6 overflow-hidden">
        <VolumetricBackground variant="profile" />
        <div className="relative z-10 glass-panel rounded-3xl p-8 max-w-md w-full text-center flex flex-col items-center">
          <GlassIconTile size="lg" accent={true} className="mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
          </GlassIconTile>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
            Profile Unavailable
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-mono text-xs sm:text-sm mb-7 leading-relaxed">
            {error || `The user @${username} does not exist, or their profile is set to private.`}
          </p>
          <Link
            to="/explore"
            className="btn-3d-pill px-6 py-2.5 rounded-full text-sm font-bold"
          >
            ← Back to Explore
          </Link>
        </div>
      </div>
    )
  }

  const isOwnProfile =
    currentUser && (currentUser.id === profileUser.id || currentUser.username === profileUser.username)
  const totalStars = mappedProjects.reduce((sum, p) => sum + (Number(p.stars) || 0), 0)

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <VolumetricBackground variant="profile" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 w-full">
        <ProfileSidebar
          user={profileData}
          isEmpty={false}
          isPublicView={true}
          projectCount={mappedProjects.length}
          totalStars={totalStars}
        />

        <div className="flex-1 min-w-0 flex flex-col">
          {/* Portfolio Overview & Stack Highlights */}
          <PortfolioHighlights user={profileData} projects={mappedProjects} />

          <div className="pb-5 mb-6 border-b border-slate-200/80 dark:border-white/[0.08]">
            <ProfileTabs
              projectCount={mappedProjects.length}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {activeTab === 'projects' &&
            (mappedProjects.length > 0 ? (
              <div className="mt-2">
                <ProjectGrid projects={mappedProjects} />
              </div>
            ) : (
              <div className="py-16 px-6 glass-panel rounded-2xl text-center flex flex-col items-center gap-3 mt-4">
                <GlassIconTile size="lg" accent={true}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </GlassIconTile>
                <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                  @{username} has no public projects yet.
                </p>
              </div>
            ))}

          {activeTab === 'feedback' && (
            <div className="flex flex-col gap-6 mt-6">
              {currentUser && !isOwnProfile && (
                <form
                  onSubmit={handlePostFeedback}
                  className="glass-panel rounded-2xl p-5 flex flex-col gap-3.5"
                >
                  <label htmlFor="public-feedback-input" className="text-sm font-bold text-slate-900 dark:text-white">
                    Leave public feedback for @{username}
                  </label>
                  <textarea
                    id="public-feedback-input"
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    placeholder="Write a constructive note, architecture review, or words of encouragement..."
                    rows="3"
                    maxLength={500}
                    className="w-full glass-input rounded-xl p-3 text-sm resize-none"
                  />
                  {feedbackError && (
                    <p role="alert" className="text-xs font-mono text-rose-500">{feedbackError}</p>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingFeedback || !newFeedback.trim()}
                      className="btn-3d-pill font-bold px-5 py-2 rounded-full text-xs sm:text-sm cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingFeedback ? 'Posting...' : 'Send Feedback'}
                    </button>
                  </div>
                </form>
              )}

              {feedback.length === 0 ? (
                <div className="py-16 px-6 glass-panel rounded-2xl text-center flex flex-col items-center gap-3">
                  <GlassIconTile size="lg" accent={true}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </GlassIconTile>
                  <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                    No feedback received yet.
                  </p>
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
                      className="glass-panel-interactive rounded-2xl p-5 flex gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/[0.08] flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-200 shrink-0 overflow-hidden border border-slate-300 dark:border-white/[0.12]">
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
                              className="font-bold text-slate-900 dark:text-white hover:text-accent dark:hover:text-accent-light transition-colors truncate"
                            >
                              @{authorName}
                            </Link>
                          ) : (
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              @{authorName}
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
                                className="text-xs font-mono font-bold text-rose-500 hover:underline cursor-pointer"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap mt-2 leading-relaxed">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Direct Reach Out / Hiring CTA Banner on Public Profile Page */}
          <div className="mt-10 pt-2">
            <ContactCTA
              developer={profileData}
              isOwner={Boolean(isOwnProfile)}
              variant="profile"
              onLeaveFeedback={() => setActiveTab('feedback')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
