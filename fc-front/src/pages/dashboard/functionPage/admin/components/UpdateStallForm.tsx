import type { GetStallsResponse, StallFormProps } from '@/api/stallApi'
import {
  fetchStallTierPricesQueryOptions,
  fetchStallsQueryOptions,
  updateStall,
} from '@/api/stallApi'
import { zodResolver } from '@hookform/resolvers/zod'
import type { StallUserAttributes } from '@server/db/userModel'
import { updateStallSchema } from '@server/lib/sharedType'
import { useMutation, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { type UseFormReturn, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod/v4'

import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function StallFormFields({
  form,
  data,
  stall,
  totalPrice,
  handleTierSelect,
  tierData,
}: {
  form: UseFormReturn<z.input<typeof updateStallSchema>>
  data: GetStallsResponse
  stall: StallUserAttributes
  totalPrice: number
  handleTierSelect: (
    value: string,
    field: { onChange: (value: unknown) => void },
  ) => void
  tierData: { id: number; name: string; price: number }[]
}) {
  // Deduplicate owners by email
  const uniqueOwners = data?.stall
    ? Array.from(
        new Map(
          data.stall
            .filter((stall) => stall.stallOwnerId && stall.stallOwnerId.email)
            .map((stall) => [stall.stallOwnerId.email, stall.stallOwnerId]),
        ).values(),
      )
    : []

  return (
    <div className="grid gap-4">
      {/* Stall Name Field */}
      <FormField
        control={form.control}
        name="stallName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="select-none">Stall Name</FormLabel>
            <FormControl>
              <Input placeholder="Stall Name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description Field */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="select-none">Description</FormLabel>
            <FormControl>
              <Input placeholder="Description" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Stall Image Field */}
      <FormField
        control={form.control}
        name="stallImage"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="select-none">Stall Image URL</FormLabel>
            <FormControl>
              <Input placeholder="Stall Image URL" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="stallSize"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="select-none">Stall Size</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="Stall Size"
                {...field}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Stall Owner Field */}
      <FormField
        control={form.control}
        name="stallOwner"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="select-none">Stall Owner Email</FormLabel>
            <FormControl>
              <Select
                defaultValue={stall.stallOwnerId?.email}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select owner email" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Owner Emails</SelectLabel>
                    {uniqueOwners.map((owner) => (
                      <SelectItem key={owner.email} value={owner.email}>
                        {owner.email}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Rent Status Field */}
      <FormField
        control={form.control}
        name="rentStatus"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-y-0 space-x-3">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="font-normal select-none">
              Rent Status
            </FormLabel>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Start Date Field */}
      <FormField
        control={form.control}
        name="startAt"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="select-none">Start Date</FormLabel>
            <FormControl>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !field.value && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value instanceof Date &&
                    !isNaN(field.value.getTime()) ? (
                      format(field.value, 'PPP')
                    ) : typeof field.value === 'string' &&
                      !isNaN(new Date(field.value).getTime()) ? (
                      format(new Date(field.value), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={(() => {
                      if (
                        field.value instanceof Date &&
                        !isNaN(field.value.getTime())
                      )
                        return field.value
                      if (
                        field.value instanceof Date &&
                        !isNaN(field.value.getTime())
                      )
                        return field.value
                      const v = field.value
                      if (typeof v === 'string' || typeof v === 'number') {
                        const d = new Date(v)
                        return !isNaN(d.getTime()) ? d : undefined
                      }
                      return undefined
                    })()}
                    onSelect={field.onChange}
                    autoFocus
                    className="rounded-md border shadow"
                  />
                </PopoverContent>
              </Popover>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* End Date Field */}
      <FormField
        control={form.control}
        name="endAt"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="select-none">End Date</FormLabel>
            <FormControl>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !field.value && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value instanceof Date &&
                    !isNaN(field.value.getTime()) ? (
                      format(field.value, 'PPP')
                    ) : typeof field.value === 'string' &&
                      !isNaN(new Date(field.value).getTime()) ? (
                      format(new Date(field.value), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={(() => {
                      if (
                        field.value instanceof Date &&
                        !isNaN(field.value.getTime())
                      )
                        return field.value
                      const v = field.value
                      if (typeof v === 'string' || typeof v === 'number') {
                        const d = new Date(v)
                        return !isNaN(d.getTime()) ? d : undefined
                      }
                      return undefined
                    })()}
                    onSelect={field.onChange}
                    autoFocus
                    className="rounded-md border shadow"
                  />
                </PopoverContent>
              </Popover>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Updated Stall Tier Field */}
      <FormField
        control={form.control}
        name="stallTierNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="select-none">Stall Tier</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <Select
                  value={field.value.tierId.toString()}
                  onValueChange={(value) => handleTierSelect(value, field)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {tierData.map((tier) => (
                      <SelectItem key={tier.id} value={tier.id.toString()}>
                        {tier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Label
                  htmlFor="stallPrice"
                  className="text-muted-foreground text-xs"
                >
                  Price: RM {totalPrice}
                </Label>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export default function UpdateStallForm({
  stall,
  onSubmit,
  setOpenDialog,
}: StallFormProps) {
  const isMobile = useIsMobile()
  const { data: tierQueryData } = useQuery(fetchStallTierPricesQueryOptions)

  const tierData =
    tierQueryData?.map((tier) => ({
      id: tier.tierId,
      name: `Tier ${tier.tierName}`,
      price: tier.tierPrice,
    })) ?? []

  // Fix: Ensure correct Zod type inference and resolver typing for useForm
  const form = useForm<z.input<typeof updateStallSchema>>({
    resolver: zodResolver(updateStallSchema),
    defaultValues: {
      stallNumber: stall.stallNumber ?? 0,
      stallName: stall.stallName ?? '',
      description: stall.description ?? '',
      stallImage: stall.stallImage || '',
      stallSize:
        typeof stall.stallSize === 'number'
          ? stall.stallSize
          : Number(stall.stallSize) || 0,
      stallOwner: stall.stallOwnerId?.email || '',
      rentStatus: Boolean(stall.rentStatus),
      startAt: stall.startAt,
      endAt: stall.endAt,
      stallTierNumber: {
        tierId: stall.stallTierNumber?.tierId || 1,
      },
    },
  })

  // Handle tier selection with proper type updates
  const handleTierSelect = (
    value: string,
    field: { onChange: (value: unknown) => void },
  ) => {
    const selectedTier = tierData.find((tier) => tier.id === Number(value))
    if (selectedTier) {
      field.onChange({
        tierId: selectedTier.id,
        tierName: selectedTier.name,
        tierPrice: selectedTier.price,
      })
    }
  }

  const calculateTotalPrice = (tierPrice: number, stallSize: number) => {
    return (tierPrice * stallSize).toFixed(2)
  }

  const price = stall.stallTierNumber?.tierPrice
  const totalPrice = price
    ? calculateTotalPrice(price, form.getValues('stallSize'))
    : 0

  const mutation = useMutation({
    mutationFn: updateStall,
    onError: (error: Error) => {
      console.error('Error updating stall:', error)
      toast.error(`${error}`)
    },
    onSuccess: (data) => {
      toast.success('Stall updated successfully')
      form.reset()
      if (onSubmit) onSubmit(data)
      if (setOpenDialog) setOpenDialog(false)
    },
  })

  async function handleSubmit(values: z.input<typeof updateStallSchema>) {
    const payload = {
      ...values,
      startAt:
        values.startAt instanceof Date
          ? values.startAt
          : new Date(values.startAt as string),
      endAt:
        values.endAt instanceof Date
          ? values.endAt
          : new Date(values.endAt as string),
    }

    await mutation.mutateAsync(payload)
  }

  const { data, error, isLoading } = useQuery(fetchStallsQueryOptions)

  if (isLoading) {
    return <div className="justify-center p-4">Loading...</div>
  }

  if (error || !data) {
    return <div className="justify-center p-4">Error: {error?.message}</div>
  }

  const formContent = (
    <StallFormFields
      form={form}
      data={data}
      stall={stall}
      totalPrice={Number(totalPrice)}
      handleTierSelect={handleTierSelect}
      tierData={tierData}
    />
  )

  return (
    <div className="flex w-full flex-col px-12 md:px-0">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="grid gap-4">
            {isMobile ? (
              <ScrollArea className="h-[600px] gap-4 overflow-x-auto rounded-md">
                {formContent}
              </ScrollArea>
            ) : (
              formContent
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              Update Stall
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
