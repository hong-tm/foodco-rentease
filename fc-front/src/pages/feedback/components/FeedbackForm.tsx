import { createFeedback } from '@/api/feedbackApi'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFeedbackSchema } from '@server/lib/sharedType'
import { useMutation } from '@tanstack/react-query'
import { Loader2Icon } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod/v4'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

import { StallCombobox } from '../../dashboard/components/StallCombobox'
import { RATINGS } from '../ratings'

const MESSAGE_LIMIT = 255

export const FeedbackForm = ({ onClose }: { onClose: () => void }) => {
  const form = useForm<z.infer<typeof createFeedbackSchema>>({
    resolver: zodResolver(createFeedbackSchema),
    defaultValues: {
      happiness: 0,
      stall: 0,
      feedbackContent: '',
    },
  })

  const mutation = useMutation({
    mutationFn: createFeedback,
    onSuccess: () => {
      toast.success('Feedback submitted successfully')
      onClose()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Feedback could not be submitted')
    },
  })

  const message =
    useWatch({ control: form.control, name: 'feedbackContent' }) ?? ''

  async function onSubmit(values: z.infer<typeof createFeedbackSchema>) {
    await mutation.mutateAsync(values).catch(() => undefined)
  }

  return (
    <div className="w-full px-4 pb-4 md:px-0 md:pb-0">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-5">
            <FormField
              control={form.control}
              name="happiness"
              render={({ field }) => (
                <FormItem className="gap-2">
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium">
                      How was your visit?
                    </legend>
                    <div className="grid grid-cols-4 gap-2">
                      {RATINGS.map(({ value, label, Icon }) => (
                        <label key={value} className="cursor-pointer">
                          <input
                            type="radio"
                            name="happiness"
                            value={value}
                            checked={field.value === value}
                            onChange={() => field.onChange(value)}
                            onBlur={field.onBlur}
                            className="peer sr-only"
                          />
                          <span
                            className={cn(
                              'flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-colors',
                              'border-border text-muted-foreground hover:bg-muted/40',
                              'peer-checked:border-foreground peer-checked:bg-muted peer-checked:text-foreground',
                              'peer-focus-visible:ring-ring/50 peer-focus-visible:ring-2',
                            )}
                          >
                            <Icon className="size-5" aria-hidden="true" />
                            <span className="text-center text-xs leading-tight">
                              {label}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stall"
              render={({ field }) => (
                <FormItem className="gap-2">
                  <FormLabel htmlFor="stall">Stall</FormLabel>
                  <FormControl>
                    <StallCombobox
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feedbackContent"
              render={({ field }) => (
                <FormItem className="gap-2">
                  <FormLabel htmlFor="feedbackContent">Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What happened at this stall?"
                      autoComplete="off"
                      rows={4}
                      maxLength={MESSAGE_LIMIT}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex items-start justify-between gap-3">
                    <FormMessage />
                    <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                      {message.length}/{MESSAGE_LIMIT}
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? (
                <>
                  Sending
                  <Loader2Icon className="size-4 animate-spin" />
                </>
              ) : (
                'Send feedback'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
