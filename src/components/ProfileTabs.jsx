import { motion } from 'motion/react'

export default function ProfileTabs({ projectCount = 0, activeTab = 'projects', onTabChange }) {
  const tabs = [
    { id: 'projects', label: 'Projects', count: projectCount },
    { id: 'feedback', label: 'Feedback received', count: null },
  ]

  return (
    <nav role="tablist" aria-label="Profile sections" className="flex items-center gap-7">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange?.(tab.id)}
            className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition-colors cursor-pointer ${
              isActive
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className="bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08] text-xs font-mono py-0.5 px-2 rounded-full">
                {tab.count}
              </span>
            )}
            {isActive && (
              <motion.span
                layoutId="profileTab"
                transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                className="absolute inset-x-0 -bottom-px h-0.5 bg-accent dark:bg-accent-light rounded-full"
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
