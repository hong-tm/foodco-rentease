import type { StallUserAttributes } from '@server/db/userModel'

import { formatDate, formatSize } from '@/lib/format'
import {
  boardState,
  daysLeft,
  isUrgent,
  timeLeftLabel,
} from '@/lib/stall-lease'
import { cn } from '@/lib/utils'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PersonAvatar } from '@/components/person-avatar'

import { TenantActionButton } from './TenantActionButton'

export type RentalRow = {
  user: {
    id: string
    name: string
    email: string
    phone?: string | null
    image?: string | null
    role?: string | null
  }
  stall: Pick<
    StallUserAttributes,
    | 'stallNumber'
    | 'stallName'
    | 'stallSize'
    | 'startAt'
    | 'endAt'
    | 'rentStatus'
  >
}

function TimeLeft({ stall }: { stall: RentalRow['stall'] }) {
  const days = daysLeft(stall.endAt)
  return (
    <p
      className={cn(
        'type-body',
        days === null && 'text-muted-foreground',
        isUrgent(stall.endAt) && 'text-negative-ink font-medium',
      )}
    >
      {timeLeftLabel(stall.endAt)}
    </p>
  )
}

function Remind({ row, className }: { row: RentalRow; className?: string }) {
  if (row.user.role === 'admin') return null
  return (
    <TenantActionButton
      className={className}
      userName={row.user.name}
      userEmail={row.user.email}
      userStallId={row.stall.stallNumber}
      userStallName={row.stall.stallName}
      stallEndAt={row.stall.endAt}
    />
  )
}

function Dash() {
  return <span className="text-muted-foreground">—</span>
}

export default function RentalsTable({ rows }: { rows: RentalRow[] }) {
  return (
    <>
      <div className="hidden xl:block">
        <Table containerClassName="overflow-visible!">
          <TableHeader className="[&_th]:bg-card [&_th]:sticky [&_th]:top-12 [&_th]:z-10 [&_th:first-child]:rounded-tl-xl [&_th:last-child]:rounded-tr-xl">
            <TableRow>
              <TableHead className="pl-5">Tenant</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Stall</TableHead>
              <TableHead>Lease</TableHead>
              <TableHead>Time left</TableHead>
              <TableHead className="w-28 pr-5 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.user.id}-${row.stall.stallNumber}`}>
                <TableCell className="py-2.5 pl-5">
                  <div className="flex items-center gap-3">
                    <PersonAvatar
                      id={row.user.id}
                      name={row.user.name}
                      image={row.user.image}
                    />
                    <div className="min-w-0">
                      <p className="type-strong">{row.user.name}</p>
                      <p className="type-meta text-muted-foreground">
                        {row.user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{row.user.phone ?? <Dash />}</TableCell>
                <TableCell className="whitespace-normal">
                  <p className="flex items-baseline gap-2">
                    <span className="type-id text-muted-foreground">
                      {row.stall.stallNumber}
                    </span>
                    <span className="font-medium">{row.stall.stallName}</span>
                  </p>
                  <p className="type-meta text-muted-foreground">
                    {formatSize(row.stall.stallSize)}
                  </p>
                </TableCell>
                <TableCell>
                  <p>
                    {row.stall.endAt ? formatDate(row.stall.endAt) : <Dash />}
                  </p>
                  <p className="type-meta text-muted-foreground">
                    {row.stall.startAt
                      ? `From ${formatDate(row.stall.startAt)}`
                      : '—'}
                  </p>
                </TableCell>
                <TableCell>
                  <TimeLeft stall={row.stall} />
                </TableCell>
                <TableCell className="pr-5 text-right">
                  {boardState(row.stall) === 'followup' ? (
                    <Remind row={row} />
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="divide-y xl:hidden">
        {rows.map((row) => (
          <li
            key={`${row.user.id}-${row.stall.stallNumber}`}
            className="flex flex-col gap-2 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <PersonAvatar
                id={row.user.id}
                name={row.user.name}
                image={row.user.image}
              />
              <div className="min-w-0 flex-1">
                <p className="type-strong truncate">{row.user.name}</p>
                <p className="type-meta text-muted-foreground truncate">
                  {row.user.email} · {row.user.phone ?? '—'}
                </p>
              </div>
            </div>
            <p className="type-body flex items-baseline gap-2">
              <span className="type-id text-muted-foreground">
                {row.stall.stallNumber}
              </span>
              <span className="font-medium">{row.stall.stallName}</span>
              <span className="type-meta text-muted-foreground ml-auto shrink-0">
                {formatSize(row.stall.stallSize)}
              </span>
            </p>
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <TimeLeft stall={row.stall} />
                <p className="type-meta text-muted-foreground mt-1">
                  {row.stall.startAt ? formatDate(row.stall.startAt) : '—'} to{' '}
                  {row.stall.endAt ? formatDate(row.stall.endAt) : '—'}
                </p>
              </div>
              {boardState(row.stall) === 'followup' ? (
                <Remind row={row} className="h-11" />
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
