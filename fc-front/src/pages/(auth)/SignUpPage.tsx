import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Turnstile } from '@marsidev/react-turnstile'
import { signupformSchema } from '@server/lib/sharedType'
import { Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod/v4'

import { authClient } from '@/lib/auth-client'

import { BackgroundLines } from '@/components/ui/background-lines'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/passwod-input'
import { FishSymbolIcon } from '@/components/fish-symbol'
// import { PhoneInput } from "@/components/ui/phone-input";
import { ModeToggle } from '@/components/mode-toggle'

export default function SignUpPage() {
  const form = useForm<z.infer<typeof signupformSchema>>({
    resolver: zodResolver(signupformSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      token: '',
    },
  })

  const navigate = useNavigate()

  const [pending, setPending] = useState(false)

  async function onSubmit(values: z.infer<typeof signupformSchema>) {
    setPending(true)

    const { name, email, password, token } = values

    await authClient.signUp.email({
      email,
      password,
      name,
      fetchOptions: {
        onRequest: () => {
          setPending(true)
        },
        onSuccess: () => {
          form.reset()
          toast.success(`Check Your Email: ${email}!`)
          navigate('/')
        },
        onError: (ctx) => {
          toast.error(ctx.error.message ?? 'An error occurred')
          setPending(false) // This works fine for errors returned by `authClient`
        },
        headers: {
          // only work on the domain that set in cloudflare turnstile,in development prefer to use google sign in
          'x-captcha-response': token,
        },
      },
    })

    setPending(false) // Guarantees the loader stops
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <BackgroundLines className="z-15 flex h-full w-full flex-col items-center justify-center px-4">
        <Card className="z-10 mx-auto max-w-md lg:min-w-[500px]">
          <CardHeader className="flex w-full flex-col items-center justify-center text-center select-none">
            <div className="motion-preset-wiggle motion-preset-bounce motion-delay-150 flex w-full items-center justify-center">
              <FishSymbolIcon />
            </div>
            <CardTitle className="text-2xl">Create New Account</CardTitle>
            <CardDescription>
              Join FoodCo-RentEase to Simplify Your Stall Management Today!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div className="grid gap-4">
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel htmlFor="name" className="select-none">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input id="name" placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
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
                            placeholder="johndoe@gmail.com"
                            type="email"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone Field */}
                  {/* <FormField
										control={form.control}
										name="phone"
										render={({ field }) => (
											<FormItem className="grid gap-2">
												<FormLabel htmlFor="phone" className="select-none">
													Phone Number
												</FormLabel>
												<FormControl>
													<PhoneInput
														{...field}
														defaultCountry="MY"
														placeholder="012-345 6789"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/> */}

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel htmlFor="password" className="select-none">
                          Password
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            id="password"
                            placeholder="******"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password Field */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel
                          htmlFor="confirmPassword"
                          className="select-none"
                        >
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            id="confirmPassword"
                            placeholder="******"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                    // only work on the domain,in production prefer to use google sign in
                    onError={() => toast.warning('Turnstile error')}
                  />

                  {/* Hidden input for token */}
                  <input type="hidden" {...form.register('token')} />

                  <Button type="submit" className="w-full" disabled={pending}>
                    {pending ? (
                      <>
                        Register
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      'Register'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm select-none">
              Already have an account?{' '}
              <Link to="/" className="underline">
                Login
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
