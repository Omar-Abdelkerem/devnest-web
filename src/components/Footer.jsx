import { Link } from 'react-router-dom'

const FOOTER_LINKS = [
  { label: 'Explore',  to: '/explore'  },
  { label: 'About',    to: '/about'    },
  { label: 'API Docs', to: '/api-docs' },
  { label: 'Privacy',  to: '/privacy'  },
  { label: 'Terms',    to: '/terms'    },
]

export default function Footer() {
  return (
    <footer className="relative bg-white/80 dark:bg-[#07070b] border-t border-slate-200/80 dark:border-white/[0.08]">
      {/* Subtle top specular highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-light/35 to-transparent"
      />

      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center gap-6 md:gap-0">
        <Link to="/" className="flex items-center gap-2 font-bold text-base shrink-0">
          <span className="w-2 h-2 rounded-full bg-accent-light shadow-[0_0_8px_#3cd2bf]" />
          <span>
            <span className="text-slate-900 dark:text-white">Dev</span>
            <span className="text-accent dark:text-accent-light">Nest</span>
          </span>
        </Link>

        <nav
          aria-label="Footer navigation"
          className="md:mx-auto flex flex-wrap justify-center gap-x-7 gap-y-2"
        >
          {FOOTER_LINKS.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-150"
            >
              {label}
            </Link>
          ))}
        </nav>

        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 shrink-0">
          © 2026 DevNest · Crafted for engineers
        </p>
      </div>
    </footer>
  )
}
