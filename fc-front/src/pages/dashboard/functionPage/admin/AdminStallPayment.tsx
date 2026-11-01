import { PageHeader } from '@/components/dashboard/PageHeader'

import StallUtilitiesForm from './components/StallUtilitiesForm'
import StallUtilitiesPaymentTable from './components/StallUtilitiesPaymentTable'

export function AdminStallPayment() {
  return (
    <div className="max-w-page mx-auto flex w-full min-w-0 flex-col gap-8 px-2 lg:px-6">
      <PageHeader
        title="Stall Utilities"
        description="Charge water or electricity to a stall, and see which charges are still unpaid."
      />
      <StallUtilitiesForm />
      <StallUtilitiesPaymentTable />
    </div>
  )
}
