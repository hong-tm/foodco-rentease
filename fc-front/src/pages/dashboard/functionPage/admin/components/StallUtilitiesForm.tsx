import { createUtilityPaymentRecord, paymentsQueryKey } from '@/api/paymentApi'
import type { GetStallsResponse } from '@/api/stallApi'
import { fetchStallsQueryOptions } from '@/api/stallApi'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  stallUtilitiesFormSchema,
  type StallUtilitiesFormValues,
} from '@server/lib/sharedType'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { DateField } from '@/components/ui/date-field'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

export default function StallUtilitiesForm({
  onDone,
}: {
  onDone?: () => void
}) {
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
    onSuccess: (record) => {
      toast.success(
        record.paymentType === 'rental'
          ? 'Rent bill created. Find it in Financial report.'
          : 'Bill created',
      )
      form.reset({
        stallId: undefined,
        paymentType: undefined,
        paymentAmount: undefined,
        paymentDate: undefined,
      })
      queryClient.invalidateQueries({ queryKey: paymentsQueryKey.record() })
      onDone?.()
    },
  })

  async function onSubmit(data: StallUtilitiesFormValues) {
    mutation.mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentType"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={onChange} value={value || ''} {...field}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select utility type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="rental">
                      Rent (listed in Financial report)
                    </SelectItem>
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
                    placeholder="Enter amount"
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
                <FormLabel>Bill date</FormLabel>
                <DateField value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? <Spinner /> : null}
          Create bill
        </Button>
      </form>
    </Form>
  )
}
