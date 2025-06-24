import FeedbackHapinessLineChart from './components/FeedbackHapinessLineChart'
import LatestAppointmentScrollArea from './components/LatestAppointmentScrollArea'
import LatestStallExpiryScrollArea from './components/LatestStallExpiryScrollArea'
import { NewStartRentalChart } from './components/NewStartRentalChart'
import NewTenantChart from './components/NewTenantChart'
import StallRentalPaymentChart from './components/StallRentalPaymentChart'
import StallUtilitiesChart from './components/StallUtilitiesChart'
import { VacancyChart } from './components/VacancyChart'

export function AdminDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <VacancyChart />
        <LatestStallExpiryScrollArea />
        <LatestAppointmentScrollArea />
        <StallUtilitiesChart />
        <StallRentalPaymentChart />
        <NewStartRentalChart />
        <NewTenantChart />
        <FeedbackHapinessLineChart className="md:col-span-2 xl:col-span-2" />
      </div>
    </div>
  )
}
