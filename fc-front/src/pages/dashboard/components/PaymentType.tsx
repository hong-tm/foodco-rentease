const typeStyle: Record<string, { label: string; color: string }> = {
  rental: { label: 'Rent', color: 'var(--chart-1)' },
  electric: { label: 'Electric', color: 'var(--chart-3)' },
  water: { label: 'Water', color: 'var(--chart-2)' },
}

/** Payment type as a coloured dot and a word, so the status keeps the loud spot. */
export function PaymentType({ type }: { type: string }) {
  const style = typeStyle[type] ?? {
    label: type,
    color: 'var(--muted-foreground)',
  }
  return (
    <span className="type-body inline-flex items-center gap-2 whitespace-nowrap">
      <span
        aria-hidden="true"
        className="size-2 rounded-full"
        style={{ background: style.color }}
      />
      {style.label}
    </span>
  )
}

export const paymentTypeLabel = (type: string) => typeStyle[type]?.label ?? type
