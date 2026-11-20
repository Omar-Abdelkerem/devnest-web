import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { apiFetch, getProjectAuthor, getStarCount } from '../lib/api'
import ProjectCard from '../components/ProjectCard'
import VolumetricBackground from '../components/VolumetricBackground'

const heroContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.03 },
  },
}

const heroItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
}

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Publish & attach visuals',
    desc: 'Document your architecture in Markdown, upload a 16:9 cover image, and attach live deployment or repository links.',
  },
  {
    step: '02',
    title: 'Curate your core stack',
    desc: 'List the languages, systems, and tools you work with alongside your current engineering role and availability.',
  },
  {
    step: '03',
    title: 'Collect peer feedback',
    desc: 'Share a single permanent profile URL to receive project stars, technical discussions, and profile endorsements.',
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
      languageColor: '#2a8a7e',
      stars: getStarCount(p),
      _count: p._count,
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Recently',
      author: author.name,
      authorUsername: author.slug,
      authorAvatar: author.avatar,
    }
  })

  return (
    <div className="relative w-full overflow-hidden">
      <VolumetricBackground variant="hero" />

      <motion.div
        variants={heroContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-6xl mx-auto px-6 py-16 lg:py-24 flex flex-col items-center text-center"
      >
        {/* Hero Badge */}
        <motion.div
          variants={heroItem}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel text-xs font-mono text-slate-600 dark:text-slate-300 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Built for engineers who ship
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          variants={heroItem}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl leading-[1.07]"
        >
          Your engineering work,{' '}
          <span className="text-accent dark:text-accent-light">
            in one place.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={heroItem}
          className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mt-6 leading-relaxed"
        >
          DevNest is a portfolio platform for developers — showcase projects with visuals and live links, collect peer feedback, and share a permanent record of your technical craft.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          variants={heroItem}
          className="flex flex-col sm:flex-row items-center gap-3.5 mt-10 w-full sm:w-auto"
        >
          <Link
            to={user ? `/${user.username}` : '/register'}
            className="btn-3d-pill w-full sm:w-auto font-semibold px-7 py-3 rounded-lg text-sm sm:text-base cursor-pointer"
          >
            {user ? 'Go to Profile' : 'Claim your profile'}
          </Link>
          <Link
            to="/explore"
            className="btn-glass-pill w-full sm:w-auto font-semibold px-7 py-3 rounded-lg text-sm sm:text-base cursor-pointer"
          >
            <span>Explore community projects</span>
            <span className="inline-block rtl:rotate-180" aria-hidden="true">→</span>
          </Link>
        </motion.div>

        {/* Live Featured Community Projects */}
        <motion.div variants={heroItem} className="w-full mt-20 text-left">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Featured Community Projects
            </h2>
            <Link
              to="/explore"
              className="text-xs font-mono font-semibold text-accent dark:text-accent-light hover:underline"
            >
              View all →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-56 rounded-xl glass-panel animate-pulse"
                />
              ))}
            </div>
          ) : mappedFeatured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {mappedFeatured.map((project, idx) => (
                <div
                  key={project.id}
                  className="animate-fade-up h-full"
                  style={{ animationDelay: `${idx * 65}ms` }}
                >
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 glass-panel rounded-xl text-center font-mono text-xs text-slate-500 dark:text-slate-400">
              No public projects published yet. Create one and make it public to feature it here.
            </div>
          )}
        </motion.div>

        {/* Restrained 3-Column Workflow Strip */}
        <motion.div variants={heroItem} className="w-full mt-16 text-left">
          <div className="glass-panel rounded-xl grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200/80 dark:divide-white/[0.07]">
            {WORKFLOW_STEPS.map((item) => (
              <div key={item.step} className="p-6 flex flex-col gap-2">
                <span className="text-xs font-mono text-accent dark:text-accent-light font-semibold">
                  {item.step}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
