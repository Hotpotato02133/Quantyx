import React, { useRef } from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { cn } from '@/lib/cn'

interface BentoGridProps {
  className?: string
  children?: React.ReactNode
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-12 gap-4 max-w-6xl mx-auto cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface BentoGridItemProps {
  className?: string
  title?: React.ReactNode
  description?: React.ReactNode
  header?: React.ReactNode
  icon?: React.ReactNode
  children?: React.ReactNode
  onClick?: () => void
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
  children,
  onClick,
}: BentoGridItemProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const cardRef = useRef<HTMLDivElement>(null)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return
    const { left, top } = cardRef.current.getBoundingClientRect()
    mouseX.set(e.clientX - left)
    mouseY.set(e.clientY - top)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-[#141414] p-6 border border-white/[0.07] transition-all duration-300 hover:border-white/[0.16] flex flex-col justify-between cursor-pointer',
        className,
      )}
    >
      {/* Radial Hover Spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              450px circle at ${mouseX}px ${mouseY}px,
              rgba(255, 255, 255, 0.08),
              transparent 80%
            )
          `,
        }}
      />

      {/* Card Content */}
      <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
        {header && <div className="w-full">{header}</div>}
        {children && <div className="w-full">{children}</div>}

        {(title || description || icon) && (
          <div className="mt-auto pt-2">
            {icon && <div className="mb-2 text-zinc-400">{icon}</div>}
            {title && (
              <h3 className="text-base font-semibold text-white tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed font-normal">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
