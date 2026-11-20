import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import VolumetricBackground from '../components/VolumetricBackground'
import GlassIconTile from '../components/GlassIconTile'

export default function NotFoundPage() {
  useDocumentTitle('Page Not Found')

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <VolumetricBackground variant="hero" />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        <p className="text-7xl sm:text-8xl font-black bg-gradient-to-b from-slate-900 to-slate-400 dark:from-white dark:to-white/20 bg-clip-text text-transparent tracking-widest font-mono mb-4 select-none">
          404
        </p>
        <div className="glass-panel rounded-3xl p-8 w-full relative overflow-hidden flex flex-col items-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-accent-light to-transparent"
          />
          <GlassIconTile size="lg" accent={true} className="mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
          </GlassIconTile>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
            Page Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm leading-relaxed">
            The page you are looking for doesn&apos;t exist, was moved, or the URL has a typo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            <Link
              to="/"
              className="btn-3d-pill w-full sm:w-auto font-bold py-2.5 px-6 rounded-full text-sm"
            >
              Return to Home
            </Link>
            <Link
              to="/explore"
              className="btn-glass-pill w-full sm:w-auto font-semibold py-2.5 px-6 rounded-full text-sm"
            >
              Explore Projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
