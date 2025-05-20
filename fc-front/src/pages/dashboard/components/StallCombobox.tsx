import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useIsMobile } from '@/hooks/use-mobile'
import { useState } from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

const stalls = Array.from({ length: 20 }, (_, i) => ({
  value: `${i + 1}`,
  label: `Stall ${i + 1}`,
}))

export function StallCombobox({
  value,
  onChange,
}: {
  value: number | null
  onChange: (value: number | null) => void
}) {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()

  if (!isMobile) {
    return (
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value
              ? stalls.find((stall) => parseInt(stall.value, 10) === value)
                  ?.label
              : 'Select Stall...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <StallList setOpen={setOpen} setValue={onChange} value={value} />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? stalls.find((stall) => parseInt(stall.value, 10) === value)?.label
            : 'Select Stall...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DrawerTrigger>
      <VisuallyHidden>
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
      </VisuallyHidden>
      <DrawerContent>
        <div className="mt-4 border-t">
          <StallList setOpen={setOpen} setValue={onChange} value={value} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function StallList({
  setOpen,
  setValue,
  value,
}: {
  setOpen: (open: boolean) => void
  setValue: (value: number | null) => void
  value: number | null
}) {
  return (
    <Command>
      <CommandInput placeholder="Search stall..." />
      <CommandList>
        <CommandEmpty>No stall found.</CommandEmpty>
        <CommandGroup>
          {stalls.map((stall) => (
            <CommandItem
              key={stall.value}
              value={stall.value}
              onSelect={(currentValue) => {
                const numericValue = parseInt(currentValue, 10) // Convert to number
                setValue(numericValue === value ? null : numericValue) // Toggle selection
                setOpen(false)
              }}
            >
              <Check
                className={cn(
                  'mr-2 h-4 w-4',
                  value === parseInt(stall.value, 10)
                    ? 'opacity-100'
                    : 'opacity-0',
                )}
              />
              {stall.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
