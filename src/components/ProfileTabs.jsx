import { motion } from 'motion/react'

export default function ProfileTabs({ projectCount = 0, activeTab = 'projects', onTabChange }) {
  const tabs = [
    { id: 'projects', label: 'Projects', count: projectCount },
    { id: 'feedback', label: 'Feedback received', count: null },
  ]

  return (
    <div
      role="tablist"
      aria-label="Profile sections"
      className="inline-flex items-center gap-1 p-1 rounded-full glass-panel"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange?.(tab.id)}
            className={`relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              isActive
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="profileTab"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="absolute inset-0 -z-10 rounded-full bg-white dark:bg-white/[0.12] border border-slate-200/80 dark:border-accent-light/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_4px_14px_-4px_rgba(42,138,126,0.35)]"
              />
            )}
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span
                className={`text-[11px] font-mono py-0.2 px-2 rounded-full border ${
                  isActive
                    ? 'bg-accent/15 text-accent dark:text-accent-light border-accent/30'
                    : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/[0.08]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
