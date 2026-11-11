import { useState } from 'react'
import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'
import { PageHeader } from '@/pages/dashboard/components/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { isSameMonth } from 'date-fns'
import { PlusIcon } from 'lucide-react'

import { formatRM } from '@/lib/format'

import { Button } from '@/components/ui/button'
import { StatStrip } from '@/components/ui/panel-parts'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import StallUtilitiesForm from './components/StallUtilitiesForm'
import StallUtilitiesPaymentTable from './components/StallUtilitiesPaymentTable'

export function AdminStallPayment() {
  const [open, setOpen] = useState(false)
  const { data } = useQuery(getAllPaymentRecordsQueryOptions)
  const bills = (data ?? []).filter(
    (payment) =>
      payment.paymentType === 'water' || payment.paymentType === 'electric',
  )
  const total = (items: typeof bills) =>
    items.reduce((sum, payment) => sum + Number(payment.paymentAmount), 0)
  const unpaid = bills.filter((payment) => !payment.paymentStatus)
  const paid = bills.filter((payment) => payment.paymentStatus)
  const latest = paid.reduce<Date | null>((newest, payment) => {
    const date = new Date(payment.paymentDate)
    return !newest || date > newest ? date : newest
  }, null)
  const paidLatest = latest
    ? paid.filter((payment) =>
        isSameMonth(new Date(payment.paymentDate), latest),
      )
    : []

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader
        title="Utilities"
        actions={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button className="max-md:h-11 max-md:w-full">
                <PlusIcon />
                New bill
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>New bill</SheetTitle>
                <SheetDescription>
                  The stall's tenant sees it as a pending payment.
                </SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-4">
                <StallUtilitiesForm onDone={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        }
      >
        Water and electric bills for each stall.
      </PageHeader>
      <StatStrip
        stats={[
          {
            label: 'Unpaid',
            value: formatRM(total(unpaid)),
            note: `${unpaid.length} bill${unpaid.length === 1 ? '' : 's'} waiting`,
            tone: unpaid.length ? 'negative' : undefined,
          },
          {
            label: 'Paid, latest month',
            value: formatRM(total(paidLatest)),
            note: `${paidLatest.length} bill${paidLatest.length === 1 ? '' : 's'}`,
          },
          {
            label: 'All bills',
            value: bills.length,
            note: `${paid.length} paid`,
          },
        ]}
      />
      <StallUtilitiesPaymentTable />
    </div>
  )
}
