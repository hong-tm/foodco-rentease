import { useState } from 'react'
import { useSession } from '@/api/adminApi'
import { useFormatForDisplay, useHotkey } from '@tanstack/react-hotkeys'
import { PanelLeftIcon, SearchIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import { useSidebar } from '@/components/ui/sidebar'

import { getNavData, type NavRole } from './nav-data'

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { toggleSidebar } = useSidebar()
  const { data: session } = useSession()
  const formatShortcut = useFormatForDisplay()

  const role = (session?.user?.role as NavRole) || 'user'
  const navData = getNavData(role)

  useHotkey('Mod+K', () => setOpen((open) => !open))

  const runCommand = (url: string) => {
    setOpen(false)
    navigate(url)
  }

  const mainItems = navData.navMain.flatMap((group) =>
    (group.items ?? []).map((item) => ({ ...item, icon: group.icon })),
  )

  return (
    <>
      <Button
        type="button"
        variant="outline"
        data-slot="command-menu-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Search"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-foreground size-9 p-0 sm:w-44 sm:justify-between sm:px-3 lg:w-56"
      >
        <SearchIcon className="size-4 shrink-0" />
        <span className="hidden text-sm sm:inline">Search...</span>
        <kbd className="bg-muted text-muted-foreground pointer-events-none hidden h-5 items-center rounded border px-1.5 font-mono text-[10px] font-medium select-none lg:flex">
          {formatShortcut('Mod+K')}
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {mainItems.map((item) => (
              <CommandItem
                key={item.url}
                value={item.title}
                onSelect={() => runCommand(item.url)}
              >
                <item.icon />
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          {navData.navSecondary.length > 0 && (
            <CommandGroup heading="Manage">
              {navData.navSecondary.map((item) => (
                <CommandItem
                  key={item.url}
                  value={item.title}
                  onSelect={() => runCommand(item.url)}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandGroup heading="General">
            <CommandItem
              value="Toggle Sidebar"
              onSelect={() => {
                setOpen(false)
                toggleSidebar()
              }}
            >
              <PanelLeftIcon />
              <span>Toggle Sidebar</span>
              <CommandShortcut>{formatShortcut('Mod+B')}</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
