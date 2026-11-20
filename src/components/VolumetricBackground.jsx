/**
 * VolumetricBackground.jsx
 *
 * Restrained ambient lighting — a soft top radial wash and a barely-there
 * architectural grid that fades out cleanly. No distracting neon blobs or twinkling stars.
 */

export default function VolumetricBackground({ variant = 'hero', className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
    >
      {/* Restrained Top Ambient Wash */}
      <div
        className="absolute left-1/2 -top-44 -translate-x-1/2 w-[560px] sm:w-[880px] h-[300px] sm:h-[380px] rounded-full opacity-20 dark:opacity-55 blur-3xl"
        style={{
          background:
            variant === 'hero'
              ? 'radial-gradient(ellipse at 50% 0%, rgba(42, 138, 126, 0.22) 0%, rgba(255, 255, 255, 0.03) 45%, transparent 75%)'
              : 'radial-gradient(ellipse at 50% 0%, rgba(42, 138, 126, 0.12) 0%, transparent 70%)',
        }}
      />

      {/* Hairline Grid Fade (Hero only) */}
      {variant === 'hero' && (
        <div
          className="absolute inset-x-0 top-0 h-[420px] opacity-[0.025] dark:opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse at 50% 0%, black 15%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, black 15%, transparent 70%)',
          }}
        />
      )}
    </div>
  )
}
