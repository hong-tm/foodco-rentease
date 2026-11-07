import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// type-* utilities (index.css) set size, line height, weight and tracking
// together, so a later type-* class replaces earlier classes for those parts.
const twMerge = extendTailwindMerge<'type-scale'>({
  extend: {
    classGroups: {
      'type-scale': [
        { type: ['display', 'page-title', 'section-title', 'stat', 'label'] },
      ],
    },
    conflictingClassGroups: {
      'type-scale': ['font-size', 'leading', 'font-weight', 'tracking'],
    },
  },
})

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}
