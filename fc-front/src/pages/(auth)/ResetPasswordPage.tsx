import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PasswordInput } from '@/components/ui/passwod-input'
import { BackgroundLines } from '@/components/ui/background-lines'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { resetPasswordFormSchema } from '@server/lib/sharedType'

export default function ResetPasswordPage() {
  const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const [pending, setPending] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(values: z.infer<typeof resetPasswordFormSchema>) {
    await authClient.resetPassword(
      {
        newPassword: values.password,
      },
      {
        onRequest: () => {
          setPending(true)
        },
        onSuccess: async () => {
          form.reset()
          toast.success('Your password has been reset. You can now sign in.')
          setPending(false)
          navigate('/')
        },
        onError: (ctx) => {
          toast.error(ctx.error.message)
          setPending(false)
        },
      },
    )
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <BackgroundLines className="-z-15 flex h-full w-full flex-col items-center justify-center px-4">
        <Card className="z-10 mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Enter your new password to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div className="grid gap-4">
                  {/* New Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel htmlFor="password">New Password</FormLabel>
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
                        <FormLabel htmlFor="confirmPassword">
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

                  <Button type="submit" className="w-full" disabled={pending}>
                    {pending ? (
                      <>
                        Reset Password
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      'Reset Password'
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
