/**
 * VolumetricBackground.jsx
 *
 * Lightweight, GPU-composited volumetric spotlight beam + micro-starfield.
 * Zero WebGL/Canvas overhead — uses deterministic CSS particles (transform + opacity only)
 * and automatically reduces particle count on mobile (< 768px) and respects prefers-reduced-motion.
 */

const STAR_PARTICLES = [
  { id: 1, left: '6%', top: '14%', size: 2, duration: '6.2s', delay: '0.1s', mobile: true },
  { id: 2, left: '14%', top: '28%', size: 1.5, duration: '7.4s', delay: '1.2s', mobile: true },
  { id: 3, left: '22%', top: '12%', size: 1, duration: '5.8s', delay: '0.7s', mobile: false },
  { id: 4, left: '29%', top: '42%', size: 2, duration: '8.1s', delay: '2.0s', mobile: true },
  { id: 5, left: '36%', top: '19%', size: 1.5, duration: '6.6s', delay: '0.4s', mobile: false },
  { id: 6, left: '43%', top: '8%', size: 2, duration: '7.0s', delay: '1.8s', mobile: true },
  { id: 7, left: '49%', top: '34%', size: 1, duration: '5.5s', delay: '2.6s', mobile: false },
  { id: 8, left: '54%', top: '16%', size: 2, duration: '7.9s', delay: '0.9s', mobile: true },
  { id: 9, left: '61%', top: '27%', size: 1.5, duration: '6.4s', delay: '1.5s', mobile: true },
  { id: 10, left: '68%', top: '11%', size: 1, duration: '8.3s', delay: '0.3s', mobile: false },
  { id: 11, left: '75%', top: '36%', size: 2, duration: '6.8s', delay: '2.2s', mobile: true },
  { id: 12, left: '83%', top: '18%', size: 1.5, duration: '7.2s', delay: '1.1s', mobile: false },
  { id: 13, left: '91%', top: '29%', size: 2, duration: '5.9s', delay: '0.6s', mobile: true },
  { id: 14, left: '11%', top: '62%', size: 1.5, duration: '7.6s', delay: '1.9s', mobile: false },
  { id: 15, left: '19%', top: '76%', size: 2, duration: '6.3s', delay: '0.5s', mobile: true },
  { id: 16, left: '27%', top: '58%', size: 1, duration: '8.0s', delay: '2.4s', mobile: false },
  { id: 17, left: '38%', top: '71%', size: 1.5, duration: '6.7s', delay: '1.3s', mobile: true },
  { id: 18, left: '47%', top: '82%', size: 2, duration: '7.5s', delay: '0.2s', mobile: false },
  { id: 19, left: '58%', top: '64%', size: 1, duration: '6.1s', delay: '2.1s', mobile: true },
  { id: 20, left: '66%', top: '78%', size: 2, duration: '7.8s', delay: '0.8s', mobile: false },
  { id: 21, left: '74%', top: '54%', size: 1.5, duration: '6.5s', delay: '1.7s', mobile: true },
  { id: 22, left: '82%', top: '69%', size: 1, duration: '8.4s', delay: '2.8s', mobile: false },
  { id: 23, left: '89%', top: '52%', size: 2, duration: '6.9s', delay: '1.0s', mobile: true },
  { id: 24, left: '94%', top: '75%', size: 1.5, duration: '7.1s', delay: '1.6s', mobile: false },
  { id: 25, left: '33%', top: '26%', size: 1.5, duration: '6.0s', delay: '2.5s', mobile: false },
  { id: 26, left: '63%', top: '44%', size: 2, duration: '7.3s', delay: '0.4s', mobile: true },
  { id: 27, left: '16%', top: '46%', size: 1, duration: '6.8s', delay: '1.4s', mobile: false },
  { id: 28, left: '79%', top: '22%', size: 2, duration: '7.7s', delay: '2.3s', mobile: false },
]

export default function VolumetricBackground({ variant = 'hero', className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
    >
      {/* Top Radial Volumetric Horizon Glow */}
      <div
        className="absolute left-1/2 -top-36 -translate-x-1/2 w-[620px] sm:w-[960px] h-[360px] sm:h-[460px] rounded-full opacity-35 dark:opacity-100 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(60, 210, 191, 0.24) 0%, rgba(42, 138, 126, 0.1) 42%, rgba(7, 7, 11, 0) 75%)',
        }}
      />

      {/* Diagonal Volumetric Light Cone (Resq.io / Linear Beam) */}
      {variant === 'hero' && (
        <>
          <div
            className="hidden sm:block absolute left-1/2 -top-24 -translate-x-1/2 w-[820px] h-[560px] opacity-25 dark:opacity-75 blur-3xl"
            style={{
              background:
                'conic-gradient(from 155deg at 50% 0%, transparent 0deg, rgba(60, 210, 191, 0.16) 22deg, rgba(255, 255, 255, 0.08) 35deg, rgba(42, 138, 126, 0.14) 48deg, transparent 72deg)',
            }}
          />
          <div
            className="absolute left-1/4 top-12 w-72 h-72 rounded-full opacity-20 dark:opacity-45 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.14) 0%, transparent 70%)',
            }}
          />
        </>
      )}

      {variant === 'profile' && (
        <div
          className="hidden sm:block absolute left-1/3 -top-28 -translate-x-1/2 w-[720px] h-[380px] opacity-25 dark:opacity-70 blur-3xl"
          style={{
            background:
              'radial-gradient(ellipse at 40% 0%, rgba(60, 210, 191, 0.18) 0%, rgba(56, 189, 248, 0.07) 45%, transparent 75%)',
          }}
        />
      )}

      {variant === 'cta' && (
        <div
          className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[560px] sm:w-[820px] h-[300px] opacity-30 dark:opacity-90 blur-3xl"
          style={{
            background:
              'radial-gradient(ellipse at 50% 100%, rgba(60, 210, 191, 0.25) 0%, rgba(42, 138, 126, 0.09) 50%, transparent 78%)',
          }}
        />
      )}

      {/* Subtle Architectural Grid Mesh Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at 50% 25%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 25%, black 20%, transparent 75%)',
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
            } absolute rounded-full bg-teal-600/40 dark:bg-white/75 shadow-[0_0_6px_rgba(60,210,191,0.75)] animate-star`}
          />
        ))}
      </div>
    </div>
  )
}
