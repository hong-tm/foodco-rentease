import * as React from 'react'

export function PageHeader({
  title,
  children,
  actions,
}: {
  title: string
  children?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6">
      <div className="min-w-0">
        <h1 className="type-title">{title}</h1>
        {children ? (
          <p className="type-body text-muted-foreground mt-1 max-w-3xl">
            {children}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2 *:max-md:flex-1">
          {actions}
        </div>
      ) : null}
    </div>
  )
}
