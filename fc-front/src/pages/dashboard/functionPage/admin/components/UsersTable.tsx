import { GetUsersResponse, fetchUsersQueryOptions } from '@/api/adminApi'
import { useQuery } from '@tanstack/react-query'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { AdminActionButton } from './AdminActionButton'

export default function UsersTable() {
  const { data, error, isLoading } = useQuery<GetUsersResponse>(
    fetchUsersQueryOptions,
  )

  if (isLoading) {
    return <div className="justify-center p-4">Loading...</div>
  }

  if (error) {
    return <div className="justify-center p-4">Error: {error.message}</div>
  }

  const users = data?.users || []

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="overflow-x-auto">
        <Table className="min-w-full table-auto border-separate border-spacing-0">
          <TableCaption>A list of all your users.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left"></TableHead>
              <TableHead className="text-left">Name</TableHead>
              <TableHead className="text-left">Email</TableHead>
              <TableHead className="text-center">Role</TableHead>
              <TableHead className="text-center">Verified</TableHead>
              <TableHead className="text-left">Phone</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-left">Joined</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      rel="preload"
                      src={user.image}
                      alt={user.name}
                    />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell> {user.name}</TableCell>
                <TableCell> {user.email}</TableCell>
                <TableCell className="text-center"> {user.role}</TableCell>
                <TableCell className="text-center">
                  {user.emailVerified ? 'Yes' : 'No'}
                </TableCell>
                <TableCell> {user.phone ? user.phone : 'null'}</TableCell>
                <TableCell className="text-center">
                  {user.banned ? (
                    <Badge variant="secondary" className="text-destructive">
                      Banned
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-green-600 dark:text-green-300"
                    >
                      Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-center">
                  {user.role === 'admin' ? (
                    ''
                  ) : (
                    <AdminActionButton
                      userId={user.id}
                      userRole={user.role}
                      userBanned={user.banned}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter></TableFooter>
        </Table>
      </div>
    </div>
  )
}
