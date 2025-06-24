import { ChevronLeft, Undo2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { AuroraBackground } from '@/components/ui/aurora-background'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div>
      <AuroraBackground className="-z-15">
        <div className="z-10 flex h-screen w-full flex-col items-center justify-center gap-4 text-center">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-6xl">
            (；´д｀)ゞ 404
          </h1>
          <p className="leading-7 not-first:mt-6">
            Sorry, the page you are looking for does not exist.
          </p>

          <div className="mt-4 flex flex-col gap-4">
            <Button variant="default" onClick={() => navigate(-1)}>
              <Undo2 />
              Previous Page
            </Button>
            <Button
              variant="secondary"
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
