import { useEffect, useState } from 'react'
import { useSession } from '@/api/adminApi'
import type { PaymentRecord } from '@server/lib/sharedType'
import { useMutation } from '@tanstack/react-query'
import { FileDownIcon } from 'lucide-react'
import { toast } from 'sonner'

import { api } from '@/lib/api'
import { formatDay } from '@/lib/format'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { InitialsAvatar } from '@/components/dashboard/InitialsAvatar'
import { SpecStrip } from '@/components/dashboard/SpecStrip'
import { StatusBadge } from '@/components/dashboard/StatusBadge'

type MonthSelectorProps = {
  value: string
  onValueChange: (value: string) => void
}

function MonthSelector({ value, onValueChange }: MonthSelectorProps) {
  const months = [
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' },
  ]

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]" aria-label="Filter by month">
        <SelectValue placeholder="Filter by month" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Months</SelectLabel>
          <SelectItem value="all">All Months</SelectItem>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

type PaymentRecordsTableProps = {
  title: string
  records: PaymentRecord[]
  showMonthFilter?: boolean
  isLoading: boolean
}

export function PaymentRecordsTable({
  title,
  records,
  showMonthFilter = false,
  isLoading,
}: PaymentRecordsTableProps) {
  const { data: session } = useSession()
  const isRental = session?.user?.role === 'rental'

  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [filteredRecords, setFilteredRecords] = useState<PaymentRecord[]>([])

  useEffect(() => {
    let filtered = [...records]

    // Filter by month if selected
    if (selectedMonth !== 'all') {
      filtered = filtered.filter((record) => {
        const date = new Date(record.paymentDate)
        return date.getMonth() === parseInt(selectedMonth)
      })
    }

    // Filter by payment type if selected
    if (selectedType !== 'all') {
      filtered = filtered.filter(
        (record) => record.paymentType === selectedType,
      )
    }

    // Sort records: rental first, then electric, then water
    filtered.sort((a, b) => {
      const typeOrder = { rental: 0, electric: 1, water: 2 }
      const aOrder = typeOrder[a.paymentType as keyof typeof typeOrder] ?? 3
      const bOrder = typeOrder[b.paymentType as keyof typeof typeOrder] ?? 3
      return aOrder - bOrder
    })

    setFilteredRecords(filtered)
  }, [selectedMonth, selectedType, records])

  const downloadPdfMutation = useMutation({
    mutationFn: async () => {
      const endpoint = isRental ? 'download-rental-pdf' : 'download-pdf'
      const response = await api.payments[endpoint].$get()
      if (!response.ok) throw new Error('Failed to download PDF')
      const arrayBuffer = await response.arrayBuffer()
      return new Blob([arrayBuffer], { type: 'application/pdf' })
    },
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'payment-records.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('PDF downloaded successfully')
    },
    onError: () => {
      toast.error('Failed to download PDF report')
    },
  })

  const downloadCsvMutation = useMutation({
    mutationFn: async () => {
      const endpoint = isRental ? 'download-rental-csv' : 'download-csv'
      const response = await api.payments[endpoint].$get()
      if (!response.ok) throw new Error('Failed to download CSV')
      const arrayBuffer = await response.arrayBuffer()
      return new Blob([arrayBuffer], { type: 'text/csv' })
    },
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'payment-records.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('CSV downloaded successfully')
    },
    onError: () => {
      toast.error('Failed to download CSV report')
    },
  })

  const rm = (value: number) =>
    value.toLocaleString('en-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  const totalAmount = filteredRecords.reduce(
    (sum, record) =>
      sum + (Number.parseFloat(record.paymentAmount ?? '0') || 0),
    0,
  )
  const settledCount = filteredRecords.filter((r) => r.paymentStatus).length
  const pendingCount = filteredRecords.length - settledCount

  if (isLoading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <section aria-label={title} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <SpecStrip
            value={`RM ${rm(totalAmount)}`}
            unit="in this view"
            cells={[
              { label: 'Settled', value: settledCount },
              {
                label: 'Pending',
                value: pendingCount,
                anomaly: pendingCount > 0,
              },
              { label: 'Records', value: filteredRecords.length },
            ]}
          />
        </div>
        <div className="flex gap-2">
          {showMonthFilter && (
            <MonthSelector
              value={selectedMonth}
              onValueChange={setSelectedMonth}
            />
          )}
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[180px]" aria-label="Filter by type">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Payment Type</SelectLabel>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="rental">Rental</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="water">Water</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-border max-w-full min-w-0 overflow-hidden rounded-xl border">
        <Table>
          <TableHeader className="border-border bg-muted/35 border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-left">User</TableHead>
              <TableHead className="text-left">Payment ID</TableHead>
              <TableHead className="text-center">Stall No.</TableHead>
              <TableHead className="text-center">Type</TableHead>
              <TableHead className="text-right">Amount (RM)</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-left">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-10 text-center text-sm whitespace-normal"
                >
                  {records.length === 0
                    ? 'No payment records yet. Payments show up here as soon as one is recorded.'
                    : 'No records match these filters.'}
                </TableCell>
              </TableRow>
            )}
            {filteredRecords.map((record) => (
              <TableRow
                key={record.paymentId}
                className="group/row border-border hover:bg-muted/20"
              >
                <TableCell className="before:bg-foreground relative py-4 pl-6 align-top before:absolute before:inset-y-0 before:left-0 before:w-px before:opacity-0 group-hover/row:before:opacity-100">
                  <div className="flex items-center gap-2">
                    <InitialsAvatar
                      name={record.paymentUser?.name ?? 'Unknown'}
                      image={record.paymentUser?.image}
                    />
                    <span className="text-sm font-medium">
                      {record.paymentUser?.name || 'Unknown User'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4 align-top">
                  <span
                    className="text-muted-foreground font-mono text-xs"
                    title={record.paymentId}
                  >
                    {record.paymentId.length > 8
                      ? `${record.paymentId.slice(0, 8)}…`
                      : record.paymentId}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-center align-top tabular-nums">
                  {record.stallId}
                </TableCell>
                <TableCell className="py-4 align-top">
                  <span className="text-muted-foreground text-sm capitalize">
                    {record.paymentType}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-right align-top tabular-nums">
                  {record.paymentAmount}
                </TableCell>
                <TableCell className="py-4 align-top">
                  <StatusBadge
                    label={record.paymentStatus ? 'Paid' : 'Pending'}
                    tone={record.paymentStatus ? 'settled' : 'action'}
                  />
                </TableCell>
                <TableCell className="py-4 align-top whitespace-nowrap tabular-nums">
                  {formatDay(record.paymentDate as unknown as Date)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-4">
        {session?.user?.role !== 'user' && (
          <>
            <Button
              variant="outline"
              onClick={() => downloadPdfMutation.mutate()}
              disabled={downloadPdfMutation.isPending}
            >
              <FileDownIcon className="mr-2 h-4 w-4" />
              {downloadPdfMutation.isPending
                ? 'Downloading...'
                : 'Download PDF'}
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadCsvMutation.mutate()}
              disabled={downloadCsvMutation.isPending}
            >
              <FileDownIcon className="mr-2 h-4 w-4" />
              {downloadCsvMutation.isPending
                ? 'Downloading...'
                : 'Download CSV'}
            </Button>
          </>
        )}
      </div>
    </section>
  )
}
