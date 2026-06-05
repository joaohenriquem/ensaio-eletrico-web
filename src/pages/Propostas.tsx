import { useState } from 'react'
import { Plus, Trash2, Download, FileText, ChevronDown, MapPin } from 'lucide-react'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import BottomDrawer from '../components/ui/BottomDrawer'
import { useExcluirProposta } from '../hooks/usePropostas'
import ImageUpload from '../components/ui/ImageUpload'
import { usePropostas, useCriarProposta, useAtualizarProposta } from '../hooks/usePropostas'
import { useClientes } from '../hooks/useClientes'
import { NORMAS_PADRAO, STATUS_PROPOSTA, STATUS_PROPOSTA_COR } from '../utils/constants'
import { dataBr, formatarMoeda } from '../utils/formatters'
import { baixarPdfProposta } from '../api/propostas'
import type { InvestimentoItem, Proposta } from '../types'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import SignaturePad from '../components/ui/SignaturePad'

function PropostaForm({ editData, onSuccess, onCancel }: {
  editData?: Proposta | null
  onSuccess: () => void
  onCancel: () => void
}) {
  const criar = useCriarProposta()
  const atualizar = useAtualizarProposta()
  const isEdit = !!editData?._id
  const { data: clientes = [] } = useClientes({ ativo: true })
  const [clienteId, setClienteId] = useState(editData?.cliente_id ?? '')
  const [clienteManual, setClienteManual] = useState(editData?.cliente_id ? '' : (editData?.cliente_nome ?? ''))
  const [form, setForm] = useState({
    cliente_endereco: editData?.cliente_endereco ?? '',
    data: String(editData?.data ?? new Date().toISOString()).split('T')[0],
    descricao: editData?.descricao ?? '',
    objetivo: editData?.objetivo ?? '',
    servicos: (editData?.servicos ?? []).join('\n'),
    materiais: (editData?.materiais ?? []).join('\n'),
    etapas: (editData?.etapas ?? []).join('\n'),
    prazo: editData?.prazo ?? '',
    garantia: editData?.garantia ?? '',
    condicoes_pagamento: editData?.condicoes_pagamento ?? '',
  })
  const [normas, setNormas] = useState<string[]>(editData?.normas ?? [])
  const [itens, setItens] = useState<InvestimentoItem[]>(editData?.investimento ?? [])
  const [novoItem, setNovoItem] = useState({ descricao: '', valor: '' })
  const [fotos, setFotos] = useState<string[]>(editData?.fotos ?? [])
  const [assinatura, setAssinatura] = useState(editData?.assinatura ?? '')
  const [nomeAprovador, setNomeAprovador] = useState(editData?.nome_aprovador ?? '')
  const [assinaturaContratado, setAssinaturaContratado] = useState(editData?.assinatura_contratado ?? '')
  const [nomeContratado, setNomeContratado] = useState(editData?.nome_contratado ?? '')
  const [error, setError] = useState('')
  const [savedId, setSavedId] = useState<string | null>(null)
  const [savedNumero, setSavedNumero] = useState<string>('')

  const clienteSelecionado = clientes.find(c => c._id === clienteId)
  const clienteNome = clienteId ? (clienteSelecionado?.nome ?? '') : clienteManual
  const total = itens.reduce((acc, i) => acc + Number(i.valor), 0)

  function addItem() {
    if (!novoItem.descricao) return
    const valor = parseFloat(novoItem.valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0
    setItens(prev => [...prev, { descricao: novoItem.descricao, valor }])
    setNovoItem({ descricao: '', valor: '' })
  }

  async function salvar(status: Proposta['status']) {
    if (!clienteNome || !form.descricao) { setError('Cliente e descrição são obrigatórios.'); return }
    setError('')
    const payload = {
      cliente_id: clienteId || undefined,
      cliente_nome: clienteNome,
      cliente_endereco: clienteSelecionado?.endereco ?? form.cliente_endereco,
      data: form.data,
      descricao: form.descricao,
      objetivo: form.objetivo,
      servicos: form.servicos.split('\n').map(s => s.trim()).filter(Boolean),
      materiais: form.materiais.split('\n').map(s => s.trim()).filter(Boolean),
      etapas: form.etapas.split('\n').map(s => s.trim()).filter(Boolean),
      normas,
      prazo: form.prazo,
      garantia: form.garantia,
      condicoes_pagamento: form.condicoes_pagamento,
      investimento: itens,
      total,
      fotos: fotos.length > 0 ? fotos : undefined,
      assinatura: assinatura || undefined,
      nome_aprovador: nomeAprovador || undefined,
      assinatura_contratado: assinaturaContratado || undefined,
      nome_contratado: nomeContratado || undefined,
      status,
    }
    try {
      if (isEdit) {
        await atualizar.mutateAsync({ id: editData!._id, data: payload })
        onSuccess()
      } else {
        const res = await criar.mutateAsync(payload)
        setSavedId(res.id)
        setSavedNumero(res.numero)
        if (status !== 'rascunho') onSuccess()
      }
    } catch {
      setError('Não foi possível salvar. Verifique sua conexão e tente novamente.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card title="Identificação">
        <div className="flex flex-col gap-3">
          <Select
            label="Cliente"
            options={[
              { value: '', label: '– Selecione –' },
              { value: '__manual__', label: '– Digitar manualmente –' },
              ...clientes.map(c => ({ value: c._id, label: c.nome })),
            ]}
            value={clienteId}
            onChange={(e) => { if (e.target.value === '__manual__') setClienteId(''); else setClienteId(e.target.value) }}
          />
          {!clienteId && <Input label="Ou digite o cliente" value={clienteManual} onChange={(e) => setClienteManual(e.target.value)} />}
          <Input label="Endereço do Cliente" value={clienteSelecionado?.endereco ?? form.cliente_endereco} onChange={(e) => setForm(f => ({ ...f, cliente_endereco: e.target.value }))} />
          <Input label="Data" type="date" value={form.data} onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))} />
          <Input label="Descrição da Proposta *" value={form.descricao} onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Instalação de carregadores veiculares Wallbox" />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Objetivo da Proposta</label>
            <textarea rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none" value={form.objetivo} onChange={(e) => setForm(f => ({ ...f, objetivo: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Fotos / Anexos</label>
            <ImageUpload fotos={fotos} onChange={setFotos} max={6} />
          </div>
        </div>
      </Card>

      <Card title="Serviços a Executar">
        <textarea rows={5} placeholder="Um serviço por linha..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none" value={form.servicos} onChange={(e) => setForm(f => ({ ...f, servicos: e.target.value }))} />
      </Card>

      <Card title="Materiais – NÃO Inclusos (opcional)">
        <textarea rows={4} placeholder="Um material por linha..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none" value={form.materiais} onChange={(e) => setForm(f => ({ ...f, materiais: e.target.value }))} />
      </Card>

      <Card title="Cronograma de Execução">
        <textarea rows={4} placeholder="Uma etapa por linha..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none" value={form.etapas} onChange={(e) => setForm(f => ({ ...f, etapas: e.target.value }))} />
      </Card>

      <Card title="Normas e Condições">
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Normas Técnicas</p>
            <div className="flex flex-col gap-1.5">
              {NORMAS_PADRAO.map(n => (
                <label key={n} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={normas.includes(n)} onChange={(e) => setNormas(prev => e.target.checked ? [...prev, n] : prev.filter(x => x !== n))} className="accent-[#f0a500]" />
                  {n}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prazo de Execução" value={form.prazo} onChange={(e) => setForm(f => ({ ...f, prazo: e.target.value }))} />
            <Input label="Garantia" value={form.garantia} onChange={(e) => setForm(f => ({ ...f, garantia: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Condições de Pagamento</label>
            <textarea rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none" value={form.condicoes_pagamento} onChange={(e) => setForm(f => ({ ...f, condicoes_pagamento: e.target.value }))} />
          </div>
        </div>
      </Card>

      <Card title="Tabela de Investimento">
        <div className="flex flex-col gap-2 mb-4">
          <Input placeholder="Descrição do serviço..." value={novoItem.descricao} onChange={(e) => setNovoItem(i => ({ ...i, descricao: e.target.value }))} />
          <div className="flex gap-2">
            <Input placeholder="Valor (ex: 1500,00)" value={novoItem.valor} onChange={(e) => setNovoItem(i => ({ ...i, valor: e.target.value }))} />
            <Button onClick={addItem}><Plus size={16} /></Button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {itens.map((item, i) => (
            <div key={i} className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
              <span className="truncate mr-2">{item.descricao}</span>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-medium">{Number(item.valor) === 0 ? 'DESCONTO' : formatarMoeda(item.valor)}</span>
                <button onClick={() => setItens(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {itens.length > 0 && (
            <div className="flex justify-end rounded bg-gray-200 px-3 py-2 font-bold text-[#1e3050]">
              TOTAL: {formatarMoeda(total)}
            </div>
          )}
        </div>
      </Card>

      <Card title="Assinaturas">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Input label="Nome do Contratante" value={nomeAprovador} onChange={(e) => setNomeAprovador(e.target.value)} placeholder="Nome completo do cliente" />
            <SignaturePad label="Assinatura do Contratante" value={assinatura} onChange={setAssinatura} />
          </div>
          <div className="flex flex-col gap-3">
            <Input label="Nome do Contratado" value={nomeContratado} onChange={(e) => setNomeContratado(e.target.value)} placeholder="Nome do responsável técnico" />
            <SignaturePad label="Assinatura do Contratado" value={assinaturaContratado} onChange={setAssinaturaContratado} />
          </div>
        </div>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {savedId && (
        <button
          onClick={() => baixarPdfProposta(savedId, savedNumero)}
          className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
        >
          <Download size={16} /> Baixar PDF da Proposta
        </button>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => salvar('rascunho')} disabled={criar.isPending || atualizar.isPending} className="flex-1">
          💾 Rascunho
        </Button>
        <Button onClick={() => salvar('enviado')} disabled={criar.isPending || atualizar.isPending} className="flex-1">
          {isEdit ? '✅ Salvar' : '📤 Enviar'}
        </Button>
      </div>
      <Button variant="outline" onClick={onCancel} className="w-full">Cancelar</Button>
    </div>
  )
}

function StatusPropostaDrawer({ proposta, open, onClose }: { proposta: Proposta | null; open: boolean; onClose: () => void }) {
  const atualizar = useAtualizarProposta()
  const [novoStatus, setNovoStatus] = useState('')
  const [saving, setSaving] = useState(false)

  async function salvar() {
    if (!proposta || !novoStatus) return
    setSaving(true)
    await atualizar.mutateAsync({ id: proposta._id, data: { status: novoStatus as Proposta['status'] } })
    setSaving(false)
    setNovoStatus('')
    onClose()
  }

  return (
    <BottomDrawer open={open} onClose={onClose} title="Atualizar Status">
      <div className="flex flex-col gap-3">
        {proposta && (
          <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
            <span className="font-medium">{proposta.numero}</span> · {proposta.cliente_nome}
          </p>
        )}
        <Select
          label="Novo Status"
          options={Object.entries(STATUS_PROPOSTA).map(([k, v]) => ({ value: k, label: v }))}
          value={novoStatus}
          onChange={(e) => setNovoStatus(e.target.value)}
        />
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

function PropostaCard({ proposta, onEdit, onStatus, onExcluir }: {
  proposta: Proposta
  onEdit: () => void
  onStatus: () => void
  onExcluir: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left active:bg-gray-50"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e3050]/10 mt-0.5">
          <FileText size={16} className="text-[#1e3050]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-gray-400">{proposta.numero}</span>
            <Badge label={STATUS_PROPOSTA[proposta.status] ?? proposta.status} className={`${STATUS_PROPOSTA_COR[proposta.status]} text-xs`} />
          </div>
          <p className="mt-0.5 truncate font-semibold text-[#1e3050] text-sm">{proposta.cliente_nome}</p>
          <p className="text-xs text-gray-400 truncate">{proposta.descricao}</p>
        </div>
        <div className="shrink-0 text-right ml-2">
          {proposta.total ? <p className="text-sm font-bold text-[#1e3050]">{formatarMoeda(proposta.total)}</p> : null}
          <p className="text-xs text-gray-400">{dataBr(proposta.data)}</p>
        </div>
        <ChevronDown size={16} className={`mt-1 shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-4 pb-4 pt-3">
          {proposta.cliente_endereco && (
            <p className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <MapPin size={12} className="shrink-0 text-gray-400" /> {proposta.cliente_endereco}
            </p>
          )}
          {proposta.objetivo && (
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{proposta.objetivo}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <button onClick={onEdit} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 active:bg-gray-50">
              Editar
            </button>
            <button onClick={() => baixarPdfProposta(proposta._id, proposta.numero)} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 active:bg-gray-50">
              <Download size={12} /> PDF
            </button>
            <button onClick={onStatus} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-[#1e3050] shadow-sm ring-1 ring-gray-200 active:bg-gray-50">
              Status
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

export default function Propostas() {
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroBusca, setFiltroBusca] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [statusDrawerOpen, setStatusDrawerOpen] = useState(false)
  const [editProp, setEditProp] = useState<Proposta | null>(null)
  const [statusProp, setStatusProp] = useState<Proposta | null>(null)
  const [excluirId, setExcluirId] = useState<string | null>(null)

  const excluir = useExcluirProposta()
  const { data: propostas = [], isLoading } = usePropostas({
    status: filtroStatus === 'todos' ? undefined : filtroStatus,
    cliente: filtroBusca || undefined,
  })

  function abrirNovo() { setEditProp(null); setDrawerOpen(true) }
  function abrirEditar(p: Proposta) { setEditProp(p); setDrawerOpen(true) }
  function abrirStatus(p: Proposta) { setStatusProp(p); setStatusDrawerOpen(true) }

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div>
        <h1 className="text-xl font-bold text-[#1e3050]">Propostas Comerciais</h1>
        {!isLoading && <p className="text-xs text-gray-400">{propostas.length} proposta{propostas.length !== 1 ? 's' : ''}</p>}
      </div>

      <div className="flex gap-2">
        <Select
          options={[{ value: 'todos', label: 'Todos os status' }, ...Object.entries(STATUS_PROPOSTA).map(([k, v]) => ({ value: k, label: v }))]  }
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        />
        <input
          className="flex-1 rounded-xl border border-gray-200 bg-white py-2 px-3 text-sm shadow-sm focus:border-[#f0a500] focus:outline-none"
          placeholder="Buscar cliente..."
          value={filtroBusca}
          onChange={e => setFiltroBusca(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-gray-400">Carregando...</p>
      ) : propostas.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
          <FileText size={32} className="opacity-30" />
          <p className="text-sm">Nenhuma proposta encontrada.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {propostas.map(p => (
            <PropostaCard
              key={p._id}
              proposta={p}
              onEdit={() => abrirEditar(p)}
              onStatus={() => abrirStatus(p)}
              onExcluir={() => setExcluirId(p._id)}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={abrirNovo}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0a500] text-[#1e3050] shadow-lg transition-transform active:scale-95 hover:bg-[#d4920a]"
        title="Nova Proposta"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <BottomDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editProp ? 'Editar Proposta' : 'Nova Proposta'}>
        <PropostaForm key={editProp?._id ?? 'new'} editData={editProp} onSuccess={() => setDrawerOpen(false)} onCancel={() => setDrawerOpen(false)} />
      </BottomDrawer>

      <StatusPropostaDrawer proposta={statusProp} open={statusDrawerOpen} onClose={() => setStatusDrawerOpen(false)} />

      {excluirId && (
        <ConfirmDialog
          mensagem="Tem certeza que deseja excluir esta proposta? Esta ação não pode ser desfeita."
          onConfirm={() => excluir.mutate(excluirId, { onSuccess: () => setExcluirId(null) })}
          onCancel={() => setExcluirId(null)}
          loading={excluir.isPending}
        />
      )}
    </div>
  )
}
