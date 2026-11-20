/**
 * GlassIconTile.jsx
 *
 * Clean, single-layer precision glass keycap badge.
 * No rotated back-squares or excessive neon glow.
 */

export default function GlassIconTile({
  children,
  size = 'md',
  className = '',
}) {
  const dimensions =
    size === 'sm'
      ? 'w-7 h-7 rounded-md'
      : size === 'lg'
        ? 'w-10 h-10 rounded-xl'
        : 'w-8 h-8 rounded-lg'

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${dimensions} bg-slate-100 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/[0.09] text-slate-700 dark:text-slate-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] ${className}`}
    >
      {children}
    </div>
  )
}
