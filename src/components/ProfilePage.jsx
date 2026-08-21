/**
 * ProfilePage.jsx — Assembles the filled profile state
 */

import ProfileSidebar from './ProfileSidebar'
import ProfileTabs from './ProfileTabs'
import ProjectGrid from './ProjectGrid'
import ContributionGraph from './ContributionGraph'

export default function ProfilePage() {
  const marenData = {
    name: 'Maren Kowalski',
    handle: 'maren-k',
    bio: 'Systems engineer. Compilers, runtime tooling, and occasionally distributed systems. Open to interesting contracts.',
    location: 'Berlin, DE',
    company: 'Cloudflare, Shopify',
    website: 'maren.dev',
    joinedYear: '2023',
    followers: '312',
    following: '41',
    skills: ['Rust', 'Go', 'TypeScript', 'Linux', 'Compilers', 'Distributed Systems'],
  }

  const projectsData = [
    {
      repo: 'maren-k/forge-cli',
      description: 'Zero-config deployment tool for monorepos. Detects changed packages, builds only what\'s needed, and...',
      tags: ['rust', 'cli', 'deployment'],
      badges: ['PINNED'],
      language: 'Rust',
      languageColor: '#dea584',
      stars: 847,
      forks: 62,
      updatedAt: '3 days ago'
    },
    {
      repo: 'maren-k/prism-db',
      description: 'Experimental column-store query engine with a hand-written SQL parser and a vectorized execution mode...',
      tags: ['database', 'query-engine'],
      badges: ['PINNED', 'WIP'],
      language: 'Rust',
      languageColor: '#dea584',
      stars: 234,
      forks: 14,
      updatedAt: '1 week ago'
    },
    {
      repo: 'maren-k/htx',
      description: 'A tiny HTTP client for the terminal. Formats responses, colorizes JSON, and handles multipart...',
      tags: ['go', 'cli', 'http'],
      badges: [],
      language: 'Go',
      languageColor: '#00add8',
      stars: 1102,
      forks: 88,
      updatedAt: '2 weeks ago'
    },
    {
      repo: 'maren-k/wren',
      description: 'Experimental type system for a scripting language. Bidirectional type inference, effect tracking, and...',
      tags: ['compilers', 'type-theory'],
      badges: ['EXPERIMENTAL'],
      language: 'Haskell',
      languageColor: '#5e5086',
      stars: 189,
      forks: 9,
      updatedAt: '1 month ago'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 bg-white dark:bg-[#161616]">
      <ProfileSidebar user={marenData} isEmpty={false} />
      <div className="flex-1 min-w-0">
        <ProfileTabs projectCount={4} />
        <ProjectGrid projects={projectsData} />
        <ContributionGraph />
      </div>
    </div>
  )
}
