/**
 * GlassIconTile.jsx
 *
 * Layered 3D glass icon badge inspired by Resq.io / Linear / Raycast:
 * - Slightly rotated back square for depth
 * - Frosted front glass square with top specular highlight
 * - Inner glowing SVG icon
 */

export default function GlassIconTile({
  children,
  size = 'md',
  accent = true,
  className = '',
}) {
  const dimensions =
    size === 'sm'
      ? 'w-8 h-8 rounded-lg'
      : size === 'lg'
        ? 'w-12 h-12 rounded-2xl'
        : 'w-10 h-10 rounded-xl'

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none group/tile ${dimensions} ${className}`}
    >
      {/* Rotated 3D Back Layer */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 ${dimensions} rotate-6 scale-95 transition-transform duration-300 group-hover/tile:rotate-12 ${
          accent
            ? 'bg-accent/18 dark:bg-accent/22 border border-accent/28 dark:border-accent-light/22'
            : 'bg-slate-200/70 dark:bg-white/[0.04] border border-slate-300/60 dark:border-white/[0.07]'
        }`}
      />

      {/* Frosted Front Specular Glass Tile */}
      <div
        className={`relative z-10 flex items-center justify-center w-full h-full ${dimensions} backdrop-blur-md transition-transform duration-300 group-hover/tile:-translate-y-0.5 ${
          accent
            ? 'bg-gradient-to-b from-white/95 to-slate-100/90 dark:from-white/[0.11] dark:to-white/[0.03] border border-accent/30 dark:border-white/[0.15] text-accent dark:text-accent-light shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_8px_18px_-6px_rgba(42,138,126,0.3)]'
            : 'bg-gradient-to-b from-white/95 to-slate-100/90 dark:from-white/[0.08] dark:to-white/[0.02] border border-slate-200 dark:border-white/[0.12] text-slate-700 dark:text-slate-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28)]'
        }`}
      >
        {accent && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] bg-radial from-accent-light/18 via-transparent to-transparent opacity-80"
          />
        )}
        <span className="relative z-10 flex items-center justify-center">{children}</span>
      </div>
    </div>
  )
}
