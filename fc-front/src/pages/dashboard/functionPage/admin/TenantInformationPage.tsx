import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import RentalsTable from './components/RentalsTable'

export function TenantInformationPage() {
  return (
    <Card className="bg-muted/10 mx-auto w-full rounded-lg p-4 shadow-md md:p-6 lg:p-8">
      <CardHeader>
        <CardTitle>Tenant Information</CardTitle>
        <CardDescription>
          Manage rental and send email to tenants
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RentalsTable />
      </CardContent>
      <VisuallyHidden>
        <CardFooter></CardFooter>
      </VisuallyHidden>
    </Card>
  )
}
