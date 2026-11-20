import { useMemo } from 'react'

export default function PortfolioHighlights({ user = {}, projects = [] }) {
  const userSkills = user?.skills
  const topLanguages = useMemo(() => {
    const counts = new Map()
    for (const p of projects) {
      const langs =
        Array.isArray(p.languages) && p.languages.length > 0
          ? p.languages.map((l) => (typeof l === 'string' ? l : l?.name)).filter(Boolean)
          : p.language && p.language !== 'Code'
            ? [p.language]
            : []
      for (const name of langs) {
        counts.set(name, (counts.get(name) || 0) + 1)
      }
    }
    if (counts.size === 0 && Array.isArray(userSkills)) {
      for (const s of userSkills.slice(0, 5)) {
        const name = typeof s === 'string' ? s : s?.name
        if (name) counts.set(name, 1)
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
  }, [projects, userSkills])

  const pinnedCount = useMemo(
    () => projects.filter((p) => p.isPinned).length,
    [projects],
  )

  const hasHighlights =
    topLanguages.length > 0 ||
    user?.headline ||
    user?.education ||
    user?.workPreferences ||
    (user?.yearsOfExperience !== null && user?.yearsOfExperience !== undefined && user?.yearsOfExperience !== '')

  if (!hasHighlights && projects.length === 0) return null

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/70 dark:divide-white/[0.07]">
        {/* Column 1: Engineering Focus & Experience */}
        <div className="flex flex-col justify-between sm:pr-3 min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Engineering Focus
          </span>
          <div className="mt-1.5 min-w-0">
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {user?.headline ||
                (user?.role
                  ? `${user.role}${user?.company ? ` @ ${user.company}` : ''}`
                  : 'Software Engineering & Systems')}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-mono text-slate-500 dark:text-slate-400">
              {user?.yearsOfExperience !== null &&
                user?.yearsOfExperience !== undefined &&
                user?.yearsOfExperience !== '' && (
                  <span className="text-accent dark:text-accent-light font-semibold">
                    {user.yearsOfExperience}+ yrs exp
                  </span>
                )}
              {user?.education && (
                <span className="truncate max-w-full" title={user.education}>
                  · {user.education}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Top Stack Across Projects */}
        <div className="pt-3 sm:pt-0 sm:px-4 flex flex-col justify-between min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Primary Stack
          </span>
          {topLanguages.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {topLanguages.map((lang) => (
                <span
                  key={lang.name}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.09] text-slate-700 dark:text-slate-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-light" />
                  <span>{lang.name}</span>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1.5">
              Multi-language stack
            </span>
          )}
        </div>

        {/* Column 3: Portfolio Status & Availability */}
        <div className="pt-3 sm:pt-0 sm:pl-4 flex flex-col justify-between min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Status &amp; Availability
          </span>
          <div className="mt-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  user?.availableForWork
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : 'bg-accent-light'
                }`}
              />
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {user?.availableForWork ? 'Open to new opportunities' : 'Active portfolio'}
              </span>
            </div>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1 truncate">
              {user?.workPreferences ||
                (pinnedCount > 0
                  ? `${pinnedCount} pinned showcase ${pinnedCount === 1 ? 'project' : 'projects'}`
                  : `${projects.length} published ${projects.length === 1 ? 'repository' : 'repositories'}`)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
