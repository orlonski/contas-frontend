import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
}

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

interface DialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      {/* Content */}
      {children}
    </div>
  )
}

export function DialogContent({ children, className }: DialogContentProps) {
  return (
    <div
      className={cn(
        'relative z-50 w-full max-w-lg bg-white rounded-lg shadow-lg p-6',
        'animate-in fade-in-0 zoom-in-95 duration-200',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  )
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return <div className={cn('flex flex-col space-y-1.5 mb-4', className)}>{children}</div>
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)}>{children}</h2>
}

export function DialogDescription({ children, className }: DialogDescriptionProps) {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div className={cn('flex items-center justify-end gap-2 mt-6', className)}>
      {children}
    </div>
  )
}

export function DialogClose({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  )
}
