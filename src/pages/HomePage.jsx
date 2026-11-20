import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { apiFetch, getProjectAuthor, getStarCount } from '../lib/api'
import ProjectCard from '../components/ProjectCard'

const heroContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
}

const heroItem = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function HomePage() {
  useDocumentTitle(
    'Developer Portfolio Platform',
    "DevNest is a portfolio platform for engineers — showcase projects with cover photos and live links, get peer feedback, and build a permanent record of your technical work.",
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
    <motion.div
      variants={heroContainer}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto px-6 py-16 lg:py-24 flex flex-col items-center text-center"
    >
      {/* Hero Badge */}
      <motion.div
        variants={heroItem}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-gray-700 dark:text-gray-300 mb-8"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Built for engineers who ship
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        variants={heroItem}
        className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight max-w-4xl leading-[1.08]"
      >
        Your engineering work,{' '}
        <span className="text-accent dark:text-accent-light">
          in one place.
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        variants={heroItem}
        className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mt-6 leading-relaxed"
      >
        DevNest is a portfolio platform for developers — showcase projects with visuals and live links, collect peer feedback, and share a permanent record of your technical craft.
      </motion.p>

      {/* Action Buttons */}
      <motion.div
        variants={heroItem}
        className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto"
      >
        <Link
          to={user ? `/${user.username}` : '/register'}
          className="w-full sm:w-auto bg-accent hover:bg-accent-light active:scale-[0.98] text-white font-semibold px-8 py-3 rounded-lg transition-all duration-150 text-base cursor-pointer shadow-sm"
        >
          {user ? 'Go to Profile' : 'Claim your profile'}
        </Link>
        <Link
          to="/explore"
          className="w-full sm:w-auto bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-[0.98] text-gray-800 dark:text-gray-200 font-semibold px-8 py-3 rounded-lg transition-all duration-150 text-base border border-neutral-200 dark:border-neutral-700 cursor-pointer"
        >
          Explore community projects <span className="inline-block rtl:rotate-180" aria-hidden="true">→</span>
        </Link>
      </motion.div>

      {/* Live Featured Community Projects */}
      <div className="w-full mt-20 text-left">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-mono uppercase tracking-widest text-gray-600 dark:text-gray-400">
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
                className="h-52 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-[#1a1a1a] animate-pulse"
              />
            ))}
          </div>
        ) : mappedFeatured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {mappedFeatured.map((project, idx) => (
              <div
                key={project.id}
                className="animate-fade-up"
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-[#1a1a1a] text-center font-mono text-xs text-gray-600 dark:text-gray-400">
            No public projects published yet. Create one and make it public to feature it here.
          </div>
        )}
      </div>
    </motion.div>
  )
}
