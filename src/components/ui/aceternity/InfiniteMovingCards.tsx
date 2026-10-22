import React from 'react'
import { cn } from '@/lib/cn'

interface InfiniteMovingCardsProps<T> {
  items: T[]
  direction?: 'left' | 'right'
  speed?: 'fast' | 'normal' | 'slow'
  pauseOnHover?: boolean
  className?: string
  renderItem: (item: T, idx: number) => React.ReactNode
}

export function InfiniteMovingCards<T>({
  items,
  direction = 'left',
  speed = 'normal',
  pauseOnHover = true,
  className,
  renderItem,
}: InfiniteMovingCardsProps<T>) {
  // Speed mapping in seconds for 1 full loop cycle
  const duration =
    speed === 'fast' ? '30s' : speed === 'normal' ? '50s' : '80s'

  return (
    <div
      className={cn(
        'scroller relative z-20 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]',
        className,
      )}
    >
      <div
        style={
          {
            '--marquee-duration': duration,
            '--marquee-direction': direction === 'left' ? 'forwards' : 'reverse',
          } as React.CSSProperties
        }
        className={cn(
          'flex w-max shrink-0 gap-4 py-2 flex-nowrap animate-marquee',
          pauseOnHover && 'hover:[animation-play-state:paused]',
        )}
      >
        {/* Render 4 repeated cycles for seamless endless marquee across all screen widths up to 4K */}
        {[...items, ...items, ...items, ...items].map((item, idx) => (
          <div key={idx} className="shrink-0">
            {renderItem(item, idx % items.length)}
          </div>
        ))}
      </div>
    </div>
  )
}
