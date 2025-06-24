import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import StallUtilitiesDetails from './components/StallUtilitiesDetails'

export function RentalStallUtilitiesPage() {
  return (
    <Card className="bg-muted/10 mx-auto w-full rounded-lg p-4 shadow-md md:p-6 lg:p-8">
      <CardHeader>
        <CardTitle>Stall Utilities</CardTitle>
        <CardDescription>
          Monitor the utilities of stalls in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StallUtilitiesDetails />
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}
