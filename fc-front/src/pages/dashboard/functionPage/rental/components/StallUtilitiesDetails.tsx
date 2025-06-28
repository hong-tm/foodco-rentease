import { useState } from 'react'
import { useSession } from '@/api/adminApi'
import {
  createPaymentIntent,
  getAllPaymentRecordsQueryOptions,
} from '@/api/paymentApi'
import { fetchStallCurrentQueryOptions } from '@/api/stallApi'
import { useQuery } from '@tanstack/react-query'
import { DropletIcon, HomeIcon, Loader2Icon, ZapIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import PaymentModal from '@/components/PaymentModal'

export default function StallUtilitiesDetails() {
  const { data: session, isLoading: isSessionLoading } = useSession()
  const userId = session?.user?.id

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<{
    type: string
    amount: number
    stallId: number
    paymentId?: string
  } | null>(null)
  const [clientSecret, setClientSecret] = useState('')

  const {
    data: stallData,
    isLoading: isStallLoading,
    error: stallError,
  } = useQuery(fetchStallCurrentQueryOptions(userId || ''))

  const {
    data: paymentRecords,
    isLoading: isPaymentLoading,
    error: paymentError,
  } = useQuery(getAllPaymentRecordsQueryOptions)

  const handlePayment = async (
    type: string,
    amount: number,
    stallId: number,
    paymentId: string,
  ) => {
    if (!userId) return

    try {
      const response = await createPaymentIntent(amount, stallId, userId)
      setClientSecret(response.clientSecret)
      setSelectedPayment({ type, amount, stallId, paymentId })
      setIsPaymentModalOpen(true)
    } catch (error) {
      console.error('Error creating payment intent:', error)
    }
  }

  if (isSessionLoading || isStallLoading || isPaymentLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">
          Please log in to view your stalls.
        </p>
      </div>
    )
  }

  if (stallError || paymentError) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-destructive">
          Error loading data. Please try again later.
        </p>
      </div>
    )
  }

  if (!stallData?.stalls || stallData.stalls.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">No stalls found.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stallData.stalls.map((stall) => {
          const waterPayments =
            paymentRecords?.filter(
              (payment) =>
                payment.stallId === stall.stallNumber &&
                payment.paymentType === 'water',
            ) || []
          const electricPayments =
            paymentRecords?.filter(
              (payment) =>
                payment.stallId === stall.stallNumber &&
                payment.paymentType === 'electric',
            ) || []
          const rentalPayments =
            paymentRecords?.filter(
              (payment) =>
                payment.stallId === stall.stallNumber &&
                payment.paymentType === 'rental',
            ) || []

          const latestWaterPayment = waterPayments[0]
          const latestElectricPayment = electricPayments[0]
          const latestRentalPayment = rentalPayments[0]

          const waterAmount = latestWaterPayment?.paymentAmount
            ? parseFloat(latestWaterPayment.paymentAmount)
            : 0
          const electricAmount = latestElectricPayment?.paymentAmount
            ? parseFloat(latestElectricPayment.paymentAmount)
            : 0
          const rentalAmount =
            stall.stallTierNumber?.tierPrice && stall.stallSize
              ? (typeof stall.stallTierNumber.tierPrice === 'string'
                  ? parseFloat(stall.stallTierNumber.tierPrice)
                  : stall.stallTierNumber.tierPrice) *
                (typeof stall.stallSize === 'string'
                  ? parseFloat(stall.stallSize)
                  : stall.stallSize)
              : 0

          return (
            <Card
              key={stall.stallNumber}
              className="w-full border-none shadow-none"
            >
              <CardHeader>
                <CardTitle className="flex">
                  <CardDescription></CardDescription>
                  <Badge variant="secondary">Stall #{stall.stallNumber}</Badge>
                  <span className="text-muted-foreground text-sm font-normal">
                    {stall.stallName}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 space-y-3 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DropletIcon className="h-4 w-4 text-blue-500" />
                      <div className="flex flex-col">
                        <span>Water Bill</span>
                        <span className="text-muted-foreground text-sm">
                          {latestWaterPayment
                            ? latestWaterPayment.paymentStatus
                              ? 'Paid on ' +
                                new Date(
                                  latestWaterPayment.paymentDate,
                                ).toLocaleDateString()
                              : 'Payment pending'
                            : 'No bill yet'}
                        </span>
                      </div>
                    </div>
                    <span className="font-semibold">
                      {waterAmount > 0 ? `RM ${waterAmount.toFixed(2)}` : '-'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ZapIcon className="h-4 w-4 text-yellow-500" />
                      <div className="flex flex-col">
                        <span>Electric Bill</span>
                        <span className="text-muted-foreground text-sm">
                          {latestElectricPayment
                            ? latestElectricPayment.paymentStatus
                              ? 'Paid on ' +
                                new Date(
                                  latestElectricPayment.paymentDate,
                                ).toLocaleDateString()
                              : 'Payment pending'
                            : 'No bill yet'}
                        </span>
                      </div>
                    </div>
                    <span className="font-semibold">
                      {electricAmount > 0
                        ? `RM ${electricAmount.toFixed(2)}`
                        : '-'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <HomeIcon className="h-4 w-4 text-green-500" />
                      <div className="flex flex-col">
                        <span>Rental Fee</span>
                        <span className="text-muted-foreground text-sm">
                          {latestRentalPayment
                            ? latestRentalPayment.paymentStatus
                              ? 'Paid on ' +
                                new Date(
                                  latestRentalPayment.paymentDate,
                                ).toLocaleDateString()
                              : 'Payment pending'
                            : `Monthly rental (${stall.stallSize} m²)`}
                        </span>
                      </div>
                    </div>
                    <span className="font-semibold">
                      {stall.stallTierNumber?.tierPrice
                        ? `RM ${rentalAmount.toFixed(2)}`
                        : '-'}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  onClick={() =>
                    handlePayment(
                      'water',
                      waterAmount,
                      stall.stallNumber,
                      latestWaterPayment?.paymentId || '',
                    )
                  }
                  className="w-full"
                  disabled={!waterAmount || latestWaterPayment?.paymentStatus}
                  variant={
                    latestWaterPayment?.paymentStatus ? 'outline' : 'default'
                  }
                >
                  {!waterAmount ? (
                    'No Water Bill'
                  ) : latestWaterPayment?.paymentStatus ? (
                    'Water Bill Paid'
                  ) : (
                    <>
                      Pay
                      <DropletIcon className="h-4 w-4 text-blue-500" />
                    </>
                  )}
                </Button>
                <Button
                  onClick={() =>
                    handlePayment(
                      'electric',
                      electricAmount,
                      stall.stallNumber,
                      latestElectricPayment?.paymentId || '',
                    )
                  }
                  className="w-full"
                  disabled={
                    !electricAmount || latestElectricPayment?.paymentStatus
                  }
                  variant={
                    latestElectricPayment?.paymentStatus ? 'outline' : 'default'
                  }
                >
                  {!electricAmount ? (
                    'No Electric Bill'
                  ) : latestElectricPayment?.paymentStatus ? (
                    'Electric Bill Paid'
                  ) : (
                    <>
                      Pay
                      <ZapIcon className="h-4 w-4 text-yellow-500" />
                    </>
                  )}
                </Button>
                <Button
                  onClick={() =>
                    handlePayment(
                      'rental',
                      rentalAmount,
                      stall.stallNumber,
                      latestRentalPayment?.paymentId || '',
                    )
                  }
                  className="w-full"
                  disabled={
                    !stall.stallTierNumber?.tierPrice ||
                    latestRentalPayment?.paymentStatus
                  }
                  variant={
                    latestRentalPayment?.paymentStatus ? 'outline' : 'default'
                  }
                >
                  {!stall.stallTierNumber?.tierPrice ? (
                    'No Rental Fee Set'
                  ) : latestRentalPayment?.paymentStatus ? (
                    'Rental Fee Paid'
                  ) : (
                    <>
                      Pay
                      <HomeIcon className="h-4 w-4 text-green-500" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {selectedPayment && clientSecret && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          clientSecret={clientSecret}
          amount={selectedPayment.amount}
          stallId={selectedPayment.stallId}
          userId={userId || ''}
          paymentType={selectedPayment.type}
          originalPaymentId={selectedPayment.paymentId}
        />
      )}
    </div>
  )
}
