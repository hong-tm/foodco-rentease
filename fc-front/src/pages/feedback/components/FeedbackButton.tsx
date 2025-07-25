import { useState } from 'react'

import { useIsMobile } from '@/hooks/use-mobile'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

import { FeedbackForm } from './FeedbackForm'

export function FeedbackButton() {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)

  const handleClose = () => {
    setIsOpen(false)
  }

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="flex w-full items-center justify-center gap-2"
            onClick={() => setIsOpen(true)}
          >
            Feedback without Account
          </Button>
        </DrawerTrigger>
        <DrawerContent className="">
          <DrawerHeader className="items-center justify-center">
            <DrawerTitle>Feedback</DrawerTitle>
            <DrawerDescription>Like our service?</DrawerDescription>
          </DrawerHeader>
          <FeedbackForm onClose={handleClose} />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex w-full items-center justify-center gap-2"
          onClick={() => setIsOpen(true)}
        >
          Feedback without Account
        </Button>
      </DialogTrigger>
      <DialogContent className="h-auto sm:max-w-[425px]">
        <DialogHeader className="items-center justify-center">
          <DialogTitle>Feedback</DialogTitle>
          <DialogDescription>Like our service?</DialogDescription>
        </DialogHeader>
        <FeedbackForm onClose={handleClose} />
      </DialogContent>
    </Dialog>
  )
}
