'use client'

import { useEffect, useState } from 'react'

export function useAnimatedCounter(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0)
  const [prevEnd, setPrevEnd] = useState(end)

  useEffect(() => {
    if (prevEnd !== end) {
      const start = prevEnd
      const difference = end - start
      const startTime = Date.now()

      const animate = () => {
        const now = Date.now()
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3)

        setCount(Math.floor(start + (difference * easeProgress)))

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setCount(end)
          setPrevEnd(end)
        }
      }

      requestAnimationFrame(animate)
    }
  }, [end, duration, prevEnd])

  return count
}
