import { useState } from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import AdminAppointmentTable from './components/AdminAppointmentTable'

export function AdminAppointmentPage() {
  const [selectedMonth, setSelectedMonth] = useState('all')

  const months = [
    { value: 'all', label: 'All Months' },
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
    <Card className="bg-muted/10 mx-auto w-full rounded-lg p-4 shadow-md md:p-6 lg:p-8">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Appointment</CardTitle>
            <CardDescription>
              View your appointment history and status
            </CardDescription>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <AdminAppointmentTable selectedMonth={selectedMonth} />
      </CardContent>
      <VisuallyHidden>
        <CardFooter></CardFooter>
      </VisuallyHidden>
    </Card>
  )
}
