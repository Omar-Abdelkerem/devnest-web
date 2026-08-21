/**
 * HowItWorks.jsx — "Three steps from zero to portfolio" section
 *
 * Structure:
 *   <section>
 *     ├── Eyebrow: "HOW IT WORKS" (accent, uppercase, monospace)
 *     ├── Section heading: "Three steps from zero to portfolio."
 *     └── 3-column step grid (bordered cards, no gap — borders touch)
 *
 * Theming:
 *   Light mode (default): white cards on white/near-white section bg.
 *   Dark mode (dark:): dark neutral cards on a slightly lighter dark bg.
 *   The section bg is slightly different from the hero to create visual
 *   rhythm / section separation without a hard line.
 *
 * Why a grid with border on the wrapper instead of gap + individual borders?
 *   Adding `border` + `overflow-hidden` on the grid wrapper and then a
 *   right-border on each non-last card creates seamless connected card borders.
 *   Using `gap` would create double-borders or gaps between cards.
 */

// Step data is defined outside the component — easier to update, and
// keeps the JSX markup focused on structure rather than content.
const STEPS = [
  {
    number: '01',
    title: 'Build a profile',
    description:
      "Add your projects, write a bio, tag your skills. Your profile is a permanent URL — not a resume you email.",
  },
  {
    number: '02',
    title: 'Share real work',
    description:
      "Each project gets its own page: description, stack, README, and a comment thread. Link to a repo or paste the code inline.",
  },
  {
    number: '03',
    title: 'Get engineering feedback',
    description:
      "Other developers review your architecture choices, flag tradeoffs, and leave structured notes — not just reactions.",
  },
]

export default function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="bg-white dark:bg-[#1a1a1a]"
    >
      <div className="max-w-6xl mx-auto px-6 py-24">

        {/* ── Section header ──────────────────────────────────────── */}
        <div className="mb-12">
          {/* Eyebrow — small, accent, monospace, all-caps */}
          <p className="text-xs font-mono uppercase tracking-widest mb-3 text-accent">
            How it works
          </p>

          <h2
            id="how-it-works-heading"
            className="
              text-3xl font-bold tracking-tight
              text-gray-900 dark:text-gray-100
            "
          >
            Three steps from zero to portfolio.
          </h2>
        </div>

        {/* ── Step cards grid ─────────────────────────────────────── */}
        {/*
          `border` on the wrapper + `overflow-hidden` clips any card borders
          at the corners, giving the combined card group rounded corners
          while the internal card dividers are straight.
        */}
        <div
          className="
            grid grid-cols-1 md:grid-cols-3
            border rounded-lg overflow-hidden
            border-gray-200 dark:border-neutral-700
          "
        >
          {STEPS.map((step, index) => (
            <StepCard
              key={step.number}
              step={step}
              isLast={index === STEPS.length - 1}
            />
          ))}
        </div>

      </div>
    </section>
  )
}

/**
 * StepCard — individual "step" card within the HowItWorks grid
 *
 * Extracted into its own function (not a separate file) because it's only
 * used here — co-location makes it easier to understand in context.
 *
 * Props:
 *   step   — { number, title, description }
 *   isLast — boolean; when false, we add a right border to create the
 *             vertical divider between cards. The last card gets no right
 *             border so we don't double-up with the wrapper's border.
 */
function StepCard({ step, isLast }) {
  return (
    <div
      className={`
        p-8 flex flex-col gap-4
        bg-white dark:bg-[#1e1e1e]
        ${!isLast
          ? 'border-b md:border-b-0 md:border-r border-gray-200 dark:border-neutral-700'
          : ''
        }
      `}
    >
      {/* Step number — monospace, accent teal, acts as a visual anchor */}
      <span className="text-sm font-mono font-semibold text-accent">
        {step.number}
      </span>

      {/* Step title */}
      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
        {step.title}
      </h3>

      {/* Step description — slightly muted body text */}
      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {step.description}
      </p>
    </div>
  )
}
