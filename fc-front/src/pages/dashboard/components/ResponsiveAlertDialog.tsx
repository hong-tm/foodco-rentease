import { useCallback, useEffect, useRef } from 'react'

import { useIsMobile } from '@/hooks/use-mobile'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

type ActionFunctionButtonProps = {
  title: string
  description?: string
  onClick: () => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  confirmLabel?: string
}

export function ResponsiveAlertDialog({
  title,
  description,
  onClick,
  open,
  setOpen,
  confirmLabel = 'Continue',
}: ActionFunctionButtonProps) {
  const isMobile = useIsMobile()
  const openerRef = useRef<HTMLElement | null>(null)
  const drawerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (open) openerRef.current = document.activeElement as HTMLElement | null
  }, [open])

  // The drawer content is rendered by vaul without moving focus into it.
  useEffect(() => {
    if (!open || !isMobile) return
    const frame = requestAnimationFrame(() => {
      drawerRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [open, isMobile])

  const restoreOpener = useCallback(() => {
    const opener = openerRef.current
    openerRef.current = null
    if (opener?.isConnected) opener.focus()
  }, [])

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) requestAnimationFrame(restoreOpener)
        }}
      >
        <DrawerContent ref={drawerRef}>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button
              variant="default"
              size="default"
              className="w-full"
              onClick={() => {
                onClick()
                setOpen(false)
              }}
            >
              {confirmLabel}
            </Button>
            <DrawerClose asChild>
              <Button
                data-autofocus
                variant="ghost"
                size="default"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent
        className="sm:max-w-md"
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          restoreOpener()
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onClick}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
