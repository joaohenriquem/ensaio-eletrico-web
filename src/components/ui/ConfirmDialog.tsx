import Button from './Button'

interface Props {
  titulo?: string
  mensagem: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export default function ConfirmDialog({ titulo = 'Confirmar exclusão', mensagem, onConfirm, onCancel, loading }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">{titulo}</h2>
        <p className="mb-6 text-sm text-gray-500">{mensagem}</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </div>
    </div>
  )
}
