import { Link } from 'react-router-dom'
import { getStarCount } from '../lib/api'

export default function ProjectCard({ project }) {
  if (!project) return null;

  const authorSlug = project.authorUsername || project.author || 'developer';
  const projectTitle = project.repo || project.title || project.name || 'Untitled Project';
  const starCount = getStarCount(project);

  return (
    <div className="relative flex flex-col bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-xl p-5 hover:border-accent dark:hover:border-accent transition-colors shadow-sm group h-full">

      <div className="flex flex-col flex-1">
        {/* ROW 1: Title (Left) and Date (Right) */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-accent transition-colors truncate">
            <Link to={`/project/${project.id}`} title={projectTitle} className="before:absolute before:inset-0 before:z-0 outline-none">
              {projectTitle}
            </Link>
          </h3>
          <span className="text-xs font-mono text-gray-400 dark:text-gray-500 shrink-0 relative z-10 mt-1">
            {project.updatedAt}
          </span>
        </div>

        {/* ROW 2: Badges */}
        {project?.badges?.length > 0 && (
          <div className="flex items-center gap-2 mb-3 relative z-10">
            {project.badges.map(badge => (
              <span key={badge} className="px-2 py-0.5 text-[10px] font-mono bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-neutral-700 rounded uppercase tracking-wider font-bold">
                {badge}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 relative z-10">
          {project.description || 'No description provided.'}
        </p>

        <div className="flex-grow min-h-[16px]"></div>

        {/* Author */}
        {project.author && (
          <div className="mt-auto mb-4 flex items-center gap-2 relative z-10">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-neutral-800 flex items-center justify-center border border-gray-300 dark:border-neutral-700">
              {project.authorAvatar ? (
                <img src={project.authorAvatar} alt={project.author} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-gray-500">{project.author.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <Link to={`/${authorSlug}`} className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-accent transition-colors truncate">
              {project.author}
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100 dark:border-neutral-800/50 mt-auto relative z-10">

        {/* Multi-language rendering */}
        {project.languages && project.languages.length > 0 ? (
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            {project.languages.map((lang, idx) => {
              const langName = typeof lang === 'string' ? lang : lang.name;
              const color = lang.color || project.languageColor || '#2a8a7e';
              return (
                <div key={idx} className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: color }}></span>
                  {langName}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
            <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: project.languageColor || '#2a8a7e' }}></span>
            {project.language || 'Code'}
          </div>
        )}

        <div className="flex items-center gap-3 text-xs font-mono text-gray-500 dark:text-gray-400 ml-auto">
          <span className="flex items-center gap-1">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
            {starCount}
          </span>
        </div>
      </div>
    </div>
  )
}