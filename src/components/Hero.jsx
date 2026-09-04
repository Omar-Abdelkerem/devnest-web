import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProjectCard from './ProjectCard'
import { apiFetch } from '../lib/api'

export default function Hero() {
  const [featuredProject, setFeaturedProject] = useState(null)

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const response = await apiFetch('/api/v1/projects/featured')

        if (response.ok) {
          const data = await response.json()
          // Extract the array, regardless of how the backend wraps it
          const projectsArray = Array.isArray(data) ? data : (data.data || data.projects || [])

          if (projectsArray.length > 0) {
            // Grab the very first project to feature in the Hero
            setFeaturedProject(projectsArray[0])
          }
        }
      } catch (error) {
        console.error('Failed to fetch hero project:', error)
      }
    }

    fetchFeatured()
  }, [])

  // Map the real DB project to match ProjectCard's expected props.
  // If the DB is empty, it falls back to the original static mockup so the page doesn't look broken.
  const displayProject = featuredProject ? {
    id: featuredProject.id,
    repo: featuredProject.title || featuredProject.name || 'Untitled',
    description: featuredProject.description,
    tags: featuredProject.tags || [],
    badges: featuredProject.isPublic ? [] : ['PRIVATE'],
    language: featuredProject.language || 'Code',
    languageColor: featuredProject.languageColor || '#dea584',
    stars: featuredProject._count?.stars || 0,
    forks: featuredProject.forks || 0,
    updatedAt: featuredProject.updatedAt ? new Date(featuredProject.updatedAt).toLocaleDateString() : 'Recently'
  } : {
    repo: 'maren-k/forge-cli',
    description: 'A zero-config deployment tool for monorepos. Detects changed packages using a content-addressed cache...',
    tags: ['rust', 'cli', 'deployment'],
    badges: ['PINNED'],
    language: 'Rust',
    languageColor: '#dea584',
    stars: 847,
    forks: 62,
    updatedAt: '3 days ago'
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

      {/* ── Left Column (Text & CTAs) ────────────────────────── */}
      <div className="flex flex-col gap-6">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
          Your engineering work, <br className="hidden lg:block" />
          in one place.
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed">
          DevNest is a portfolio platform for engineers — show what you've built, get real feedback from peers, and build a permanent record of your technical work.
        </p>

        <div className="flex items-center gap-6 mt-2">
          <Link
            to="/register"
            className="bg-accent hover:bg-accent-light text-white font-semibold px-6 py-3 rounded-md transition-colors"
          >
            Claim your profile
          </Link>
          <Link
            to="#"
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
          >
            Browse profiles →
          </Link>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Free during beta · No credit card required
        </p>
      </div>

      {/* ── Right Column (Dynamic Project Card) ──────────────── */}
      <div className="relative w-full">
        <div className="text-[11px] font-mono text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-4 pl-1">
          Example Project
        </div>

        {/* Render our mapped, real database project */}
        <ProjectCard {...displayProject} />

        {/* Faded decorative list underneath to match screenshot */}
        <div className="mt-4 flex flex-col gap-2 pl-1 mask-image-fade-bottom">
          <div className="text-sm font-mono text-gray-400 dark:text-gray-600 opacity-60">
            {displayProject.repo.split('/')[0]} · 4 projects · 1.2k stars
          </div>
          <div className="text-sm font-mono text-gray-400 dark:text-gray-700 opacity-20">
            {displayProject.repo.split('/')[0]}/htx
          </div>
        </div>
      </div>
    </section>
  )
}