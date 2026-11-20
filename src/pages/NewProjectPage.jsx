import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { apiFetch, parseApiError, safeExternalUrl } from '../lib/api'
import { savePinnedState } from '../lib/projectOrder'

export default function NewProjectPage() {
  useDocumentTitle('Create New Project')
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [readme, setReadme] = useState('')
  const [languages, setLanguages] = useState('')
  const [projectimgUrl, setProjectimgUrl] = useState('')
  const [links, setLinks] = useState([])
  const [linkName, setLinkName] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkError, setLinkError] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [isPinned, setIsPinned] = useState(false)

  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError('')
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be 5 MB or smaller.')
      return
    }

    setIsUploadingImage(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await apiFetch('/api/v1/projects/upload-image', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        setProjectimgUrl(data.imageUrl || '')
      } else {
        const { message } = await parseApiError(res, 'Failed to upload image.')
        setUploadError(message)
      }
    } catch {
      setUploadError('Could not connect to upload server.')
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAddLink = () => {
    setLinkError('')
    const trimmedName = linkName.trim()
    const safeUrl = safeExternalUrl(linkUrl)
    if (!trimmedName) {
      setLinkError('Enter a label for the link (e.g. Live Demo or GitHub).')
      return
    }
    if (!safeUrl) {
      setLinkError('Enter a valid http:// or https:// URL.')
      return
    }
    if (links.length >= 10) {
      setLinkError('Maximum 10 links per project.')
      return
    }
    setLinks((prev) => [...prev, { name: trimmedName, url: safeUrl }])
    setLinkName('')
    setLinkUrl('')
  }

  const handleRemoveLink = (index) => {
    setLinks((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLoading || isUploadingImage) return
    setIsLoading(true)
    setError('')

    try {
      const languagesArray = languages
        .split(',')
        .map((lang) => lang.trim())
        .filter(Boolean)

      const payload = {
        title: title.trim(),
        description: description.trim(),
        readme: readme || '',
        languages: languagesArray,
        links,
        isPublic,
        isPinned,
        ...(projectimgUrl ? { projectimgUrl } : {}),
      }

      const response = await apiFetch('/api/v1/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const created = await response.json()
        if (created?.id && isPinned) {
          savePinnedState(user?.username, created.id, true)
        }
        navigate(created?.id ? `/project/${created.id}` : '/profile', { replace: true })
      } else {
        const { message } = await parseApiError(response, 'Failed to create project.')
        setError(message)
      }
    } catch {
      setError('Could not connect to the server.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 lg:py-16 w-full">
      <div className="mb-8">
        <Link to="/profile" className="text-sm font-mono text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          ← Back to profile
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-4 tracking-tight">
          Create a new project
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 glass-panel p-6 md:p-8 rounded-xl"
      >
        {/* Project Cover Photo (Optional) */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Project Cover Photo <span className="text-xs font-normal text-slate-500">(optional)</span>
          </span>

          {projectimgUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-white/[0.1] aspect-[16/9] bg-slate-100 dark:bg-[#0d0f16]">
              <img
                src={projectimgUrl}
                alt="Project cover preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="bg-black/75 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => setProjectimgUrl('')}
                  className="bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="flex flex-col items-center justify-center gap-2 py-8 px-4 border border-dashed border-slate-300 dark:border-white/[0.14] hover:border-accent dark:hover:border-accent-light rounded-lg bg-slate-50/60 dark:bg-white/[0.02] transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {isUploadingImage ? 'Uploading cover photo...' : 'Click to upload a cover photo'}
              </span>
              <span className="text-xs font-mono text-slate-500">
                JPEG, PNG, WebP or GIF · Max 5 MB
              </span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleImageUpload}
          />
          {uploadError && (
            <p role="alert" className="text-xs font-mono text-rose-500">{uploadError}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Project Title
          </label>
          <input
            type="text"
            id="title"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Distributed Task Queue"
            className="px-3.5 py-2 glass-input rounded-lg text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Short Description
          </label>
          <textarea
            id="description"
            required
            rows="2"
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="One or two sentences summarizing what you built..."
            className="px-3.5 py-2 glass-input rounded-lg text-sm resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="languages" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Languages / Stack <span className="text-xs font-normal text-slate-500">(comma separated)</span>
          </label>
          <input
            type="text"
            id="languages"
            placeholder="TypeScript, Go, PostgreSQL"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            className="px-3.5 py-2 glass-input rounded-lg text-sm"
          />
        </div>

        {/* Optional Project Links */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Project Links <span className="text-xs font-normal text-slate-500">(optional — Live Demo, GitHub, Docs)</span>
          </span>

          {links.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-1">
              {links.map((item, idx) => (
                <div
                  key={`${item.url}-${idx}`}
                  className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-md bg-accent/10 border border-accent/25 text-accent dark:text-accent-light"
                >
                  <span className="font-semibold">{item.name}:</span>
                  <span className="truncate max-w-[160px]">{item.url.replace(/^https?:\/\//, '')}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name} link`}
                    onClick={() => handleRemoveLink(idx)}
                    className="text-slate-400 hover:text-rose-500 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <input
              type="text"
              placeholder="Label (e.g. Live Demo)"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              className="sm:col-span-4 px-3.5 py-2 glass-input rounded-lg text-sm"
            />
            <input
              type="url"
              placeholder="https://my-project.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddLink()
                }
              }}
              className="sm:col-span-6 px-3.5 py-2 glass-input rounded-lg text-sm"
            />
            <button
              type="button"
              onClick={handleAddLink}
              className="sm:col-span-2 btn-glass-pill px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer"
            >
              Add
            </button>
          </div>
          {linkError && <p className="text-xs font-mono text-rose-500">{linkError}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="readme" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Project Readme (Markdown supported)
          </label>
          <textarea
            id="readme"
            rows="6"
            value={readme}
            onChange={(e) => setReadme(e.target.value)}
            placeholder="Explain architecture, setup steps, or what you learned..."
            className="px-3.5 py-2 glass-input rounded-lg font-mono text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-1">
          <label htmlFor="isPublic" className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 accent-accent rounded cursor-pointer"
            />
            Make this project public
          </label>

          <label htmlFor="isPinned" className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              id="isPinned"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 accent-accent rounded cursor-pointer"
            />
            Pin to top of my portfolio
          </label>
        </div>

        {error && (
          <div role="alert" className="text-sm font-mono text-rose-500">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || isUploadingImage}
          className="btn-3d-pill font-semibold px-6 py-2.5 rounded-lg text-sm disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? 'Publishing...' : 'Publish Project'}
        </button>
      </form>
    </div>
  )
}
