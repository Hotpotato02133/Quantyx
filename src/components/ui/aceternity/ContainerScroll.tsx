import React, { useRef, useState, useEffect } from 'react'
import { useScroll, useTransform, motion, type MotionValue } from 'framer-motion'
import { cn } from '@/lib/cn'

interface ContainerScrollProps {
  titleComponent?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function ContainerScroll({
  titleComponent,
  children,
  className,
}: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Rotate from 20deg tilted back to 0deg flat facing the camera
  const rotate = useTransform(scrollYProgress, [0.1, 0.55], isMobile ? [10, 0] : [20, 0])
  const scale = useTransform(scrollYProgress, [0.1, 0.55], isMobile ? [0.95, 1] : [0.96, 1.02])
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0.8, 1])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex items-center justify-center p-2 sm:p-6 md:p-10',
        className,
      )}
    >
      <div
        className="relative w-full max-w-6xl py-4 sm:py-8"
        style={{
          perspective: '1200px',
        }}
      >
        {titleComponent && (
          <div className="relative mb-8 text-center">{titleComponent}</div>
        )}
        <Card rotate={rotate} scale={scale} opacity={opacity}>
          {children}
        </Card>
      </div>
    </div>
  )
}

function Card({
  rotate,
  scale,
  opacity,
  children,
}: {
  rotate: MotionValue<number>
  scale: MotionValue<number>
  opacity: MotionValue<number>
  children: React.ReactNode
}) {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        opacity,
        boxShadow:
          '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
      }}
      className="relative mx-auto w-full rounded-2xl md:rounded-3xl border border-white/[0.08] bg-[#141414] p-2 sm:p-4 md:p-5 shadow-2xl transition-all"
    >
      <div className="relative w-full overflow-hidden rounded-xl md:rounded-2xl bg-[#0A0A0A]">
        {children}
      </div>
    </motion.div>
  )
}
