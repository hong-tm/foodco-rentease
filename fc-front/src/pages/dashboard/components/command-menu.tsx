import { useEffect, useState } from 'react'
import { useSession } from '@/api/adminApi'
import { useNavigate } from '@tanstack/react-router'
import { MoonIcon, SearchIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useTheme } from '@/components/theme-provider'

import { navByRole, type AppPath, type Role } from './nav-data'

/** Quick access: every destination for the current role, from the keyboard. */
export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const nav =
    navByRole[(session?.user?.role as Role) ?? 'user'] ?? navByRole.user
  const go = (url: AppPath) => {
    setOpen(false)
    navigate({ to: url })
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="Open quick access"
        className="text-muted-foreground size-9 p-0 font-normal md:w-56 md:justify-start md:px-3"
      >
        <SearchIcon />
        <span className="type-meta hidden md:inline">Quick access</span>
        <kbd className="type-meta bg-muted ml-auto hidden rounded-sm px-1.5 py-0.5 md:inline">
          Ctrl K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Quick access"
        description="Jump to any page"
      >
        <CommandInput placeholder="Jump to a page..." />
        <CommandList>
          <CommandEmpty>No matching page.</CommandEmpty>
          <CommandGroup heading="Quick access">
            {nav.quick.map((item) => (
              <CommandItem
                key={`quick-${item.title}`}
                value={`quick ${item.title}`}
                onSelect={() => go(item.url)}
              >
                <item.icon />
                {item.title}
              </CommandItem>
            ))}
          </CommandGroup>
          {nav.main.map((section) => (
            <CommandGroup key={section.title} heading={section.title}>
              {section.items.map((item) => (
                <CommandItem
                  key={item.url}
                  value={`${section.title} ${item.title}`}
                  onSelect={() => go(item.url)}
                >
                  <item.icon />
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          {nav.secondary.length > 0 && (
            <CommandGroup heading="More">
              {nav.secondary.map((item) => (
                <CommandItem
                  key={item.url}
                  value={`more ${item.title}`}
                  onSelect={() => go(item.url)}
                >
                  <item.icon />
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandGroup heading="Appearance">
            <CommandItem
              value="toggle theme dark light"
              onSelect={() => {
                setTheme(theme === 'light' ? 'dark' : 'light')
                setOpen(false)
              }}
            >
              <MoonIcon />
              Toggle light and dark
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
