import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

interface SheetContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | undefined>(undefined)

function useSheet() {
  const context = React.useContext(SheetContext)
  if (!context) {
    throw new Error('Sheet components must be used within a Sheet')
  }
  return context
}

export interface SheetProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Sheet({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    },
    [isControlled, onOpenChange],
  )

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

export interface SheetTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export function SheetTrigger({
  children,
  onClick,
  ...props
}: SheetTriggerProps) {
  const { setOpen } = useSheet()

  return (
    <button
      type="button"
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) {
          setOpen(true)
        }
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export interface SheetContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'bottom' | 'left' | 'right'
  onClose?: () => void
}

export function SheetContent({
  side = 'right',
  className,
  children,
  onClose,
  ...props
}: SheetContentProps) {
  const { open, setOpen } = useSheet()
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        onClose?.()
      }
    }
    if (open) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, setOpen, onClose])

  if (!open) return null

  const sideClasses = {
    top: 'inset-x-0 top-0 border-b border-border animate-in slide-in-from-top duration-200',
    bottom: 'inset-x-0 bottom-0 border-t border-border animate-in slide-in-from-bottom duration-200',
    left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm sm:max-w-md border-r border-border animate-in slide-in-from-left duration-200',
    right: 'inset-y-0 right-0 h-full w-full max-w-md border-l border-border animate-in slide-in-from-right duration-200',
  }[side]

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => {
          setOpen(false)
          onClose?.()
        }}
      />
      {/* Drawer */}
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed z-50 flex flex-col bg-[#141414] p-6 shadow-2xl transition ease-in-out',
          sideClasses,
          className,
        )}
        {...props}
      >
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            onClose?.()
          }}
          className="absolute right-4 top-4 rounded-sm text-[#A1A1AA] hover:text-[#F4F4F5] focus:outline-none focus:ring-1 focus:ring-profit transition-colors"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  )
}

export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-2 text-left mb-4', className)}
      {...props}
    />
  )
}

export function SheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-base font-semibold leading-none tracking-tight text-[#F4F4F5]',
        className,
      )}
      {...props}
    />
  )
}

export function SheetDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-xs text-[#A1A1AA]', className)}
      {...props}
    />
  )
}

export function SheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-auto pt-4 border-t border-border',
        className,
      )}
      {...props}
    />
  )
}

export function SheetClose({
  children,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useSheet()
  return (
    <button
      type="button"
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) {
          setOpen(false)
        }
      }}
      {...props}
    >
      {children}
    </button>
  )
}
