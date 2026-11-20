import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { safeExternalUrl } from '../lib/api'

export default function ProfileSidebar({
  user,
  isEmpty,
  isPublicView,
  projectCount = 0,
  totalStars = 0,
}) {
  const hasAvatar = !!user?.avatarUrl
  const avatarWrapRef = useRef(null)

  // Subtle, clean scroll-linked scale on the sticky profile avatar (passive + rAF)
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    let ticking = false
    const update = () => {
      ticking = false
      const el = avatarWrapRef.current
      if (!el) return
      const progress = Math.min(window.scrollY || 0, 360) / 360
      const scale = 1 - progress * 0.06 // subtle 1.00 -> 0.94
      el.style.transform = `scale(${scale.toFixed(3)})`
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        window.requestAnimationFrame(update)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const hasMeta =
    user?.role ||
    user?.company ||
    user?.location ||
    user?.age ||
    user?.joinedYear

  return (
    <aside className="flex flex-col gap-6 w-full lg:w-80 shrink-0 mb-8 lg:mb-0 lg:sticky lg:top-20 lg:self-start">
      {/* Clean Profile Image */}
      <div
        ref={avatarWrapRef}
        className={`relative w-full aspect-square max-w-[300px] mx-auto lg:mx-0 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm transition-transform duration-200 ease-out origin-top will-change-transform ${
          !hasAvatar && isEmpty
            ? 'border border-dashed border-gray-300 dark:border-neutral-700 bg-transparent'
            : 'bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-800'
        }`}
      >
        {hasAvatar ? (
          <img
            src={user.avatarUrl}
            alt={`${user.handle || 'Developer'} profile photo`}
            fetchPriority="high"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
          />
        ) : isEmpty ? (
          <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-sm font-medium">Add photo in Settings</span>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-neutral-800 text-gray-500 dark:text-gray-300 font-bold text-6xl">
            {user?.handle ? user.handle.charAt(0).toUpperCase() : 'U'}
          </div>
        )}

        {user?.availableForWork && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-sm border border-white/15 text-[11px] font-mono font-medium text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Open to work
          </div>
        )}
      </div>

      {/* Name, Handle & Edit CTA */}
      <div className="flex flex-col gap-3 text-center lg:text-left">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {user?.name}
          </h1>
          <p className="text-sm font-mono text-gray-500 dark:text-gray-400">
            @{user?.handle}
          </p>
        </div>

        {/* Clean Stats Row */}
        <div className="flex items-center justify-center lg:justify-start gap-4 text-xs font-mono text-gray-600 dark:text-gray-400">
          <span>
            <strong className="text-gray-900 dark:text-white font-semibold">{projectCount}</strong>{' '}
            {projectCount === 1 ? 'project' : 'projects'}
          </span>
          <span className="text-gray-300 dark:text-neutral-700">·</span>
          <span>
            <strong className="text-gray-900 dark:text-white font-semibold">★ {totalStars}</strong>{' '}
            {totalStars === 1 ? 'star' : 'stars'}
          </span>
        </div>

        {!isPublicView && (
          <Link
            to="/settings"
            className="w-full text-center py-2 px-3 border border-gray-300 dark:border-neutral-700 rounded-md text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Edit Profile
          </Link>
        )}
      </div>

      {/* Developer Details (Role, Company, Location, Age, Joined) */}
      {hasMeta && (
        <ul className="flex flex-col gap-2.5 text-sm text-gray-700 dark:text-gray-300">
          {(user?.role || user?.company) && (
            <li className="flex items-center justify-center lg:justify-start gap-2.5">
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="truncate">
                {user.role}
                {user.role && user.company ? ' @ ' : ''}
                {user.company && <strong className="font-semibold text-gray-900 dark:text-white">{user.company}</strong>}
              </span>
            </li>
          )}
          {user?.location && (
            <li className="flex items-center justify-center lg:justify-start gap-2.5">
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{user.location}</span>
            </li>
          )}
          {user?.age && (
            <li className="flex items-center justify-center lg:justify-start gap-2.5">
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{user.age} years old</span>
            </li>
          )}
          {user?.joinedYear && (
            <li className="flex items-center justify-center lg:justify-start gap-2.5 text-xs font-mono text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Joined {user.joinedYear}</span>
            </li>
          )}
        </ul>
      )}

      {/* Bio */}
      {!user?.bio ? (
        <div className="text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-neutral-700 rounded-lg p-4 font-mono text-center lg:text-left">
          Add a bio — what you build, study, and care about.
        </div>
      ) : (
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-center lg:text-left">
          {user.bio}
        </p>
      )}

      {/* ABOUT ME */}
      <div className="w-full pt-6 border-t border-gray-200 dark:border-neutral-800 text-left">
        <h2 className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 font-mono uppercase mb-3">
          About
        </h2>
        {user?.about ? (
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-sans break-words">
            {user.about}
          </p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono italic">
            No detailed about section added yet.
          </p>
        )}
      </div>

      {/* SKILLS */}
      <div className="w-full pt-6 border-t border-gray-200 dark:border-neutral-800 text-center lg:text-left">
        <h2 className="text-sm font-bold tracking-wide text-gray-900 dark:text-neutral-100 mb-3 font-mono">
          core_stack()
        </h2>
        {user?.skills && Array.isArray(user.skills) && user.skills.length > 0 ? (
          <div className="flex flex-wrap justify-center lg:justify-start gap-2">
            {user.skills.map((skill, idx) => {
              const skillName = typeof skill === 'string' ? skill : skill?.name
              if (!skillName) return null
              return (
                <span
                  key={idx}
                  className="skill-pill flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-gray-200 hover:border-gray-400 dark:hover:border-neutral-500"
                >
                  {skillName}
                  {skill?.level && (
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-200/80 dark:bg-neutral-700/80 px-1 rounded-sm">
                      {skill.level}
                    </span>
                  )}
                </span>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            No skills added yet.
          </p>
        )}
      </div>

      {/* LINKS */}
      <div className="w-full pt-6 border-t border-gray-200 dark:border-neutral-800 text-center lg:text-left">
        <h2 className="text-sm font-bold tracking-wide text-gray-900 dark:text-neutral-100 mb-3 font-mono">
          links()
        </h2>
        {user?.links && user.links.length > 0 ? (
          <ul className="flex flex-col items-center lg:items-start gap-2.5 text-sm">
            {user.links.map((link, idx) => {
              const rawHref = typeof link === 'string' ? link : link?.url || link?.href || ''
              const safeHref = safeExternalUrl(rawHref)
              if (!safeHref) return null
              const displayUrl = safeHref.replace(/^https?:\/\//, '')
              return (
                <li key={idx} className="flex items-center gap-2.5 w-full justify-center lg:justify-start">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <a
                    href={safeHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent-light hover:underline transition-colors truncate max-w-[220px] font-medium"
                  >
                    {displayUrl}
                  </a>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono italic">
            No links added yet.
          </p>
        )}
      </div>
    </aside>
  )
}
