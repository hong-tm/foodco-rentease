import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircleIcon } from 'lucide-react'

export function PaymentSuccessPage() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto mt-20 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
            Payment Successful
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Your payment has been processed successfully. Thank you for your
            payment!
          </p>
          <div className="flex justify-center">
            <Button onClick={() => navigate('/dashboard/user-appointment')}>
              Return to Appointments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
