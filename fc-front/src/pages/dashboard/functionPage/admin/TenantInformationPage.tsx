import RentalsTable from './components/RentalsTable'

export function TenantInformationPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold">Tenant Information</h1>
        <p className="text-muted-foreground text-sm">
          Manage rental and send email to tenants
        </p>
      </header>
      <RentalsTable />
    </div>
  )
}

export default TenantInformationPage
