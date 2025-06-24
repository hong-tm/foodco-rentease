import { useState } from 'react'
import { fetchUsersQueryOptions } from '@/api/adminApi'
import type { GetUsersResponse } from '@/api/adminApi'
import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'
import { useQuery } from '@tanstack/react-query'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function StallUtilitiesPaymentTable() {
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const { data: payments, isLoading } = useQuery(
    getAllPaymentRecordsQueryOptions,
  )
  const { data: usersData } = useQuery<GetUsersResponse>(fetchUsersQueryOptions)

  if (isLoading) {
    return <div>Loading...</div>
  }

  const utilityPayments = payments?.filter(
    (payment) =>
      payment.paymentType === 'water' || payment.paymentType === 'electric',
  )

  const uniqueUsers = [
    ...new Set(utilityPayments?.map((payment) => payment.userId)),
  ]

  const filteredByUser =
    selectedUser === 'all'
      ? utilityPayments
      : utilityPayments?.filter((payment) => payment.userId === selectedUser)

  const filteredPayments =
    selectedType === 'all'
      ? filteredByUser
      : filteredByUser?.filter(
          (payment) => payment.paymentType === selectedType,
        )

  const sortedPayments = filteredPayments?.sort(
    (b, a) =>
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
  )

  const getUserName = (userId: string) => {
    const user = usersData?.users.find((u: { id: string }) => u.id === userId)
    return user?.name || userId
  }

  return (
    <div className="grid grid-cols-1 space-y-4">
      <div className="flex justify-end gap-4 overflow-x-auto">
        <Select
          value={selectedType}
          onValueChange={(value) => setSelectedType(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="water">Water</SelectItem>
            <SelectItem value="electric">Electric</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedUser}
          onValueChange={(value) => setSelectedUser(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {uniqueUsers.map((userId) => (
              <SelectItem key={userId} value={userId}>
                {getUserName(userId)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader className="sticky top-0">
          <TableRow>
            <TableHead>Payment ID</TableHead>
            <TableHead className="text-center">Stall Number</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="text-center">Type</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPayments?.map((payment) => {
            const user = usersData?.users.find(
              (u: { id: string }) => u.id === payment.userId,
            )
            return (
              <TableRow key={payment.paymentId}>
                <TableCell>{payment.paymentId}</TableCell>
                <TableCell className="text-center">{payment.stallId}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.image || ''}
                        alt={getUserName(payment.userId)}
                      />
                      <AvatarFallback>
                        {getUserName(payment.userId)
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span>{getUserName(payment.userId)}</span>
                  </div>
                </TableCell>
                <TableCell>RM {payment.paymentAmount}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="secondary"
                    className={
                      payment.paymentType === 'water'
                        ? 'bg-cyan-100 text-cyan-800'
                        : payment.paymentType === 'electric'
                          ? 'bg-yellow-100 text-yellow-800'
                          : ''
                    }
                  >
                    {payment.paymentType}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={payment.paymentStatus ? 'default' : 'destructive'}
                  >
                    {payment.paymentStatus ? 'Paid' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(payment.paymentDate).toLocaleDateString()}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
