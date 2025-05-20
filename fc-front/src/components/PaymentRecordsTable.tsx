import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { PaymentRecord } from '@server/lib/sharedType'
import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useSession } from '@/api/adminApi'

interface MonthSelectorProps {
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
      <SelectTrigger className="w-[180px]">
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

interface PaymentRecordsTableProps {
  title: string
  description: string
  records: PaymentRecord[]
  showMonthFilter?: boolean
  isLoading: boolean
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

  if (isLoading) {
    return <div>Loading payment records...</div>
  }

  if (!records || records.length === 0) {
    return (
      <Card className="bg-muted/10 mx-auto w-full rounded-lg p-4 shadow-md md:p-6 lg:p-8">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No record</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="overflow-x-auto">
        <Card className="bg-muted/10 mx-auto w-full rounded-lg p-4 shadow-md md:p-6 lg:p-8">
          <CardHeader className="flex flex-col items-center justify-between sm:flex-row">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <div className="flex gap-4">
              {showMonthFilter && (
                <MonthSelector
                  value={selectedMonth}
                  onValueChange={setSelectedMonth}
                />
              )}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
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
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader className="bg-background sticky top-0">
                <TableRow>
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
                {filteredRecords.map((record) => (
                  <TableRow key={record.paymentId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={record.paymentUser?.image || undefined}
                            alt={record.paymentUser?.name || 'User'}
                          />
                          <AvatarFallback>
                            {record.paymentUser?.name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {record.paymentUser?.name || 'Unknown User'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-left">
                      {record.paymentId}
                    </TableCell>
                    <TableCell className="text-center">
                      {record.stallId}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={`${
                          record.paymentType === 'rental'
                            ? 'bg-blue-100 text-blue-800'
                            : record.paymentType === 'electric'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-cyan-100 text-cyan-800'
                        }`}
                      >
                        {record.paymentType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {record.paymentAmount}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={`${
                          record.paymentStatus
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {record.paymentStatus ? 'Paid' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-left">
                      {typeof record.paymentDate === 'object'
                        ? record.paymentDate.toLocaleDateString()
                        : new Date(record.paymentDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>

          <CardFooter className="flex justify-end gap-4">
            {session?.user?.role !== 'user' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => downloadPdfMutation.mutate()}
                  disabled={downloadPdfMutation.isPending}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  {downloadPdfMutation.isPending
                    ? 'Downloading...'
                    : 'Download PDF'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadCsvMutation.mutate()}
                  disabled={downloadCsvMutation.isPending}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  {downloadCsvMutation.isPending
                    ? 'Downloading...'
                    : 'Download CSV'}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
