import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'
import { cn } from '@/lib/cn'

interface NumberTickerProps {
  value: number
  direction?: 'up' | 'down'
  className?: string
  delay?: number // in seconds
  decimalPlaces?: number
  prefix?: string
  suffix?: string
}

export function NumberTicker({
  value,
  direction = 'up',
  delay = 0,
  className,
  decimalPlaces = 0,
  prefix = '',
  suffix = '',
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(direction === 'down' ? value : 0)
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 90,
  })
  const isInView = useInView(ref, { once: true, margin: '0px' })

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        motionValue.set(direction === 'down' ? 0 : value)
      }, delay * 1000)
      return () => clearTimeout(timer)
    }
  }, [motionValue, isInView, delay, value, direction])

  useEffect(
    () =>
      springValue.on('change', (latest) => {
        if (ref.current) {
          const formatted = Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(Number(latest.toFixed(decimalPlaces)))

          ref.current.textContent = `${prefix}${formatted}${suffix}`
        }
      }),
    [springValue, decimalPlaces, prefix, suffix],
  )

  return (
    <span
      className={cn(
        'inline-block tabular-nums font-mono tracking-tight text-white',
        className,
      )}
      ref={ref}
    >
      {prefix}
      {direction === 'down' ? value : 0}
      {suffix}
    </span>
  )
}
