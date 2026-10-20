import * as React from 'react'
import { cn } from '@/lib/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'profit'
    | 'warning'
    | 'destructive'
    | 'outline'
  tabular?: boolean
}

export function Badge({
  className,
  variant = 'default',
  tabular = false,
  ...props
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-profit/15 text-profit border-profit/30',
    secondary: 'bg-white/[0.06] text-[#F4F4F5] border-border',
    profit: 'bg-[#1DB954]/15 text-[#1DB954] border-[#1DB954]/30',
    warning: 'bg-[#FF8C43]/15 text-[#FF8C43] border-[#FF8C43]/30',
    destructive: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',
    outline: 'text-[#A1A1AA] border-border bg-transparent',
  }[variant]

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors',
        tabular && 'font-mono tabular-nums',
        variantClasses,
        className,
      )}
      {...props}
    />
  )
}
