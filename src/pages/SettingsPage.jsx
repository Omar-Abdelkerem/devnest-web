import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const parseError = (rawText, status) => {
    try {
        const data = JSON.parse(rawText)
        if (Array.isArray(data) && data[0]?.message) {
            return data[0].message
        }
        if (data.error && Array.isArray(data.error) && data.error[0]?.message) {
            return data.error[0].message
        }
        return data.message || data.error?.message || (typeof data.error === 'string' ? data.error : 'Validation failed.')
    } catch {
        return rawText || `Server error: ${status}`
    }
}

export default function SettingsPage() {
    const { user } = useAuth()

    // 1. Profile State
    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        website: ''
    })
    const [isProfileLoading, setIsProfileLoading] = useState(false)
    const [profileError, setProfileError] = useState('')
    const [profileSuccess, setProfileSuccess] = useState('')

    // 2. Skills State
    const [skills, setSkills] = useState([])
    const [newSkill, setNewSkill] = useState('')
    const [newSkillLevel, setNewSkillLevel] = useState('BEGINNER')
    const [isSkillLoading, setIsSkillLoading] = useState(false)
    const [skillError, setSkillError] = useState('')

    // Fetch current user's skills when page loads so we can display them inline
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                bio: user.bio || '',
                website: Array.isArray(user.links) && user.links.length > 0 ? user.links[0] : ''
            })

            const fetchSkills = async () => {
                try {
                    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
                    const identifier = user.username || user.id
                    const response = await fetch(`${baseUrl}/api/v1/user/${identifier}/skills`, {
                        credentials: 'include'
                    })
                    if (response.ok) {
                        const data = await response.json()
                        setSkills(Array.isArray(data) ? data : [])
                    }
                } catch (err) {
                    console.error('Failed to load skills:', err)
                }
            }

            fetchSkills()
        }
    }, [user])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setIsProfileLoading(true)
        setProfileError('')
        setProfileSuccess('')

        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

            const payload = {
                username: formData.username,
                bio: formData.bio,
                links: formData.website ? [formData.website] : []
            }

            const response = await fetch(`${baseUrl}/api/v1/user/me`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                setProfileSuccess('Profile updated successfully!')
            } else {
                const rawText = await response.text()
                setProfileError(parseError(rawText, response.status))
            }
        } catch (err) {
            console.error('Settings update error:', err)
            setProfileError('Could not connect to the server.')
        } finally {
            setIsProfileLoading(false)
        }
    }

    const handleAddSkill = async (e) => {
        e.preventDefault()
        if (!newSkill.trim()) return

        setIsSkillLoading(true)
        setSkillError('')

        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

            const response = await fetch(`${baseUrl}/api/v1/skills`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: newSkill.trim(),
                    level: newSkillLevel
                }),
            })

            if (response.ok) {
                const createdSkill = await response.json()
                // Instantly add it to our local state so it appears on screen without a reload!
                setSkills([...skills, createdSkill])
                setNewSkill('')
                setNewSkillLevel('BEGINNER')
            } else {
                const rawText = await response.text()
                setSkillError(parseError(rawText, response.status))
            }
        } catch (err) {
            console.error('Skill addition error:', err)
            setSkillError('Could not connect to the server.')
        } finally {
            setIsSkillLoading(false)
        }
    }

    const handleDeleteSkill = async (skillId) => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
            const response = await fetch(`${baseUrl}/api/v1/skills/${skillId}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            if (response.ok) {
                // Remove it from local state instantly
                setSkills(skills.filter(s => s.id !== skillId))
            }
        } catch (err) {
            console.error('Failed to delete skill:', err)
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-6 py-12 lg:py-20 w-full">
            <div className="mb-8">
                <Link to="/profile" className="text-sm font-mono text-gray-500 hover:text-white transition-colors">
                    ← Back to profile
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4">
                    Public Profile Settings
                </h1>
            </div>

            <div className="flex flex-col gap-8">

                {/* ── Main Profile Form ──────────────────────────────────── */}
                <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 p-6 md:p-8 rounded-xl shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-neutral-800 pb-2">Basic Info</h2>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="username" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Username</label>
                        <input
                            type="text" id="username" name="username"
                            value={formData.username} onChange={handleChange}
                            className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="bio" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Bio</label>
                        <textarea
                            id="bio" name="bio" rows="3"
                            value={formData.bio} onChange={handleChange}
                            placeholder="What do you work on? What are you interested in?"
                            className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100 resize-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="website" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Website</label>
                        <input
                            type="url" id="website" name="website"
                            value={formData.website} onChange={handleChange}
                            placeholder="https://your-website.com"
                            className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    {profileError && (
                        <div className="text-sm text-red-600 dark:text-red-400 font-mono text-xs break-words">
                            {profileError}
                        </div>
                    )}

                    {profileSuccess && (
                        <div className="text-sm text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                            {profileSuccess}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit" disabled={isProfileLoading}
                            className="bg-accent hover:bg-accent-light text-white font-semibold px-6 py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isProfileLoading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>

                {/* ── Manage Skills Section ──────────────────────────────── */}
                <div className="flex flex-col gap-6 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 p-6 md:p-8 rounded-xl shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-neutral-800 pb-2">Manage Skills</h2>

                    {/* Existing Skills List */}
                    {skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <div key={skill.id} className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300">
                                    <span>{skill.name}</span>
                                    <span className="text-[10px] opacity-50 uppercase">({skill.level})</span>
                                    <button
                                        onClick={() => handleDeleteSkill(skill.id)}
                                        className="text-red-500 hover:text-red-700 ml-1 font-bold cursor-pointer"
                                        title="Delete skill"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 font-mono">No skills added yet.</p>
                    )}

                    {/* Add Skill Form */}
                    <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row items-start sm:items-end gap-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
                        <div className="flex-1 flex flex-col gap-2 w-full">
                            <label htmlFor="newSkill" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Add New Skill</label>
                            <input
                                type="text" id="newSkill"
                                value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="e.g. React, Go, Docker"
                                className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-full sm:w-40">
                            <label htmlFor="newSkillLevel" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Level</label>
                            <select
                                id="newSkillLevel"
                                value={newSkillLevel} onChange={(e) => setNewSkillLevel(e.target.value)}
                                className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100 appearance-none cursor-pointer"
                            >
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                                <option value="EXPERT">Expert</option>
                            </select>
                        </div>

                        <button
                            type="submit" disabled={isSkillLoading || !newSkill.trim()}
                            className="w-full sm:w-auto bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-800 dark:text-white font-semibold px-6 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border border-gray-300 dark:border-neutral-700"
                        >
                            {isSkillLoading ? 'Adding...' : 'Add Skill'}
                        </button>
                    </form>

                    {skillError && (
                        <div className="text-sm text-red-600 dark:text-red-400 font-mono text-xs break-words">
                            {skillError}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}