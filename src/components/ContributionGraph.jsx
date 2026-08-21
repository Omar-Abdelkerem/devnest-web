/**
 * ContributionGraph.jsx — GitHub-style heatmap graph
 *
 * This is a static visual representation for now, matching the Figma design.
 * It uses a CSS grid with many small squares, applying different opacities
 * of the accent color to simulate activity.
 */

export default function ContributionGraph() {
  // Generate a 52x7 grid of squares with pseudo-random opacities to look like real activity
  // We'll use a fixed seed approach so it doesn't flicker on re-renders, but since it's just static UI, simple math is fine.
  
  const totalWeeks = 52
  const daysPerWeek = 7
  const squares = []

  for (let col = 0; col < totalWeeks; col++) {
    for (let row = 0; row < daysPerWeek; row++) {
      // Create some visual clustering for the "randomness"
      const activityLevel = Math.sin(col * 0.5) * Math.cos(row * 0.5) + (col % 3) * 0.3 + (row % 2) * 0.5
      let opacityClass = 'opacity-[0.05] dark:opacity-10' // default / lowest activity
      
      if (activityLevel > 1.2) {
        opacityClass = 'opacity-100'
      } else if (activityLevel > 0.8) {
        opacityClass = 'opacity-70'
      } else if (activityLevel > 0.4) {
        opacityClass = 'opacity-40'
      }

      squares.push(
        <div 
          key={`${col}-${row}`}
          className={`w-3 h-3 rounded-sm bg-accent ${opacityClass}`}
        />
      )
    }
  }

  return (
    <div className="border border-gray-200 dark:border-neutral-800 rounded-lg p-6 bg-white dark:bg-[#1a1a1a]">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-6">
        1,247 contributions in the last year
      </h3>
      
      <div className="flex flex-col gap-2 overflow-x-auto pb-2">
        <div 
          className="grid gap-1"
          style={{ 
            gridTemplateColumns: `repeat(${totalWeeks}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${daysPerWeek}, minmax(0, 1fr))`
          }}
        >
          {squares}
        </div>
        
        <div className="flex items-center justify-end gap-2 text-[11px] text-gray-500 mt-2 font-mono">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-accent opacity-10" />
            <div className="w-3 h-3 rounded-sm bg-accent opacity-40" />
            <div className="w-3 h-3 rounded-sm bg-accent opacity-70" />
            <div className="w-3 h-3 rounded-sm bg-accent opacity-100" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
