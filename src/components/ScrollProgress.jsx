import { useEffect, useRef } from 'react'

export default function ScrollProgress() {
  const barRef = useRef(null)

  useEffect(() => {
    let ticking = false
    const update = () => {
      ticking = false
      const el = barRef.current
      if (!el) return
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0
      el.style.transform = `scaleX(${progress.toFixed(4)})`
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        window.requestAnimationFrame(update)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2.5px] z-[60] pointer-events-none bg-transparent"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-gradient-to-r from-accent via-accent-light to-emerald-400 shadow-[0_0_10px_rgba(52,168,153,0.75)] will-change-transform"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  )
}
