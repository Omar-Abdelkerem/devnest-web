/**
 * ProjectCard.jsx — "Example Project" widget shown in the Hero right column
 *
 * This mimics a GitHub-style pinned repository card, as seen in the screenshot.
 * It's intentionally self-contained so it could be reused in a future
 * "portfolio grid" feature.
 */
import { Link } from 'react-router-dom'

export default function ProjectCard({
  id = '00000000-0000-0000-0000-000000000000', // <-- Added UUID expectation
  repo = 'maren-k/forge-cli',
  description = 'A zero-config deployment tool for monorepos. Detects changed packages using a content-addressed cache…',
  tags = ['rust', 'cli', 'deployment'],
  badges = ['PINNED'],
  language = 'Rust',
  languageColor = '#dea584',
  stars = 847,
  forks = 62,
  updatedAt = '3 days ago',
}) {
  return (
    <Link
      to={`/project/${id}`} // <-- Now strictly routes using the UUID
      className="
        block rounded-lg border p-4
        bg-white dark:bg-neutral-800
        border-gray-200 dark:border-neutral-700
        hover:border-gray-400 dark:hover:border-neutral-500
        hover:bg-gray-50 dark:hover:bg-neutral-700
        transition-all duration-200 cursor-pointer
      "
    >
      {/* ── Header: Badges + repo name ────────────────────── */}
      <header className="flex items-center gap-2 mb-3">

        {/* Badges — very small, uppercase, muted background */}
        {badges && badges.length > 0 && (
          <div className="flex gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge}
                className="
                  text-[10px] font-semibold uppercase tracking-wider
                  px-1.5 py-0.5 rounded
                  bg-gray-100 dark:bg-neutral-700
                  text-gray-500 dark:text-gray-400
                "
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Repo name in accent — visually signals it's a link target */}
        <span className="text-accent font-semibold text-sm font-mono truncate">
          {repo}
        </span>
      </header>

      {/* ── Left accent bar + content ────────────────────────────── */}
      <div className="flex gap-3">

        {/* Accent bar */}
        <div className="w-0.5 bg-accent rounded-full shrink-0" />

        {/* Content column */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">

          {/* ── Description ─────────────────────────────────────── */}
          <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed line-clamp-2 font-mono">
            {description}
          </p>

          {/* ── Tech tag chips ──────────────────────────────────── */}
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="
                  text-[11px] font-mono
                  px-2 py-0.5 rounded
                  bg-gray-100 dark:bg-neutral-700
                  text-gray-500 dark:text-gray-400
                "
              >
                {tag}
              </span>
            ))}
          </div>

          {/* ── Footer: language · stars · forks · updated ──────── */}
          <footer className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500 font-mono">
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: languageColor }}
              />
              {language}
            </span>

            <span className="flex items-center gap-1">
              <span aria-hidden="true">☆</span>
              {stars.toLocaleString()}
            </span>

            <span className="flex items-center gap-1">
              <span aria-hidden="true">⑂</span>
              {forks}
            </span>

            <span className="ml-auto">{updatedAt}</span>
          </footer>

        </div>
      </div>
    </Link>
  )
}