import { useSession } from '@/api/adminApi'
import { PageHeader } from '@/pages/dashboard/components/PageHeader'
import { Link } from '@tanstack/react-router'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Panel,
  PanelError,
  PanelHeader,
  PanelRowsSkeleton,
} from '@/components/ui/panel'

import UpdateProfileButton from '../dashboard/components/UpdateProfileButton'

const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || '?'

export default function UserProfilePage() {
  const { data: session, error, isLoading } = useSession()
  const user = session?.user

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader title="Account">
        Your name, contact details and sign-in email.
      </PageHeader>

      <Panel className="max-w-3xl">
        {isLoading ? <PanelRowsSkeleton rows={5} /> : null}
        {error ? <PanelError what="your account" /> : null}
        {user ? (
          <>
            <PanelHeader
              title={
                <span className="flex items-center gap-3">
                  <Avatar className="size-10 rounded-full">
                    <AvatarImage src={user.image ?? ''} alt="" />
                    <AvatarFallback>
                      {initialsOf(user.name ?? '')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0">
                    <span className="block truncate">{user.name}</span>
                    <span className="type-meta text-muted-foreground block font-normal capitalize">
                      {user.role}
                    </span>
                  </span>
                </span>
              }
              action={<UpdateProfileButton onUpdate={() => {}} />}
            />
            <dl className="divide-y border-t">
              <Row label="Email">
                <span className="flex flex-wrap items-center gap-2">
                  {user.email}
                  <Badge variant={user.emailVerified ? 'positive' : 'warning'}>
                    {user.emailVerified ? 'Verified' : 'Not verified'}
                  </Badge>
                </span>
              </Row>
              <Row label="Phone">
                {user.phone && user.phone !== 'null' ? (
                  user.phone
                ) : (
                  <span className="text-muted-foreground">Not added</span>
                )}
              </Row>
              <Row label="Password">
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-muted-foreground">
                    Used with your email to sign in.
                  </span>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/dashboard/change-password">Change password</Link>
                  </Button>
                </span>
              </Row>
              <Row label="User ID">
                <span className="type-id break-all">{user.id}</span>
              </Row>
            </dl>
          </>
        ) : null}
      </Panel>
    </div>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="type-body grid grid-cols-1 gap-1 py-3 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}
