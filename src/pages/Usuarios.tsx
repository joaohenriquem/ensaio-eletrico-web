import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Clock, Users, ShieldCheck, MapPin, History } from 'lucide-react'
import { listarUsuarios, aprovarUsuario, rejeitarUsuario, listarLoginLogs } from '../api/auth'
import type { UsuarioAdmin } from '../types'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router'

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
}

const STATUS_STYLE: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-800',
  aprovado: 'bg-green-100 text-green-700',
  rejeitado: 'bg-red-100 text-red-700',
}

function ModalRejeitar({ usuario, onConfirm, onCancel }: {
  usuario: UsuarioAdmin
  onConfirm: (motivo: string) => void
  onCancel: () => void
}) {
  const [motivo, setMotivo] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">Rejeitar cadastro</h2>
        <p className="mb-4 text-sm text-gray-500">
          Usuário: <strong>{usuario.nome}</strong>
        </p>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Motivo (opcional)
        </label>
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Informe o motivo da rejeição..."
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button variant="danger" onClick={() => onConfirm(motivo)}>Confirmar rejeição</Button>
        </div>
      </div>
    </div>
  )
}

export default function Usuarios() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [rejeitando, setRejeitando] = useState<UsuarioAdmin | null>(null)
  const [filtro, setFiltro] = useState<'todos' | 'pendente' | 'aprovado' | 'rejeitado'>('todos')

  if (user?.perfil !== 'Administrador' && user?.perfil !== 'Admin') {
    return <Navigate to="/" replace />
  }

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: listarUsuarios,
  })

  const mutAprovar = useMutation({
    mutationFn: (id: string) => aprovarUsuario(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  })

  const mutRejeitar = useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) => rejeitarUsuario(id, motivo || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] })
      setRejeitando(null)
    },
  })

  const pendentes = usuarios.filter((u) => u.status === 'pendente').length

  const lista = filtro === 'todos' ? usuarios : usuarios.filter((u) => u.status === filtro)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[#1e3050] p-2.5">
          <Users size={20} className="text-[#f0a500]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Usuários</h1>
          <p className="text-sm text-gray-500">Gerencie o acesso ao sistema</p>
        </div>
        {pendentes > 0 && (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
            <Clock size={14} />
            {pendentes} pendente{pendentes > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {(['todos', 'pendente', 'aprovado', 'rejeitado'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filtro === f
                ? 'bg-[#1e3050] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'todos' ? 'Todos' : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-gray-400">Carregando...</div>
      ) : lista.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <ShieldCheck size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-400">Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lista.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e3050] text-sm font-bold text-[#f0a500]">
                {u.nome.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">{u.nome}</p>
                <p className="truncate text-sm text-gray-500">{u.email} · @{u.username}</p>
                <p className="text-xs text-gray-400">{u.perfil}</p>
              </div>

              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[u.status]}`}>
                {STATUS_LABEL[u.status]}
              </span>

              {u.status === 'pendente' && (
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => mutAprovar.mutate(u.id)}
                    disabled={mutAprovar.isPending}
                  >
                    <CheckCircle size={14} />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setRejeitando(u)}
                  >
                    <XCircle size={14} />
                    Rejeitar
                  </Button>
                </div>
              )}

              {u.status === 'aprovado' && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setRejeitando(u)}
                >
                  <XCircle size={14} />
                  Revogar
                </Button>
              )}

              {u.status === 'rejeitado' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => mutAprovar.mutate(u.id)}
                  disabled={mutAprovar.isPending}
                >
                  <CheckCircle size={14} />
                  Aprovar
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {rejeitando && (
        <ModalRejeitar
          usuario={rejeitando}
          onConfirm={(motivo) => mutRejeitar.mutate({ id: rejeitando.id, motivo })}
          onCancel={() => setRejeitando(null)}
        />
      )}

      <LoginLogsSection />
    </div>
  )
}

function LoginLogsSection() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['login-logs'],
    queryFn: listarLoginLogs,
  })

  function formatData(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <History size={16} className="text-gray-500" />
        <h2 className="font-semibold text-gray-800">Histórico de Logins</h2>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Carregando...</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhum login registrado ainda.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <div className="mt-0.5 shrink-0 rounded-full bg-green-100 p-1.5">
                <ShieldCheck size={14} className="text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{log.usuario_nome}</p>
                {log.endereco && (
                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={11} /> {log.endereco}
                  </p>
                )}
                {!log.endereco && log.latitude && (
                  <p className="text-xs text-gray-400">{log.latitude?.toFixed(4)}, {log.longitude?.toFixed(4)}</p>
                )}
                {!log.endereco && !log.latitude && (
                  <p className="text-xs text-gray-400">Localização não disponível</p>
                )}
              </div>
              <span className="shrink-0 text-xs text-gray-400">{formatData(log.criado_em)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
