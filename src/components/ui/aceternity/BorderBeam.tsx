import { cn } from '@/lib/cn'

interface BorderBeamProps {
  className?: string
  size?: number
  duration?: number
  borderWidth?: number
  colorFrom?: string
  colorTo?: string
}

export function BorderBeam({
  className,
  duration = 10,
  borderWidth = 1.5,
  colorFrom = '#1DB954',
  colorTo = '#ffffff',
}: BorderBeamProps) {
  return (
    <div
      style={{
        WebkitMask:
          'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskImage:
          'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
        padding: `${borderWidth}px`,
      }}
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-10',
        className,
      )}
    >
      <div
        style={{
          background: `conic-gradient(from 0deg, transparent 0 310deg, ${colorFrom} 340deg, ${colorTo} 360deg)`,
          animation: `spin ${duration}s linear infinite`,
        }}
        className="absolute inset-[-150%] rounded-full"
      />
    </div>
  )
}
