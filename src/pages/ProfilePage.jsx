import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom' // <-- Added Link import for the button
import { useAuth } from '../context/AuthContext'
import ProfileSidebar from '../components/ProfileSidebar'
import ProfileTabs from '../components/ProfileTabs'
import ProjectGrid from '../components/ProjectGrid'
import ContributionGraph from '../components/ContributionGraph'

export default function ProfilePage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const identifier = user.username || (user.email ? user.email.split('@')[0] : null) || user.id

    if (!identifier) {
      console.error("Could not find a valid username or ID on the user object:", user)
      setIsLoading(false)
      return
    }

    async function fetchProfileData() {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

        const [projectsRes, skillsRes] = await Promise.all([
          fetch(`${baseUrl}/api/v1/user/${identifier}/projects`, { credentials: 'include' }),
          fetch(`${baseUrl}/api/v1/user/${identifier}/skills`, { credentials: 'include' })
        ])

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          setProjects(Array.isArray(projectsData) ? projectsData : [])
        } else {
          console.error("Backend rejected projects fetch:", await projectsRes.text())
        }

        if (skillsRes.ok) {
          const skillsData = await skillsRes.json()
          setSkills(Array.isArray(skillsData) ? skillsData : [])
        } else {
          console.error("Backend rejected skills fetch:", await skillsRes.text())
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#161616] flex items-center justify-center text-gray-400 font-mono text-sm">
        Loading profile...
      </div>
    )
  }

  const displayUsername = user?.username || (user?.email ? user.email.split('@')[0] : 'developer')

  const profileData = {
    name: user?.name || displayUsername,
    handle: displayUsername,
    bio: user?.bio,
    location: user?.location,
    company: user?.company,
    website: user?.website,
    joinedYear: user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026',
    followers: user?._count?.followers || 0,
    following: user?._count?.following || 0,
    skills: skills.map(s => typeof s === 'string' ? s : s.name),
  }

  const mappedProjects = projects.map(p => ({
    id: p.id,
    repo: p.title || p.name || 'Untitled Project',
    description: p.description || '',
    tags: p.tags || [],
    badges: p.isPublic ? [] : ['PRIVATE'],
    language: p.language || 'Code',
    languageColor: p.languageColor || '#dea584',
    stars: p._count?.stars || 0,
    forks: p.forks || 0,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Recently'
  }))

  const isEmpty = !user?.bio && projects.length === 0 && skills.length === 0

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 bg-white dark:bg-[#161616]">
      <ProfileSidebar user={profileData} isEmpty={isEmpty} />

      <div className="flex-1 min-w-0">
        {/* Header container for Tabs + Add Project Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 mb-6">
          <ProfileTabs projectCount={mappedProjects.length} />
          <Link
            to="/projects/new"
            className="hidden sm:flex items-center gap-2 bg-accent hover:bg-accent-light text-white text-sm font-semibold px-4 py-1.5 rounded-md transition-colors mb-2"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
            New Project
          </Link>
        </div>

        {/* Mobile New Project Button */}
        <Link
          to="/projects/new"
          className="sm:hidden flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-white text-sm font-semibold px-4 py-2.5 rounded-md transition-colors mb-6 w-full"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
          New Project
        </Link>

        {mappedProjects.length > 0 ? (
          <ProjectGrid projects={mappedProjects} />
        ) : (
          <div className="py-12 text-center border border-dashed border-gray-300 dark:border-neutral-800 rounded-lg text-gray-500 mt-2 text-sm font-mono">
            No projects published yet.
          </div>
        )}

        <ContributionGraph />
      </div>
    </div>
  )
}