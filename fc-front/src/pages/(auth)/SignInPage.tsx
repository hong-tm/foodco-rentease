import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Turnstile } from '@marsidev/react-turnstile'
import { signinFormSchema } from '@server/lib/sharedType'
import { LoaderCircleIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod/v4'

import { authClient } from '@/lib/auth-client'
import { verifyTurnstileToken } from '@/lib/verifyTurnstileToken'

import { BackgroundLines } from '@/components/ui/background-lines'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/passwod-input'
import { Separator } from '@/components/ui/separator'
import { FishSymbolIcon } from '@/components/fish-symbol'
import { ModeToggle } from '@/components/mode-toggle'

import { FeedbackButton } from '../feedback/components/FeedbackButton'

export default function SignInPage() {
  const form = useForm<z.infer<typeof signinFormSchema>>({
    resolver: zodResolver(signinFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      token: '',
    },
  })

  const navigate = useNavigate()

  const [pending, setPending] = useState(false)
  const [pendingGoogle, setPendingGoogle] = useState(false)
  const [pendingGithub, setPendingGithub] = useState(false)

  // async function checkSession() {
  // 	const session = await authClient.getSession();

  // 	if (session.data?.user) {
  // 		navigate("/dashboard", { replace: true });
  // 		return;
  // 	}
  // }
  // checkSession();

  //TODO Fix UI Layout all

  async function SignIn(values: z.infer<typeof signinFormSchema>) {
    setPending(true)

    // Verify Turnstile token
    const { success, data } = await verifyTurnstileToken(values.token)

    if (!success) {
      console.log('Failed to verify Turnstile')
      setPending(false)
      return
    }

    console.log('Turnstile verification successful:', data)

    const { email, password, rememberMe } = values

    await authClient.signIn.email(
      {
        email,
        password,
        rememberMe,
      },
      {
        onRequest: () => {
          setPending(true)
        },
        onSuccess: () => {
          form.reset()
          toast.success(`Welcome, ${email}!`)
          navigate('/dashboard', { replace: true })
        },
        onError: async (ctx) => {
          toast.error(ctx.error.message ?? 'An error occurred')
          setPending(false)
        },
      },
    )
    setPending(false) // Guarantees the loader stops
  }

  async function handlerSignInGoogle() {
    await authClient.signIn.social(
      {
        provider: 'google',
        callbackURL: '/dashboard',
        errorCallbackURL: '/',
      },
      {
        onRequest: () => {
          setPendingGoogle(true)
        },
        onSuccess: async () => {
          // toast.success("Welcome, Google User!");
          // navigate("/dashboard", { replace: true });
        },
        onError: async (ctx) => {
          toast.error(ctx.error.message)
          setPendingGoogle(false)
        },
      },
    )
  }

  async function handlerSignInGithub() {
    await authClient.signIn.social(
      {
        provider: 'github',
        callbackURL: '/dashboard',
        errorCallbackURL: '/',
      },
      {
        onRequest: () => {
          setPendingGithub(true)
        },
        onSuccess: async () => {
          // toast.success("Welcome, Github User!");
        },
        onError: async (ctx) => {
          toast.error(ctx.error.message)
          setPendingGithub(false)
        },
      },
    )
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <BackgroundLines className="z-15 flex h-full w-full flex-col items-center justify-center px-4">
        <Card className="z-10 mx-auto max-w-md lg:min-w-[500px]">
          <CardHeader className="text-center">
            <div className="motion-preset-wiggle motion-preset-bounce motion-delay-150 flex w-full items-center justify-center">
              <FishSymbolIcon />
            </div>
            <CardTitle className="text-2xl">
              Welcome to FoodCo-RentEase
            </CardTitle>
            <CardDescription>
              Your Ultimate Stall Management Tool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(SignIn)} className="space-y-8">
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel htmlFor="email" className="select-none">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="email"
                            placeholder="johndoe@mail.com"
                            type="email"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <FormLabel htmlFor="password" className="select-none">
                            Password
                          </FormLabel>
                          <Link
                            to="forget-password"
                            className="ml-auto inline-block text-sm underline"
                          >
                            Forgot your password?
                          </Link>
                        </div>
                        <FormControl>
                          <PasswordInput
                            id="password"
                            placeholder="******"
                            autoComplete="current-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember">Remember me</Label>
                  </div>

                  {/* Turnstile */}
                  <Turnstile
                    className="cf-turnstile"
                    siteKey="0x4AAAAAAA17oVW-tvHSVIXI"
                    options={{
                      theme: 'auto',
                    }}
                    onSuccess={(token) => {
                      // Update token field
                      form.setValue('token', token, { shouldValidate: true })
                    }}
                    onError={() => console.log('Turnstile error')}
                  />

                  {/* Hidden input for token */}
                  <input type="hidden" {...form.register('token')} />

                  <Button type="submit" className="w-full" disabled={pending}>
                    {pending ? (
                      <>
                        Login
                        <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
            <div className="mt-4 grid gap-4 text-center text-sm select-none">
              <Separator />
              <Button
                variant="outline"
                className="flex w-full items-center justify-center gap-3 px-4 py-2"
                onClick={handlerSignInGoogle}
                disabled={pendingGoogle}
              >
                {pendingGoogle ? (
                  <>
                    <FcGoogle className="text-2xl" />
                    <span>Continue with Google</span>
                    <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    <FcGoogle className="text-2xl" />
                    <span>Continue with Google</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="flex w-full items-center justify-center gap-3 px-4 py-2"
                onClick={handlerSignInGithub}
                disabled={pendingGithub}
              >
                {pendingGithub ? (
                  <>
                    <FaGithub className="text-2xl" />
                    <span>Continue with Github</span>
                    <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    <FaGithub className="text-2xl" />
                    <span>Continue with Github</span>
                  </>
                )}
              </Button>
              <FeedbackButton />
            </div>
            <div className="mt-4 text-center text-sm select-none">
              Don&apos;t have an account?{' '}
              <Link to="signup" className="underline">
                Sign up
              </Link>
            </div>
          </CardContent>
          <div className="item-center flex justify-center p-2">
            <ModeToggle />
          </div>
        </Card>
      </BackgroundLines>
    </div>
  )
}
