import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import UserAppointmentTable from './components/UserAppointmentTable'

export function UserAppointmentPage() {
  return (
    <Card className="bg-muted/10 mx-auto w-full rounded-lg p-4 shadow-md md:p-6 lg:p-8">
      <CardHeader>
        <CardTitle>User Appointment</CardTitle>
        <CardDescription>
          View your appointment history and status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserAppointmentTable />
      </CardContent>
      <VisuallyHidden>
        <CardFooter></CardFooter>
      </VisuallyHidden>
    </Card>
  )
}
