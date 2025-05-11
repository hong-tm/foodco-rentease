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
    <Card className="mx-auto w-full bg-muted/10 p-4 md:p-6 lg:p-8 rounded-lg shadow-md">
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
