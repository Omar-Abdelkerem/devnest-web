import { Link } from 'react-router-dom'

const FOOTER_LINKS = [
  { label: 'About',    to: '/about'    },
  { label: 'API Docs', to: '/api-docs' },
  { label: 'Privacy',  to: '/privacy'  },
  { label: 'Terms',    to: '/terms'    },
]

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#090a0f] border-t border-slate-200/80 dark:border-white/[0.07]">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center gap-6 md:gap-0">
        <Link to="/" className="flex items-center font-bold text-base shrink-0">
          <span className="text-slate-900 dark:text-white">Dev</span>
          <span className="text-accent dark:text-accent-light ml-0.5">Nest</span>
        </Link>

        <nav
          aria-label="Footer navigation"
          className="md:mx-auto flex flex-wrap justify-center gap-x-6 gap-y-2"
        >
          {FOOTER_LINKS.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-150"
            >
              {label}
            </Link>
          ))}
        </nav>

        <p className="text-xs font-mono text-slate-400 dark:text-slate-500 shrink-0">
          © 2026 DevNest
        </p>
      </div>
    </footer>
  )
}
