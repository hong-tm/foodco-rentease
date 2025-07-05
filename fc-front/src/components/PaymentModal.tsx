import { useEffect, useState } from 'react'
import {
  createPaymentRecord,
  paymentsQueryKey,
  stripePromise,
  updatePaymentStatus,
} from '@/api/paymentApi'
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { StripeElementsOptions } from '@stripe/stripe-js'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useIsMobile } from '@/hooks/use-mobile'

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

type CheckoutFormProps = {
  amount: number
  stallId: number
  userId: string
  paymentType: string
  originalPaymentId?: string
  onClose: () => void
}

const CheckoutForm = ({
  amount,
  stallId,
  userId,
  paymentType,
  originalPaymentId,
  onClose,
}: CheckoutFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<
    'pending' | 'processing' | 'success' | 'failed'
  >('pending')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const paymentMutation = useMutation({
    mutationFn: async (paymentData: { paymentId: string }) => {
      if (originalPaymentId) {
        // For utility payments, update existing record
        await updatePaymentStatus({
          paymentId: originalPaymentId,
          newPaymentId: paymentData.paymentId,
          paymentStatus: true,
        })
      } else {
        // For rental payments, create new record
        const createResult = await createPaymentRecord({
          paymentId: paymentData.paymentId,
          stallId: stallId,
          userId: userId,
          paymentAmount: amount.toString(),
          paymentType: paymentType,
          paymentStatus: true,
          paymentDate: new Date().toISOString(),
        })
        console.log('Create payment result:', createResult)
        return createResult
      }
    },
    onSuccess: (data) => {
      console.log('Payment mutation success:', data)
      if (!originalPaymentId) {
        // For rental payments, navigate to success page
        navigate(
          `/dashboard/payment-success?payment_id=${
            data?.paymentId || ''
          }&stall_id=${stallId}`,
        )
      } else {
        // For utility payments, just show toast and close modal
        toast.success('Payment successful and record saved!')
        if (typeof onClose === 'function') {
          onClose()
        }
      }
      queryClient.invalidateQueries({ queryKey: paymentsQueryKey.record() })
    },
    onError: (error: Error) => {
      console.error('Payment mutation error:', error)
      toast.error(
        error.message ||
          'Failed to save payment record. Please contact support.',
      )
    },
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      setErrorMessage('Stripe has not been initialized')
      return
    }

    setPaymentStatus('processing')
    setErrorMessage(null)

    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/payment-success`,
        },
      })

      if (result.error) {
        console.error('Stripe payment error:', result.error)
        setErrorMessage(result.error.message ?? 'An unknown error occurred')
        setPaymentStatus('failed')
        toast.error(result.error.message ?? 'Payment failed')
      } else if (
        result.paymentIntent &&
        result.paymentIntent.status === 'succeeded'
      ) {
        console.log('Stripe payment success:', result.paymentIntent)
        setPaymentStatus('success')

        try {
          await paymentMutation.mutateAsync({
            paymentId: result.paymentIntent.id,
          })
        } catch (mutationError) {
          console.error('Payment mutation error:', mutationError)
          setErrorMessage('Failed to save payment record')
          setPaymentStatus('failed')
        }
      }
    } catch (error) {
      console.error('Payment submission error:', error)
      setErrorMessage('An unexpected error occurred')
      setPaymentStatus('failed')
      toast.error('Payment failed')
    }
  }

  const getButtonText = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Processing...'
      case 'success':
        return 'Payment Successful!'
      case 'failed':
        return 'Try Again'
      default:
        return 'Pay Now'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 text-lg font-semibold">
        Amount to pay: RM{amount.toFixed(2)}
      </div>
      <PaymentElement />
      {errorMessage && (
        <div className="mt-2 text-sm text-red-500">{errorMessage}</div>
      )}
      <div className="mt-4">
        <Button
          type="submit"
          className={`w-full ${
            paymentStatus === 'success'
              ? 'bg-green-500 text-white hover:bg-green-600'
              : ''
          }`}
          disabled={
            !stripe ||
            paymentStatus === 'processing' ||
            paymentStatus === 'success'
          }
          variant={paymentStatus === 'success' ? 'secondary' : 'default'}
        >
          {getButtonText()}
        </Button>
      </div>
    </form>
  )
}

type PaymentModalProps = {
  isOpen: boolean
  onClose: () => void
  clientSecret: string
  amount: number
  stallId: number
  userId: string
  paymentType: string
  originalPaymentId?: string
}

export default function PaymentModal({
  isOpen,
  onClose,
  clientSecret,
  amount,
  stallId,
  userId,
  paymentType,
  originalPaymentId,
}: PaymentModalProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (clientSecret) {
      setReady(true)
    }
  }, [clientSecret])

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0F172A',
      },
    },
  }

  const isMobile = useIsMobile()

  if (!ready) return null

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Payment Details</DrawerTitle>
            <DrawerDescription>Payment for Stall #{stallId}</DrawerDescription>
          </DrawerHeader>
          <div className="mx-6 mb-2 flex flex-col gap-4">
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm
                amount={amount}
                stallId={stallId}
                userId={userId}
                paymentType={paymentType}
                originalPaymentId={originalPaymentId}
                onClose={onClose}
              />
            </Elements>
          </div>
          <DrawerFooter className="pt-0">
            <DrawerClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>Payment for Stall #{stallId}</DialogDescription>
        </DialogHeader>
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm
            amount={amount}
            stallId={stallId}
            userId={userId}
            paymentType={paymentType}
            originalPaymentId={originalPaymentId}
            onClose={onClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  )
}
