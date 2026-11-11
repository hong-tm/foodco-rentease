import { stallsQueryKey, type GetStallsResponse, type StallFormProps } from '@/api/stallApi'
import {
  fetchStallTierPricesQueryOptions,
  fetchStallsQueryOptions,
  updateStall,
} from '@/api/stallApi'
import { zodResolver } from '@hookform/resolvers/zod'
import type { StallUserAttributes } from '@server/db/userModel'
import { updateStallSchema } from '@server/lib/sharedType'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod/v4'

import { useIsMobile } from '@/hooks/use-mobile'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Label } from '@/components/ui/label'
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

/** Rent for the selected tier and size, so the figure follows both fields. */
function PricePreview({
  form,
  tierData,
}: {
  form: UseFormReturn<z.input<typeof updateStallSchema>>
  tierData: { id: number; name: string; price: number }[]
}) {
  const tier = useWatch({ control: form.control, name: 'stallTierNumber' })
  const size = useWatch({ control: form.control, name: 'stallSize' })
  const rate = tierData.find((item) => item.id === tier?.tierId)?.price
  const price = rate ? Number((rate * (Number(size) || 0)).toFixed(2)) : 0

  return (
    <Label htmlFor="stallPrice" className="text-muted-foreground text-xs">
      Price: RM {price}
    </Label>
  )
}

function StallFormFields({
  form,
  data,
  stall,
  handleTierSelect,
  tierData,
}: {
  form: UseFormReturn<z.input<typeof updateStallSchema>>
  data: GetStallsResponse
  stall: StallUserAttributes
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
      <fieldset className="grid gap-4">
        <legend className="type-strong mb-3">Stall</legend>
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

        <div className="grid grid-cols-2 items-start gap-3">
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
                      value={
                        field.value.tierId ? field.value.tierId.toString() : ''
                      }
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
                    <PricePreview form={form} tierData={tierData} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
      </fieldset>
      <fieldset className="grid gap-4 border-t pt-5">
        <legend className="type-strong mb-3">Lease</legend>
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

        <div className="grid grid-cols-2 items-start gap-3">
          {/* Start Date Field */}
          <FormField
            control={form.control}
            name="startAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="select-none">Start Date</FormLabel>
                <DateField
                  value={field.value as Date | string | undefined}
                  onChange={field.onChange}
                  calendarClassName="rounded-md border shadow"
                />
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
                <DateField
                  value={field.value as Date | string | undefined}
                  onChange={field.onChange}
                  calendarClassName="rounded-md border shadow"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </fieldset>
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
      stallImage: stall.stallImage || undefined,
      stallSize:
        typeof stall.stallSize === 'number'
          ? stall.stallSize
          : Number(stall.stallSize) || 0,
      stallOwner: stall.stallOwnerId?.email || '',
      rentStatus: Boolean(stall.rentStatus),
      startAt: stall.startAt,
      endAt: stall.endAt,
      stallTierNumber: {
        tierId: stall.stallTierNumber?.tierId ?? 0,
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

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: updateStall,
    onError: (error: Error) => {
      console.error('Error updating stall:', error)
      toast.error(`${error}`)
    },
    onSuccess: (data) => {
      toast.success('Stall updated successfully')
      form.reset()
      queryClient.invalidateQueries({ queryKey: stallsQueryKey.all })
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
      handleTierSelect={handleTierSelect}
      tierData={tierData}
    />
  )

  return (
    <div className="flex w-full flex-col px-12 md:px-0">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-5">
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
