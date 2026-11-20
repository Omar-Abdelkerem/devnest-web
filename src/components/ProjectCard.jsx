import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch, getStarCount, normalizeProjectLinks, parseApiError } from '../lib/api'

const FALLBACK_GRADIENTS = [
  'from-teal-900/80 via-emerald-950/70 to-neutral-900',
  'from-cyan-900/80 via-slate-900 to-neutral-900',
  'from-emerald-900/75 via-teal-950 to-neutral-900',
  'from-sky-900/75 via-slate-900 to-neutral-900',
]

function pickGradient(title = '') {
  let sum = 0
  for (let i = 0; i < title.length; i++) sum += title.charCodeAt(i)
  return FALLBACK_GRADIENTS[sum % FALLBACK_GRADIENTS.length]
}

export default function ProjectCard({
  project,
  isOwner = false,
  onImageUpdated = null,
}) {
  const cardRef = useRef(null)
  const rafRef = useRef(null)
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [localCover, setLocalCover] = useState(null)

  if (!project) return null

  const authorSlug = project.authorUsername || project.author || 'developer'
  const projectTitle = project.repo || project.title || project.name || 'Untitled Project'
  const starCount = getStarCount(project)
  const coverImage = localCover ?? project.projectimgUrl ?? project.imageUrl ?? null
  const projectLinks = normalizeProjectLinks(project.links)
  const primaryLang =
    (project.languages && project.languages.length > 0
      ? typeof project.languages[0] === 'string'
        ? project.languages[0]
        : project.languages[0]?.name
      : null) ||
    project.language ||
    'Code'

  // GPU-only 3D tilt + pointer spotlight inside rAF (zero React re-renders)
  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const clientX = e.clientX
    const clientY = e.clientY
    if (rafRef.current) return
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      const el = cardRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      const rx = -((y / rect.height) - 0.5) * 6
      const ry = ((x / rect.width) - 0.5) * 6
      el.style.setProperty('--mx', `${x}px`)
      el.style.setProperty('--my', `${y}px`)
      el.style.setProperty('--rx', `${rx.toFixed(2)}deg`)
      el.style.setProperty('--ry', `${ry.toFixed(2)}deg`)
    })
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.setProperty('--rx', '0deg')
    cardRef.current.style.setProperty('--ry', '0deg')
  }

  // Owner can upload/change cover photo directly from the outside Profile Page!
  const handleQuickCoverUpload = async (e) => {
    e.stopPropagation()
    const file = e.target.files?.[0]
    if (!file || !project.id) return

    setUploadError('')
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Max 5 MB image')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const uploadRes = await apiFetch('/api/v1/projects/upload-image', {
        method: 'POST',
        body: formData,
      })
      if (!uploadRes.ok) {
        const { message } = await parseApiError(uploadRes, 'Upload failed')
        setUploadError(message)
        return
      }
      const { imageUrl } = await uploadRes.json()
      const patchRes = await apiFetch(`/api/v1/projects/${project.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ projectimgUrl: imageUrl }),
      })
      if (patchRes.ok) {
        setLocalCover(imageUrl)
        if (onImageUpdated) onImageUpdated(project.id, imageUrl)
      } else {
        const { message } = await parseApiError(patchRes, 'Could not save photo')
        setUploadError(message)
      }
    } catch {
      setUploadError('Network error')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="project-card-interactive flex flex-col bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:border-accent dark:hover:border-accent-light shadow-sm group h-full"
    >
      {/* Visual 16:9 Cover Banner (always rich & visual!) */}
      <div className="relative w-full aspect-[16/9] overflow-hidden border-b border-gray-200 dark:border-neutral-800 bg-neutral-900">
        {coverImage ? (
          <img
            src={coverImage}
            alt={`${projectTitle} preview`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${pickGradient(projectTitle)} bg-dot-grid flex flex-col justify-between p-4 transition-transform duration-500 group-hover:scale-105`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 text-emerald-200 border border-white/15 backdrop-blur-sm">
                {primaryLang}
              </span>
            </div>
            <div className="text-4xl font-black tracking-tight text-white/15 select-none truncate">
              {projectTitle}
            </div>
          </div>
        )}

        {/* Cinematic hover vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />

        {/* Owner Quick Cover Upload Button right on the outside card */}
        {isOwner && project.id && (
          <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleQuickCoverUpload}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold bg-black/75 hover:bg-accent text-white border border-white/20 backdrop-blur-md transition-all duration-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer shadow-md"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              {isUploading ? 'Uploading...' : coverImage ? 'Change photo' : 'Add photo'}
            </button>
            {uploadError && (
              <span className="px-2 py-0.5 rounded bg-red-600/90 text-white text-[10px] font-mono shadow">
                {uploadError}
              </span>
            )}
          </div>
        )}

        {/* Badges floating on cover */}
        {project?.badges?.length > 0 && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
            {project.badges.map((badge) => (
              <span
                key={badge}
                className="px-2 py-0.5 text-[10px] font-mono bg-black/70 text-white border border-white/20 backdrop-blur-md rounded uppercase tracking-wider font-bold"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 group-hover:text-accent dark:group-hover:text-accent-light transition-colors truncate">
            <Link
              to={`/project/${project.id}`}
              title={projectTitle}
              className="before:absolute before:inset-0 before:z-0 outline-none"
            >
              {projectTitle}
            </Link>
          </h3>
          <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 shrink-0 relative z-10 mt-1">
            {project.updatedAt}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 relative z-10 leading-relaxed">
          {project.description || 'No description provided.'}
        </p>

        {/* Optional Project Links (Live Demo / Repo / Docs) */}
        {projectLinks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3.5 relative z-10">
            {projectLinks.slice(0, 3).map((link, idx) => (
              <a
                key={`${link.url}-${idx}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-accent/10 text-accent dark:text-accent-light border border-accent/25 hover:bg-accent hover:text-white transition-all duration-150 hover:-translate-y-0.5"
              >
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="truncate max-w-[120px]">{link.name}</span>
              </a>
            ))}
          </div>
        )}

        <div className="flex-grow min-h-[14px]" />

        {/* Author */}
        {project.author && (
          <div className="mt-auto mb-3.5 flex items-center gap-2 relative z-10">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-neutral-800 flex items-center justify-center border border-gray-300 dark:border-neutral-700 shrink-0">
              {project.authorAvatar ? (
                <img
                  src={project.authorAvatar}
                  alt={`${project.author} avatar`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">
                  {project.author.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <Link
              to={`/${authorSlug}`}
              className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent-light transition-colors truncate"
            >
              {project.author}
            </Link>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-3.5 border-t border-gray-100 dark:border-neutral-800/70 mt-auto relative z-10">
          {project.languages && project.languages.length > 0 ? (
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              {project.languages.map((lang, idx) => {
                const langName = typeof lang === 'string' ? lang : lang.name
                const color = (typeof lang === 'object' && lang.color) || project.languageColor || '#2a8a7e'
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                    {langName}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: project.languageColor || '#2a8a7e' }}
              />
              {project.language || 'Code'}
            </div>
          )}

          <div className="flex items-center gap-3 text-xs font-mono text-gray-600 dark:text-gray-400 ml-auto">
            <span className="flex items-center gap-1 group-hover:text-accent dark:group-hover:text-accent-light transition-colors font-semibold">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {starCount}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
