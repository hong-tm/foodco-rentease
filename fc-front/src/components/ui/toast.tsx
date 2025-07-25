import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { XIcon } from 'lucide-react'
import { Toast as ToastPrimitives } from 'radix-ui'

import { cn } from '@/lib/utils'

const ToastProvider = ToastPrimitives.Provider

type ToastViewportProps = React.ComponentProps<typeof ToastPrimitives.Viewport>

function ToastViewport({ className, ...props }: ToastViewportProps) {
  return (
    <ToastPrimitives.Viewport
      className={cn(
        'fixed top-0 z-100 flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-[420px]',
        className,
      )}
      {...props}
      data-slot="toast-viewport"
    />
  )
}

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x) data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive:
          'destructive group border-destructive bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type ToastRootProps = React.ComponentProps<typeof ToastPrimitives.Root> &
  VariantProps<typeof toastVariants>

function Toast({ className, variant, ...props }: ToastRootProps) {
  return (
    <ToastPrimitives.Root
      className={cn(toastVariants({ variant }), className)}
      {...props}
      data-slot="toast"
    />
  )
}

type ToastActionProps = React.ComponentProps<typeof ToastPrimitives.Action>

function ToastAction({ className, ...props }: ToastActionProps) {
  return (
    <ToastPrimitives.Action
      className={cn(
        'hover:bg-secondary focus:ring-ring group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors focus:ring-1 focus:outline-none disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
      data-slot="toast-action"
    />
  )
}

type ToastCloseProps = React.ComponentProps<typeof ToastPrimitives.Close>

function ToastClose({ className, ...props }: ToastCloseProps) {
  return (
    <ToastPrimitives.Close
      className={cn(
        'text-foreground/50 hover:text-foreground absolute top-1 right-1 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 focus:opacity-100 focus:ring-1 focus:outline-none group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
        className,
      )}
      toast-close=""
      {...props}
      data-slot="toast-close"
    >
      <XIcon className="h-4 w-4" />
    </ToastPrimitives.Close>
  )
}

type ToastTitleProps = React.ComponentProps<typeof ToastPrimitives.Title>

function ToastTitle({ className, ...props }: ToastTitleProps) {
  return (
    <ToastPrimitives.Title
      className={cn('text-sm font-semibold [&+div]:text-xs', className)}
      {...props}
      data-slot="toast-title"
    />
  )
}

type ToastDescriptionProps = React.ComponentProps<
  typeof ToastPrimitives.Description
>

function ToastDescription({ className, ...props }: ToastDescriptionProps) {
  return (
    <ToastPrimitives.Description
      className={cn('text-sm opacity-90', className)}
      {...props}
      data-slot="toast-description"
    />
  )
}

type ToastProps = React.ComponentProps<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
