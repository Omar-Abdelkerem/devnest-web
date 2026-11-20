import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { apiFetch, getProjectAuthor, getStarCount } from '../lib/api'
import ProjectCard from '../components/ProjectCard'
import VolumetricBackground from '../components/VolumetricBackground'
import GlassIconTile from '../components/GlassIconTile'

const heroContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
}

const heroItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.44, ease: [0.22, 1, 0.36, 1] },
  },
}

const WORKFLOW_NODES = [
  {
    step: '01',
    title: 'Build & Document',
    desc: 'Write clean Markdown architecture docs and technical breakdowns.',
    signal: 'README.md · Architecture',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Attach Cover & Live Links',
    desc: 'Upload 16:9 high-DPI cover visuals, Live Demo URLs, and GitHub repos.',
    signal: '16:9 Cover · Live Demo ↗',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Showcase Core Stack',
    desc: 'Tag languages, proficiency tiers, and your current engineering role.',
    signal: 'core_stack() · Verified Role',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Collect Peer Feedback',
    desc: 'Receive stars, project discussions, and public endorsements from engineers.',
    signal: '★ Peer Stars · Reviews',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
]

const FLOATING_TAGS = [
  {
    label: 'Project shipped',
    meta: 'v2.4 · production',
    dotClass: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
    threadHeight: 'h-16 sm:h-24',
    delay: '0s',
  },
  {
    label: 'Cover photo uploaded',
    meta: '16:9 WebP · CDN',
    dotClass: 'bg-accent-light shadow-[0_0_8px_#38b2a3]',
    threadHeight: 'h-24 sm:h-32',
    delay: '0.9s',
  },
  {
    label: '★ Starred by peers',
    meta: 'Community verified',
    dotClass: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
    threadHeight: 'h-14 sm:h-20',
    delay: '1.7s',
  },
  {
    label: 'Open to work',
    meta: 'Active profile badge',
    dotClass: 'bg-teal-300 shadow-[0_0_8px_#5eead4]',
    threadHeight: 'h-20 sm:h-28',
    delay: '2.4s',
  },
]

const FALLBACK_PREVIEW_CARDS = [
  {
    title: 'Distributed Raft KV Store',
    lang: 'Rust',
    stars: 148,
    desc: 'Deterministic consensus engine with zero-copy WAL replication and snapshot compaction.',
    links: ['Live Demo ↗', 'GitHub ↗'],
  },
  {
    title: 'Edge Telemetry Pipeline',
    lang: 'Go',
    stars: 94,
    desc: 'High-throughput ingestion worker and query engine with sub-millisecond tail latency.',
    links: ['Benchmarks ↗', 'GitHub ↗'],
  },
]

export default function HomePage() {
  useDocumentTitle(
    'Developer Portfolio Platform',
    'DevNest is a portfolio platform for engineers — showcase projects with cover photos and live links, get peer feedback, and build a permanent record of your technical work.',
  )
  const { user } = useAuth()
  const [featuredProjects, setFeaturedProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeNodeIdx, setActiveNodeIdx] = useState(0)

  const previewRef = useRef(null)
  const prefersReduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: previewRef,
    offset: ['start end', 'center center'],
  })

  const rotateX = useTransform(scrollYProgress, [0, 1], [prefersReduced ? 0 : 10, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [prefersReduced ? 1 : 0.965, 1])

  useEffect(() => {
    let cancelled = false
    async function fetchFeaturedProjects() {
      try {
        const response = await apiFetch('/api/v1/projects/featured')
        if (!cancelled && response.ok) {
          const projects = await response.json()
          if (Array.isArray(projects)) {
            setFeaturedProjects(projects)
          }
        }
      } catch {
        // Keep home page clean if API is temporarily unreachable
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchFeaturedProjects()
    return () => {
      cancelled = true
    }
  }, [])

  const mappedFeatured = featuredProjects.map((p) => {
    const author = getProjectAuthor(p)
    return {
      id: p.id,
      repo: p.title || p.name || 'Untitled',
      description: p.description,
      projectimgUrl: p.projectimgUrl || null,
      links: p.links || [],
      badges: ['FEATURED'],
      languages: p.languages || (p.language ? [p.language] : []),
      language: p.language || 'Code',
      languageColor: '#38b2a3',
      stars: getStarCount(p),
      _count: p._count,
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Recently',
      author: author.name,
      authorUsername: author.slug,
      authorAvatar: author.avatar,
    }
  })

  const previewCards =
    mappedFeatured.length >= 2
      ? mappedFeatured.slice(0, 2).map((p) => ({
          id: p.id,
          title: p.repo,
          lang:
            (p.languages?.length > 0
              ? typeof p.languages[0] === 'string'
                ? p.languages[0]
                : p.languages[0]?.name
              : p.language) || 'Code',
          stars: p.stars,
          desc: p.description || 'Engineering project published on DevNest.',
          cover: p.projectimgUrl,
          author: p.authorUsername,
          links: ['Inspect ↗', 'Source ↗'],
        }))
      : FALLBACK_PREVIEW_CARDS

  return (
    <div className="relative w-full overflow-hidden">
      {/* =====================================================================
          1. CINEMATIC HERO + 3D PERSPECTIVE PORTFOLIO PREVIEW FRAME
         ===================================================================== */}
      <section className="relative pt-14 pb-20 lg:pt-24 lg:pb-28 px-6">
        <VolumetricBackground variant="hero" />

        <motion.div
          variants={heroContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-6xl mx-auto flex flex-col items-center text-center"
        >
          {/* Specular Frosted Hero Pill Badge */}
          <motion.div
            variants={heroItem}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-panel text-xs font-mono font-medium text-slate-700 dark:text-slate-200 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span>Built for engineers who ship</span>
            <span className="text-slate-300 dark:text-white/20">|</span>
            <Link
              to="/explore"
              className="text-accent dark:text-accent-light font-semibold hover:underline"
            >
              Explore feed →
            </Link>
          </motion.div>

          {/* Main Metallic White-to-Silver Gradient Headline */}
          <motion.h1
            variants={heroItem}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.06] bg-gradient-to-b from-slate-950 via-slate-800 to-slate-600 dark:from-white dark:via-white dark:to-white/65 bg-clip-text text-transparent"
          >
            Your engineering work,{' '}
            <span className="text-accent dark:text-accent-light">
              in one place.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={heroItem}
            className="text-base sm:text-xl text-slate-600 dark:text-slate-300/90 max-w-2xl mt-6 leading-relaxed"
          >
            DevNest is a portfolio platform for developers — showcase projects with cover visuals and live links, collect peer feedback, and share a permanent record of your technical craft.
          </motion.p>

          {/* Frosted 3D Pill Primary CTA + Glass Secondary CTA */}
          <motion.div
            variants={heroItem}
            className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto"
          >
            <Link
              to={user ? `/${user.username}` : '/register'}
              className="btn-3d-pill w-full sm:w-auto font-bold px-8 py-3.5 rounded-full text-sm sm:text-base cursor-pointer"
            >
              <span>{user ? 'Go to your profile' : 'Claim your profile'}</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/explore"
              className="btn-glass-pill w-full sm:w-auto font-semibold px-8 py-3.5 rounded-full text-sm sm:text-base cursor-pointer"
            >
              <span>Explore community projects</span>
            </Link>
          </motion.div>

          {/* 3D Perspective Portfolio Preview Frame */}
          <motion.div
            ref={previewRef}
            variants={heroItem}
            style={{
              perspective: 1200,
            }}
            className="w-full max-w-5xl mt-14 sm:mt-18"
          >
            <motion.div
              style={{
                rotateX,
                scale,
                transformStyle: 'preserve-3d',
              }}
              className="relative rounded-2xl p-2 sm:p-3 glass-panel overflow-hidden will-change-transform"
            >
              {/* Top Specular Rim Light Beam */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-accent-light/80 to-transparent"
              />

              {/* Window Chrome Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 rounded-t-xl bg-slate-100/80 dark:bg-white/[0.035] border-b border-slate-200/80 dark:border-white/[0.07]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-white/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-white/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-white/20" />
                </div>
                <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 dark:bg-black/40 border border-slate-200/80 dark:border-white/[0.08] text-[11px] font-mono text-slate-500 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {user ? `devnest.dev/${user.username}` : 'devnest.dev/portfolio'}
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span>core_stack()</span>
                </div>
              </div>

              {/* Inner Portfolio Workspace Preview */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 sm:p-6 bg-white/60 dark:bg-[#08090e]/90 rounded-b-xl text-left">
                {/* Left Sidebar Preview */}
                <div className="md:col-span-4 flex flex-col justify-between gap-3.5 p-4 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07]">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-light/25 to-accent/10 border border-accent-light/35 flex items-center justify-center font-mono font-bold text-xs text-accent dark:text-accent-light shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)]">
                        {user?.username ? user.username.slice(0, 2).toUpperCase() : 'DN'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {user?.username || 'Systems Engineer'}
                        </div>
                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate">
                          @{user?.username || 'engineer'}
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Open to work
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {user?.bio ||
                        ' shipping distributed backends, developer tools, and open-source infrastructure with full architecture write-ups.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/70 dark:border-white/[0.06]">
                    {['TypeScript', 'Go', 'Rust', 'PostgreSQL'].map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Projects Bento Preview */}
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {previewCards.map((card) => (
                    <div
                      key={card.title}
                      className="flex flex-col justify-between p-4 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.075] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                    >
                      <div>
                        <div className="relative w-full h-22 rounded-lg mb-3 overflow-hidden bg-gradient-to-br from-slate-200/70 via-slate-100 to-teal-50/50 dark:from-[#0d111a] dark:via-[#0a0c12] dark:to-[#0d1d1c] border border-slate-200/60 dark:border-white/[0.07] flex items-center justify-between px-3">
                          {card.cover ? (
                            <img
                              src={card.cover}
                              alt={card.title}
                              className="absolute inset-0 w-full h-full object-cover opacity-80"
                            />
                          ) : null}
                          <span className="relative z-10 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/65 text-slate-200 border border-white/15 backdrop-blur-sm">
                            {card.lang}
                          </span>
                          <span className="relative z-10 text-xs font-mono px-2 py-0.5 rounded-full bg-black/65 text-amber-400 border border-white/10 backdrop-blur-sm">
                            ★ {card.stars}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white mb-1 truncate">
                          {card.title}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {card.desc}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/70 dark:border-white/[0.06]">
                        <div className="flex gap-1.5">
                          {card.links.map((l) => (
                            <span
                              key={l}
                              className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.09] text-slate-600 dark:text-slate-300"
                            >
                              {l}
                            </span>
                          ))}
                        </div>
                        <span className="text-[11px] font-mono text-accent dark:text-accent-light">
                          README.md
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* =====================================================================
          2. INTERACTIVE CONNECTED NODE DIAGRAM ("HOW DEVNEST WORKS")
         ===================================================================== */}
      <section className="relative max-w-6xl mx-auto px-6 py-16 lg:py-24">
        <div className="flex flex-col items-center text-center mb-14">
          <span className="px-3.5 py-1 rounded-full glass-panel text-xs font-mono uppercase tracking-widest text-accent dark:text-accent-light mb-4">
            Unified Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            How DevNest connects your engineering signal
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mt-3">
            Every project, cover visual, live deployment link, and peer review flows into one verifiable developer profile.
          </p>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center">
          {/* Left 4 Interactive Glass Nodes */}
          <div className="lg:col-span-5 flex flex-col gap-3.5 relative z-10">
            {WORKFLOW_NODES.map((node, idx) => {
              const isSelected = activeNodeIdx === idx
              return (
                <div
                  key={node.step}
                  onMouseEnter={() => setActiveNodeIdx(idx)}
                  onFocus={() => setActiveNodeIdx(idx)}
                  tabIndex={0}
                  className={`glass-panel-interactive rounded-2xl p-4 flex items-start gap-4 cursor-pointer outline-none ${
                    isSelected
                      ? 'border-accent/50 dark:border-accent-light/45'
                      : ''
                  }`}
                >
                  <GlassIconTile size="md" accent={isSelected}>
                    {node.icon}
                  </GlassIconTile>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {node.title}
                      </h3>
                      <span className="text-[11px] font-mono text-accent dark:text-accent-light">
                        {node.step}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {node.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Center Animated SVG Circuit Lines (Desktop) */}
          <div className="hidden lg:flex lg:col-span-3 items-center justify-center relative h-[360px]" aria-hidden="true">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 240 360"
              fill="none"
            >
              <defs>
                <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(56, 178, 163, 0.25)" />
                  <stop offset="55%" stopColor="rgba(56, 178, 163, 0.95)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.9)" />
                </linearGradient>
              </defs>

              {[36, 132, 228, 324].map((y, idx) => {
                const isSelected = activeNodeIdx === idx
                return (
                  <g key={idx}>
                    <path
                      d={`M 0 ${y} C 95 ${y}, 125 180, 240 180`}
                      stroke="currentColor"
                      className={
                        isSelected
                          ? 'text-accent/40 dark:text-accent-light/35 transition-colors duration-300'
                          : 'text-slate-300 dark:text-white/[0.08] transition-colors duration-300'
                      }
                      strokeWidth={isSelected ? '2' : '1.5'}
                    />
                    <path
                      d={`M 0 ${y} C 95 ${y}, 125 180, 240 180`}
                      stroke="url(#circuitGrad)"
                      strokeWidth={isSelected ? '2.4' : '1.8'}
                      strokeLinecap="round"
                      className="animate-circuit-pulse"
                      style={{ animationDelay: `${idx * 0.55}s` }}
                    />
                    <circle
                      cx="4"
                      cy={y}
                      r={isSelected ? '4.5' : '3'}
                      className="fill-accent-light transition-all duration-300"
                    />
                  </g>
                )
              })}
              <circle
                cx="236"
                cy="180"
                r="5"
                className="fill-accent-light"
              />
            </svg>
          </div>

          {/* Right Central Glowing DevNest Profile Core Tile */}
          <div className="lg:col-span-4 relative z-10">
            <div className="relative glass-panel rounded-3xl p-6 sm:p-8 overflow-hidden border border-accent/35 dark:border-accent-light/30 shadow-[0_0_45px_-14px_rgba(56,178,163,0.28)]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-52 rounded-full blur-3xl opacity-65"
                style={{
                  background:
                    'radial-gradient(circle, rgba(56, 178, 163, 0.3) 0%, transparent 72%)',
                }}
              />

              <div className="relative z-10 flex flex-col items-center text-center">
                <GlassIconTile size="lg" accent={true} className="mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </GlassIconTile>

                <span className="px-3 py-0.5 rounded-full bg-accent/15 border border-accent-light/30 text-[11px] font-mono font-semibold text-accent dark:text-accent-light mb-2">
                  {WORKFLOW_NODES[activeNodeIdx]?.signal || 'Unified Output'}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  DevNest Profile Core
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  One shareable URL (<code className="font-mono text-accent dark:text-accent-light">devnest.dev/you</code>) combining your live repositories, visual demos, core stack, and community reputation.
                </p>

                <div className="w-full grid grid-cols-2 gap-2.5 mt-6 pt-5 border-t border-slate-200/80 dark:border-white/[0.08] text-left">
                  <div className="p-3 rounded-xl bg-white/70 dark:bg-white/[0.035] border border-slate-200/70 dark:border-white/[0.07]">
                    <div className="text-[10px] font-mono uppercase text-slate-400">Projects</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">Live Demos + Docs</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/70 dark:bg-white/[0.035] border border-slate-200/70 dark:border-white/[0.07]">
                    <div className="text-[10px] font-mono uppercase text-slate-400">Reputation</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">Peer Stars &amp; Reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. FLOATING STATUS TAGS BENTO CARD
         ===================================================================== */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="relative glass-panel rounded-3xl p-6 sm:p-10 overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-accent-light/55 to-transparent"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 text-left">
              <span className="text-xs font-mono uppercase tracking-widest text-accent dark:text-accent-light">
                Live Portfolio Signals
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
                Built to highlight your best engineering milestones.
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                Whether you are shipping a side project, uploading high-contrast architecture diagrams, or signaling availability for new roles, your profile stays current.
              </p>
            </div>

            {/* Suspended Floating Glass Status Pills on Vertical Light Threads */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FLOATING_TAGS.map((tag) => (
                <div
                  key={tag.label}
                  className="relative flex flex-col items-center pt-6 pb-3 px-4 rounded-2xl bg-slate-100/60 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] overflow-hidden"
                >
                  {/* Vertical Glowing Light Thread */}
                  <div
                    aria-hidden="true"
                    className={`w-px ${tag.threadHeight} bg-gradient-to-b from-transparent via-accent-light/50 to-accent-light mb-2`}
                  />

                  {/* Floating Frosted Status Pill */}
                  <div
                    style={{ animationDelay: tag.delay }}
                    className="animate-float-slow w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl glass-panel border border-white/15"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${tag.dotClass}`} />
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {tag.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                      {tag.meta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. FEATURED COMMUNITY PROJECTS BENTO GRID
         ===================================================================== */}
      <section className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="flex items-center gap-3.5">
            <GlassIconTile size="md" accent={true}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </GlassIconTile>
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Featured Community Projects
              </h2>
              <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400">
                Live repositories and engineering write-ups published on DevNest
              </p>
            </div>
          </div>

          <Link
            to="/explore"
            className="btn-glass-pill self-start sm:self-auto text-xs font-mono font-semibold px-4 py-2 rounded-full"
          >
            <span>View all projects</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-72 rounded-2xl glass-panel animate-pulse"
              />
            ))}
          </div>
        ) : mappedFeatured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {mappedFeatured.map((project, idx) => (
              <div
                key={project.id}
                className="animate-fade-up h-full"
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 glass-panel rounded-2xl text-center flex flex-col items-center gap-3">
            <GlassIconTile size="md" accent={true}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
            </GlassIconTile>
            <p className="font-mono text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md">
              No public projects published yet. Create one and make it public to feature it here.
            </p>
          </div>
        )}
      </section>

      {/* =====================================================================
          5. BOTTOM VOLUMETRIC CALL-TO-ACTION SECTION
         ===================================================================== */}
      <section className="relative max-w-6xl mx-auto px-6 pb-20 pt-4">
        <div className="relative glass-panel rounded-3xl px-6 py-14 sm:px-12 sm:py-18 text-center overflow-hidden">
          <VolumetricBackground variant="cta" />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <span className="px-3.5 py-1 rounded-full bg-accent/15 border border-accent-light/30 text-xs font-mono text-accent dark:text-accent-light mb-5">
              Ready to ship?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-b from-slate-950 to-slate-700 dark:from-white dark:to-white/70 bg-clip-text text-transparent">
              Build your permanent engineering portfolio today.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
              Join developers documenting their systems, attaching live demos, and receiving constructive peer feedback.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-8 w-full sm:w-auto">
              <Link
                to={user ? `/${user.username}` : '/register'}
                className="btn-3d-pill w-full sm:w-auto font-bold px-8 py-3.5 rounded-full text-sm sm:text-base"
              >
                {user ? 'Open your profile' : 'Claim your profile'}
              </Link>
              <Link
                to="/explore"
                className="btn-glass-pill w-full sm:w-auto font-semibold px-7 py-3.5 rounded-full text-sm sm:text-base"
              >
                Browse community
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
