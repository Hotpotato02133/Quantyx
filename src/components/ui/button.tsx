import * as React from 'react'
import { cn } from '@/lib/cn'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'profit'
    | 'warning'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-profit disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]'

    const variantClasses = {
      default:
        'bg-profit text-[#0A0A0A] font-semibold hover:bg-profit/90 shadow-sm',
      secondary:
        'bg-surface border border-border text-[#F4F4F5] hover:bg-white/[0.06] hover:border-[#404040]',
      destructive:
        'bg-loss text-white font-semibold hover:bg-loss/90 shadow-sm',
      outline:
        'border border-border bg-transparent text-[#F4F4F5] hover:bg-white/[0.05] hover:border-[#404040]',
      ghost:
        'text-[#A1A1AA] hover:bg-white/[0.05] hover:text-[#F4F4F5]',
      link:
        'text-profit underline-offset-4 hover:underline p-0 h-auto',
      profit:
        'bg-profit/15 text-profit border border-profit/30 hover:bg-profit/25',
      warning:
        'bg-warning/15 text-warning border border-warning/30 hover:bg-warning/25',
    }[variant]

    const sizeClasses = {
      default: 'h-9 px-4 py-2',
      sm: 'h-7 rounded-md px-2.5 text-xs',
      lg: 'h-10 rounded-md px-6 text-base',
      icon: 'h-8 w-8 p-0',
    }[size]

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseClasses, variantClasses, sizeClasses, className)}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'
