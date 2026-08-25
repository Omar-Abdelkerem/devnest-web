import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProfileSidebar from '../components/ProfileSidebar'
import ProfileTabs from '../components/ProfileTabs'
import ProjectGrid from '../components/ProjectGrid'
import { apiFetch } from '../lib/api'

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

    useEffect(() => {
        async function fetchPublicData() {
            try {
                const [userRes, projectsRes, skillsRes, feedbackRes] = await Promise.all([
                    apiFetch(`/api/v1/user/${username}`),
                    apiFetch(`/api/v1/user/${username}/projects`),
                    apiFetch(`/api/v1/user/${username}/skills`),
                    apiFetch(`/api/v1/feedback/user/${username}`)
                ])

                if (!userRes.ok) {
                    setError(`Could not find a user with the handle @${username}.`)
                    setIsLoading(false)
                    return
                }

                const userData = await userRes.json()
                const fetchedUser = userData.user || userData.data?.user || userData.data || userData

                if (!fetchedUser) {
                    setError(`Could not find a user with the handle @${username}.`)
                    setIsLoading(false)
                    return
                }

                setProfileUser(fetchedUser)

                if (projectsRes.ok) {
                    const projectsData = await projectsRes.json()
                    setProjects(Array.isArray(projectsData) ? projectsData : (projectsData.data || projectsData.projects || []))
                } else {
                    console.error("Backend rejected the projects fetch. Check your backend auth middleware!");
                }

                if (skillsRes.ok) {
                    const skillsData = await skillsRes.json()
                    setSkills(Array.isArray(skillsData) ? skillsData : (skillsData.data || skillsData.skills || []))
                } else {
                    console.error("Backend rejected the skills fetch. Check your backend auth middleware!");
                }

                if (feedbackRes.ok) {
                    const feedbackData = await feedbackRes.json()
                    setFeedback(Array.isArray(feedbackData) ? feedbackData : [])
                }

            } catch (err) {
                console.error('Failed to fetch public profile:', err)
                setError('Failed to load profile due to a network error.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchPublicData()
    }, [username])

    const handlePostFeedback = async (e) => {
        e.preventDefault()
        if (!newFeedback.trim() || !profileUser) return

        setIsSubmittingFeedback(true)
        try {
            const res = await apiFetch('/api/v1/feedback', {
                method: 'POST',
                body: JSON.stringify({
                    recipientId: profileUser.id,
                    content: newFeedback.trim()
                })
            })

            if (res.ok) {
                const createdFeedback = await res.json()
                setFeedback([createdFeedback, ...feedback])
                setNewFeedback('')
            }
        } catch (err) {
            console.error('Failed to post feedback:', err)
        } finally {
            setIsSubmittingFeedback(false)
        }
    }

    const handleDeleteFeedback = async (feedbackId) => {
        if (!window.confirm("Are you sure you want to remove this feedback?")) return;

        const previousFeedback = [...feedback];
        setFeedback(feedback.filter(f => f.id !== feedbackId));

        try {
            const res = await apiFetch(`/api/v1/feedback/${feedbackId}`, { method: 'DELETE' })
            if (!res.ok) {
                setFeedback(previousFeedback);
            }
        } catch (err) {
            setFeedback(previousFeedback);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#161616] flex items-center justify-center text-gray-500 font-mono text-sm">
                Loading @{username}'s profile...
            </div>
        )
    }

    if (error || !profileUser) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#161616] flex flex-col items-center justify-center py-20 px-6">
                <div className="text-6xl mb-4">👻</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ghost Profile Found</h2>
                <p className="text-gray-500 dark:text-gray-400 font-mono text-sm mb-8 max-w-md text-center">
                    {error || `The user @${username} does not exist, or their profile is set to private.`}
                </p>
                <Link to="/explore" className="bg-accent hover:bg-accent-light text-white px-6 py-2.5 rounded-md font-bold transition-colors shadow-sm">
                    ← Back to Explore
                </Link>
            </div>
        )
    }

    const handle = profileUser.username || username
    const mappedSkills = skills.map(s => {
        if (typeof s === 'string') return { name: s, level: '' };
        return { name: s?.name || s?.title || '', level: s?.level || '' };
    }).filter(s => s.name);

    console.log("RAW SKILLS FROM API:", skills);
    console.log("MAPPED SKILLS FOR SIDEBAR:", mappedSkills);
    // FIXED: Uses the exact same object mapping logic as your private ProfilePage.jsx
    const profileData = {
        name: profileUser.name || handle,
        handle,
        bio: profileUser.bio,
        about: profileUser.about,
        avatarUrl: profileUser.avatarUrl,
        links: profileUser.links || [],
        followers: profileUser._count?.followers || profileUser.followers || 0,
        following: profileUser._count?.following || profileUser.following || 0,
        skills: mappedSkills,
    }

    // FIXED: Uses the exact same comprehensive mapping logic as your private ProfilePage.jsx
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
            author: handle,
            authorUsername: handle,
            authorHandle: handle,
            authorAvatar: profileUser.avatarUrl,
            owner: { username: handle, avatarUrl: profileUser.avatarUrl },
            user: { username: handle, avatarUrl: profileUser.avatarUrl },
        };
    }).filter(Boolean);

    const isOwnProfile = currentUser && (currentUser.id === profileUser.id || currentUser.username === profileUser.username);

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 bg-white dark:bg-[#161616]">
            <ProfileSidebar user={profileData} isEmpty={false} isPublicView={true} />

            <div className="flex-1 min-w-0">
                <ProfileTabs
                    projectCount={mappedProjects.length}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {activeTab === 'projects' && (
                    mappedProjects.length > 0 ? (
                        <div className="mt-6">
                            <ProjectGrid projects={mappedProjects} />
                        </div>
                    ) : (
                        <div className="py-12 text-center border border-dashed border-gray-300 dark:border-neutral-800 rounded-lg text-gray-500 mt-6 text-sm font-mono">
                            @{username} has no public projects.
                        </div>
                    )
                )}

                {activeTab === 'feedback' && (
                    <div className="flex flex-col gap-6 mt-6">
                        {/* Leave Feedback Form */}
                        {currentUser && !isOwnProfile && (
                            <form onSubmit={handlePostFeedback} className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-5 flex flex-col gap-3 shadow-sm">
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Leave public feedback for @{username}</label>
                                <textarea
                                    value={newFeedback}
                                    onChange={(e) => setNewFeedback(e.target.value)}
                                    placeholder="Write a constructive note, review, or words of encouragement..."
                                    rows="3"
                                    className="w-full bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-md p-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                                ></textarea>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmittingFeedback || !newFeedback.trim()}
                                        className="bg-accent hover:bg-accent-light text-white font-bold px-5 py-2 rounded-md text-sm transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        {isSubmittingFeedback ? 'Posting...' : 'Send Feedback'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {feedback.length === 0 ? (
                            <div className="py-12 text-center border border-dashed border-gray-300 dark:border-neutral-800 rounded-lg text-gray-500 text-sm font-mono">
                                No feedback received yet.
                            </div>
                        ) : (
                            feedback.map((item) => {
                                const canDeleteFeedback = currentUser && (currentUser.id === item.authorId || currentUser.id === profileUser.id);
                                return (
                                    <div key={item.id} className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-5 flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 shrink-0 overflow-hidden border border-gray-300 dark:border-neutral-700">
                                            {item.author?.avatarUrl ? (
                                                <img src={item.author.avatarUrl} alt={item.author.username} className="w-full h-full object-cover" />
                                            ) : (
                                                item.author?.username ? item.author.username.charAt(0).toUpperCase() : 'U'
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <Link to={`/u/${item.author?.username}`} className="font-bold text-gray-900 dark:text-gray-100 hover:text-accent transition-colors">
                                                    {item.author?.username || 'Unknown User'}
                                                </Link>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-mono text-gray-500">
                                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}
                                                    </span>
                                                    {canDeleteFeedback && (
                                                        <button
                                                            onClick={() => handleDeleteFeedback(item.id)}
                                                            className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mt-2">{item.content}</p>
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