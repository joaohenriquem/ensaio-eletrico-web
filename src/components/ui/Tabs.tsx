import { useState, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface Tab {
  label: string
  content: ReactNode
}

interface Props {
  tabs: Tab[]
  defaultIndex?: number
  className?: string
}

export default function Tabs({ tabs, defaultIndex = 0, className }: Props) {
  const [active, setActive] = useState(defaultIndex)

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px',
              active === i
                ? 'border-[#f0a500] text-[#f0a500]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[active]?.content}</div>
    </div>
  )
}
