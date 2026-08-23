/**
 * ProfileTabs.jsx — Tab navigation for the profile page
 *
 * Props:
 *   projectCount — number of projects to display in the badge
 */

export default function ProfileTabs({ projectCount = 0 }) {
  return (
    <div className="border-b border-gray-200 dark:border-neutral-800 mb-6">
      <nav className="flex gap-8">
        <a
          href="#"
          className="flex items-center gap-2 pb-3 border-b-2 border-accent text-sm font-semibold text-gray-900 dark:text-gray-100"
        >
          Projects
          <span className="bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 text-xs py-0.5 px-2 rounded-full">
            {projectCount}
          </span>
        </a>
        <a
          href="#"
          className="flex items-center gap-2 pb-3 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Activity
        </a>
        <a
          href="#"
          className="flex items-center gap-2 pb-3 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Feedback received
        </a>
      </nav>
    </div>
  )
}
