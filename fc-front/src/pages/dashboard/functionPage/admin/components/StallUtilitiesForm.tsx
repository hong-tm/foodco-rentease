import { createUtilityPaymentRecord, paymentsQueryKey } from '@/api/paymentApi'
import { GetStallsResponse, fetchStallsQueryOptions } from '@/api/stallApi'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  StallUtilitiesFormValues,
  stallUtilitiesFormSchema,
} from '@server/lib/sharedType'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CalendarIcon, Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
      stallId: 0,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
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
                    <SelectTrigger>
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
                <FormLabel>Utility Type</FormLabel>
                <Select onValueChange={onChange} value={value || ''} {...field}>
                  <FormControl>
                    <SelectTrigger>
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
                <FormLabel>Payment Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
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
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full sm:w-auto"
        >
          {mutation.isPending ? (
            <>
              Creating Utility Payment
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            </>
          ) : (
            <>Create Utility Payment</>
          )}
        </Button>
      </form>
    </Form>
  )
}
