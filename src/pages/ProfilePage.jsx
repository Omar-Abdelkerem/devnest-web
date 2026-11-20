import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { apiFetch, getStarCount } from '../lib/api'
import ProfileSidebar from '../components/ProfileSidebar'
import ProfileTabs from '../components/ProfileTabs'
import ProjectCard from '../components/ProjectCard'
import VolumetricBackground from '../components/VolumetricBackground'
import GlassIconTile from '../components/GlassIconTile'

export default function ProfilePage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [feedback, setFeedback] = useState([])
  const [isLoading, setIsLoading] = useState(() => Boolean(user))
  const [activeTab, setActiveTab] = useState('projects')
  const [copied, setCopied] = useState(false)

  const displayUsername = user?.username || (user?.email ? user.email.split('@')[0] : 'developer')
  useDocumentTitle(`@${displayUsername}`, user?.bio || `${displayUsername}'s developer portfolio on DevNest.`)

  useEffect(() => {
    const identifier = user?.username || (user?.email ? user.email.split('@')[0] : null) || user?.id
    if (!identifier) return

    let cancelled = false
    async function fetchProfileData() {
      try {
        const [projectsRes, skillsRes, feedbackRes] = await Promise.all([
          apiFetch(`/api/v1/user/${identifier}/projects`),
          apiFetch(`/api/v1/user/${identifier}/skills`),
          apiFetch(`/api/v1/feedback/user/${identifier}`),
        ])

        if (cancelled) return

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          setProjects(Array.isArray(projectsData) ? projectsData : projectsData.data || projectsData.projects || [])
        }
        if (skillsRes.ok) {
          const skillsData = await skillsRes.json()
          setSkills(Array.isArray(skillsData) ? skillsData : skillsData.data || skillsData.skills || [])
        }
        if (feedbackRes.ok) {
          const feedbackData = await feedbackRes.json()
          setFeedback(Array.isArray(feedbackData) ? feedbackData : [])
        }
      } catch {
        // Handled gracefully with empty states
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchProfileData()
    return () => {
      cancelled = true
    }
  }, [user])

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to remove this feedback from your profile?')) return
    const previousFeedback = [...feedback]
    setFeedback(feedback.filter((f) => f.id !== feedbackId))
    try {
      const res = await apiFetch(`/api/v1/feedback/${feedbackId}`, { method: 'DELETE' })
      if (!res.ok) setFeedback(previousFeedback)
    } catch {
      setFeedback(previousFeedback)
    }
  }

  const handleCopyProfileLink = async () => {
    if (!displayUsername) return
    const shareableUrl = `${window.location.origin}/${displayUsername}`
    try {
      await navigator.clipboard.writeText(shareableUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable
    }
  }

  const profileData = useMemo(
    () => ({
      name: user?.name || displayUsername,
      handle: displayUsername,
      bio: user?.bio,
      about: user?.about,
      location: user?.location,
      age: user?.age,
      role: user?.role,
      company: user?.company,
      availableForWork: user?.availableForWork,
      avatarUrl: user?.avatarUrl,
      links: user?.links || [],
      joinedYear: user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026',
      followers: user?._count?.followers || 0,
      following: user?._count?.following || 0,
      skills: skills
        .map((s) =>
          typeof s === 'string'
            ? { name: s, level: '' }
            : { name: s?.name || s?.title || '', level: s?.level || '' },
        )
        .filter((s) => s.name),
    }),
    [user, displayUsername, skills],
  )

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
          languageColor: p.languageColor || '#3cd2bf',
          stars: getStarCount(p),
          _count: p._count,
          updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Recently',
          author: displayUsername,
          authorUsername: user?.username || user?.handle || displayUsername,
          authorHandle: user?.username || user?.handle || displayUsername,
          authorAvatar: user?.avatarUrl,
        })),
    [projects, displayUsername, user],
  )

  const totalStars = useMemo(
    () => mappedProjects.reduce((sum, p) => sum + (Number(p.stars) || 0), 0),
    [mappedProjects],
  )

  const handleProjectImageUpdated = (projectId, newUrl) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, projectimgUrl: newUrl } : p)),
    )
  }

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

  const isEmpty = !user?.bio && projects.length === 0 && skills.length === 0

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <VolumetricBackground variant="profile" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8 lg:gap-12 w-full">
        <ProfileSidebar
          user={profileData}
          isEmpty={isEmpty}
          isPublicView={false}
          projectCount={mappedProjects.length}
          totalStars={totalStars}
        />

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-200/80 dark:border-white/[0.08]">
            <ProfileTabs
              projectCount={mappedProjects.length}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Action bar — visible on mobile (375px), tablet, and desktop */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleCopyProfileLink}
                className="btn-glass-pill text-xs font-mono font-semibold px-3.5 py-2 rounded-full cursor-pointer"
              >
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-emerald-400" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-emerald-500 dark:text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span>Share</span>
                  </>
                )}
              </button>

              <Link
                to="/starred"
                className="btn-glass-pill text-xs font-mono font-semibold px-3.5 py-2 rounded-full"
              >
                <span className="text-amber-400">★</span>
                <span>Starred</span>
              </Link>

              <Link
                to="/projects/new"
                className="btn-3d-pill text-xs font-bold px-4 py-2 rounded-full"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>New Project</span>
              </Link>
            </div>
          </div>

          {activeTab === 'projects' &&
            (mappedProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mappedProjects.map((project, idx) => (
                  <div
                    key={project.id}
                    className="animate-fade-up h-full"
                    style={{ animationDelay: `${Math.min(idx * 65, 360)}ms` }}
                  >
                    <ProjectCard
                      project={project}
                      isOwner={true}
                      onImageUpdated={handleProjectImageUpdated}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 px-6 glass-panel rounded-2xl text-center flex flex-col items-center gap-3 mt-2">
                <GlassIconTile size="lg" accent={true}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                </GlassIconTile>
                <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                  No projects published yet.
                </p>
                <Link
                  to="/projects/new"
                  className="btn-3d-pill text-xs font-bold px-5 py-2.5 rounded-full mt-1"
                >
                  Create your first project →
                </Link>
              </div>
            ))}

          {activeTab === 'feedback' && (
            <div className="flex flex-col gap-4 mt-4">
              {feedback.length === 0 ? (
                <div className="py-16 px-6 glass-panel rounded-2xl text-center flex flex-col items-center gap-3 mt-2">
                  <GlassIconTile size="lg" accent={true}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </GlassIconTile>
                  <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                    You haven&apos;t received any peer feedback yet.
                  </p>
                </div>
              ) : (
                feedback.map((item) => (
                  <div
                    key={item.id}
                    className="glass-panel-interactive rounded-2xl p-5 flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/[0.08] flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-200 shrink-0 overflow-hidden border border-slate-300 dark:border-white/[0.12]">
                      {item.author?.avatarUrl ? (
                        <img
                          src={item.author.avatarUrl}
                          alt={`${item.author.username} avatar`}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : item.author?.username ? (
                        item.author.username.charAt(0).toUpperCase()
                      ) : (
                        'U'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1 gap-2">
                        <Link
                          to={`/${item.author?.username}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-accent dark:hover:text-accent-light transition-colors truncate"
                        >
                          @{item.author?.username || 'Unknown User'}
                        </Link>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteFeedback(item.id)}
                            className="text-xs font-mono font-bold text-rose-500 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap mt-2 leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
