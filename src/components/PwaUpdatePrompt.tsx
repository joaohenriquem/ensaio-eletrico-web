import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw } from 'lucide-react'

export default function PwaUpdatePrompt() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl bg-[#1e3050] px-4 py-3 text-sm text-white shadow-lg">
      <span>Nova versão disponível.</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="flex items-center gap-1.5 rounded-lg bg-[#f0a500] px-3 py-1.5 font-semibold text-[#1e3050]"
      >
        <RefreshCw size={14} /> Atualizar
      </button>
    </div>
  )
}
