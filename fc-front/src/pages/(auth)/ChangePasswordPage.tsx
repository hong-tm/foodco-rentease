import { useState } from 'react'
import { PageHeader } from '@/pages/dashboard/components/PageHeader'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePasswordFormSchema } from '@server/lib/sharedType'
import { useNavigate } from '@tanstack/react-router'
import { Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod/v4'

import { authClient } from '@/lib/auth-client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Panel, PanelHeader } from '@/components/ui/panel'
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
    await authClient.changePassword({
      newPassword: values.password,
      currentPassword: values.currentPassword,
      fetchOptions: {
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
          navigate({ to: '/' })
        },
        onError: (ctx) => {
          toast.error(ctx.error.message, { id: 'change-password' })
          setPending(false)
        },
      },
    })
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader title="Change password">
        Set a new password for your account.
      </PageHeader>
      <Panel className="max-w-3xl">
        <PanelHeader
          title="Change Account Password"
          meta="Enter your new password to change your password."
        />
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

            <Button type="submit" disabled={pending}>
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
      </Panel>
    </div>
  )
}
