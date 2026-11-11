import { useMemo, useState } from 'react'
import { useSession } from '@/api/adminApi'
import { PageHeader } from '@/pages/dashboard/components/PageHeader'
import { PaymentType } from '@/pages/dashboard/components/PaymentType'
import { ColumnChart } from '@/pages/dashboard/functionPage/admin/components/ColumnChart'
import type { PaymentRecord } from '@server/lib/sharedType'
import { useMutation } from '@tanstack/react-query'
import { format, parse } from 'date-fns'
import { FileDownIcon } from 'lucide-react'
import { toast } from 'sonner'

import { api } from '@/lib/api'
import { formatDate, formatRM } from '@/lib/format'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Panel,
  PanelEmpty,
  PanelHeader,
  PanelRowsSkeleton,
} from '@/components/ui/panel'
import {
  CountTabs,
  PanelToolbar,
  SearchField,
  StatStrip,
  TablePager,
  TablePanel,
  usePager,
} from '@/components/ui/panel-parts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PersonAvatar } from '@/components/person-avatar'

type PaymentRecordsTableProps = {
  title: string
  description: string
  records: PaymentRecord[]
  showMonthFilter?: boolean
  isLoading: boolean
}

const monthKey = (date: string | Date) => format(new Date(date), 'yyyy-MM')
const amountOf = (record: PaymentRecord) => Number(record.paymentAmount)
const sumOf = (items: PaymentRecord[]) =>
  items.reduce((sum, record) => sum + amountOf(record), 0)

function saveBlob(blob: Blob, name: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', name)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export function PaymentRecordsTable({
  title,
  description,
  records,
  showMonthFilter = false,
  isLoading,
}: PaymentRecordsTableProps) {
  const { data: session } = useSession()
  const isRental = session?.user?.role === 'rental'

  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'unpaid' | 'paid'
  >('all')

  const months = useMemo(
    () => [...new Set(records.map((r) => monthKey(r.paymentDate)))].sort(),
    [records],
  )
  const query = search.trim().toLowerCase()
  const matchesSearch = (record: (typeof records)[number]) =>
    !query ||
    Boolean(record.paymentUser?.name?.toLowerCase().includes(query)) ||
    String(record.stallId).includes(query) ||
    record.paymentId.toLowerCase().includes(query)
  const ofType = records.filter(
    (record) => selectedType === 'all' || record.paymentType === selectedType,
  )
  const inScope = ofType.filter(
    (record) =>
      selectedMonth === 'all' || monthKey(record.paymentDate) === selectedMonth,
  )
  // Tab counts answer "what is in this view right now": month and search apply.
  const inView = records.filter(
    (record) =>
      (selectedMonth === 'all' ||
        monthKey(record.paymentDate) === selectedMonth) &&
      (selectedStatus === 'all' ||
        record.paymentStatus === (selectedStatus === 'paid')) &&
      matchesSearch(record),
  )
  const rows = inView
    .filter(
      (record) => selectedType === 'all' || record.paymentType === selectedType,
    )
    .sort(
      (a, b) =>
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
    )
  const pager = usePager(
    rows,
    15,
    `${selectedMonth}|${selectedType}|${selectedStatus}|${query}`,
  )

  const paid = inScope.filter((record) => record.paymentStatus)
  const pending = inScope.filter((record) => !record.paymentStatus)
  const chart = months.map((key) => ({
    label: format(parse(key, 'yyyy-MM', new Date()), 'MMM'),
    key,
    paid: sumOf(
      ofType.filter(
        (record) =>
          record.paymentStatus && monthKey(record.paymentDate) === key,
      ),
    ),
  }))
  const scopeLabel =
    selectedMonth === 'all'
      ? 'all months'
      : format(parse(selectedMonth, 'yyyy-MM', new Date()), 'MMMM yyyy')

  const downloadPdfMutation = useMutation({
    mutationFn: async () => {
      const endpoint = isRental ? 'download-rental-pdf' : 'download-pdf'
      const response = await api.payments[endpoint].$get()
      if (!response.ok) throw new Error('Failed to download PDF')
      const arrayBuffer = await response.arrayBuffer()
      return new Blob([arrayBuffer], { type: 'application/pdf' })
    },
    onSuccess: (data) => {
      saveBlob(data, 'payment-records.pdf')
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
      saveBlob(data, 'payment-records.csv')
      toast.success('CSV downloaded successfully')
    },
    onError: () => {
      toast.error('Failed to download CSV report')
    },
  })

  const canExport = session?.user?.role !== 'user' && records.length > 0

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader
        title={title}
        actions={
          canExport ? (
            <ButtonGroup
              aria-label="Export all records"
              className="max-md:w-full"
            >
              <Button
                variant="outline"
                title="Downloads every record as a PDF"
                className="max-md:h-11 max-md:flex-1"
                onClick={() => downloadPdfMutation.mutate()}
                disabled={downloadPdfMutation.isPending}
              >
                {downloadPdfMutation.isPending ? <Spinner /> : <FileDownIcon />}
                Export PDF
              </Button>
              <Button
                variant="outline"
                title="Downloads every record as a CSV"
                className="max-md:h-11 max-md:flex-1"
                onClick={() => downloadCsvMutation.mutate()}
                disabled={downloadCsvMutation.isPending}
              >
                {downloadCsvMutation.isPending ? <Spinner /> : <FileDownIcon />}
                Export CSV
              </Button>
            </ButtonGroup>
          ) : null
        }
      >
        {description}
      </PageHeader>

      {isLoading ? (
        <Panel>
          <PanelRowsSkeleton rows={6} />
        </Panel>
      ) : null}

      {!isLoading && records.length === 0 ? (
        <Panel>
          <PanelEmpty>No payment records yet.</PanelEmpty>
        </Panel>
      ) : null}

      {!isLoading && records.length > 0 ? (
        <>
          <StatStrip
            stats={[
              {
                label: 'Collected',
                value: formatRM(sumOf(paid)),
                note: `${paid.length} payments, ${scopeLabel}`,
              },
              {
                label: 'Outstanding',
                value: formatRM(sumOf(pending)),
                note: `${pending.length} unpaid, ${scopeLabel}`,
                tone: pending.length ? 'negative' : undefined,
                selected: selectedStatus === 'unpaid',
                onSelect: pending.length
                  ? () => {
                      setSelectedStatus(
                        selectedStatus === 'unpaid' ? 'all' : 'unpaid',
                      )
                      document
                        .getElementById('payment-records')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  : undefined,
              },
              {
                label: 'Rent',
                value: formatRM(
                  sumOf(paid.filter((r) => r.paymentType === 'rental')),
                ),
                note: 'Collected',
              },
              {
                label: 'Utilities',
                value: formatRM(
                  sumOf(paid.filter((r) => r.paymentType !== 'rental')),
                ),
                note: 'Collected, electric and water',
              },
            ]}
          />

          {chart.length > 1 ? (
            <Panel>
              <PanelHeader
                title="Collected by month"
                meta={
                  showMonthFilter
                    ? 'Select a month to filter the figures and the records'
                    : 'Paid records'
                }
                action={
                  selectedMonth !== 'all' ? (
                    <Button
                      variant="quiet"
                      onClick={() => setSelectedMonth('all')}
                    >
                      Show all months
                    </Button>
                  ) : null
                }
              />
              <ColumnChart
                data={chart}
                series={[
                  { key: 'paid', label: 'Collected', color: 'var(--chart-1)' },
                ]}
                colorOf={(point) =>
                  selectedMonth === 'all' || point.key === selectedMonth
                    ? 'var(--chart-1)'
                    : 'var(--chart-1-soft)'
                }
                onSelect={
                  showMonthFilter
                    ? (point) =>
                        setSelectedMonth(
                          point.key === selectedMonth ? 'all' : point.key,
                        )
                    : undefined
                }
                formatTick={(value) =>
                  value >= 1000 ? `${value / 1000}k` : String(value)
                }
                formatValue={formatRM}
                height={176}
              />
            </Panel>
          ) : null}

          <TablePanel id="payment-records" className="scroll-mt-16">
            <PanelToolbar>
              <CountTabs
                label="Filter by payment type"
                value={selectedType}
                onChange={setSelectedType}
                tabs={[
                  { value: 'all', label: 'All', count: inView.length },
                  ...['rental', 'electric', 'water'].map((type) => ({
                    value: type,
                    label:
                      type === 'rental'
                        ? 'Rent'
                        : type === 'electric'
                          ? 'Electric'
                          : 'Water',
                    count: inView.filter((r) => r.paymentType === type).length,
                  })),
                ]}
              />
              <div className="flex flex-wrap items-center gap-2 max-md:w-full md:ml-auto">
                {showMonthFilter ? (
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger
                      aria-label="Filter by month"
                      className="w-40 max-md:h-11 max-md:w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All months</SelectItem>
                      {[...months].reverse().map((key) => (
                        <SelectItem key={key} value={key}>
                          {format(
                            parse(key, 'yyyy-MM', new Date()),
                            'MMMM yyyy',
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
                <Select
                  value={selectedStatus}
                  onValueChange={(value) =>
                    setSelectedStatus(value as typeof selectedStatus)
                  }
                >
                  <SelectTrigger
                    aria-label="Filter by status"
                    className="w-32 max-md:h-11 max-md:w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any status</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
                <SearchField
                  value={search}
                  onChange={setSearch}
                  placeholder="Search name, stall or ID"
                  label="Search records"
                  className="md:w-56"
                />
              </div>
            </PanelToolbar>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="max-md:hidden">Date</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead className="max-md:hidden">Stall</TableHead>
                  <TableHead className="max-md:hidden">Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="max-md:hidden">Status</TableHead>
                  <TableHead className="max-md:hidden">Payment ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pager.rows.map((record) => (
                  <TableRow key={record.paymentId}>
                    <TableCell className="text-muted-foreground whitespace-nowrap max-md:hidden">
                      {formatDate(record.paymentDate)}
                    </TableCell>
                    <TableCell className="max-md:w-full max-md:max-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <PersonAvatar
                          id={record.userId}
                          name={record.paymentUser?.name}
                          image={record.paymentUser?.image}
                          className="size-6"
                        />
                        <span className="truncate">
                          {record.paymentUser?.name || 'Unknown user'}
                        </span>
                      </div>
                      <p className="type-meta text-muted-foreground mt-1 truncate md:hidden">
                        {formatDate(record.paymentDate)} · Stall{' '}
                        {record.stallId} ·{' '}
                        {record.paymentType === 'rental' ? (
                          'Rent'
                        ) : (
                          <PaymentType type={record.paymentType} />
                        )}
                      </p>
                    </TableCell>
                    <TableCell className="tabular-nums max-md:hidden">
                      {record.stallId}
                    </TableCell>
                    <TableCell className="max-md:hidden">
                      <PaymentType type={record.paymentType} />
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatRM(amountOf(record))}
                      {record.paymentStatus ? null : (
                        <div className="mt-1 md:hidden">
                          <Badge variant="warning">Unpaid</Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-md:hidden">
                      {record.paymentStatus ? (
                        <span className="text-muted-foreground">Paid</span>
                      ) : (
                        <Badge variant="warning">Unpaid</Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className="type-id text-muted-foreground max-w-40 truncate max-md:hidden"
                      title={record.paymentId}
                    >
                      {record.paymentId}
                    </TableCell>
                  </TableRow>
                ))}
                {pager.total === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="type-body text-muted-foreground py-8 text-center"
                    >
                      No records match these filters.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
            <TablePager pager={pager} noun="records" />
          </TablePanel>
        </>
      ) : null}
    </div>
  )
}
