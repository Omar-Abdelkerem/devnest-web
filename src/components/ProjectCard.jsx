import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { apiFetch, getStarCount, normalizeProjectLinks, parseApiError } from '../lib/api'
import GlassIconTile from './GlassIconTile'

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

  const primaryLanguage =
    (project.languages && project.languages.length > 0
      ? typeof project.languages[0] === 'string'
        ? project.languages[0]
        : project.languages[0]?.name
      : null) ||
    project.language ||
    'Code'

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
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel-interactive rounded-2xl overflow-hidden flex flex-col group h-full p-2.5"
    >
      {/* Top specular highlight beam on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent-light/65 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

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

      {/* 16:9 Cover Photo OR Dark-Glass Abstract Mesh Header */}
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] bg-slate-100 dark:bg-[#0b0d14] shrink-0">
        {coverImage ? (
          <>
            <img
              src={coverImage}
              alt={`${projectTitle} preview`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-70"
            />
          </>
        ) : (
          /* Sleek Dark-Glass Abstract Mesh Header with Floating 3D Language Badge */
          <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-teal-50/40 dark:from-[#0b0d15] dark:via-[#08090f] dark:to-[#0d1c1d]">
            {/* Volumetric spotlight inside mesh header */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-56 h-36 rounded-full blur-2xl opacity-60 dark:opacity-90"
              style={{
                background:
                  'radial-gradient(circle, rgba(60, 210, 191, 0.25) 0%, rgba(42, 138, 126, 0.06) 60%, transparent 80%)',
              }}
            />
            {/* Micro grid lines */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.07] dark:opacity-[0.09]"
              style={{
                backgroundImage:
                  'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <GlassIconTile size="md" accent={true}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </GlassIconTile>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase bg-white/80 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.1]">
                {primaryLanguage}
              </span>
            </div>
          </div>
        )}

        {/* Badges overlay (top-left) */}
        {project?.badges?.length > 0 && (
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
            {project.badges.map((badge) => (
              <span
                key={badge}
                className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-full bg-black/70 text-accent-light border border-white/15 backdrop-blur-md shadow-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Owner Quick Cover Upload Button (top-right) */}
        {isOwner && project.id && (
          <button
            type="button"
            disabled={isUploading}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
            title={coverImage ? 'Change project cover photo' : 'Add project cover photo'}
            className="absolute top-2.5 right-2.5 z-20 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md transition-opacity opacity-95 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer"
          >
            <svg className="w-3 h-3 text-accent-light" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            {isUploading ? 'Uploading...' : coverImage ? 'Change photo' : '+ Photo'}
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 px-3 pt-4 pb-2.5">
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-accent dark:group-hover:text-accent-light transition-colors truncate">
            <Link
              to={`/project/${project.id}`}
              title={projectTitle}
              className="before:absolute before:inset-0 before:z-0 outline-none"
            >
              {projectTitle}
            </Link>
          </h3>

          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0 mt-1">
            {project.updatedAt}
          </span>
        </div>

        {uploadError && (
          <p className="text-xs font-mono text-red-500 mb-2 relative z-10">{uploadError}</p>
        )}

        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 relative z-10 leading-relaxed">
          {project.description || 'No description provided.'}
        </p>

        {/* Optional Project Links styled as Frosted Mini-Pills */}
        {projectLinks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3.5 relative z-10">
            {projectLinks.slice(0, 3).map((link, idx) => (
              <a
                key={`${link.url}-${idx}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-slate-100/90 dark:bg-white/[0.05] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.1] hover:border-accent/50 dark:hover:border-accent-light/50 hover:text-accent dark:hover:text-accent-light transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]"
              >
                <span className="truncate max-w-[120px]">{link.name}</span>
                <span aria-hidden="true" className="text-[11px] opacity-75">↗</span>
              </a>
            ))}
          </div>
        )}

        <div className="flex-grow min-h-[14px]" />

        {/* Author Row */}
        {project.author && (
          <div className="mt-auto mb-3 flex items-center gap-2 relative z-10">
            <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 dark:bg-white/[0.08] flex items-center justify-center border border-slate-300 dark:border-white/[0.14] shrink-0">
              {project.authorAvatar ? (
                <img
                  src={project.authorAvatar}
                  alt={`${project.author} avatar`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
                  {project.author.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <Link
              to={`/${authorSlug}`}
              className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 hover:text-accent dark:hover:text-accent-light transition-colors truncate"
            >
              @{project.author}
            </Link>
          </div>
        )}

        {/* Bottom Metadata & Specular Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200/70 dark:border-white/[0.07] mt-auto relative z-10">
          {project.languages && project.languages.length > 0 ? (
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
              {project.languages.slice(0, 3).map((lang, idx) => {
                const langName = typeof lang === 'string' ? lang : lang.name
                const color =
                  (typeof lang === 'object' && lang.color) || project.languageColor || '#3cd2bf'
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap"
                  >
                    <span
                      className="w-2 h-2 rounded-full shadow-[0_0_6px_rgba(60,210,191,0.6)]"
                      style={{ backgroundColor: color }}
                    />
                    {langName}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span
                className="w-2 h-2 rounded-full shadow-[0_0_6px_rgba(60,210,191,0.6)]"
                style={{ backgroundColor: project.languageColor || '#3cd2bf' }}
              />
              {project.language || 'Code'}
            </div>
          )}

          <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 ml-auto">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-accent dark:text-accent-light opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:opacity-100 transition-all duration-200">
              View details
              <span className="inline-block rtl:rotate-180" aria-hidden="true">→</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-200">
              <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
