import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordFormSchema } from '@server/lib/sharedType'
import { Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
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

export default function ForgetPasswordPage() {
  const form = useForm<z.infer<typeof forgotPasswordFormSchema>>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: '',
    },
  })

  const [pending, setPending] = useState(false)

  async function onSubmit(values: z.infer<typeof forgotPasswordFormSchema>) {
    const { email } = values

    await authClient.forgetPassword({
      email,
      redirectTo: '/reset-password',
      fetchOptions: {
        onRequest: () => {
          setPending(true)
        },
        onSuccess: async () => {
          form.reset()
          toast.success(
            'If the email exists, a password reset link has been sent.',
          )
          setPending(false)
        },
        onError: (ctx) => {
          toast.error(ctx.error.message)
          setPending(false)
        },
      },
    })
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <BackgroundLines className="-z-15 flex h-full w-full flex-col items-center justify-center px-4">
        <Card className="z-10 mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address to receive a password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div className="grid gap-4">
                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel htmlFor="email">Email</FormLabel>
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
                  <Button type="submit" className="w-full" disabled={pending}>
                    {pending ? (
                      <>
                        Send Reset Link
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </BackgroundLines>
    </div>
  )
}
