import { useState } from 'react'
import { useSession } from '@/api/adminApi'
import { ErrorContext } from '@better-fetch/fetch'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateUsernameFormSchema } from '@server/lib/sharedType'
import { useQueryClient } from '@tanstack/react-query'
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
import { Input } from '@/components/ui/input'

import { ResponsiveFormDialog } from './ResponsiveFormDialog'

type UpdateProfileButtonProps = {
  onUpdate: (newName: string) => void
}

export default function UpdateProfileButton({
  onUpdate,
}: UpdateProfileButtonProps) {
  const form = useForm<z.infer<typeof updateUsernameFormSchema>>({
    resolver: zodResolver(updateUsernameFormSchema),
    defaultValues: {
      name: '',
    },
  })

  const [userName, setUserName] = useState('')
  const [pending, setPending] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: session, isLoading, error } = useSession()
  const queryClient = useQueryClient()

  // Update userName when session data is available
  if (session?.user?.name && !userName) {
    setUserName(session.user.name)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    toast.error('Error loading session')
    return <div>Error loading session</div>
  }

  async function onSubmit(values: z.infer<typeof updateUsernameFormSchema>) {
    const { name } = values
    setPending(true)

    try {
      await authClient.updateUser(
        {
          name,
        },
        {
          onSuccess: () => {
            onUpdate(name)
            setDialogOpen(false)
            toast.success('Name updated successfully')
            queryClient.invalidateQueries({ queryKey: ['user-session'] })
          },
          onError: (ctx: ErrorContext) => {
            toast.error(ctx.error.message ?? 'An error occurred')
          },
        },
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <ResponsiveFormDialog
        isOpen={dialogOpen}
        setIsOpen={setDialogOpen}
        title="Edit Name"
        description="Edit your name to be displayed on the platform. It may require a refresh to see the changes."
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-4 space-y-8"
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel htmlFor="name" className="select-none">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="name"
                        placeholder={userName || 'Enter your name'}
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
                    Save Change
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  'Save Change'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </ResponsiveFormDialog>

      <Button onClick={() => setDialogOpen(true)}>Edit Name</Button>
    </>
  )
}
