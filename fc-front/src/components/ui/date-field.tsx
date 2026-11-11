import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { FormControl } from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const toDate = (value?: Date | string | number | null) => {
  if (!value) return undefined
  const date = value instanceof Date ? value : new Date(value)
  return isNaN(date.getTime()) ? undefined : date
}

/**
 * The date button used inside forms. Picking a day closes the calendar, so the
 * submit button underneath is never left covered by an open popover.
 */
export function DateField({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
  calendarClassName,
}: {
  value?: Date | string | number | null
  onChange: (value?: Date) => void
  placeholder?: string
  className?: string
  calendarClassName?: string
}) {
  const [open, setOpen] = React.useState(false)
  const date = toDate(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start pl-3 text-left font-normal',
              !date && 'text-muted-foreground',
              className,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP') : <span>{placeholder}</span>}
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(next) => {
            onChange(next)
            setOpen(false)
          }}
          autoFocus
          className={calendarClassName}
        />
      </PopoverContent>
    </Popover>
  )
}
