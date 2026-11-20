import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { getStarCount, normalizeProjectLinks } from '../lib/api'

export default function ProjectCard({ project }) {
  const cardRef = useRef(null)
  const rafRef = useRef(null)

  if (!project) return null

  const authorSlug = project.authorUsername || project.author || 'developer'
  const projectTitle = project.repo || project.title || project.name || 'Untitled Project'
  const starCount = getStarCount(project)
  const coverImage = project.projectimgUrl || project.imageUrl || null
  const projectLinks = normalizeProjectLinks(project.links)

  // GPU-only pointer spotlight — updates CSS vars inside rAF (zero React re-renders)
  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const clientX = e.clientX
    const clientY = e.clientY
    if (rafRef.current) return
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      cardRef.current.style.setProperty('--mx', `${clientX - rect.left}px`)
      cardRef.current.style.setProperty('--my', `${clientY - rect.top}px`)
    })
  }

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="project-card-interactive flex flex-col bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:border-accent dark:hover:border-accent-light shadow-sm group h-full"
    >
      {/* Optional Project Cover Photo */}
      {coverImage && (
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
          <img
            src={coverImage}
            alt={`${projectTitle} preview`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        {/* ROW 1: Title (Left) and Date (Right) */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-accent dark:group-hover:text-accent-light transition-colors truncate">
            <Link
              to={`/project/${project.id}`}
              title={projectTitle}
              className="before:absolute before:inset-0 before:z-0 outline-none"
            >
              {projectTitle}
            </Link>
          </h3>
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 shrink-0 relative z-10 mt-1">
            {project.updatedAt}
          </span>
        </div>

        {/* ROW 2: Badges */}
        {project?.badges?.length > 0 && (
          <div className="flex items-center gap-2 mb-3 relative z-10">
            {project.badges.map((badge) => (
              <span
                key={badge}
                className="px-2 py-0.5 text-[10px] font-mono bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 rounded uppercase tracking-wider font-bold"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 relative z-10">
          {project.description || 'No description provided.'}
        </p>

        {/* Optional Project Links (Live Demo / Repo / Docs) */}
        {projectLinks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3 relative z-10">
            {projectLinks.slice(0, 3).map((link, idx) => (
              <a
                key={`${link.url}-${idx}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-accent/10 text-accent dark:text-accent-light border border-accent/25 hover:bg-accent hover:text-white transition-colors"
              >
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="truncate max-w-[120px]">{link.name}</span>
              </a>
            ))}
          </div>
        )}

        <div className="flex-grow min-h-[16px]" />

        {/* Author */}
        {project.author && (
          <div className="mt-auto mb-4 flex items-center gap-2 relative z-10">
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

        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100 dark:border-neutral-800/70 mt-auto relative z-10">
          {/* Multi-language rendering */}
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
            <span className="flex items-center gap-1 group-hover:text-accent dark:group-hover:text-accent-light transition-colors">
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
