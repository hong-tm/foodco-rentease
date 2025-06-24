import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import UsersTable from './components/UsersTable'

export function AdminManage() {
  return (
    <Card className="bg-muted/10 mx-auto w-full rounded-lg p-4 shadow-md md:p-6 lg:p-8">
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
        <CardDescription>
          Manage users and view system statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UsersTable />
      </CardContent>
      <VisuallyHidden>
        <CardFooter></CardFooter>
      </VisuallyHidden>
    </Card>
  )
}
