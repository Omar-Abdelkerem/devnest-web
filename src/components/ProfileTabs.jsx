export default function ProfileTabs({ projectCount = 0, activeTab = 'projects', onTabChange }) {
  return (
    <div className="border-b border-gray-200 dark:border-neutral-800 mb-6">
      <nav className="flex gap-8">
        <button
          onClick={() => onTabChange('projects')}
          className={`flex items-center gap-2 pb-3 border-b-2 text-sm font-semibold transition-colors cursor-pointer ${activeTab === 'projects'
              ? 'border-accent text-gray-900 dark:text-gray-100'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          Projects
          <span className="bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 text-xs py-0.5 px-2 rounded-full">
            {projectCount}
          </span>
        </button>
        <button
          onClick={() => onTabChange('feedback')}
          className={`flex items-center gap-2 pb-3 border-b-2 text-sm font-semibold transition-colors cursor-pointer ${activeTab === 'feedback'
              ? 'border-accent text-gray-900 dark:text-gray-100'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          Feedback received
        </button>
      </nav>
    </div>
  )
}