import RentalsTable from './components/RentalsTable'

export function TenantInformationPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] min-w-0 flex-col gap-8 px-2 lg:px-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Tenant Information
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage rental and send email to tenants
        </p>
      </header>
      <RentalsTable />
    </div>
  )
}

export default TenantInformationPage
