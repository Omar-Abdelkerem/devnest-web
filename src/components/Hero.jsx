/**
 * Hero.jsx — Landing page hero section (above the fold)
 *
 * Layout: two-column grid on desktop, stacked on mobile.
 *   LEFT column:
 *     ├── "Now in public beta" badge (pill)
 *     ├── H1 headline ("Your engineering work, in one place.")
 *     ├── Body copy
 *     ├── CTA row ("Claim your profile" + "Browse profiles →")
 *     └── Tagline ("Free during beta · No credit card required")
 *
 *   RIGHT column:
 *     ├── "EXAMPLE PROJECT" eyebrow label
 *     ├── <ProjectCard /> — the pinned repo widget
 *     └── Author line ("maren-k · 4 projects · 1.2k stars")
 *         and a faint secondary repo link below it
 *
 * Theming strategy (Tailwind class-based dark mode):
 *   We write the DEFAULT class as the LIGHT mode value, then use `dark:`
 *   to override for dark mode. This is the canonical Tailwind approach.
 *   e.g. `bg-neutral-100 dark:bg-[#161616]`
 *
 * Why separate left/right in a CSS grid?
 *   The two columns have very different content and alignment — the left is
 *   large editorial text, the right is a compact code-aesthetic widget.
 *   A grid gives us independent vertical alignment control per column.
 */

import ProjectCard from './ProjectCard'

export default function Hero() {
  return (
    <section
      aria-label="Hero"
      className="bg-neutral-100 dark:bg-[#161616]"
    >
      {/* Page-width container with 2-column grid on large screens */}
      <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* ══════════════════════════════════════════════════════════
            LEFT COLUMN — Editorial content
        ══════════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-6">

          {/* ── Beta badge ──────────────────────────────────────── */}
          {/*
            A rounded pill with a leading accent dot signals "live status".
            Light mode: soft gray pill on light bg.
            Dark mode: darker neutral pill on dark bg.
          */}
          <div>
            <span
              className="
                inline-flex items-center gap-2
                text-xs font-medium
                px-3 py-1.5 rounded-full
                border
                border-gray-300 dark:border-neutral-700
                text-gray-600 dark:text-gray-400
                bg-gray-200/70 dark:bg-neutral-800/50
              "
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
              Now in public beta
            </span>
          </div>

          {/* ── H1 Headline ─────────────────────────────────────── */}
          {/*
            font-black + tight leading/tracking creates the large, bold
            headline feel from the Figma design.
            text-4xl on mobile, text-5xl on large screens.
          */}
          <h1
            className="
              text-4xl lg:text-5xl font-black leading-tight tracking-tight
              text-gray-900 dark:text-gray-100
            "
          >
            Your engineering work,<br />
            in one place.
          </h1>

          {/* ── Body copy ───────────────────────────────────────── */}
          <p
            className="
              text-base leading-relaxed max-w-sm
              text-gray-600 dark:text-gray-400
            "
          >
            DevNest is a portfolio platform for engineers —{' '}
            show what you've built, get real feedback from peers, and build
            a permanent record of your technical work.
          </p>

          {/* ── CTA row ─────────────────────────────────────────── */}
          <div className="flex items-center gap-6">

            {/* Primary CTA — filled accent button */}
            <button
              type="button"
              className="
                px-5 py-2.5 rounded
                bg-accent hover:bg-accent-light
                text-white font-semibold text-sm
                transition-colors duration-150
                cursor-pointer
              "
            >
              Claim your profile
            </button>

            {/* Secondary CTA — plain link with arrow, no underline */}
            <a
              href="#"
              className="
                text-sm font-medium
                text-gray-700 dark:text-gray-300
                hover:text-gray-900 dark:hover:text-white
                transition-colors duration-150
              "
            >
              Browse profiles →
            </a>
          </div>

          {/* ── Tagline ─────────────────────────────────────────── */}
          <p
            className="
              text-xs tracking-wide
              text-gray-400 dark:text-gray-600
            "
          >
            Free during beta · No credit card required
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════
            RIGHT COLUMN — Project preview widget
        ══════════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-3">

          {/* Eyebrow — uppercase, muted, monospace (like GitHub's "Pinned" label) */}
          <p className="text-[11px] font-mono uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Example Project
          </p>

          {/* The pinned project card — see ProjectCard.jsx for full breakdown */}
          <ProjectCard />

          {/* ── Author / profile summary line ─────────────────── */}
          {/*
            "maren-k" appears in accent to suggest it's a clickable profile link.
            The rest is muted metadata.
          */}
          <p className="text-xs font-mono">
            <span className="text-accent">maren-k</span>
            <span className="text-gray-500"> · 4 projects · 1.2k stars</span>
          </p>

          {/* ── Ghosted secondary repo ────────────────────────── */}
          {/*
            This faint line hints at more content below the first card,
            conveying "there's an entire portfolio here" without showing it.
          */}
          <p className="text-xs font-mono text-gray-600 dark:text-gray-700 opacity-60">
            maren-k/htx
          </p>
        </div>

      </div>
    </section>
  )
}
