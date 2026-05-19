import { cn } from '../../utils/cn'

interface Props {
  label: string
  className?: string
}

export default function Badge({ label, className }: Props) {
  return (
    <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', className)}>
      {label}
    </span>
  )
}
