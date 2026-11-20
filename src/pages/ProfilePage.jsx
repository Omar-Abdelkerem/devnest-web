import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { apiFetch, getStarCount } from '../lib/api'
import ProfileSidebar from '../components/ProfileSidebar'
import ProfileTabs from '../components/ProfileTabs'
import ProjectCard from '../components/ProjectCard'

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
          languageColor: p.languageColor || '#2a8a7e',
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

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 w-full">
        <div className="w-full lg:w-80 h-96 rounded-2xl bg-gray-100 dark:bg-[#1a1a1a] animate-pulse shrink-0" />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-xl bg-gray-100 dark:bg-[#1a1a1a] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const isEmpty = !user?.bio && projects.length === 0 && skills.length === 0

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8 lg:gap-12 bg-white dark:bg-[#161616] min-h-screen w-full">
      <ProfileSidebar user={profileData} isEmpty={isEmpty} isPublicView={false} />

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-3 sm:pb-0 mb-6">
          <ProfileTabs projectCount={mappedProjects.length} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Action bar — now visible and usable on mobile (375px), tablet, and desktop */}
          <div className="flex flex-wrap items-center gap-2.5 sm:mb-2">
            <button
              type="button"
              onClick={handleCopyProfileLink}
              className="flex items-center gap-2 bg-gray-50 dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-neutral-700 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 rounded-md transition-colors shadow-sm cursor-pointer"
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-emerald-500">Copied!</span>
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
              className="flex items-center gap-1.5 bg-gray-50 dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-neutral-700 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 rounded-md transition-colors shadow-sm"
            >
              ★ Starred
            </Link>

            <Link
              to="/projects/new"
              className="flex items-center gap-1.5 bg-accent hover:bg-accent-light text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-1.5 rounded-md transition-colors shadow-sm"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Project
            </Link>
          </div>
        </div>

        {activeTab === 'projects' &&
          (mappedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {mappedProjects.map((project, idx) => (
                <div
                  key={project.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(idx * 55, 330)}ms` }}
                >
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center border border-dashed border-gray-300 dark:border-neutral-800 rounded-lg text-gray-600 dark:text-gray-400 mt-2 text-sm font-mono">
              No projects published yet.{' '}
              <Link to="/projects/new" className="text-accent dark:text-accent-light hover:underline font-semibold">
                Create your first project →
              </Link>
            </div>
          ))}

        {activeTab === 'feedback' && (
          <div className="flex flex-col gap-4 mt-4">
            {feedback.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-gray-300 dark:border-neutral-800 rounded-lg text-gray-600 dark:text-gray-400 mt-2 text-sm font-mono">
                You haven&apos;t received any feedback yet.
              </div>
            ) : (
              feedback.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-5 flex gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 shrink-0 overflow-hidden border border-gray-300 dark:border-neutral-700">
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
                        className="font-bold text-gray-900 dark:text-gray-100 hover:text-accent transition-colors truncate"
                      >
                        {item.author?.username || 'Unknown User'}
                      </Link>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteFeedback(item.id)}
                          className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mt-2">
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
  )
}
