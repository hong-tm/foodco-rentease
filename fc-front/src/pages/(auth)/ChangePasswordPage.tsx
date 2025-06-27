import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePasswordFormSchema } from '@server/lib/sharedType'
import { Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod/v4'

import { authClient } from '@/lib/auth-client'

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
import { PasswordInput } from '@/components/ui/passwod-input'

export default function ChangePasswordPage() {
  const form = useForm<z.infer<typeof changePasswordFormSchema>>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  })

  const [pending, setPending] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(values: z.infer<typeof changePasswordFormSchema>) {
    await authClient.changePassword(
      {
        newPassword: values.password,
        currentPassword: values.currentPassword,
      },
      {
        onRequest: () => {
          setPending(true)
          toast.loading('Updating...', { id: 'change-password' })
        },
        onSuccess: async () => {
          form.reset()
          toast.success('Your password has been reset. You can now sign in.', {
            id: 'change-password',
          })
          setPending(false)
          navigate('/')
        },
        onError: (ctx) => {
          toast.error(ctx.error.message, { id: 'change-password' })
          setPending(false)
        },
      },
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Card className="w-full max-w-md rounded-2xl border-none shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Change Account Password
          </CardTitle>
          <CardDescription className="text-gray-500">
            Enter your new password to change your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Current Password Field */}
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        id="currentPassword"
                        placeholder="******"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* New Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
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
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
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
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
