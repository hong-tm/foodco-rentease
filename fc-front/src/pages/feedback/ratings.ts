import { AngryIcon, FrownIcon, LaughIcon, SmileIcon } from 'lucide-react'

export const RATINGS = [
  { value: 4, label: 'Very happy', Icon: LaughIcon },
  { value: 3, label: 'Happy', Icon: SmileIcon },
  { value: 2, label: 'Unhappy', Icon: FrownIcon },
  { value: 1, label: 'Very unhappy', Icon: AngryIcon },
] as const
