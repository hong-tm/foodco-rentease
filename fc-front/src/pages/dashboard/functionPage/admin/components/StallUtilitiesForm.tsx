import { createUtilityPaymentRecord, paymentsQueryKey } from '@/api/paymentApi'
import type { GetStallsResponse } from '@/api/stallApi'
import { fetchStallsQueryOptions } from '@/api/stallApi'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  type StallUtilitiesFormValues,
  stallUtilitiesFormSchema,
} from '@server/lib/sharedType'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CalendarIcon, Loader2Icon } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function StallUtilitiesForm() {
  const { data: stallsData } = useQuery({
    ...fetchStallsQueryOptions,
    select: (data: GetStallsResponse) =>
      data.stall.filter((stall) => stall.rentStatus),
  })

  const form = useForm<StallUtilitiesFormValues>({
    resolver: zodResolver(stallUtilitiesFormSchema),
    defaultValues: {
      stallId: undefined,
      paymentType: undefined,
      paymentAmount: 0,
      paymentDate: undefined,
    },
  })

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: StallUtilitiesFormValues) => {
      const selectedStall = stallsData?.find(
        (stall) => stall.stallNumber === data.stallId,
      )

      if (!selectedStall?.stallOwner) {
        throw new Error('Stall owner not found')
      }

      await createUtilityPaymentRecord({
        paymentId: `req_${crypto.randomUUID()}`,
        stallId: data.stallId,
        userId: selectedStall.stallOwner,
        paymentAmount: data.paymentAmount.toString(),
        paymentType: data.paymentType,
        paymentStatus: false,
        paymentDate: data.paymentDate.toISOString(),
      })

      return data
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
    onSuccess: () => {
      toast.success('Utility payment record created successfully')
      form.reset({
        stallId: undefined,
        paymentType: undefined,
        paymentAmount: undefined,
        paymentDate: undefined,
      })
      queryClient.invalidateQueries({ queryKey: paymentsQueryKey.record() })
    },
  })

  async function onSubmit(data: StallUtilitiesFormValues) {
    mutation.mutate(data)
  }

  const selectedStallId = useWatch({ control: form.control, name: 'stallId' })
  const selectedStall = stallsData?.find(
    (stall) => stall.stallNumber === selectedStallId,
  )
  const selectedOwner = selectedStall?.stallOwnerId?.name
  const stallHint = selectedStall
    ? selectedOwner
      ? `Billed to ${selectedOwner}`
      : 'No tenant holds this stall, so it cannot be charged'
    : 'Only rented stalls can be charged'

  return (
    <section aria-label="New utility charge" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-base font-medium">New charge</h2>

        <p className="text-muted-foreground text-xs">
          Issued unpaid. The tenant pays it from their utilities page.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={form.control}
              name="stallId"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Stall</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      onChange(val ? parseInt(val) : undefined)
                    }}
                    value={value?.toString() || ''}
                    {...field}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a stall" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stallsData?.map((stall) => (
                        <SelectItem
                          key={stall.stallNumber}
                          value={stall.stallNumber.toString()}
                        >
                          Stall {stall.stallNumber} - {stall.stallName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>{stallHint}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentType"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Utility type</FormLabel>
                  <Select onValueChange={onChange} value={value || ''} {...field}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select utility type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="water">Water</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="rental">Rental</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (RM)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      inputMode="decimal"
                      placeholder="0.00"
                      className="tabular-nums"
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(
                          value === '' ? undefined : parseFloat(value),
                        )
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Charge date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start pl-3 text-left font-normal tabular-nums',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  Creating charge
                  <Loader2Icon className="size-4 animate-spin" />
                </>
              ) : (
                'Create charge'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  )
}
