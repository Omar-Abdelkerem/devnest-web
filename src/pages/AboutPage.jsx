import { useDocumentTitle } from '../hooks/useDocumentTitle'
import VolumetricBackground from '../components/VolumetricBackground'
import GlassIconTile from '../components/GlassIconTile'

export default function AboutPage() {
  useDocumentTitle('About DevNest', 'Learn about DevNest, an open portfolio platform built for software engineers.')
  return (
    <div className="relative min-h-screen overflow-hidden">
      <VolumetricBackground variant="profile" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-24 space-y-12">
        {/* Hero */}
        <div className="glass-panel rounded-3xl p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-5">
            <GlassIconTile size="sm" accent={true}>
              <span className="w-2 h-2 rounded-full bg-accent-light" />
            </GlassIconTile>
            <span className="text-xs font-mono uppercase tracking-widest text-accent dark:text-accent-light">
              About the Platform
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5 text-slate-900 dark:text-white">
            Built for developers,{' '}
            <span className="bg-gradient-to-r from-accent via-accent-light to-cyan-300 bg-clip-text text-transparent">
              by developers.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            DevNest is an open portfolio platform where software engineers showcase their projects, discover work from peers, and receive constructive technical feedback — without noise or algorithms.
          </p>
        </div>

        {/* Features Bento */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-5">
            Core Capabilities
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                title: 'Project Portfolios',
                desc: 'Showcase your work with a title, 16:9 cover visual, README, live links, and programming languages.',
              },
              {
                title: 'Peer Stars',
                desc: 'Star projects you find impressive and see which of your own systems have resonated with engineers.',
              },
              {
                title: 'Technical Discussions',
                desc: 'Leave comments on any public project to ask architecture questions or share feedback.',
              },
              {
                title: 'Explore Feed',
                desc: 'Search for developers by username or browse the community’s latest public repositories.',
              },
              {
                title: 'Privacy Controls',
                desc: 'Mark your profile or individual projects as private whenever you need to.',
              },
              {
                title: 'Dark-Glass Craft',
                desc: 'A high-contrast obsidian dark mode with a crisp light mode fallback, toggleable anytime.',
              },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="glass-panel-interactive rounded-2xl p-5"
              >
                <h3 className="font-bold text-base mb-1.5 text-slate-900 dark:text-white">{title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="glass-panel rounded-3xl p-8">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-5">
            Platform Stack
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {[
              'Node.js', 'Express', 'PostgreSQL', 'Prisma ORM', 'Redis',
              'React 19', 'Vite', 'Tailwind CSS v4', 'Motion', 'Cloudinary', 'Railway', 'Vercel',
            ].map((tech) => (
              <span
                key={tech}
                className="skill-pill text-xs font-mono px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-slate-200"
              >
                {tech}
              </span>
            ))}
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-6 pt-6 border-t border-slate-200/70 dark:border-white/[0.08]">
            DevNest is built in the open. Explore the source code on the{' '}
            <a
              href="https://github.com/Omar-Abdelkerem/DevNest"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent dark:text-accent-light font-semibold hover:underline"
            >
              GitHub repository ↗
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
