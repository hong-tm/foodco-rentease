import { fetchStallsQueryOptions } from '@/api/stallApi'
import { useQuery } from '@tanstack/react-query'

import { formatDay } from '@/lib/format'

import { InitialsAvatar } from '@/components/dashboard/InitialsAvatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const labelClass =
  'text-muted-foreground text-xs font-medium tracking-widest uppercase'

export default function LatestStallExpiryScrollArea() {
  const { data: stalls } = useQuery({
    ...fetchStallsQueryOptions,
    select: (data) => {
      const currentDate = new Date()
      return {
        ...data,
        stall: data.stall
          .filter((stall) => new Date(stall.endAt) > currentDate)
          .sort(
            (a, b) => new Date(a.endAt).getTime() - new Date(b.endAt).getTime(),
          ),
      }
    },
  })

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Rental Expiry</CardTitle>
        <CardDescription>List of upcoming rental expiry</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className={labelClass}>Tenant</TableHead>
                <TableHead className={labelClass}>Stall</TableHead>
                <TableHead className={labelClass}>Expiry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stalls?.stall.map((stall) => (
                <TableRow key={stall.stallNumber}>
                  <TableCell>
                    <InitialsAvatar
                      name={stall.stallOwnerId?.name ?? 'Unknown'}
                      image={stall.stallOwnerId?.image}
                    />
                  </TableCell>
                  <TableCell className="text-sm font-medium whitespace-nowrap">
                    Stall {stall.stallNumber}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap tabular-nums">
                    {formatDay(stall.endAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
