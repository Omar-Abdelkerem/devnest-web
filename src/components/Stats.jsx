/**
 * Stats.jsx — Social-proof statistics band
 *
 * This section stays dark in BOTH light and dark modes — the deep background
 * creates a strong visual break between the "How It Works" cards and the footer,
 * and the large monospace numbers read best against a very dark surface.
 *
 * Structure:
 *   <section>
 *     └── 4-column grid of stat items:
 *           ├── Large number (monospace, white, bold)
 *           └── Label (small, muted)
 *
 * Why monospace for the numbers?
 *   Monospace gives each digit the same width, so numbers like "4,200+"
 *   and "91,000+" align visually. It also reinforces the "engineering" feel
 *   of the product — numbers look like terminal output, not marketing copy.
 */

const STATS = [
  { value: '4,200+',  label: 'developers' },
  { value: '18,000+', label: 'projects published' },
  { value: '91,000+', label: 'comments & reviews' },
  { value: '340+',    label: 'hires via DevNest' },
]

export default function Stats() {
  return (
    <section
      aria-label="Platform statistics"
      className="bg-[#111111]"   // Always dark — intentional design choice
    >
      <div className="max-w-6xl mx-auto px-6 py-20">

        {/* Responsive grid: 2 cols on mobile, 4 on desktop */}
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-2">

              {/* The big number — dt (definition term) semantically fits here */}
              <dt
                className="
                  text-4xl font-black font-mono
                  text-white
                "
              >
                {value}
              </dt>

              {/* The description label — dd (definition description) */}
              <dd
                className="
                  text-sm font-mono
                  text-gray-500
                "
              >
                {label}
              </dd>

            </div>
          ))}
        </dl>

      </div>
    </section>
  )
}
