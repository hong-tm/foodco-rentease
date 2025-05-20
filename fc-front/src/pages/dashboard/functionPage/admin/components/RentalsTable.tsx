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
import { TenantActionButton } from './TenantActionButton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useQuery } from '@tanstack/react-query'
import { fetchRentalsQueryOptions } from '@/api/adminApi'

export default function RentalsTable() {
  const { data, error, isLoading } = useQuery(fetchRentalsQueryOptions)

  if (isLoading) {
    return <div className="justify-center p-4">Loading...</div>
  }

  if (error) {
    return <div className="justify-center p-4">Error: {error.message}</div>
  }

  const { user: users } = data || { user: [] }

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>A list of your current rentals.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Phone</TableHead>
              <TableHead className="text-center">Stall No</TableHead>
              <TableHead className="text-center">Stall Name</TableHead>
              <TableHead>Stall Size</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) =>
              user.stalls.map((stall) => (
                <TableRow key={`${user.id}-${stall.stallNumber}`}>
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
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-center">
                    {user.phone ? user.phone : 'N/A'}
                  </TableCell>
                  <TableCell className="text-center">
                    {stall.stallNumber}
                  </TableCell>
                  <TableCell className="text-center">
                    {stall.stallName}
                  </TableCell>
                  <TableCell>{stall.stallSize} m²</TableCell>
                  <TableCell>
                    {stall.startAt
                      ? new Date(stall.startAt).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {stall.endAt ? (
                      <span
                        className={
                          new Date(stall.endAt).getTime() -
                            new Date().getTime() <=
                          7 * 24 * 60 * 60 * 1000
                            ? 'text-destructive font-bold'
                            : ''
                        }
                      >
                        {new Date(stall.endAt).toLocaleDateString()}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {user.role === 'admin' ? (
                      ''
                    ) : (
                      <TenantActionButton
                        userName={user.name}
                        userEmail={user.email}
                        userStallId={stall.stallNumber}
                        userStallName={stall.stallName}
                        stallEndAt={stall.endAt}
                      />
                    )}
                  </TableCell>
                </TableRow>
              )),
            )}
          </TableBody>
          <TableFooter></TableFooter>
        </Table>
      </div>
    </div>
  )
}
