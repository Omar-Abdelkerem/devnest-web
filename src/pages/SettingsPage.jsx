import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { apiFetch, parseApiError, safeExternalUrl } from '../lib/api'
import VolumetricBackground from '../components/VolumetricBackground'
import GlassIconTile from '../components/GlassIconTile'

export default function SettingsPage() {
  useDocumentTitle('Profile Settings')
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState(() => ({
    username: user?.username || '',
    bio: user?.bio || '',
    location: user?.location || '',
    age: user?.age ? String(user.age) : '',
    role: user?.role || '',
    company: user?.company || '',
    availableForWork: Boolean(user?.availableForWork),
    isPublic: user?.isPublic !== undefined ? Boolean(user.isPublic) : true,
  }))
  const [about, setAbout] = useState(() => user?.about || '')
  const [links, setLinks] = useState(() => (Array.isArray(user?.links) ? user.links : []))
  const [newLink, setNewLink] = useState('')
  const [linkError, setLinkError] = useState('')

  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState('INTERMEDIATE')

  const [newPassword, setNewPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState({ error: '', success: '' })
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [currentAvatar, setCurrentAvatar] = useState(() => user?.avatarUrl || '')

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const fetchSkills = async () => {
      try {
        const response = await apiFetch(`/api/v1/user/${user.username || user.id}/skills`, {
          skipCache: true,
        })
        if (!cancelled && response.ok) {
          const data = await response.json()
          const mappedSkills = Array.isArray(data)
            ? data.map((s) =>
                typeof s === 'string'
                  ? { name: s, level: 'BEGINNER' }
                  : { name: s.name, level: s.level },
              )
            : []
          setSkills(mappedSkills.filter((s) => s.name))
        }
      } catch {
        // Ignore transient skills load errors
      }
    }
    fetchSkills()
    return () => {
      cancelled = true
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError('')
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Avatar must be 5 MB or smaller.')
      return
    }

    setIsUploading(true)
    const uploadData = new FormData()
    uploadData.append('avatar', file)

    try {
      const response = await apiFetch('/api/v1/user/me/avatar', {
        method: 'PATCH',
        body: uploadData,
      })
      if (response.ok) {
        const data = await response.json()
        setCurrentAvatar(data.user?.avatarUrl || data.avatarUrl || '')
        await refreshUser()
      } else {
        const { message } = await parseApiError(response, 'Failed to upload avatar.')
        setUploadError(message)
      }
    } catch {
      setUploadError('Failed to connect to upload server.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (isProfileLoading) return
    setIsProfileLoading(true)
    setProfileError('')
    setProfileSuccess('')

    try {
      const parsedAge = formData.age.trim() ? parseInt(formData.age, 10) : null
      if (formData.age.trim() && (!Number.isInteger(parsedAge) || parsedAge < 13 || parsedAge > 120)) {
        setProfileError('Age must be a whole number between 13 and 120.')
        setIsProfileLoading(false)
        return
      }

      const payload = {
        username: formData.username.trim(),
        bio: formData.bio.trim(),
        about: about.trim(),
        location: formData.location.trim(),
        age: parsedAge,
        role: formData.role.trim(),
        company: formData.company.trim(),
        availableForWork: formData.availableForWork,
        isPublic: formData.isPublic,
        links,
        skills,
      }

      const response = await apiFetch('/api/v1/user/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const updated = await refreshUser()
        setProfileSuccess('Profile saved!')
        setTimeout(() => {
          navigate(`/${updated?.username || formData.username.trim()}`)
        }, 700)
      } else {
        const { message } = await parseApiError(response, 'Could not save profile changes.')
        setProfileError(message)
      }
    } catch {
      setProfileError('Could not connect to the server.')
    } finally {
      setIsProfileLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (isUpdatingPassword || !newPassword) return
    setIsUpdatingPassword(true)
    setPasswordStatus({ error: '', success: '' })

    try {
      const res = await apiFetch('/api/v1/user/me', {
        method: 'PATCH',
        body: JSON.stringify({ password: newPassword }),
      })
      if (res.ok) {
        setNewPassword('')
        setPasswordStatus({
          error: '',
          success: 'Password updated. All other active sessions have been signed out.',
        })
      } else {
        const { message } = await parseApiError(res, 'Could not update password.')
        setPasswordStatus({ error: message, success: '' })
      }
    } catch {
      setPasswordStatus({ error: 'Could not connect to the server.', success: '' })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleAddLink = (e) => {
    e.preventDefault()
    setLinkError('')
    const safeUrl = safeExternalUrl(newLink)
    if (!safeUrl) {
      setLinkError('Please enter a valid http:// or https:// URL.')
      return
    }
    if (!links.includes(safeUrl)) setLinks([...links, safeUrl])
    setNewLink('')
  }

  const handleDeleteLink = (linkToRemove) => {
    setLinks(links.filter((link) => link !== linkToRemove))
  }

  const handleAddSkill = (e) => {
    e.preventDefault()
    if (!newSkill.trim()) return
    const formattedSkill = newSkill.trim()
    if (!skills.some((s) => s.name.toLowerCase() === formattedSkill.toLowerCase())) {
      setSkills([...skills, { name: formattedSkill, level: newSkillLevel }])
    }
    setNewSkill('')
  }

  const handleDeleteSkill = (skillNameToRemove) => {
    setSkills(skills.filter((skill) => skill.name !== skillNameToRemove))
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <VolumetricBackground variant="profile" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12 lg:py-18 w-full">
        <div className="mb-8">
          <Link
            to={user?.username ? `/${user.username}` : '/'}
            className="btn-glass-pill text-xs font-mono px-4 py-1.5 rounded-full"
          >
            ← Back to profile
          </Link>
          <div className="flex items-center gap-3.5 mt-5">
            <GlassIconTile size="lg" accent={true}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </GlassIconTile>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Profile Settings
              </h1>
              <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400">
                Customize your identity, core stack, and portfolio visibility
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Avatar Card */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-white/[0.12] p-1">
              <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center bg-slate-200 dark:bg-[#0b0d14]">
                {currentAvatar ? (
                  <img src={currentAvatar} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-500 font-mono text-xs">No img</span>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Profile Picture
              </h2>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="btn-glass-pill px-4 py-2 rounded-full text-xs font-mono font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Choose Photo'}
                </button>
              </div>
              {uploadError && <p role="alert" className="text-xs font-mono text-rose-500 mt-2">{uploadError}</p>}
            </div>
          </div>

          {/* Profile Form */}
          <form
            onSubmit={handleUpdateProfile}
            className="flex flex-col gap-6 glass-panel p-6 md:p-8 rounded-3xl"
          >
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200/70 dark:border-white/[0.08] pb-3">
              Sidebar &amp; Basic Info
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="settings-username" className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Username
                </label>
                <input
                  id="settings-username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="px-3.5 py-2.5 glass-input rounded-xl text-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="settings-age" className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Age <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  id="settings-age"
                  type="number"
                  name="age"
                  min={13}
                  max={120}
                  placeholder="e.g. 22"
                  value={formData.age}
                  onChange={handleChange}
                  className="px-3.5 py-2.5 glass-input rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="settings-location" className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Location <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  id="settings-location"
                  type="text"
                  name="location"
                  maxLength={100}
                  placeholder="e.g. Cairo, Egypt"
                  value={formData.location}
                  onChange={handleChange}
                  className="px-3.5 py-2.5 glass-input rounded-xl text-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="settings-role" className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Role / Title <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  id="settings-role"
                  type="text"
                  name="role"
                  maxLength={80}
                  placeholder="e.g. Full-Stack Engineer"
                  value={formData.role}
                  onChange={handleChange}
                  className="px-3.5 py-2.5 glass-input rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="settings-company" className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Company / University <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                id="settings-company"
                type="text"
                name="company"
                maxLength={80}
                placeholder="e.g. DevNest Labs"
                value={formData.company}
                onChange={handleChange}
                className="px-3.5 py-2.5 glass-input rounded-xl text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-6 pt-1">
              <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="availableForWork"
                  checked={formData.availableForWork}
                  onChange={handleChange}
                  className="w-4 h-4 accent-accent rounded cursor-pointer"
                />
                Show &ldquo;Open to work&rdquo; badge
              </label>

              <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="w-4 h-4 accent-accent rounded cursor-pointer"
                />
                Public profile
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="settings-bio" className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Short Bio
              </label>
              <textarea
                id="settings-bio"
                name="bio"
                rows="3"
                maxLength={160}
                value={formData.bio}
                onChange={handleChange}
                placeholder="e.g. Computer Science student building fast web apps..."
                className="px-3.5 py-2.5 glass-input rounded-xl text-sm resize-none"
              />
              <div className="text-xs text-slate-500 text-right font-mono">
                {(formData.bio || '').length}/160
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="settings-about" className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                About Me
              </label>
              <textarea
                id="settings-about"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows="5"
                maxLength={1500}
                className="w-full glass-input rounded-xl p-3.5 text-sm resize-y"
              />
            </div>

            {/* SKILLS MANAGER */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Skills &amp; Tech Stack
              </span>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] text-slate-800 dark:text-slate-200"
                  >
                    <span>{skill.name}</span>
                    <span className="text-[10px] bg-accent/15 text-accent dark:text-accent-light border border-accent/30 px-1.5 py-0.5 rounded">
                      {skill.level}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${skill.name}`}
                      onClick={() => handleDeleteSkill(skill.name)}
                      className="text-slate-400 hover:text-rose-500 font-bold ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSkill(e)
                    }
                  }}
                  placeholder="e.g. React, Python"
                  className="flex-1 px-3.5 py-2 glass-input rounded-xl text-sm"
                />
                <select
                  aria-label="Skill level"
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                  className="px-3.5 py-2 glass-input rounded-xl text-sm cursor-pointer dark:bg-[#0e1018]"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn-glass-pill px-4 py-2 rounded-xl text-xs font-mono font-semibold cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* LINKS MANAGER */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Social &amp; Portfolio Links
              </span>
              <div className="flex flex-wrap gap-2 mb-2">
                {links.map((link, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] text-slate-800 dark:text-slate-200"
                  >
                    <span className="truncate max-w-[200px]">{link.replace(/^https?:\/\//, '')}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${link}`}
                      onClick={() => handleDeleteLink(link)}
                      className="text-slate-400 hover:text-rose-500 font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddLink(e)
                    }
                  }}
                  placeholder="e.g. github.com/username"
                  className="flex-1 px-3.5 py-2 glass-input rounded-xl text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="btn-glass-pill px-4 py-2 rounded-xl text-xs font-mono font-semibold cursor-pointer"
                >
                  Add
                </button>
              </div>
              {linkError && <p className="text-xs font-mono text-rose-500">{linkError}</p>}
            </div>

            {profileError && <div role="alert" className="text-rose-500 font-mono text-xs">{profileError}</div>}
            {profileSuccess && <div role="status" className="text-accent dark:text-accent-light font-mono text-xs">{profileSuccess}</div>}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProfileLoading}
                className="btn-3d-pill font-bold px-7 py-3 rounded-full text-sm disabled:opacity-50 cursor-pointer"
              >
                {isProfileLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>

          {/* Security: Change Password */}
          <form
            onSubmit={handlePasswordChange}
            className="flex flex-col gap-4 glass-panel p-6 md:p-8 rounded-3xl"
          >
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200/70 dark:border-white/[0.08] pb-3">
              Security
            </h2>
            <div className="flex flex-col gap-2">
              <label htmlFor="new-password" className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                maxLength={20}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="6 to 20 characters"
                className="px-3.5 py-2.5 glass-input rounded-xl text-sm"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Changing your password automatically signs out all other active devices.
              </p>
            </div>

            {passwordStatus.error && (
              <p role="alert" className="text-xs font-mono text-rose-500">{passwordStatus.error}</p>
            )}
            {passwordStatus.success && (
              <p role="status" className="text-xs font-mono text-accent dark:text-accent-light">{passwordStatus.success}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={isUpdatingPassword || newPassword.length < 6}
                className="btn-glass-pill font-semibold px-6 py-2.5 rounded-full text-xs sm:text-sm disabled:opacity-50 cursor-pointer"
              >
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
