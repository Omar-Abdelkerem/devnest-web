/**
 * VolumetricBackground.jsx
 *
 * GPU-composited volumetric spotlight beam + micro-starfield.
 * Uses deterministic CSS particles (transform + opacity only)
 * and reduces particle count on mobile (< 768px) while respecting prefers-reduced-motion.
 */

const STAR_PARTICLES = [
  { id: 1, left: '7%', top: '15%', size: 2, duration: '6.4s', delay: '0.1s', mobile: true },
  { id: 2, left: '15%', top: '29%', size: 1.5, duration: '7.6s', delay: '1.2s', mobile: true },
  { id: 3, left: '23%', top: '12%', size: 1, duration: '5.9s', delay: '0.7s', mobile: false },
  { id: 4, left: '30%', top: '42%', size: 2, duration: '8.2s', delay: '2.0s', mobile: true },
  { id: 5, left: '37%', top: '19%', size: 1.5, duration: '6.8s', delay: '0.4s', mobile: false },
  { id: 6, left: '44%', top: '9%', size: 2, duration: '7.1s', delay: '1.8s', mobile: true },
  { id: 7, left: '50%', top: '34%', size: 1, duration: '5.7s', delay: '2.6s', mobile: false },
  { id: 8, left: '55%', top: '16%', size: 2, duration: '7.9s', delay: '0.9s', mobile: true },
  { id: 9, left: '62%', top: '27%', size: 1.5, duration: '6.5s', delay: '1.5s', mobile: true },
  { id: 10, left: '69%', top: '11%', size: 1, duration: '8.4s', delay: '0.3s', mobile: false },
  { id: 11, left: '76%', top: '36%', size: 2, duration: '6.9s', delay: '2.2s', mobile: true },
  { id: 12, left: '84%', top: '18%', size: 1.5, duration: '7.3s', delay: '1.1s', mobile: false },
  { id: 13, left: '91%', top: '29%', size: 2, duration: '6.0s', delay: '0.6s', mobile: true },
  { id: 14, left: '12%', top: '62%', size: 1.5, duration: '7.7s', delay: '1.9s', mobile: false },
  { id: 15, left: '20%', top: '75%', size: 2, duration: '6.4s', delay: '0.5s', mobile: true },
  { id: 16, left: '28%', top: '58%', size: 1, duration: '8.1s', delay: '2.4s', mobile: false },
  { id: 17, left: '39%', top: '71%', size: 1.5, duration: '6.8s', delay: '1.3s', mobile: true },
  { id: 18, left: '48%', top: '82%', size: 2, duration: '7.5s', delay: '0.2s', mobile: false },
  { id: 19, left: '59%', top: '64%', size: 1, duration: '6.2s', delay: '2.1s', mobile: true },
  { id: 20, left: '67%', top: '78%', size: 2, duration: '7.8s', delay: '0.8s', mobile: false },
  { id: 21, left: '75%', top: '54%', size: 1.5, duration: '6.6s', delay: '1.7s', mobile: true },
  { id: 22, left: '83%', top: '69%', size: 1, duration: '8.5s', delay: '2.8s', mobile: false },
  { id: 23, left: '89%', top: '52%', size: 2, duration: '7.0s', delay: '1.0s', mobile: true },
  { id: 24, left: '94%', top: '74%', size: 1.5, duration: '7.2s', delay: '1.6s', mobile: false },
  { id: 25, left: '34%', top: '26%', size: 1.5, duration: '6.1s', delay: '2.5s', mobile: false },
  { id: 26, left: '64%', top: '44%', size: 2, duration: '7.4s', delay: '0.4s', mobile: true },
]

export default function VolumetricBackground({ variant = 'hero', className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
    >
      {/* Top Radial Volumetric Horizon Glow */}
      <div
        className="absolute left-1/2 -top-36 -translate-x-1/2 w-[620px] sm:w-[960px] h-[360px] sm:h-[460px] rounded-full opacity-30 dark:opacity-95 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(56, 178, 163, 0.22) 0%, rgba(42, 138, 126, 0.09) 44%, rgba(7, 7, 11, 0) 75%)',
        }}
      />

      {/* Diagonal Volumetric Light Cone */}
      {variant === 'hero' && (
        <div
          className="hidden sm:block absolute left-1/2 -top-24 -translate-x-1/2 w-[820px] h-[540px] opacity-25 dark:opacity-70 blur-3xl"
          style={{
            background:
              'conic-gradient(from 156deg at 50% 0%, transparent 0deg, rgba(56, 178, 163, 0.14) 22deg, rgba(255, 255, 255, 0.07) 35deg, rgba(42, 138, 126, 0.12) 48deg, transparent 70deg)',
          }}
        />
      )}

      {variant === 'profile' && (
        <div
          className="hidden sm:block absolute left-1/3 -top-28 -translate-x-1/2 w-[720px] h-[360px] opacity-20 dark:opacity-60 blur-3xl"
          style={{
            background:
              'radial-gradient(ellipse at 40% 0%, rgba(56, 178, 163, 0.16) 0%, rgba(42, 138, 126, 0.05) 48%, transparent 75%)',
          }}
        />
      )}

      {variant === 'cta' && (
        <div
          className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[560px] sm:w-[820px] h-[280px] opacity-25 dark:opacity-85 blur-3xl"
          style={{
            background:
              'radial-gradient(ellipse at 50% 100%, rgba(56, 178, 163, 0.22) 0%, rgba(42, 138, 126, 0.08) 50%, transparent 78%)',
          }}
        />
      )}

      {/* Subtle Architectural Grid Mesh Overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at 50% 22%, black 18%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 22%, black 18%, transparent 72%)',
        }}
      />

      {/* Micro-Starfield (Drifting 1px–2px GPU-composited particles) */}
      <div className="absolute inset-0">
        {STAR_PARTICLES.map((star) => (
          <span
            key={star.id}
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              '--star-duration': star.duration,
              '--star-delay': star.delay,
            }}
            className={`${
              star.mobile ? 'block' : 'hidden md:block'
            } absolute rounded-full bg-teal-700/35 dark:bg-white/70 shadow-[0_0_5px_rgba(255,255,255,0.5)] animate-star`}
          />
        ))}
      </div>
    </div>
  )
}
