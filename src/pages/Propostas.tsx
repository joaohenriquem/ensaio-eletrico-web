import { useState } from 'react'
import { Plus, Trash2, Download, Pencil } from 'lucide-react'
import ImageUpload from '../components/ui/ImageUpload'
import { usePropostas, useCriarProposta, useAtualizarProposta } from '../hooks/usePropostas'
import { useClientes } from '../hooks/useClientes'
import { NORMAS_PADRAO, STATUS_PROPOSTA, STATUS_PROPOSTA_COR } from '../utils/constants'
import { dataBr, formatarMoeda } from '../utils/formatters'
import { baixarPdfProposta } from '../api/propostas'
import type { InvestimentoItem, Proposta } from '../types'
import Tabs from '../components/ui/Tabs'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import SignaturePad from '../components/ui/SignaturePad'

function NovaPropostaForm({ onSuccess, editData }: { onSuccess: () => void; editData?: Proposta | null }) {
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

    const servicos = form.servicos.split('\n').map(s => s.trim()).filter(Boolean)
    const materiais = form.materiais.split('\n').map(s => s.trim()).filter(Boolean)
    const etapas = form.etapas.split('\n').map(s => s.trim()).filter(Boolean)

    const payload = {
      cliente_id: clienteId || undefined,
      cliente_nome: clienteNome,
      cliente_endereco: clienteSelecionado?.endereco ?? form.cliente_endereco,
      data: form.data,
      descricao: form.descricao,
      objetivo: form.objetivo,
      servicos, materiais, etapas, normas,
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
    if (isEdit) {
      await atualizar.mutateAsync({ id: editData!._id, data: payload })
      onSuccess()
    } else {
      const res = await criar.mutateAsync(payload)
      setSavedId(res.id)
      setSavedNumero(res.numero)
      if (status !== 'rascunho') onSuccess()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card title="Identificação">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <div className="sm:col-span-2">
            <Input label="Descrição da Proposta *" value={form.descricao} onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Instalação de carregadores veiculares Wallbox" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Objetivo da Proposta</label>
            <textarea rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none" value={form.objetivo} onChange={(e) => setForm(f => ({ ...f, objetivo: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
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
        <textarea rows={4} placeholder="Uma etapa por linha (Dia 1, Dia 2...)..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none" value={form.etapas} onChange={(e) => setForm(f => ({ ...f, etapas: e.target.value }))} />
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        <div className="flex flex-wrap gap-2 mb-4">
          <Input placeholder="Descrição do serviço..." value={novoItem.descricao} onChange={(e) => setNovoItem(i => ({ ...i, descricao: e.target.value }))} className="flex-1 min-w-[180px]" />
          <Input placeholder="Valor (ex: 1500,00 ou 0 p/ DESCONTO)" value={novoItem.valor} onChange={(e) => setNovoItem(i => ({ ...i, valor: e.target.value }))} className="w-full sm:w-44" />
          <Button onClick={addItem}><Plus size={16} /></Button>
        </div>
        <div className="flex flex-col gap-1">
          {itens.map((item, i) => (
            <div key={i} className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
              <span>{item.descricao}</span>
              <div className="flex items-center gap-3">
                <span className="font-medium">{Number(item.valor) === 0 ? 'DESCONTO' : formatarMoeda(item.valor)}</span>
                <button onClick={() => setItens(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {itens.length > 0 && (
            <div className="flex justify-end rounded bg-gray-200 px-3 py-2 font-bold text-[#1c1c2e]">
              TOTAL: {formatarMoeda(total)}
            </div>
          )}
        </div>
      </Card>

      <Card title="Assinaturas">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Input
              label="Nome do Contratante"
              value={nomeAprovador}
              onChange={(e) => setNomeAprovador(e.target.value)}
              placeholder="Nome completo do cliente"
            />
            <SignaturePad
              label="Assinatura do Contratante"
              value={assinatura}
              onChange={setAssinatura}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Input
              label="Nome do Contratado"
              value={nomeContratado}
              onChange={(e) => setNomeContratado(e.target.value)}
              placeholder="Nome do responsável técnico"
            />
            <SignaturePad
              label="Assinatura do Contratado"
              value={assinaturaContratado}
              onChange={setAssinaturaContratado}
            />
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
        <Button variant="secondary" onClick={() => salvar('rascunho')} disabled={criar.isPending || atualizar.isPending}>💾 Salvar Rascunho</Button>
        <Button onClick={() => salvar('enviado')} disabled={criar.isPending || atualizar.isPending}>
          {isEdit ? '✅ Salvar Alterações' : '📤 Salvar como Enviada'}
        </Button>
      </div>
    </div>
  )
}

function ListaPropostas({ onEditar }: { onEditar: (p: Proposta) => void }) {
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroBusca, setFiltroBusca] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [novoStatus, setNovoStatus] = useState('')
  const atualizar = useAtualizarProposta()

  const { data: propostas = [], isLoading } = usePropostas({
    status: filtroStatus === 'todos' ? undefined : filtroStatus,
    cliente: filtroBusca || undefined,
  })

  async function atualizarStatus(id: string) {
    await atualizar.mutateAsync({ id, data: { status: novoStatus as Proposta['status'] } })
    setEditId(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <Select
          label="Status"
          options={[{ value: 'todos', label: 'Todos' }, ...Object.entries(STATUS_PROPOSTA).map(([k, v]) => ({ value: k, label: v }))]}
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        />
        <Input label="Cliente" placeholder="Buscar cliente..." value={filtroBusca} onChange={(e) => setFiltroBusca(e.target.value)} />
      </div>

      {isLoading ? <p className="text-sm text-gray-400">Carregando...</p> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#1c1c2e] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold">Nº</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Descrição</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Data</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {propostas.map((p) => (
                <>
                  <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{p.numero}</td>
                    <td className="px-4 py-3">{p.cliente_nome}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{p.descricao?.slice(0, 50)}</td>
                    <td className="px-4 py-3 text-xs font-medium">{formatarMoeda(p.total ?? 0)}</td>
                    <td className="px-4 py-3">
                      <Badge label={STATUS_PROPOSTA[p.status] ?? p.status} className={STATUS_PROPOSTA_COR[p.status]} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{dataBr(p.data)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          title="Editar proposta"
                          onClick={() => onEditar(p)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition"
                        >
                          <Pencil size={15} />
                        </button>
                        <Button size="sm" variant="secondary" onClick={() => baixarPdfProposta(p._id, p.numero)}>
                          <Download size={13} /> PDF
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditId(p._id); setNovoStatus(p.status) }}>
                          Status
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {editId === p._id && (
                    <tr className="bg-amber-50">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="flex items-end gap-3">
                          <Select
                            label="Novo Status"
                            options={Object.entries(STATUS_PROPOSTA).map(([k, v]) => ({ value: k, label: v }))}
                            value={novoStatus}
                            onChange={(e) => setNovoStatus(e.target.value)}
                          />
                          <Button size="sm" onClick={() => atualizarStatus(p._id)} disabled={atualizar.isPending}>Salvar</Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditId(null)}>Cancelar</Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {propostas.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-400">Nenhuma proposta encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function Propostas() {
  const [tab, setTab] = useState(0)
  const [editProp, setEditProp] = useState<Proposta | null>(null)

  function handleEditar(p: Proposta) {
    setEditProp(p)
    setTab(1)
  }

  function handleSuccess() {
    setEditProp(null)
    setTab(0)
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-[#1c1c2e]">Propostas Comerciais</h1>
      <Tabs
        tabs={[
          { label: '📋 Lista de Propostas', content: <ListaPropostas onEditar={handleEditar} /> },
          { label: editProp ? '✏️ Editar Proposta' : '➕ Nova Proposta', content: <NovaPropostaForm editData={editProp} onSuccess={handleSuccess} /> },
        ]}
        defaultIndex={tab}
        key={`${tab}-${editProp?._id ?? 'new'}`}
      />
    </div>
  )
}
