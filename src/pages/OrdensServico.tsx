import { useState } from 'react'
import { Mail, Send, Trash2, Plus, ClipboardList, MapPin, User, ChevronDown } from 'lucide-react'
import { useOrdens, useCriarOrdem, useAtualizarOrdem, useEnviarEmailOS, useExcluirOrdem } from '../hooks/useOrdens'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import BottomDrawer from '../components/ui/BottomDrawer'
import { useClientes } from '../hooks/useClientes'
import { STATUS_OS, STATUS_OS_COR, TIPOS_OS } from '../utils/constants'
import { dataBr } from '../utils/formatters'
import { foiEnfileirado } from '../offline/outboxMutation'
import { useOutbox } from '../offline/useOutbox'
import { remover } from '../offline/outbox'
import type { OrdemServico } from '../types'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'

function OSForm({ editData, onSuccess, onCancel }: {
  editData?: OrdemServico | null
  onSuccess: () => void
  onCancel: () => void
}) {
  const criar = useCriarOrdem()
  const atualizar = useAtualizarOrdem()
  const enviarEmail = useEnviarEmailOS()
  const isEdit = !!editData?._id
  const { data: clientes = [] } = useClientes({ ativo: true })
  const [clienteId, setClienteId] = useState(editData?.cliente_id ?? '')
  const [clienteManual, setClienteManual] = useState(editData?.cliente_id ? '' : (editData?.cliente_nome ?? ''))
  const tipoBase = editData?.tipo?.startsWith('Outro: ') ? 'Outro' : (editData?.tipo ?? TIPOS_OS[0])
  const [tipoOutro, setTipoOutro] = useState(editData?.tipo?.startsWith('Outro: ') ? editData.tipo.replace('Outro: ', '') : '')
  const [emailAprovacao, setEmailAprovacao] = useState('')
  const [form, setForm] = useState({
    tipo: tipoBase,
    status: editData?.status ?? 'aberta' as OrdemServico['status'],
    data: String(editData?.data ?? new Date().toISOString()).split('T')[0],
    tecnico: editData?.tecnico ?? '',
    local: editData?.local ?? '',
    prioridade: (editData?.prioridade ?? 'Normal') as 'Normal' | 'Alta' | 'Urgente',
    descricao: editData?.descricao ?? '',
    observacoes: editData?.observacoes ?? '',
    valor: editData?.valor ?? '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const clienteNome = clienteId
    ? (clientes.find(c => c._id === clienteId)?.nome ?? '')
    : clienteManual

  async function handleSubmit() {
    if (!clienteNome || !form.descricao) { setError('Cliente e descrição são obrigatórios.'); return }
    if (form.tipo === 'Outro' && !tipoOutro.trim()) { setError('Informe o tipo de serviço.'); return }
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        tipo: form.tipo === 'Outro' ? `Outro: ${tipoOutro.trim()}` : form.tipo,
        cliente_id: clienteId || undefined,
        cliente_nome: clienteNome,
        valor: form.valor ? Number(form.valor) : undefined,
      }
      if (isEdit) {
        await atualizar.mutateAsync({ id: editData!._id, data: payload })
      } else {
        const res = await criar.mutateAsync(payload)
        if (!foiEnfileirado(res) && emailAprovacao.trim()) {
          await enviarEmail.mutateAsync({ id: res.id, destinatario: emailAprovacao.trim(), tipo: 'aprovacao' })
        }
      }
      onSuccess()
    } catch {
      setError('Não foi possível salvar. Verifique sua conexão e tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const clienteOpts = [
    { value: '', label: '– Selecione um cliente –' },
    { value: '__manual__', label: '– Digitar manualmente –' },
    ...clientes.map(c => ({ value: c._id, label: c.nome })),
  ]

  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Cliente"
        options={clienteOpts}
        value={clienteId === '' && clienteManual ? '__manual__' : clienteId}
        onChange={(e) => {
          if (e.target.value === '__manual__') { setClienteId(''); setClienteManual('') }
          else { setClienteId(e.target.value); setClienteManual('') }
        }}
      />
      {clienteId === '' && (
        <Input label="Nome do cliente" value={clienteManual} onChange={(e) => setClienteManual(e.target.value)} />
      )}
      <Select
        label="Tipo de Serviço"
        options={TIPOS_OS.map(t => ({ value: t, label: t }))}
        value={form.tipo}
        onChange={(e) => { setForm(f => ({ ...f, tipo: e.target.value })); setTipoOutro('') }}
      />
      {form.tipo === 'Outro' && (
        <Input label="Descreva o tipo" placeholder="Ex: Troca de quadro elétrico..." value={tipoOutro} onChange={(e) => setTipoOutro(e.target.value)} />
      )}
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Status"
          options={Object.entries(STATUS_OS).map(([k, v]) => ({ value: k, label: v }))}
          value={form.status}
          onChange={(e) => setForm(f => ({ ...f, status: e.target.value as OrdemServico['status'] }))}
        />
        <Select
          label="Prioridade"
          options={['Normal', 'Alta', 'Urgente'].map(p => ({ value: p, label: p }))}
          value={form.prioridade}
          onChange={(e) => setForm(f => ({ ...f, prioridade: e.target.value as 'Normal' | 'Alta' | 'Urgente' }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Data" type="date" value={form.data} onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))} />
        <Input label="Técnico" value={form.tecnico} onChange={(e) => setForm(f => ({ ...f, tecnico: e.target.value }))} />
      </div>
      <Input label="Local / Endereço" value={form.local} onChange={(e) => setForm(f => ({ ...f, local: e.target.value }))} />
      <Input label="Valor (R$)" type="number" min={0} step={0.01} placeholder="0,00" value={form.valor} onChange={(e) => setForm(f => ({ ...f, valor: e.target.value }))} />
      <div>
        <label htmlFor="os-descricao" className="mb-1 block text-sm font-medium text-gray-700">Descrição / Escopo *</label>
        <textarea id="os-descricao" rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none focus:ring-2 focus:ring-[#f0a500]/20" value={form.descricao} onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Observações Internas</label>
        <textarea rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none focus:ring-2 focus:ring-[#f0a500]/20" value={form.observacoes} onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))} />
      </div>
      {!isEdit && (
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Mail size={13} className="text-[#f0a500]" />
            Enviar aprovação por e-mail <span className="font-normal text-gray-400">(opcional)</span>
          </label>
          <Input type="email" placeholder="email@cliente.com.br" value={emailAprovacao} onChange={(e) => setEmailAprovacao(e.target.value)} />
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button onClick={handleSubmit} disabled={saving} className="flex-1">
          {saving ? 'Salvando...' : !isEdit && emailAprovacao.trim() ? <><Send size={14} /> Criar e Enviar</> : isEdit ? 'Salvar Alterações' : 'Criar OS'}
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>
      </div>
    </div>
  )
}

function StatusDrawer({ os, open, onClose }: { os: OrdemServico | null; open: boolean; onClose: () => void }) {
  const atualizar = useAtualizarOrdem()
  const [novoStatus, setNovoStatus] = useState('')
  const [obs, setObs] = useState('')
  const [emailConclusao, setEmailConclusao] = useState('')
  const [saving, setSaving] = useState(false)

  async function salvar() {
    if (!os || !novoStatus) return
    setSaving(true)
    const payload: Partial<OrdemServico> & { _email_conclusao?: string } = {
      status: novoStatus as OrdemServico['status'],
      obs_status: obs,
    }
    if (novoStatus === 'concluida' && emailConclusao.trim()) {
      payload._email_conclusao = emailConclusao.trim()
    }
    await atualizar.mutateAsync({ id: os._id, data: payload })
    setSaving(false)
    setNovoStatus('')
    setObs('')
    setEmailConclusao('')
    onClose()
  }

  return (
    <BottomDrawer open={open} onClose={onClose} title="Atualizar Status">
      <div className="flex flex-col gap-3">
        {os && (
          <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
            <span className="font-medium">{os.numero}</span> · {os.cliente_nome}
          </p>
        )}
        <Select
          label="Novo Status"
          options={Object.entries(STATUS_OS).map(([k, v]) => ({ value: k, label: v }))}
          value={novoStatus}
          onChange={(e) => setNovoStatus(e.target.value)}
        />
        <Input label="Observação" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Opcional" />
        {novoStatus === 'concluida' && (
          <Input label="Notificar cliente (e-mail)" type="email" value={emailConclusao} onChange={(e) => setEmailConclusao(e.target.value)} placeholder="email@cliente.com (opcional)" />
        )}
        <div className="flex gap-3 pt-2">
          <Button onClick={salvar} disabled={saving || !novoStatus} className="flex-1">
            {saving ? 'Salvando...' : 'Salvar Status'}
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
        </div>
      </div>
    </BottomDrawer>
  )
}

function OSCard({ os, onEdit, onStatus, onEmail, onExcluir }: {
  os: OrdemServico
  onEdit: () => void
  onStatus: () => void
  onEmail: () => void
  onExcluir: () => void
}) {
  const [open, setOpen] = useState(false)

  const prioridadeCor = os.prioridade === 'Urgente'
    ? 'bg-red-100 text-red-700'
    : os.prioridade === 'Alta'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-gray-100 text-gray-600'

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left active:bg-gray-50"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e3050]/10 mt-0.5">
          <ClipboardList size={16} className="text-[#1e3050]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-gray-400">{os.numero}</span>
            <Badge label={STATUS_OS[os.status] ?? os.status} className={`${STATUS_OS_COR[os.status]} text-xs`} />
            {os.prioridade && os.prioridade !== 'Normal' && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${prioridadeCor}`}>{os.prioridade}</span>
            )}
          </div>
          <p className="mt-0.5 truncate font-semibold text-[#1e3050] text-sm">{os.cliente_nome}</p>
          <p className="text-xs text-gray-400">{os.tipo} · {dataBr(os.data)}</p>
        </div>
        <ChevronDown size={16} className={`mt-1 shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-4 pb-4 pt-3">
          <div className="flex flex-col gap-1.5 text-sm text-gray-600">
            {os.local && (
              <p className="flex items-center gap-2 text-xs">
                <MapPin size={12} className="shrink-0 text-gray-400" /> {os.local}
              </p>
            )}
            {os.tecnico && (
              <p className="flex items-center gap-2 text-xs">
                <User size={12} className="shrink-0 text-gray-400" /> {os.tecnico}
              </p>
            )}
            {os.descricao && <p className="text-xs text-gray-500 mt-1">{os.descricao}</p>}
            {os.obs_status && (
              <p className="text-xs italic text-gray-400">Obs: {os.obs_status}</p>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={onEdit} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 active:bg-gray-50">
              Editar
            </button>
            <button onClick={onStatus} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-[#1e3050] shadow-sm ring-1 ring-gray-200 active:bg-gray-50">
              Status
            </button>
            <button onClick={onEmail} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-[#f0a500] shadow-sm ring-1 ring-amber-200 active:bg-amber-50">
              <Mail size={12} /> E-mail
            </button>
            <button onClick={onExcluir} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm ring-1 ring-red-200 active:bg-red-50">
              <Trash2 size={12} /> Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function OSCardPendente({ item, onDescartar }: { item: import('../offline/outbox').OutboxItem; onDescartar: () => void }) {
  const payload = item.payload as Partial<OrdemServico>
  return (
    <div className="overflow-hidden rounded-xl border border-dashed border-amber-300 bg-amber-50/60 px-4 py-3.5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 mt-0.5">
          <ClipboardList size={16} className="text-amber-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              {item.ultimoErro ? 'Erro ao sincronizar' : 'Pendente de sincronização'}
            </span>
          </div>
          <p className="mt-0.5 truncate font-semibold text-[#1e3050] text-sm">{payload.cliente_nome ?? '—'}</p>
          <p className="text-xs text-gray-500">{payload.tipo} · {payload.descricao}</p>
          {item.ultimoErro && <p className="mt-1 text-xs text-red-600">{item.ultimoErro}</p>}
        </div>
        <button onClick={onDescartar} className="shrink-0 rounded-lg bg-white px-2 py-1 text-xs text-red-600 shadow-sm ring-1 ring-red-200 active:bg-red-50">
          Descartar
        </button>
      </div>
    </div>
  )
}

export default function OrdensServico() {
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroBusca, setFiltroBusca] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [statusDrawerOpen, setStatusDrawerOpen] = useState(false)
  const [editOS, setEditOS] = useState<OrdemServico | null>(null)
  const [novoOSKey, setNovoOSKey] = useState(0)
  const [statusOS, setStatusOS] = useState<OrdemServico | null>(null)
  const [excluirId, setExcluirId] = useState<string | null>(null)
  const [emailModal, setEmailModal] = useState<{ open: boolean; os: OrdemServico | null }>({ open: false, os: null })
  const [emailDestino, setEmailDestino] = useState('')
  const [emailEnviando, setEmailEnviando] = useState(false)
  const [emailFeedback, setEmailFeedback] = useState('')

  const enviarEmail = useEnviarEmailOS()
  const excluir = useExcluirOrdem()
  const pendentes = useOutbox('ordens')

  const { data: ordens = [], isLoading } = useOrdens({
    status: filtroStatus === 'todos' ? undefined : filtroStatus,
    tipo: filtroTipo === 'todos' ? undefined : filtroTipo,
    cliente: filtroBusca || undefined,
  })

  function abrirNovo() { setEditOS(null); setNovoOSKey(k => k + 1); setDrawerOpen(true) }
  function abrirEditar(os: OrdemServico) { setEditOS(os); setDrawerOpen(true) }
  function abrirStatus(os: OrdemServico) { setStatusOS(os); setStatusDrawerOpen(true) }

  async function handleEnviarEmail() {
    if (!emailModal.os || !emailDestino.trim()) return
    setEmailEnviando(true)
    setEmailFeedback('')
    try {
      await enviarEmail.mutateAsync({ id: emailModal.os._id, destinatario: emailDestino.trim(), tipo: 'aprovacao' })
      setEmailFeedback('E-mail enviado com sucesso!')
    } catch {
      setEmailFeedback('Erro ao enviar e-mail.')
    } finally {
      setEmailEnviando(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div>
        <h1 className="text-xl font-bold text-[#1e3050]">Ordens de Serviço</h1>
        {!isLoading && <p className="text-xs text-gray-400">{ordens.length} ordem{ordens.length !== 1 ? 's' : ''}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Select
            options={[{ value: 'todos', label: 'Todos os status' }, ...Object.entries(STATUS_OS).map(([k, v]) => ({ value: k, label: v }))]}
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          />
          <Select
            options={[{ value: 'todos', label: 'Todos os tipos' }, ...TIPOS_OS.map(t => ({ value: t, label: t }))]}
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          />
        </div>
        <input
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm shadow-sm focus:border-[#f0a500] focus:outline-none focus:ring-2 focus:ring-[#f0a500]/20"
          placeholder="Buscar por cliente..."
          value={filtroBusca}
          onChange={e => setFiltroBusca(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-gray-400">Carregando...</p>
      ) : ordens.length === 0 && pendentes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
          <ClipboardList size={32} className="opacity-30" />
          <p className="text-sm">Nenhuma OS encontrada.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pendentes.map(item => (
            <OSCardPendente key={item.localId} item={item} onDescartar={() => remover(item.localId)} />
          ))}
          {ordens.map(os => (
            <OSCard
              key={os._id}
              os={os}
              onEdit={() => abrirEditar(os)}
              onStatus={() => abrirStatus(os)}
              onEmail={() => { setEmailDestino(''); setEmailFeedback(''); setEmailModal({ open: true, os }) }}
              onExcluir={() => setExcluirId(os._id)}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={abrirNovo}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0a500] text-[#1e3050] shadow-lg transition-transform active:scale-95 hover:bg-[#d4920a]"
        title="Nova OS"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <BottomDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editOS ? 'Editar OS' : 'Nova OS'}>
        <OSForm key={editOS?._id ?? `new-${novoOSKey}`} editData={editOS} onSuccess={() => setDrawerOpen(false)} onCancel={() => setDrawerOpen(false)} />
      </BottomDrawer>

      <StatusDrawer os={statusOS} open={statusDrawerOpen} onClose={() => setStatusDrawerOpen(false)} />

      <Modal open={emailModal.open} onClose={() => setEmailModal({ open: false, os: null })} title="Enviar OS por E-mail">
        {emailModal.os && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm">
              <p className="font-medium text-gray-800">{emailModal.os.numero} · {emailModal.os.cliente_nome}</p>
              <p className="text-gray-500">{emailModal.os.tipo} · {dataBr(emailModal.os.data)}</p>
            </div>
            <Input label="E-mail do destinatário" type="email" value={emailDestino} onChange={(e) => setEmailDestino(e.target.value)} placeholder="email@cliente.com.br" />
            {emailFeedback && (
              <p className={`text-sm ${emailFeedback.includes('sucesso') ? 'text-green-600' : 'text-red-500'}`}>{emailFeedback}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEmailModal({ open: false, os: null })}>Cancelar</Button>
              <Button size="sm" onClick={handleEnviarEmail} disabled={emailEnviando || !emailDestino.trim()}>
                {emailEnviando ? 'Enviando...' : 'Enviar E-mail'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {excluirId && (
        <ConfirmDialog
          mensagem="Tem certeza que deseja excluir esta OS? Esta ação não pode ser desfeita."
          onConfirm={() => excluir.mutate(excluirId, { onSuccess: () => setExcluirId(null) })}
          onCancel={() => setExcluirId(null)}
          loading={excluir.isPending}
        />
      )}
    </div>
  )
}
