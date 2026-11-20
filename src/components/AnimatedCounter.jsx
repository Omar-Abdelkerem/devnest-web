import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'

export default function AnimatedCounter({ value = 0, duration = 0.8 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const prefersReduced = useReducedMotion()
  const numericTarget = Number.isFinite(Number(value)) ? Number(value) : 0
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (prefersReduced || !isInView) return

    const controls = animate(0, numericTarget, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    })

    return () => controls.stop()
  }, [isInView, numericTarget, duration, prefersReduced])

  return <span ref={ref}>{prefersReduced ? numericTarget : display}</span>
}
