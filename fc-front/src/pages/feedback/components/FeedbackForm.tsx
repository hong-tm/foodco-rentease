import { useState } from 'react'
import { createFeedback, feedbacksQueryKey } from '@/api/feedbackApi'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFeedbackSchema } from '@server/lib/sharedType'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AngryIcon,
  FrownIcon,
  LaughIcon,
  Loader2Icon,
  SmileIcon,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod/v4'

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

const feedback = [
  { happiness: 4, emoji: <LaughIcon size={16} className="stroke-inherit" /> },
  { happiness: 3, emoji: <SmileIcon size={16} className="stroke-inherit" /> },
  { happiness: 2, emoji: <FrownIcon size={16} className="stroke-inherit" /> },
  { happiness: 1, emoji: <AngryIcon size={16} className="stroke-inherit" /> },
]

export const FeedbackForm = ({ onClose }: { onClose: () => void }) => {
  const form = useForm<z.infer<typeof createFeedbackSchema>>({
    resolver: zodResolver(createFeedbackSchema),
    defaultValues: {
      happiness: 0,
      stall: 0,
      feedbackContent: '',
    },
  })

  const [pending, setPending] = useState(false)
  const [happiness, setHappiness] = useState<null | number>(null)

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createFeedback,
    onSuccess: () => {
      toast.success('Feedback submitted successfully')
      queryClient.invalidateQueries({ queryKey: feedbacksQueryKey.all })
      onClose()
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Failed to submit feedback')
    },
    onSettled: () => setPending(false),
  })

  async function onSubmit(values: z.infer<typeof createFeedbackSchema>) {
    setPending(true)
    mutation.mutate(values)
  }

  return (
    <div className="flex w-full flex-col px-12 md:px-0">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            {/* Happiness emoji */}
            <FormField
              control={form.control}
              name="happiness"
              render={({ field }) => (
                <FormItem className="grid gap-1">
                  <FormLabel
                    htmlFor="happiness"
                    className="select-none"
                  ></FormLabel>
                  <FormControl>
                    <span className="flex h-12 items-center justify-center gap-3">
                      <div className="flex items-center gap-4 text-neutral-400">
                        {feedback.map((e) => (
                          <Button
                            type="button"
                            onClick={() => {
                              const newHappiness =
                                e.happiness === happiness ? null : e.happiness
                              setHappiness(newHappiness) // Update local state
                              field.onChange(newHappiness) // Sync with react-hook-form
                            }}
                            variant="ghost"
                            className={twMerge(
                              happiness === e.happiness
                                ? e.happiness === 4
                                  ? 'bg-positive-soft stroke-positive-ink hover:scale-125'
                                  : e.happiness === 3
                                    ? 'bg-brand-soft stroke-brand-ink hover:scale-125'
                                    : e.happiness === 2
                                      ? 'bg-warning-soft stroke-warning-ink hover:scale-125'
                                      : 'bg-negative-soft stroke-negative-ink hover:scale-125'
                                : 'stroke-muted-foreground',
                              'flex h-8 w-8 items-center justify-center rounded-full transition-all',
                              happiness === e.happiness
                                ? ''
                                : e.happiness === 4
                                  ? 'hover:bg-positive-soft hover:stroke-positive-ink hover:scale-125'
                                  : e.happiness === 3
                                    ? 'hover:bg-brand-soft hover:stroke-brand-ink hover:scale-125'
                                    : e.happiness === 2
                                      ? 'hover:bg-warning-soft hover:stroke-warning-ink hover:scale-125'
                                      : 'hover:bg-negative-soft hover:stroke-negative-ink hover:scale-125',
                            )}
                            key={e.happiness}
                          >
                            {e.emoji}
                          </Button>
                        ))}
                      </div>
                    </span>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stall combobox */}
            <FormField
              control={form.control}
              name="stall"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel htmlFor="stall" className="select-none">
                    Stall
                  </FormLabel>
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

            {/* Feedback content */}
            <FormField
              control={form.control}
              name="feedbackContent"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel htmlFor="feedbackContent" className="select-none">
                    Message
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="This is awesoooome"
                      autoComplete="feedbackContent"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={pending} type="submit" className="mb-3 w-full">
              {pending ? (
                <>
                  Submit
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
