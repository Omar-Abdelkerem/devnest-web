/**
 * ProfileEmptyState.jsx — Empty state shown to new users
 *
 * Provides suggestions on what to build/add and a CTA.
 */

export default function ProfileEmptyState() {
  return (
    <div className="flex flex-col gap-10">
      
      {/* ── Header & Intro ────────────────────────────────────── */}
      <div>
        <p className="text-xs font-mono text-accent mb-2">01 / first project</p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          What have you built?
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
          DevNest is built around projects — real technical work with context, not job titles. Start with something you're proud of, even if it's unfinished.
        </p>
      </div>

      {/* ── Suggestion Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SuggestionCard 
          title="Side project"
          description="Something you built for fun, curiosity, or because nothing else solved the problem."
        />
        <SuggestionCard 
          title="OSS contribution"
          description="A meaningful PR, a fork you maintain, or a library others depend on."
        />
        <SuggestionCard 
          title="Work sample"
          description="A system design, a notable refactor, or an architectural decision you're proud of."
        />
      </div>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <div>
        <button 
          className="bg-accent hover:bg-accent-light text-white font-semibold text-sm px-5 py-2.5 rounded transition-colors"
        >
          Add your first project
        </button>
      </div>

      {/* ── Example Section ───────────────────────────────────── */}
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-neutral-800">
        <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-6">
          See an example → <a href="#" className="text-accent hover:underline">maren-k's profile</a>
        </p>
        
        {/* Ghosted skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-40 pointer-events-none">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>

    </div>
  )
}

function SuggestionCard({ title, description }) {
  return (
    <div className="border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50 rounded-lg p-5">
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="border border-gray-200 dark:border-neutral-800 bg-transparent rounded-lg p-4 flex flex-col gap-4">
      <div className="w-1/3 h-4 bg-gray-200 dark:bg-neutral-800 rounded"></div>
      <div className="space-y-2">
        <div className="w-full h-2 bg-gray-200 dark:bg-neutral-800 rounded"></div>
        <div className="w-5/6 h-2 bg-gray-200 dark:bg-neutral-800 rounded"></div>
      </div>
      <div className="flex gap-2 mt-2">
        <div className="w-10 h-3 bg-gray-200 dark:bg-neutral-800 rounded"></div>
        <div className="w-12 h-3 bg-gray-200 dark:bg-neutral-800 rounded"></div>
      </div>
    </div>
  )
}
