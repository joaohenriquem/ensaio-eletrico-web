import { cn } from '../../utils/cn'
import type { HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  title?: string
}

export default function Card({ title, children, className, ...props }: Props) {
  return (
    <div
      className={cn('rounded-xl border border-gray-200 bg-white p-5 shadow-sm', className)}
      {...props}
    >
      {title && <h3 className="mb-4 font-semibold text-[#1e3050]">{title}</h3>}
      {children}
    </div>
  )
}
