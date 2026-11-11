import * as React from 'react'
import type { StallUserAttributes } from '@server/db/userModel'
import { Tooltip as TooltipPrimitive } from 'radix-ui'

import { formatSize } from '@/lib/format'
import {
  boardState,
  isUrgent,
  pastLabel,
  type BoardState,
} from '@/lib/stall-lease'
import { cn } from '@/lib/utils'

import { TooltipContent } from '@/components/ui/tooltip'

function tileLeft(endAt: StallUserAttributes['endAt']) {
  return pastLabel(endAt)
}

/** Legend marker. Free is a hollow shape; only the highlighted set carries colour. */
export function StateSwatch({ state }: { state: BoardState }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'size-3 shrink-0 rounded-[4px]',
        state === 'let' && 'bg-muted-foreground/25',
        state === 'followup' && 'bg-primary',
        state === 'free' && 'border-muted-foreground border border-dashed',
      )}
    />
  )
}

/** Ring seats of the court: 7 along the top, 3 pairs down the aisle, 7 along the bottom. */
function seatOf(index: number, total: number) {
  if (total !== 20) return undefined
  if (index < 7) return { gridColumn: index + 1, gridRow: 1 }
  if (index < 13) {
    const offset = index - 7
    return {
      gridColumn: offset % 2 === 0 ? 1 : 7,
      gridRow: 2 + Math.floor(offset / 2),
    }
  }
  return { gridColumn: index - 12, gridRow: 5 }
}

export function StallFloorPlan({
  stalls,
  size,
  matches,
  active,
  onOpen,
  peek,
  centre,
  className,
}: {
  stalls: StallUserAttributes[]
  size: 'compact' | 'full'
  /** Stalls highlighted for the current selection. Everything else stays neutral. */
  matches?: (stall: StallUserAttributes) => boolean
  active?: number | null
  onOpen: (stall: StallUserAttributes) => void
  /** Content of the hover or focus card beside a tile. */
  peek?: (stall: StallUserAttributes) => React.ReactNode
  centre?: React.ReactNode
  className?: string
}) {
  const ordered = [...stalls].sort((a, b) => a.stallNumber - b.stallNumber)
  const isRing = ordered.length === 20

  return (
    <TooltipPrimitive.Provider delayDuration={250} skipDelayDuration={800}>
      <div
        className={cn(
          'grid min-w-0 grid-cols-7 gap-[5px] md:gap-1.5',
          isRing && 'grid-rows-5',
          className,
        )}
      >
        {ordered.map((stall, index) => {
          const state = boardState(stall)
          const highlighted = matches?.(stall)
          const tile = (
            <button
              key={stall.stallNumber}
              type="button"
              style={seatOf(index, ordered.length)}
              onClick={() => onOpen(stall)}
              aria-label={`Stall ${stall.stallNumber}, ${stall.stallName}`}
              className={cn(
                'focus-visible:ring-ring min-h-11 min-w-0 cursor-pointer overflow-hidden rounded-lg border text-left transition-colors outline-none focus-visible:ring-2',
                state === 'free'
                  ? 'border-muted-foreground/50 bg-card border-dashed'
                  : 'bg-muted/60 border-transparent',
                highlighted
                  ? 'bg-brand-soft text-brand-ink border-primary border-solid'
                  : 'hover:border-muted-foreground/50',
                size === 'compact'
                  ? 'flex items-center justify-center'
                  : 'flex flex-col items-center justify-center p-1 md:items-start md:justify-start md:p-2',
                active === stall.stallNumber &&
                  'ring-ring ring-offset-card ring-2 ring-offset-2',
              )}
            >
              <span className="type-id">{stall.stallNumber}</span>
              {size === 'full' ? (
                <span className="type-meta hidden min-w-0 md:contents">
                  <span className="line-clamp-2 font-medium">
                    {stall.stallName}
                  </span>
                  <span
                    className={cn(
                      'mt-auto truncate whitespace-nowrap',
                      state === 'followup' &&
                        isUrgent(stall.endAt) &&
                        'text-negative-ink font-medium',
                    )}
                  >
                    {state === 'free'
                      ? 'Free'
                      : state === 'followup'
                        ? tileLeft(stall.endAt)
                        : formatSize(stall.stallSize)}
                  </span>
                </span>
              ) : null}
            </button>
          )
          if (!peek) return tile
          return (
            <TooltipPrimitive.Root key={stall.stallNumber}>
              <TooltipPrimitive.Trigger asChild>
                {tile}
              </TooltipPrimitive.Trigger>
              <TooltipContent
                side="top"
                sideOffset={6}
                className="hidden md:block"
              >
                {peek(stall)}
              </TooltipContent>
            </TooltipPrimitive.Root>
          )
        })}
        {centre && isRing ? (
          <div
            className="flex min-w-0 flex-col items-center justify-center overflow-hidden p-2 text-center md:p-4"
            style={{ gridColumn: '2 / 7', gridRow: '2 / 5' }}
          >
            {centre}
          </div>
        ) : null}
      </div>
    </TooltipPrimitive.Provider>
  )
}
