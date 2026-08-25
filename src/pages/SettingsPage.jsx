import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'

const parseError = (rawText, status) => {
    try {
        const data = JSON.parse(rawText)
        if (Array.isArray(data) && data.length > 0 && data[0].message) {
            return data[0].message
        }
        return data.message || data.error?.message || (typeof data.error === 'string' ? data.error : 'Validation failed.')
    } catch {
        return rawText || `Server error: ${status}`
    }
}

export default function SettingsPage() {
    const { user } = useAuth()
    const fileInputRef = useRef(null)

    const [formData, setFormData] = useState({ username: '', bio: '' })
    const [isProfileLoading, setIsProfileLoading] = useState(false)
    const [profileError, setProfileError] = useState('')
    const [profileSuccess, setProfileSuccess] = useState('')
    const [about, setAbout] = useState(user?.about || '')

    const [links, setLinks] = useState([])
    const [newLink, setNewLink] = useState('')

    // SKILLS STATE (Now handling objects!)
    const [skills, setSkills] = useState([])
    const [newSkill, setNewSkill] = useState('')
    const [newSkillLevel, setNewSkillLevel] = useState('BEGINNER')

    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState('')
    const [currentAvatar, setCurrentAvatar] = useState('')

    useEffect(() => {
        if (user) {
            setFormData({ username: user.username || '', bio: user.bio || '' })
            setAbout(user.about || '')
            setCurrentAvatar(user.avatarUrl || '')
            setLinks(Array.isArray(user.links) ? user.links : [])

            const fetchSkills = async () => {
                try {
                    const response = await apiFetch(`/api/v1/user/${user.username || user.id}/skills`)
                    if (response.ok) {
                        const data = await response.json()
                        const mappedSkills = Array.isArray(data)
                            ? data.map(s => typeof s === 'string' ? { name: s, level: 'BEGINNER' } : { name: s.name, level: s.level })
                            : []
                        setSkills(mappedSkills.filter(s => s.name))
                    }
                } catch (err) { console.error(err) }
            }
            fetchSkills()
        }
    }, [user])

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setIsUploading(true)
        setUploadError('')
        const uploadData = new FormData()
        uploadData.append('avatar', file)

        try {
            const response = await apiFetch('/api/v1/user/me/avatar', {
                method: 'PATCH',
                body: uploadData,
            })
            if (response.ok) {
                const data = await response.json()
                setCurrentAvatar(data.user?.avatarUrl || data.avatarUrl)
            } else {
                setUploadError(parseError(await response.text(), response.status))
            }
        } catch (err) {
            setUploadError('Failed to connect to upload server.')
        } finally {
            setIsUploading(false)
        }
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setIsProfileLoading(true)
        setProfileError(''); setProfileSuccess('')

        try {
            // Payload now includes skills as [{name, level}]
            const payload = { ...formData, about, links, skills }
            const response = await apiFetch('/api/v1/user/me', {
                method: 'PATCH',
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                setProfileSuccess('Profile updated successfully.')
                setTimeout(() => window.location.href = '/profile', 1000)
            } else {
                setProfileError(parseError(await response.text(), response.status))
            }
        } catch (err) {
            setProfileError('Could not connect to the server.')
        } finally { setIsProfileLoading(false) }
    }

    const handleAddLink = (e) => {
        e.preventDefault()
        if (!newLink.trim()) return
        let formattedLink = newLink.trim()
        if (!formattedLink.startsWith('http')) formattedLink = `https://${formattedLink}`
        if (!links.includes(formattedLink)) setLinks([...links, formattedLink])
        setNewLink('')
    }

    const handleDeleteLink = (linkToRemove) => {
        setLinks(links.filter(link => link !== linkToRemove))
    }

    // UPDATED: Now adds object with level
    const handleAddSkill = (e) => {
        e.preventDefault()
        if (!newSkill.trim()) return
        const formattedSkill = newSkill.trim()

        if (!skills.some(s => s.name.toLowerCase() === formattedSkill.toLowerCase())) {
            setSkills([...skills, { name: formattedSkill, level: newSkillLevel }])
        }
        setNewSkill('')
    }

    const handleDeleteSkill = (skillNameToRemove) => {
        setSkills(skills.filter(skill => skill.name !== skillNameToRemove))
    }

    return (
        <div className="max-w-2xl mx-auto px-6 py-12 lg:py-20 w-full">
            <div className="mb-8">
                <Link to="/profile" className="text-sm font-mono text-gray-500 hover:text-white transition-colors">← Back to profile</Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4">Public Profile Settings</h1>
            </div>

            <div className="flex flex-col gap-8">
                <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 p-6 md:p-8 rounded-xl shadow-sm flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-700">
                        {currentAvatar ? (
                            <img src={currentAvatar} alt="Avatar preview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-gray-400 font-mono text-xs">No img</span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Profile Picture</h2>
                        <div className="flex items-center gap-3">
                            <input
                                type="file" accept="image/jpeg, image/png, image/webp"
                                ref={fileInputRef} className="hidden"
                                onChange={handleAvatarUpload}
                            />
                            <button
                                type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                                className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-semibold transition-colors border border-neutral-200 dark:border-neutral-700 cursor-pointer disabled:opacity-50"
                            >
                                {isUploading ? 'Uploading...' : 'Choose File'}
                            </button>
                        </div>
                        {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
                    </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 p-6 md:p-8 rounded-xl shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-neutral-800 pb-2">Basic Info</h2>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Username</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-gray-900 dark:text-gray-100" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Headline</label>
                        <textarea
                            name="bio" rows="3" maxLength={160} value={formData.bio} onChange={handleChange}
                            placeholder="e.g., Computer Science student building web apps..."
                            className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-gray-900 dark:text-gray-100 resize-none"
                        />
                        <div className="text-xs text-gray-500 text-right mt-1 font-mono">{(formData.bio || '').length}/160</div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">About Me</label>
                        <textarea
                            value={about} onChange={(e) => setAbout(e.target.value)} rows="5"
                            className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 rounded-lg p-3.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-y transition-all shadow-sm"
                        ></textarea>
                    </div>

                    {/* SKILLS MANAGER */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Skills & Tech Stack</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {skills.map((skill, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300">
                                    <span>{skill.name}</span>
                                    <span className="text-[10px] bg-gray-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400">{skill.level}</span>
                                    <button type="button" onClick={() => handleDeleteSkill(skill.name)} className="text-gray-400 hover:text-red-500 font-bold ml-1">×</button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(e); } }}
                                placeholder="e.g., React, Python"
                                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-gray-900 dark:text-gray-100 text-sm"
                            />
                            {/* LEVEL DROPDOWN */}
                            <select
                                value={newSkillLevel}
                                onChange={(e) => setNewSkillLevel(e.target.value)}
                                className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-gray-900 dark:text-gray-100 text-sm cursor-pointer"
                            >
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                                <option value="EXPERT">Expert</option>
                            </select>
                            <button type="button" onClick={handleAddSkill} className="bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-800 dark:text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors border border-gray-300 dark:border-neutral-700">Add</button>
                        </div>
                    </div>

                    {/* LINKS MANAGER */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Social & Portfolio Links</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {links.map((link, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300">
                                    <span className="truncate max-w-[200px]">{link.replace('https://', '')}</span>
                                    <button type="button" onClick={() => handleDeleteLink(link)} className="text-gray-400 hover:text-red-500 font-bold">×</button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text" value={newLink} onChange={(e) => setNewLink(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLink(e); } }}
                                placeholder="e.g., github.com/username"
                                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-gray-900 dark:text-gray-100 text-sm"
                            />
                            <button type="button" onClick={handleAddLink} className="bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-800 dark:text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors border border-gray-300 dark:border-neutral-700">Add</button>
                        </div>
                    </div>

                    {profileError && <div className="text-sm text-red-500 font-mono text-xs">{profileError}</div>}
                    {profileSuccess && <div className="text-sm text-accent font-mono text-xs">{profileSuccess}</div>}

                    <div className="pt-2">
                        <button type="submit" disabled={isProfileLoading} className="bg-accent hover:bg-accent-light text-white font-semibold px-6 py-2.5 rounded-md transition-colors disabled:opacity-50 cursor-pointer">
                            {isProfileLoading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}