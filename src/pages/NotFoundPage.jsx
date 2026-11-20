import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Page Not Found')

  return (
    <div className="flex-1 bg-white dark:bg-[#161616] flex flex-col items-center justify-center p-6 text-center">
      <p className="text-7xl sm:text-8xl font-black text-gray-200 dark:text-neutral-800 tracking-widest font-mono mb-4 select-none">
        404
      </p>
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-xl p-8 max-w-md w-full shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-accent" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm leading-relaxed">
          The page you are looking for doesn&apos;t exist, was moved, or the URL has a typo.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto bg-accent hover:bg-accent-light text-white font-semibold py-2.5 px-6 rounded-md transition-colors duration-200 text-sm"
          >
            Return to Home
          </Link>
          <Link
            to="/explore"
            className="w-full sm:w-auto bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-800 dark:text-gray-200 font-semibold py-2.5 px-6 rounded-md transition-colors duration-200 text-sm"
          >
            Explore Projects
          </Link>
        </div>
      </div>
    </div>
  )
}
