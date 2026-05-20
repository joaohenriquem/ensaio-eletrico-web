import { useState } from 'react'
import { Mail, Send, Pencil, Trash2 } from 'lucide-react'
import { useOrdens, useCriarOrdem, useAtualizarOrdem, useEnviarEmailOS, useExcluirOrdem } from '../hooks/useOrdens'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useClientes } from '../hooks/useClientes'
import { STATUS_OS, STATUS_OS_COR, TIPOS_OS } from '../utils/constants'
import { dataBr } from '../utils/formatters'
import type { OrdemServico } from '../types'
import Tabs from '../components/ui/Tabs'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'

function NovaOSForm({ onSuccess, editData }: { onSuccess: () => void; editData?: OrdemServico | null }) {
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
  })
  const [error, setError] = useState('')

  const clienteNome = clienteId
    ? (clientes.find(c => c._id === clienteId)?.nome ?? '')
    : clienteManual

  async function handleSubmit() {
    if (!clienteNome || !form.descricao) {
      setError('Cliente e descrição são obrigatórios.')
      return
    }
    if (form.tipo === 'Outro' && !tipoOutro.trim()) {
      setError('Informe o tipo de serviço.')
      return
    }
    setError('')
    const payload = {
      ...form,
      tipo: form.tipo === 'Outro' ? `Outro: ${tipoOutro.trim()}` : form.tipo,
      cliente_id: clienteId || undefined,
      cliente_nome: clienteNome,
    }
    if (isEdit) {
      await atualizar.mutateAsync({ id: editData!._id, data: payload })
      onSuccess()
    } else {
      const { id } = await criar.mutateAsync(payload)
      if (emailAprovacao.trim()) {
        await enviarEmail.mutateAsync({ id, destinatario: emailAprovacao.trim(), tipo: 'aprovacao' })
      }
      onSuccess()
    }
  }

  const clienteOpts = [
    { value: '', label: '– Selecione um cliente –' },
    { value: '__manual__', label: '– Digitar manualmente –' },
    ...clientes.map(c => ({ value: c._id, label: c.nome })),
  ]

  return (
    <Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Select
            label="Cliente"
            options={clienteOpts}
            value={clienteId === '' && clienteManual ? '__manual__' : clienteId}
            onChange={(e) => {
              if (e.target.value === '__manual__') { setClienteId(''); setClienteManual('') }
              else { setClienteId(e.target.value); setClienteManual('') }
            }}
          />
        </div>
        {(clienteId === '' && !clientes.find(c => c._id === clienteId)) && (
          <div className="sm:col-span-2">
            <Input label="Nome do cliente" value={clienteManual} onChange={(e) => setClienteManual(e.target.value)} />
          </div>
        )}
        <div className={form.tipo === 'Outro' ? '' : 'sm:col-span-1'}>
          <Select
            label="Tipo de Serviço"
            options={TIPOS_OS.map(t => ({ value: t, label: t }))}
            value={form.tipo}
            onChange={(e) => { setForm(f => ({ ...f, tipo: e.target.value })); setTipoOutro('') }}
          />
        </div>
        {form.tipo === 'Outro' && (
          <div>
            <Input
              label="Descreva o tipo de serviço"
              placeholder="Ex: Troca de quadro elétrico..."
              value={tipoOutro}
              onChange={(e) => setTipoOutro(e.target.value)}
            />
          </div>
        )}
        <Select
          label="Status Inicial"
          options={Object.entries(STATUS_OS).map(([k, v]) => ({ value: k, label: v }))}
          value={form.status}
          onChange={(e) => setForm(f => ({ ...f, status: e.target.value as OrdemServico['status'] }))}
        />
        <Input label="Data" type="date" value={form.data} onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))} />
        <Input label="Técnico Responsável" value={form.tecnico} onChange={(e) => setForm(f => ({ ...f, tecnico: e.target.value }))} />
        <Input label="Local / Endereço" value={form.local} onChange={(e) => setForm(f => ({ ...f, local: e.target.value }))} />
        <Select
          label="Prioridade"
          options={['Normal', 'Alta', 'Urgente'].map(p => ({ value: p, label: p }))}
          value={form.prioridade}
          onChange={(e) => setForm(f => ({ ...f, prioridade: e.target.value as 'Normal' | 'Alta' | 'Urgente' }))}
        />
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Descrição / Escopo *</label>
          <textarea rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none focus:ring-2 focus:ring-[#f0a500]/20" value={form.descricao} onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Observações Internas</label>
          <textarea rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none focus:ring-2 focus:ring-[#f0a500]/20" value={form.observacoes} onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            <span className="flex items-center gap-1.5">
              <Mail size={14} className="text-[#f0a500]" />
              Enviar aprovação por e-mail após criar <span className="text-gray-400 font-normal">(opcional)</span>
            </span>
          </label>
          <Input
            type="email"
            placeholder="email@cliente.com.br"
            value={emailAprovacao}
            onChange={(e) => setEmailAprovacao(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      <div className="mt-4 flex justify-end">
        <Button onClick={handleSubmit} disabled={criar.isPending || atualizar.isPending || enviarEmail.isPending}>
          <span className="flex items-center gap-2">
            {!isEdit && emailAprovacao.trim() ? <Send size={15} /> : null}
            {isEdit ? 'Salvar Alterações' : emailAprovacao.trim() ? 'Criar e Enviar Aprovação' : 'Criar Ordem de Serviço'}
          </span>
        </Button>
      </div>
    </Card>
  )
}

function ListaOS({ onEditar }: { onEditar: (os: OrdemServico) => void }) {
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroBusca, setFiltroBusca] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [novoStatus, setNovoStatus] = useState('')
  const [obs, setObs] = useState('')
  const [emailConclusao, setEmailConclusao] = useState('')
  const atualizar = useAtualizarOrdem()
  const excluir = useExcluirOrdem()
  const [excluirId, setExcluirId] = useState<string | null>(null)

  const [emailModal, setEmailModal] = useState<{ open: boolean; os: OrdemServico | null }>({ open: false, os: null })
  const [emailDestino, setEmailDestino] = useState('')
  const [emailEnviando, setEmailEnviando] = useState(false)
  const [emailFeedback, setEmailFeedback] = useState('')
  const enviarEmail = useEnviarEmailOS()

  const { data: ordens = [], isLoading } = useOrdens({
    status: filtroStatus === 'todos' ? undefined : filtroStatus,
    tipo: filtroTipo === 'todos' ? undefined : filtroTipo,
    cliente: filtroBusca || undefined,
  })

  async function atualizarStatus(id: string) {
    const payload: Partial<OrdemServico> & { _email_conclusao?: string } = {
      status: novoStatus as OrdemServico['status'],
      obs_status: obs,
    }
    if (novoStatus === 'concluida' && emailConclusao.trim()) {
      payload._email_conclusao = emailConclusao.trim()
    }
    await atualizar.mutateAsync({ id, data: payload })
    setEditId(null)
    setNovoStatus('')
    setObs('')
    setEmailConclusao('')
  }

  function abrirModalEmail(os: OrdemServico) {
    setEmailDestino('')
    setEmailFeedback('')
    setEmailModal({ open: true, os })
  }

  async function handleEnviarEmail() {
    if (!emailModal.os || !emailDestino.trim()) return
    setEmailEnviando(true)
    setEmailFeedback('')
    try {
      await enviarEmail.mutateAsync({ id: emailModal.os._id, destinatario: emailDestino.trim(), tipo: 'aprovacao' })
      setEmailFeedback('E-mail enviado com sucesso!')
    } catch {
      setEmailFeedback('Erro ao enviar e-mail. Verifique as configurações SMTP.')
    } finally {
      setEmailEnviando(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select
          label="Status"
          options={[{ value: 'todos', label: 'Todos os status' }, ...Object.entries(STATUS_OS).map(([k, v]) => ({ value: k, label: v }))]}
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        />
        <Select
          label="Tipo"
          options={[{ value: 'todos', label: 'Todos os tipos' }, ...TIPOS_OS.map(t => ({ value: t, label: t }))]}
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        />
        <Input label="Busca de Cliente" placeholder="Nome do cliente..." value={filtroBusca} onChange={(e) => setFiltroBusca(e.target.value)} />
      </div>

      {isLoading ? <p className="text-sm text-gray-400">Carregando...</p> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#1e3050] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold">Nº</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Data</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {ordens.map((os) => (
                <>
                  <tr key={os._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{os.numero}</td>
                    <td className="px-4 py-3">{os.cliente_nome}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{os.tipo}</td>
                    <td className="px-4 py-3">
                      <Badge label={STATUS_OS[os.status] ?? os.status} className={STATUS_OS_COR[os.status]} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{dataBr(os.data)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          title="Editar OS"
                          onClick={() => onEditar(os)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition"
                        >
                          <Pencil size={15} />
                        </button>
                        <Button variant="ghost" size="sm" onClick={() => { setEditId(os._id); setNovoStatus(os.status); setEmailConclusao('') }}>
                          Status
                        </Button>
                        <button
                          title="Enviar por e-mail para aprovação"
                          onClick={() => abrirModalEmail(os)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-[#f0a500]/10 hover:text-[#f0a500] transition"
                        >
                          <Mail size={16} />
                        </button>
                        <button
                          title="Excluir OS"
                          onClick={() => setExcluirId(os._id)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editId === os._id && (
                    <tr className="bg-amber-50">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="flex flex-wrap items-end gap-3">
                          <Select
                            label="Novo Status"
                            options={Object.entries(STATUS_OS).map(([k, v]) => ({ value: k, label: v }))}
                            value={novoStatus}
                            onChange={(e) => setNovoStatus(e.target.value)}
                          />
                          <Input label="Observação" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Opcional" />
                          {novoStatus === 'concluida' && (
                            <Input
                              label="Notificar cliente (e-mail)"
                              type="email"
                              value={emailConclusao}
                              onChange={(e) => setEmailConclusao(e.target.value)}
                              placeholder="email@cliente.com (opcional)"
                            />
                          )}
                          <Button size="sm" onClick={() => atualizarStatus(os._id)} disabled={atualizar.isPending}>Salvar</Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditId(null)}>Cancelar</Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {ordens.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-400">Nenhuma OS encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={emailModal.open} onClose={() => setEmailModal({ open: false, os: null })} title="Enviar OS por E-mail para Aprovação">
        {emailModal.os && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm">
              <p className="font-medium text-gray-800">{emailModal.os.numero} · {emailModal.os.cliente_nome}</p>
              <p className="text-gray-500">{emailModal.os.tipo} · {dataBr(emailModal.os.data)}</p>
            </div>
            <Input
              label="E-mail do destinatário"
              type="email"
              value={emailDestino}
              onChange={(e) => setEmailDestino(e.target.value)}
              placeholder="email@cliente.com.br"
            />
            {emailFeedback && (
              <p className={`text-sm ${emailFeedback.includes('sucesso') ? 'text-green-600' : 'text-red-500'}`}>
                {emailFeedback}
              </p>
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

export default function OrdensServico() {
  const [tab, setTab] = useState(0)
  const [editOS, setEditOS] = useState<OrdemServico | null>(null)

  function handleEditar(os: OrdemServico) {
    setEditOS(os)
    setTab(1)
  }

  function handleSuccess() {
    setEditOS(null)
    setTab(0)
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-[#1e3050]">Ordens de Serviço</h1>
      <Tabs
        tabs={[
          { label: '📋 Lista de OS', content: <ListaOS onEditar={handleEditar} /> },
          { label: editOS ? '✏️ Editar OS' : '➕ Nova OS', content: <NovaOSForm editData={editOS} onSuccess={handleSuccess} /> },
        ]}
        defaultIndex={tab}
        key={`${tab}-${editOS?._id ?? 'new'}`}
      />
    </div>
  )
}
