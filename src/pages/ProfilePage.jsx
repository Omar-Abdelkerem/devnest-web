import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'
import ProfileSidebar from '../components/ProfileSidebar'
import ProfileTabs from '../components/ProfileTabs'
import ProjectCard from '../components/ProjectCard'

export default function ProfilePage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [feedback, setFeedback] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('projects')

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const identifier = user.username || (user.email ? user.email.split('@')[0] : null) || user.id

    if (!identifier) {
      setIsLoading(false)
      return
    }

    async function fetchProfileData() {
      try {
        const [projectsRes, skillsRes, feedbackRes] = await Promise.all([
          apiFetch(`/api/v1/user/${identifier}/projects`),
          apiFetch(`/api/v1/user/${identifier}/skills`),
          apiFetch(`/api/v1/feedback/user/${identifier}`)
        ])

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          setProjects(Array.isArray(projectsData) ? projectsData : (projectsData.data || projectsData.projects || []))
        }

        if (skillsRes.ok) {
          const skillsData = await skillsRes.json()
          setSkills(Array.isArray(skillsData) ? skillsData : (skillsData.data || skillsData.skills || []))
        }

        if (feedbackRes.ok) {
          const feedbackData = await feedbackRes.json()
          setFeedback(Array.isArray(feedbackData) ? feedbackData : [])
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [user])

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to remove this feedback from your profile?")) return;
    const previousFeedback = [...feedback];
    setFeedback(feedback.filter(f => f.id !== feedbackId));
    try {
      const res = await apiFetch(`/api/v1/feedback/${feedbackId}`, { method: 'DELETE' })
      if (!res.ok) { setFeedback(previousFeedback); }
    } catch (err) { setFeedback(previousFeedback); }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-white dark:bg-[#161616] flex items-center justify-center text-gray-400 font-mono text-sm">Loading profile...</div>
  }

  const displayUsername = user?.username || (user?.email ? user.email.split('@')[0] : 'developer')

  // SECURE OBJECT MAPPING: Preserves the level for the sidebar UI
  const profileData = {
    name: user?.name || displayUsername,
    handle: displayUsername,
    bio: user?.bio,
    about: user?.about,
    location: user?.location,
    company: user?.company,
    avatarUrl: user?.avatarUrl,
    links: user?.links || [],
    joinedYear: user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026',
    followers: user?._count?.followers || 0,
    following: user?._count?.following || 0,
    skills: skills.map(s => {
      if (typeof s === 'string') return { name: s, level: '' };
      return { name: s?.name || s?.title || '', level: s?.level || '' };
    }).filter(s => s.name),
  }

  const mappedProjects = projects.map(p => {
    if (!p) return null;
    return {
      id: p.id,
      repo: p.title || p.name || 'Untitled Project',
      description: p.description || '',
      tags: p.tags || [],
      badges: p.isPublic === false ? ['PRIVATE'] : [],
      language: p.language || (p.languages && p.languages.length > 0 ? (typeof p.languages[0] === 'string' ? p.languages[0] : p.languages[0].name) : null) || 'Code',
      languageColor: p.languageColor || '#2a8a7e',
      stars: p._count?.stars || 0,
      forks: p.forks || 0,
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Recently',
      author: displayUsername,
      authorUsername: user?.username || user?.handle || displayUsername,
      authorHandle: user?.username || user?.handle || displayUsername,
      authorAvatar: user?.avatarUrl,
    };
  }).filter(Boolean);

  const isEmpty = !user?.bio && projects.length === 0 && skills.length === 0

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8 lg:gap-12 bg-white dark:bg-[#161616] min-h-screen">
      <ProfileSidebar user={profileData} isEmpty={isEmpty} isPublicView={false} />

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 mb-6">
          <ProfileTabs projectCount={mappedProjects.length} activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="hidden sm:flex items-center gap-3 mb-2">
            <Link to="/starred" className="flex items-center gap-2 bg-gray-50 dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 text-sm font-semibold px-4 py-1.5 rounded-md transition-colors shadow-sm">★ Stars</Link>
            <Link to="/projects/new" className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white text-sm font-semibold px-4 py-1.5 rounded-md transition-colors shadow-sm"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>New Project</Link>
          </div>
        </div>

        {activeTab === 'projects' && (
          mappedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mappedProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
            </div>
          ) : (
            <div className="py-12 text-center border border-dashed border-gray-300 dark:border-neutral-800 rounded-lg text-gray-500 mt-2 text-sm font-mono">No projects published yet.</div>
          )
        )}
        {activeTab === 'feedback' && (
          <div className="flex flex-col gap-4 mt-4">
            {feedback.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-gray-300 dark:border-neutral-800 rounded-lg text-gray-500 mt-2 text-sm font-mono">You haven't received any feedback yet.</div>
            ) : (
              feedback.map((item) => (
                <div key={item.id} className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 shrink-0 overflow-hidden border border-gray-300 dark:border-neutral-700">
                    {item.author?.avatarUrl ? <img src={item.author.avatarUrl} alt={item.author.username} className="w-full h-full object-cover" /> : item.author?.username ? item.author.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <Link to={`/u/${item.author?.username}`} className="font-bold text-gray-900 dark:text-gray-100 hover:text-accent transition-colors">{item.author?.username || 'Unknown User'}</Link>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}</span>
                        <button onClick={() => handleDeleteFeedback(item.id)} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer">Delete</button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mt-2">{item.content}</p>
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