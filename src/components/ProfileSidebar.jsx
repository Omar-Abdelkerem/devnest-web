import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { safeExternalUrl } from '../lib/api'
import AnimatedCounter from './AnimatedCounter'
import GlassIconTile from './GlassIconTile'

export default function ProfileSidebar({
  user,
  isEmpty,
  isPublicView,
  projectCount = 0,
  totalStars = 0,
}) {
  const hasAvatar = !!user?.avatarUrl
  const prefersReduced = useReducedMotion()
  const { scrollY } = useScroll()
  const avatarScale = useTransform(scrollY, [0, 360], [1, prefersReduced ? 1 : 0.94])

  const hasMeta =
    user?.role ||
    user?.company ||
    user?.location ||
    user?.age ||
    user?.joinedYear

  return (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-5 w-full lg:w-80 shrink-0 mb-8 lg:mb-0 lg:sticky lg:top-20 lg:self-start"
    >
      {/* Top Identity Bento Card: Double-Layered Glass Squircle + Name + Stats */}
      <div className="glass-panel rounded-3xl p-5 flex flex-col gap-4 relative overflow-hidden">
        {/* Specular top rim */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent-light/55 to-transparent"
        />

        {/* Double-Layered Frosted Glass Squircle Avatar */}
        <motion.div
          style={{ scale: avatarScale }}
          className="relative w-full aspect-square max-w-[270px] mx-auto p-2 rounded-3xl bg-gradient-to-b from-white/80 to-slate-100/60 dark:from-white/[0.1] dark:to-white/[0.02] border border-slate-200/80 dark:border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28)] origin-top will-change-transform"
        >
          <div
            className={`relative w-full h-full rounded-2xl flex items-center justify-center overflow-hidden ${
              !hasAvatar && isEmpty
                ? 'border border-dashed border-slate-300 dark:border-white/[0.15] bg-slate-50/50 dark:bg-white/[0.02]'
                : 'bg-slate-100 dark:bg-[#0b0d14] border border-slate-200/80 dark:border-white/[0.08]'
            }`}
          >
            {hasAvatar ? (
              <img
                src={user.avatarUrl}
                alt={`${user.handle || 'Developer'} profile photo`}
                fetchPriority="high"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.04]"
              />
            ) : isEmpty ? (
              <div className="flex flex-col items-center gap-2.5 text-slate-500 dark:text-slate-400">
                <GlassIconTile size="md" accent={true}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </GlassIconTile>
                <span className="text-xs font-mono font-medium">Add photo in Settings</span>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 via-slate-900 to-cyan-500/10 text-accent-light font-extrabold text-6xl font-mono">
                {user?.handle ? user.handle.charAt(0).toUpperCase() : 'U'}
              </div>
            )}

            {user?.availableForWork && (
              <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-emerald-400/35 text-[11px] font-mono font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.45)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                Open to work
              </div>
            )}
          </div>
        </motion.div>

        {/* Name & Handle */}
        <div className="text-center lg:text-left">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {user?.name}
          </h1>
          <p className="text-sm font-mono text-accent dark:text-accent-light">
            @{user?.handle}
          </p>
        </div>

        {/* Frosted Stats Bento Grid (Projects & Total Stars with AnimatedCounter) */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-white/[0.035] border border-slate-200/80 dark:border-white/[0.08] flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {projectCount === 1 ? 'Project' : 'Projects'}
            </span>
            <strong className="text-lg font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
              <AnimatedCounter value={projectCount} />
            </strong>
          </div>
          <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-white/[0.035] border border-slate-200/80 dark:border-white/[0.08] flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {totalStars === 1 ? 'Total Star' : 'Total Stars'}
            </span>
            <strong className="text-lg font-extrabold font-mono text-amber-500 dark:text-amber-400 mt-0.5 flex items-center gap-1">
              <span>★</span>
              <AnimatedCounter value={totalStars} />
            </strong>
          </div>
        </div>

        {/* Bio */}
        {!user?.bio ? (
          <div className="text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-white/[0.12] rounded-xl p-3.5 font-mono text-center lg:text-left">
            Add a bio — what you build, study, and care about.
          </div>
        ) : (
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-center lg:text-left">
            {user.bio}
          </p>
        )}

        {!isPublicView && (
          <Link
            to="/settings"
            className="btn-glass-pill w-full text-center py-2.5 px-4 rounded-xl text-xs font-mono font-semibold"
          >
            <svg className="w-3.5 h-3.5 text-accent dark:text-accent-light" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit Profile</span>
          </Link>
        )}
      </div>

      {/* Developer Metadata Bento Card (Role @ Company, Location, Age, Joined) */}
      {hasMeta && (
        <div className="glass-panel rounded-2xl p-5">
          <h2 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3.5">
            Developer Metadata
          </h2>
          <ul className="flex flex-col gap-3 text-sm text-slate-700 dark:text-slate-300">
            {(user?.role || user?.company) && (
              <li className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent dark:text-accent-light shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <span className="truncate">
                  {user.role}
                  {user.role && user.company ? ' @ ' : ''}
                  {user.company && <strong className="font-semibold text-slate-900 dark:text-white">{user.company}</strong>}
                </span>
              </li>
            )}
            {user?.location && (
              <li className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent dark:text-accent-light shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <span className="truncate">{user.location}</span>
              </li>
            )}
            {user?.age && (
              <li className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent dark:text-accent-light shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <span>{user.age} years old</span>
              </li>
            )}
            {user?.joinedYear && (
              <li className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent dark:text-accent-light shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <span>Joined {user.joinedYear}</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* ABOUT ME Bento Card */}
      <div className="glass-panel rounded-2xl p-5 text-left">
        <h2 className="text-[11px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 font-mono uppercase mb-2.5">
          About
        </h2>
        {user?.about ? (
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans break-words">
            {user.about}
          </p>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono italic">
            No detailed about section added yet.
          </p>
        )}
      </div>

      {/* CORE STACK Bento Card */}
      <div className="glass-panel rounded-2xl p-5 text-left">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-xs font-bold tracking-wide text-slate-900 dark:text-white font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-light shadow-[0_0_8px_#3cd2bf]" />
            core_stack()
          </h2>
          {user?.skills?.length > 0 && (
            <span className="text-[10px] font-mono text-slate-400">
              {user.skills.length}
            </span>
          )}
        </div>
        {user?.skills && Array.isArray(user.skills) && user.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill, idx) => {
              const skillName = typeof skill === 'string' ? skill : skill?.name
              if (!skillName) return null
              return (
                <span
                  key={idx}
                  className="skill-pill inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100/90 dark:bg-white/[0.045] border border-slate-200/90 dark:border-white/[0.1] text-slate-800 dark:text-slate-200 hover:border-accent/50 dark:hover:border-accent-light/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]"
                >
                  <span>{skillName}</span>
                  {skill?.level && (
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-accent dark:text-accent-light bg-accent/10 border border-accent/25 px-1.5 py-0.2 rounded">
                      {skill.level}
                    </span>
                  )}
                </span>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            No skills added yet.
          </p>
        )}
      </div>

      {/* LINKS Bento Card */}
      <div className="glass-panel rounded-2xl p-5 text-left">
        <h2 className="text-xs font-bold tracking-wide text-slate-900 dark:text-white mb-3.5 font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          links()
        </h2>
        {user?.links && user.links.length > 0 ? (
          <ul className="flex flex-col gap-2.5 text-sm">
            {user.links.map((link, idx) => {
              const rawHref = typeof link === 'string' ? link : link?.url || link?.href || ''
              const safeHref = safeExternalUrl(rawHref)
              if (!safeHref) return null
              const displayUrl = safeHref.replace(/^https?:\/\//, '')
              return (
                <li key={idx} className="flex items-center gap-2.5 w-full">
                  <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-400 shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </span>
                  <a
                    href={safeHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-slate-700 dark:text-slate-300 hover:text-accent dark:hover:text-accent-light hover:underline transition-colors truncate max-w-[210px] font-medium"
                  >
                    {displayUrl}
                  </a>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono italic">
            No links added yet.
          </p>
        )}
      </div>
    </motion.aside>
  )
}
