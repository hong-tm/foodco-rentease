import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { AuroraBackground } from '@/components/ui/aurora-background'
import { Button } from '@/components/ui/button'

export function EmailVerifiedPage() {
  const navigate = useNavigate()

  return (
    <div>
      <AuroraBackground className="-z-15">
        <div className="z-10 flex h-screen w-full flex-col items-center justify-center gap-4 text-center">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-6xl">
            Email Verified !
          </h1>
          <p className="leading-7 not-first:mt-6">
            Your email has been verified. You can now login to your account.
          </p>

          <div className="mt-4 flex flex-col gap-4">
            <Button
              variant="default"
              onClick={() => navigate('/', { replace: true })}
            >
              <ChevronLeft />
              Login Page
            </Button>
          </div>
        </div>
      </AuroraBackground>
    </div>
  )
}
