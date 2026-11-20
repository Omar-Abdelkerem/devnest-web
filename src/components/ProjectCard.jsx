import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { apiFetch, getStarCount, normalizeProjectLinks, parseApiError } from '../lib/api'

export default function ProjectCard({
  project,
  isOwner = false,
  onImageUpdated = null,
}) {
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
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel-interactive rounded-xl overflow-hidden flex flex-col group h-full"
    >
      {/* Hidden file input for owner quick cover upload */}
      {isOwner && project.id && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleQuickCoverUpload}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* 16:9 Cover Photo — rendered ONLY when a photo actually exists */}
      {coverImage && (
        <div className="relative w-full aspect-[16/9] overflow-hidden border-b border-slate-200/80 dark:border-white/[0.07] bg-slate-100 dark:bg-[#0c0e14] shrink-0">
          <img
            src={coverImage}
            alt={`${projectTitle} preview`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
          {isOwner && project.id && (
            <button
              type="button"
              disabled={isUploading}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              className="absolute top-2.5 right-2.5 z-20 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-black/75 hover:bg-black text-white border border-white/15 backdrop-blur-sm transition-opacity opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer"
            >
              {isUploading ? 'Uploading...' : 'Change photo'}
            </button>
          )}
        </div>
      )}

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-accent dark:group-hover:text-accent-light transition-colors truncate">
            <Link
              to={`/project/${project.id}`}
              title={projectTitle}
              className="before:absolute before:inset-0 before:z-0 outline-none"
            >
              {projectTitle}
            </Link>
          </h3>

          <div className="flex items-center gap-2 shrink-0 relative z-10 mt-0.5">
            {isOwner && !coverImage && project.id && (
              <button
                type="button"
                disabled={isUploading}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                title="Add project cover photo"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.1] hover:border-slate-400 dark:hover:border-white/[0.22] transition-colors cursor-pointer"
              >
                {isUploading ? '...' : '+ Photo'}
              </button>
            )}
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
              {project.updatedAt}
            </span>
          </div>
        </div>

        {uploadError && (
          <p className="text-xs font-mono text-rose-500 mb-2 relative z-10">{uploadError}</p>
        )}

        {project?.badges?.length > 0 && (
          <div className="flex items-center gap-2 mb-2.5 relative z-10">
            {project.badges.map((badge) => (
              <span
                key={badge}
                className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/[0.09] rounded uppercase tracking-wider font-semibold"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 relative z-10 leading-relaxed">
          {project.description || 'No description provided.'}
        </p>

        {/* Optional Project Links */}
        {projectLinks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3 relative z-10">
            {projectLinks.slice(0, 3).map((link, idx) => (
              <a
                key={`${link.url}-${idx}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-slate-100/90 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.09] hover:border-slate-300 dark:hover:border-white/[0.2] hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <span className="truncate max-w-[120px]">{link.name}</span>
                <span aria-hidden="true" className="text-[11px] opacity-70">↗</span>
              </a>
            ))}
          </div>
        )}

        <div className="flex-grow min-h-[14px]" />

        {/* Author */}
        {project.author && (
          <div className="mt-auto mb-3.5 flex items-center gap-2 relative z-10">
            <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 dark:bg-white/[0.08] flex items-center justify-center border border-slate-300 dark:border-white/[0.12] shrink-0">
              {project.authorAvatar ? (
                <img
                  src={project.authorAvatar}
                  alt={`${project.author} avatar`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300">
                  {project.author.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <Link
              to={`/${authorSlug}`}
              className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors truncate"
            >
              {project.author}
            </Link>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-3.5 border-t border-slate-100 dark:border-white/[0.06] mt-auto relative z-10">
          {project.languages && project.languages.length > 0 ? (
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              {project.languages.slice(0, 3).map((lang, idx) => {
                const langName = typeof lang === 'string' ? lang : lang.name
                const color =
                  (typeof lang === 'object' && lang.color) || project.languageColor || '#2a8a7e'
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    {langName}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: project.languageColor || '#2a8a7e' }}
              />
              {project.language || 'Code'}
            </div>
          )}

          <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 ml-auto">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
              View details
              <span className="inline-block rtl:rotate-180" aria-hidden="true">→</span>
            </span>
            <span className="flex items-center gap-1">
              <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {starCount}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
