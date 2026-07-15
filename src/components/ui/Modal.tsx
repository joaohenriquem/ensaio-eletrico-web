import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  wide?: boolean
}

export default function Modal({ open, onClose, title, children, wide }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`flex w-full max-h-[90vh] flex-col rounded-xl bg-white shadow-xl ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
          {title && <h2 className="font-semibold text-[#1e3050]">{title}</h2>}
          <button onClick={onClose} className="ml-auto text-gray-500 hover:text-gray-800">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}
