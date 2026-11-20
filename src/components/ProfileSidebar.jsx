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
  const sheenRef = useRef(null)
  const tiltRef = useRef({ rx: 0, ry: 0, hovering: false })

  // Smooth, GPU-only scroll-linked avatar scale + morph + subtle drift (passive scroll + rAF)
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    let ticking = false
    const applyTransform = () => {
      ticking = false
      const el = avatarWrapRef.current
      if (!el) return
      const y = Math.min(window.scrollY || 0, 480)
      const progress = y / 480 // 0 -> 1
      const { rx, ry, hovering } = tiltRef.current
      const baseScale = hovering ? 1.04 : 1 - progress * 0.1
      const shiftY = hovering ? -4 : progress * -6
      const radius = 24 + progress * 56 // morphs cleanly from rounded-3xl toward circular on scroll!
      el.style.transform = `perspective(900px) translate3d(0, ${shiftY.toFixed(1)}px, 0) scale(${baseScale.toFixed(3)}) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
      el.style.borderRadius = `${radius.toFixed(1)}px`
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        window.requestAnimationFrame(applyTransform)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleAvatarMouseMove = (e) => {
    const el = avatarWrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rx = -(py - 0.5) * 14
    const ry = (px - 0.5) * 14
    tiltRef.current = { rx, ry, hovering: true }
    el.style.transform = `perspective(900px) translate3d(0, -4px, 0) scale(1.04) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`

    if (sheenRef.current) {
      sheenRef.current.style.opacity = '1'
      sheenRef.current.style.background = `radial-gradient(240px circle at ${(px * 100).toFixed(1)}% ${(py * 100).toFixed(1)}%, rgba(255,255,255,0.22), transparent 65%)`
    }
  }

  const handleAvatarMouseLeave = () => {
    tiltRef.current = { rx: 0, ry: 0, hovering: false }
    const el = avatarWrapRef.current
    if (!el) return
    const progress = Math.min(window.scrollY || 0, 480) / 480
    const scale = 1 - progress * 0.1
    el.style.transform = `perspective(900px) translate3d(0, ${(progress * -6).toFixed(1)}px, 0) scale(${scale.toFixed(3)}) rotateX(0deg) rotateY(0deg)`
    if (sheenRef.current) sheenRef.current.style.opacity = '0'
  }

  const hasMeta =
    user?.role ||
    user?.company ||
    user?.location ||
    user?.age ||
    user?.joinedYear

  return (
    <aside className="flex flex-col gap-6 w-full lg:w-80 shrink-0 mb-8 lg:mb-0 lg:sticky lg:top-20 lg:self-start">
      {/* Interactive Scroll-Morphing & 3D-Tilt Profile Image with Animated Aura Ring */}
      <div className="relative w-full max-w-[300px] mx-auto lg:mx-0">
        {/* Animated Conic Aura Glow Behind Avatar */}
        <div
          aria-hidden="true"
          className="absolute -inset-1 rounded-[28px] bg-gradient-to-tr from-accent via-emerald-400/60 to-accent-light opacity-55 blur-md animate-pulse pointer-events-none"
        />

        <div
          ref={avatarWrapRef}
          onMouseMove={handleAvatarMouseMove}
          onMouseLeave={handleAvatarMouseLeave}
          className={`relative w-full aspect-square rounded-3xl flex items-center justify-center overflow-hidden shadow-xl transition-transform duration-200 ease-out will-change-transform cursor-pointer ${
            !hasAvatar && isEmpty
              ? 'border-2 border-dashed border-gray-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80'
              : 'bg-gray-100 dark:bg-neutral-800 border-2 border-white/60 dark:border-accent/50'
          }`}
        >
          {hasAvatar ? (
            <img
              src={user.avatarUrl}
              alt={`${user.handle || 'Developer'} profile photo`}
              fetchPriority="high"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : isEmpty ? (
            <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
              <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="text-sm font-semibold">Add photo in Settings</span>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/30 via-gray-200 to-gray-100 dark:from-accent/30 dark:via-neutral-800 dark:to-neutral-900 text-accent dark:text-accent-light font-black text-7xl">
              {user?.handle ? user.handle.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          {/* Dynamic 3D Specular Sheen Overlay */}
          <div
            ref={sheenRef}
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-200"
          />

          {user?.availableForWork && (
            <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-emerald-400/50 text-[11px] font-mono font-semibold text-emerald-300 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute inline-flex opacity-75" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 relative inline-flex" />
              Open to work
            </div>
          )}
        </div>
      </div>

      {/* Name, Handle & Edit CTA */}
      <div className="flex flex-col gap-3 text-center lg:text-left">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {user?.name}
          </h1>
          <p className="text-sm font-mono text-accent dark:text-accent-light font-medium">
            @{user?.handle}
          </p>
        </div>

        {/* Live Stats Strip */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl px-3.5 py-2.5 bg-gray-50/90 dark:bg-[#1a1a1a]/90 border border-gray-200 dark:border-neutral-800 text-center lg:text-left">
            <div className="text-lg font-black text-gray-900 dark:text-white leading-none">
              {projectCount}
            </div>
            <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
              Projects
            </div>
          </div>
          <div className="rounded-xl px-3.5 py-2.5 bg-gray-50/90 dark:bg-[#1a1a1a]/90 border border-gray-200 dark:border-neutral-800 text-center lg:text-left">
            <div className="text-lg font-black text-accent dark:text-accent-light leading-none">
              ★ {totalStars}
            </div>
            <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
              Total Stars
            </div>
          </div>
        </div>

        {!isPublicView && (
          <Link
            to="/settings"
            className="w-full text-center py-2.5 px-4 border border-gray-300 dark:border-neutral-700 rounded-lg text-sm font-semibold text-gray-800 dark:text-gray-200 hover:border-accent dark:hover:border-accent-light hover:bg-accent/5 dark:hover:bg-accent/10 transition-all duration-200 hover:-translate-y-0.5"
          >
            Edit Profile
          </Link>
        )}
      </div>

      {/* Developer Quick Details (Role, Company, Location, Age, Member Since) */}
      {hasMeta && (
        <ul className="flex flex-col gap-2.5 p-4 rounded-xl bg-gray-50/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm border border-gray-200 dark:border-neutral-800 text-sm text-gray-700 dark:text-gray-300 shadow-sm">
          {(user?.role || user?.company) && (
            <li className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-accent dark:text-accent-light shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="truncate">
                {user.role}
                {user.role && user.company ? ' @ ' : ''}
                {user.company && (
                  <strong className="font-semibold text-gray-900 dark:text-white">
                    {user.company}
                  </strong>
                )}
              </span>
            </li>
          )}
          {user?.location && (
            <li className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-accent dark:text-accent-light shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{user.location}</span>
            </li>
          )}
          {user?.age && (
            <li className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-accent dark:text-accent-light shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{user.age} years old</span>
            </li>
          )}
          {user?.joinedYear && (
            <li className="flex items-center gap-2.5 text-xs font-mono text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-neutral-800">
              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Joined {user.joinedYear}</span>
            </li>
          )}
        </ul>
      )}

      {/* Bio */}
      {!user?.bio ? (
        <div className="text-sm text-gray-600 dark:text-gray-400 border border-dashed border-gray-300 dark:border-neutral-700 rounded-lg p-4 font-mono text-center lg:text-left">
          Add a bio — what you build, study, and care about.
        </div>
      ) : (
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-center lg:text-left">
          {user.bio}
        </p>
      )}

      {/* ABOUT ME */}
      <div className="w-full pt-6 border-t border-gray-200 dark:border-neutral-800 text-left">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
          <h2 className="text-xs font-bold tracking-wider text-accent dark:text-accent-light font-mono uppercase">
            About @{user?.handle || user?.name || 'developer'}
          </h2>
        </div>
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
        <h2 className="text-base font-black tracking-wide text-gray-900 dark:text-neutral-100 mb-4 font-mono">
          <span className="text-accent dark:text-accent-light">&gt;</span> core_stack()
        </h2>
        {user?.skills && Array.isArray(user.skills) && user.skills.length > 0 ? (
          <div className="flex flex-wrap justify-center lg:justify-start gap-2">
            {user.skills.map((skill, idx) => {
              const skillName = typeof skill === 'string' ? skill : skill?.name
              if (!skillName) return null
              return (
                <span
                  key={idx}
                  className="skill-pill flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-neutral-800/90 border border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-gray-200 hover:border-accent dark:hover:border-accent-light cursor-default"
                >
                  {skillName}
                  {skill?.level && (
                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded-sm">
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
        <h2 className="text-base font-black tracking-wide text-gray-900 dark:text-neutral-100 mb-4 flex items-center justify-center lg:justify-start gap-2 font-mono">
          <span className="text-accent dark:text-accent-light">&gt;</span> links()
        </h2>
        {user?.links && user.links.length > 0 ? (
          <ul className="flex flex-col items-center lg:items-start gap-3 text-sm font-medium">
            {user.links.map((link, idx) => {
              const rawHref = typeof link === 'string' ? link : link?.url || link?.href || ''
              const safeHref = safeExternalUrl(rawHref)
              if (!safeHref) return null
              const displayUrl = safeHref.replace(/^https?:\/\//, '')
              return (
                <li key={idx} className="flex items-center gap-3 w-full justify-center lg:justify-start group">
                  <svg className="w-4 h-4 text-accent dark:text-accent-light shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <a
                    href={safeHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent dark:text-accent-light hover:underline transition-colors truncate max-w-[220px] font-semibold"
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
