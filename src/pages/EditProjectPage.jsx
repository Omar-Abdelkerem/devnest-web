import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { apiFetch, normalizeProjectLinks, parseApiError, safeExternalUrl } from '../lib/api'

export default function EditProjectPage() {
  useDocumentTitle('Edit Project')
  const { projectId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    readme: '',
    languages: '',
    projectimgUrl: '',
    isPublic: true,
  })
  const [links, setLinks] = useState([])
  const [linkName, setLinkName] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkError, setLinkError] = useState('')

  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isFetching, setIsFetching] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function fetchProject() {
      try {
        const response = await apiFetch(`/api/v1/projects/${projectId}`, { skipCache: true })
        if (cancelled) return

        if (response.ok) {
          const data = await response.json()
          const project = data.data || data.project || data

          if (user && user.id !== project.userId) {
            navigate('/profile', { replace: true })
            return
          }

          setFormData({
            title: project.title || project.name || '',
            description: project.description || '',
            readme: project.readme || '',
            languages: Array.isArray(project.languages) ? project.languages.join(', ') : '',
            projectimgUrl: project.projectimgUrl || '',
            isPublic: project.isPublic !== undefined ? project.isPublic : true,
          })
          setLinks(normalizeProjectLinks(project.links))
        } else {
          setError('Project not found.')
        }
      } catch {
        if (!cancelled) setError('Could not connect to the server.')
      } finally {
        if (!cancelled) setIsFetching(false)
      }
    }
    fetchProject()
    return () => {
      cancelled = true
    }
  }, [projectId, user, navigate])

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError('')
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be 5 MB or smaller.')
      return
    }

    setIsUploadingImage(true)
    const uploadData = new FormData()
    uploadData.append('image', file)

    try {
      const res = await apiFetch('/api/v1/projects/upload-image', {
        method: 'POST',
        body: uploadData,
      })
      if (res.ok) {
        const data = await res.json()
        setFormData((prev) => ({ ...prev, projectimgUrl: data.imageUrl || '' }))
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

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (isSaving || isDeleting || isUploadingImage) return
    setIsSaving(true)
    setError('')

    try {
      const languagesArray = formData.languages
        .split(',')
        .map((lang) => lang.trim())
        .filter(Boolean)

      const response = await apiFetch(`/api/v1/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          readme: formData.readme || '',
          languages: languagesArray,
          projectimgUrl: formData.projectimgUrl || null,
          links,
          isPublic: formData.isPublic,
        }),
      })

      if (response.ok) {
        navigate(`/project/${projectId}`, { replace: true })
      } else {
        const { message } = await parseApiError(response, 'Failed to update project.')
        setError(message)
      }
    } catch {
      setError('Could not connect to the server.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (isDeleting || isSaving) return
    if (!window.confirm('Are you sure you want to delete this project? This cannot be undone.')) return
    setIsDeleting(true)
    setError('')
    try {
      const response = await apiFetch(`/api/v1/projects/${projectId}`, { method: 'DELETE' })
      if (response.ok) {
        navigate('/profile', { replace: true })
      } else {
        const { message } = await parseApiError(response, 'Failed to delete project.')
        setError(message)
      }
    } catch {
      setError('Could not connect to server.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 font-mono text-sm">
        Loading project...
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 lg:py-16 w-full">
      <div className="mb-8">
        <Link to={`/project/${projectId}`} className="text-sm font-mono text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          ← Back to project
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-4 tracking-tight">
          Edit Project
        </h1>
      </div>

      <form
        onSubmit={handleUpdate}
        className="flex flex-col gap-6 glass-panel p-6 md:p-8 rounded-xl mb-8"
      >
        {/* Project Cover Photo */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Project Cover Photo <span className="text-xs font-normal text-slate-500">(optional)</span>
          </span>

          {formData.projectimgUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-white/[0.1] aspect-[16/9] bg-slate-100 dark:bg-[#0d0f16]">
              <img
                src={formData.projectimgUrl}
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
                  onClick={() => setFormData((prev) => ({ ...prev, projectimgUrl: '' }))}
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
          {uploadError && <p role="alert" className="text-xs font-mono text-rose-500">{uploadError}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="edit-title" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Project Title
          </label>
          <input
            id="edit-title"
            type="text"
            required
            maxLength={120}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="px-3.5 py-2 glass-input rounded-lg text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="edit-description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Short Description
          </label>
          <textarea
            id="edit-description"
            required
            rows="2"
            maxLength={500}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="px-3.5 py-2 glass-input rounded-lg text-sm resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="edit-languages" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Languages / Stack <span className="text-xs font-normal text-slate-500">(comma separated)</span>
          </label>
          <input
            id="edit-languages"
            type="text"
            placeholder="Rust, Go, TypeScript"
            value={formData.languages}
            onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
            className="px-3.5 py-2 glass-input rounded-lg text-sm"
          />
        </div>

        {/* Optional Project Links */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Project Links <span className="text-xs font-normal text-slate-500">(optional)</span>
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
          <label htmlFor="edit-readme" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Project Readme (Markdown supported)
          </label>
          <textarea
            id="edit-readme"
            rows="6"
            value={formData.readme}
            onChange={(e) => setFormData({ ...formData, readme: e.target.value })}
            className="px-3.5 py-2 glass-input rounded-lg font-mono text-sm"
          />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <input
            id="edit-public"
            type="checkbox"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            className="w-4 h-4 accent-accent rounded cursor-pointer"
          />
          <label htmlFor="edit-public" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            Make this project public
          </label>
        </div>

        {error && (
          <div role="alert" className="text-sm font-mono text-rose-500">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving || isDeleting || isUploadingImage}
          className="btn-3d-pill font-semibold px-6 py-2.5 rounded-lg text-sm disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Danger Zone */}
      <div className="border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 p-6 md:p-8 rounded-xl">
        <h2 className="text-base font-semibold text-rose-700 dark:text-rose-400 mb-1.5">Danger Zone</h2>
        <p className="text-sm text-rose-600/80 dark:text-rose-300/80 mb-4">
          Deleting this project permanently removes its readme, stars, and comments.
        </p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSaving || isDeleting}
          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isDeleting ? 'Deleting...' : 'Delete Project'}
        </button>
      </div>
    </div>
  )
}
