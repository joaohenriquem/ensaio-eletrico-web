import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function BottomDrawer({ open, onClose, title, children }: Props) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-300',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{ maxHeight: 'calc(88dvh - env(safe-area-inset-top, 0px))' }}
      >
        <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-gray-200" />
        <div className="flex shrink-0 items-center justify-between px-5 py-3">
          <h2 className="text-base font-semibold text-[#1e3050]">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto px-5" style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}>
          {children}
        </div>
      </div>
    </>
  )
}
