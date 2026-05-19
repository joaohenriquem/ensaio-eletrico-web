import { useState } from 'react'
import { Plus, Trash2, Download, CheckCircle, ChevronDown, ChevronUp, Pencil } from 'lucide-react'
import ImageUpload from '../components/ui/ImageUpload'
import SignaturePad from '../components/ui/SignaturePad'
import { useRelatorios, useCriarRelatorio, useAtualizarRelatorio } from '../hooks/useRelatorios'
import { useClientes } from '../hooks/useClientes'
import {
  NORMAS_PADRAO, TIPOS_PAINEL, ITENS_INSPECAO_VISUAL, ITENS_LIMPEZA,
  ITENS_REAPERTO, ITENS_VERIFICACAO_ELETRICA, STATUS_RELATORIO, STATUS_RELATORIO_COR,
  painelVazio, OBJETIVO_PADRAO, CONCLUSAO_PADRAO,
} from '../utils/constants'
import { dataBr } from '../utils/formatters'
import { baixarPdfRelatorio } from '../api/relatorios'
import type { Painel, Relatorio } from '../types'
import Tabs from '../components/ui/Tabs'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'

function PainelForm({
  painel,
  index,
  onChange,
}: {
  painel: Painel
  index: number
  onChange: (p: Painel) => void
}) {
  const [open, setOpen] = useState(true)

  function setChecklist(
    grupo: keyof Pick<Painel, 'inspecao_visual' | 'limpeza_tecnica' | 'reaperto_mecanico'>,
    chave: string,
    valor: string
  ) {
    onChange({ ...painel, [grupo]: { ...painel[grupo], [chave]: valor } })
  }

  function setVerificacao(chave: string, valor: string) {
    onChange({ ...painel, verificacao_eletrica: { ...painel.verificacao_eletrica, [chave]: valor } })
  }

  const CheckItem = ({
    grupo,
    chave,
    rotulo,
  }: {
    grupo: keyof Pick<Painel, 'inspecao_visual' | 'limpeza_tecnica' | 'reaperto_mecanico'>
    chave: string
    rotulo: string
  }) => {
    const val = painel[grupo][chave] ?? 'conforme'
    return (
      <div className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 px-2 py-1.5">
        <span className="text-xs">{rotulo}</span>
        <div className="flex gap-1">
          <button
            onClick={() => setChecklist(grupo, chave, 'conforme')}
            className={`rounded px-2 py-0.5 text-xs font-medium transition ${val === 'conforme' ? 'bg-green-500 text-white' : 'bg-white text-gray-500 border'}`}
          >✓</button>
          <button
            onClick={() => setChecklist(grupo, chave, 'nao_conforme')}
            className={`rounded px-2 py-0.5 text-xs font-medium transition ${val === 'nao_conforme' ? 'bg-red-500 text-white' : 'bg-white text-gray-500 border'}`}
          >✗</button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-gray-50"
      >
        <span className="font-medium text-sm">Painel {index + 1}: {painel.nome || 'Sem nome'}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 pb-5 pt-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Nome do Painel" value={painel.nome} onChange={(e) => onChange({ ...painel, nome: e.target.value })} />
            <Select
              label="Tipo"
              options={TIPOS_PAINEL.map(t => ({ value: t, label: t }))}
              value={painel.tipo}
              onChange={(e) => onChange({ ...painel, tipo: e.target.value })}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-[#f0a500] uppercase tracking-wide">Inspeção Visual</p>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {Object.entries(ITENS_INSPECAO_VISUAL).map(([k, v]) => (
                <CheckItem key={k} grupo="inspecao_visual" chave={k} rotulo={v} />
              ))}
            </div>
            <ImageUpload
              fotos={painel.fotos_inspecao_visual ?? []}
              onChange={(fotos) => onChange({ ...painel, fotos_inspecao_visual: fotos })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold text-[#f0a500] uppercase tracking-wide">Limpeza Técnica</p>
              <div className="flex flex-col gap-1.5">
                {Object.entries(ITENS_LIMPEZA).map(([k, v]) => (
                  <CheckItem key={k} grupo="limpeza_tecnica" chave={k} rotulo={v} />
                ))}
              </div>
              <ImageUpload
                fotos={painel.fotos_limpeza_tecnica ?? []}
                onChange={(fotos) => onChange({ ...painel, fotos_limpeza_tecnica: fotos })}
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-[#f0a500] uppercase tracking-wide">Reaperto Mecânico</p>
              <div className="flex flex-col gap-1.5">
                {Object.entries(ITENS_REAPERTO).map(([k, v]) => (
                  <CheckItem key={k} grupo="reaperto_mecanico" chave={k} rotulo={v} />
                ))}
              </div>
              <ImageUpload
                fotos={painel.fotos_reaperto_mecanico ?? []}
                onChange={(fotos) => onChange({ ...painel, fotos_reaperto_mecanico: fotos })}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-[#f0a500] uppercase tracking-wide">Verificação Elétrica</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input label="Medição de Tensão" value={painel.verificacao_eletrica.medicao_tensao} onChange={(e) => setVerificacao('medicao_tensao', e.target.value)} />
              <Input label="Medição de Corrente" value={painel.verificacao_eletrica.medicao_corrente} onChange={(e) => setVerificacao('medicao_corrente', e.target.value)} />
              {['equilibrio_fases', 'continuidade_condutor_pe'].map(k => {
                const val = painel.verificacao_eletrica[k] ?? 'conforme'
                const rotulo = ITENS_VERIFICACAO_ELETRICA[k]
                return (
                  <div key={k} className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 px-2 py-1.5">
                    <span className="text-xs">{rotulo}</span>
                    <div className="flex gap-1">
                      <button onClick={() => setVerificacao(k, 'conforme')} className={`rounded px-2 py-0.5 text-xs font-medium ${val === 'conforme' ? 'bg-green-500 text-white' : 'bg-white text-gray-500 border'}`}>✓</button>
                      <button onClick={() => setVerificacao(k, 'nao_conforme')} className={`rounded px-2 py-0.5 text-xs font-medium ${val === 'nao_conforme' ? 'bg-red-500 text-white' : 'bg-white text-gray-500 border'}`}>✗</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Não Conformidades</label>
              <textarea rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none" value={painel.nao_conformidades} onChange={(e) => onChange({ ...painel, nao_conformidades: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Recomendações</label>
              <textarea rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none" value={painel.recomendacoes} onChange={(e) => onChange({ ...painel, recomendacoes: e.target.value })} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NovoRelatorioForm({ onSuccess, editData }: { onSuccess: () => void; editData?: Relatorio | null }) {
  const criar = useCriarRelatorio()
  const atualizar = useAtualizarRelatorio()
  const isEdit = !!editData?._id
  const { data: clientes = [] } = useClientes({ ativo: true })
  const [clienteId, setClienteId] = useState(editData?.cliente_id ?? '')
  const [clienteManual, setClienteManual] = useState(editData?.cliente_id ? '' : (editData?.cliente_nome ?? ''))
  const [form, setForm] = useState({
    local: editData?.local ?? '',
    endereco: editData?.endereco ?? '',
    data: String(editData?.data ?? new Date().toISOString()).split('T')[0],
    tecnico: editData?.tecnico ?? '',
    cft: editData?.cft ?? '',
    trt: editData?.trt ?? '',
    objetivo: editData?.objetivo ?? '',
    tomadas: editData?.tomadas ?? '',
    iluminacao: editData?.iluminacao ?? '',
    conclusao: editData?.conclusao ?? '',
  })
  const [normas, setNormas] = useState<string[]>(editData?.normas ?? [])
  const [paineis, setPaineis] = useState<Painel[]>((editData?.paineis as Painel[] | undefined) ?? [painelVazio('Painel 1') as Painel])
  const [assinatura, setAssinatura] = useState(editData?.assinatura ?? '')
  const [nomeAprovador, setNomeAprovador] = useState(editData?.nome_aprovador ?? '')
  const [assinaturaContratado, setAssinaturaContratado] = useState(editData?.assinatura_contratado ?? '')
  const [nomeContratado, setNomeContratado] = useState(editData?.nome_contratado ?? '')
  const [error, setError] = useState('')
  const [savedId, setSavedId] = useState<string | null>(null)

  const clienteNome = clienteId
    ? (clientes.find(c => c._id === clienteId)?.nome ?? '')
    : clienteManual

  function addPainel() {
    setPaineis(p => [...p, painelVazio(`Painel ${p.length + 1}`) as Painel])
  }

  function removePainel() {
    if (paineis.length > 1) setPaineis(p => p.slice(0, -1))
  }

  function updatePainel(i: number, p: Painel) {
    setPaineis(prev => prev.map((x, idx) => (idx === i ? p : x)))
  }

  async function salvar(status: 'rascunho' | 'finalizado') {
    if (!clienteNome || !form.local) { setError('Cliente e local são obrigatórios.'); return }
    setError('')
    const payload = {
      ...form,
      cliente_id: clienteId || undefined,
      cliente_nome: clienteNome,
      normas,
      paineis,
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
      if (status === 'finalizado') onSuccess()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card title="Dados Gerais">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Cliente"
            options={[
              { value: '', label: '– Selecione –' },
              { value: '__manual__', label: '– Digitar manualmente –' },
              ...clientes.map(c => ({ value: c._id, label: c.nome })),
            ]}
            value={clienteId}
            onChange={(e) => { if (e.target.value === '__manual__') setClienteId(''); else setClienteId(e.target.value); setClienteManual('') }}
          />
          {!clienteId && <Input label="Ou digite o cliente" value={clienteManual} onChange={(e) => setClienteManual(e.target.value)} />}
          <Input label="Local *" value={form.local} onChange={(e) => setForm(f => ({ ...f, local: e.target.value }))} placeholder="Condomínio Recanto das Flores" />
          <Input label="Endereço / Cidade" value={form.endereco} onChange={(e) => setForm(f => ({ ...f, endereco: e.target.value }))} placeholder="Osasco – SP" />
          <Input label="Data" type="date" value={form.data} onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))} />
          <Input label="Técnico Responsável" value={form.tecnico} onChange={(e) => setForm(f => ({ ...f, tecnico: e.target.value }))} />
          <Input label="CFT" value={form.cft} onChange={(e) => setForm(f => ({ ...f, cft: e.target.value }))} />
          <Input label="TRT" value={form.trt} onChange={(e) => setForm(f => ({ ...f, trt: e.target.value }))} />
        </div>
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-gray-700">Normas Aplicáveis</p>
          <div className="flex flex-col gap-1.5">
            {NORMAS_PADRAO.map(n => (
              <label key={n} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={normas.includes(n)}
                  onChange={(e) => setNormas(prev => e.target.checked ? [...prev, n] : prev.filter(x => x !== n))}
                  className="accent-[#f0a500]"
                />
                {n}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Objetivo</label>
          <textarea rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none" value={form.objetivo} onChange={(e) => setForm(f => ({ ...f, objetivo: e.target.value }))} />
        </div>
      </Card>

      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-[#1c1c2e]">Painéis Elétricos ({paineis.length})</h3>
        <Button size="sm" onClick={addPainel}><Plus size={14} /> Adicionar</Button>
        <Button size="sm" variant="secondary" onClick={removePainel} disabled={paineis.length <= 1}>
          <Trash2 size={14} /> Remover Último
        </Button>
      </div>

      {paineis.map((p, i) => (
        <PainelForm key={i} painel={p} index={i} onChange={(np) => updatePainel(i, np)} />
      ))}

      <Card title="Complementos">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tomadas</label>
            <textarea rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none" value={form.tomadas} onChange={(e) => setForm(f => ({ ...f, tomadas: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Iluminação</label>
            <textarea rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none" value={form.iluminacao} onChange={(e) => setForm(f => ({ ...f, iluminacao: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Conclusão</label>
            <textarea rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none" value={form.conclusao} onChange={(e) => setForm(f => ({ ...f, conclusao: e.target.value }))} />
          </div>
        </div>
      </Card>

      <Card title="Assinaturas">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Input
              label="Nome do Aprovador"
              placeholder="Nome completo de quem aprova o serviço"
              value={nomeAprovador}
              onChange={(e) => setNomeAprovador(e.target.value)}
            />
            <SignaturePad
              label="Assinatura do Aprovador"
              value={assinatura}
              onChange={setAssinatura}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Input
              label="Nome do Técnico Responsável"
              placeholder="Nome do técnico que executou o serviço"
              value={nomeContratado}
              onChange={(e) => setNomeContratado(e.target.value)}
            />
            <SignaturePad
              label="Assinatura do Técnico"
              value={assinaturaContratado}
              onChange={setAssinaturaContratado}
            />
          </div>
        </div>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {savedId && (
        <button
          onClick={() => baixarPdfRelatorio(savedId, 'relatorio')}
          className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
        >
          <Download size={16} /> Baixar PDF do Relatório
        </button>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => salvar('rascunho')} disabled={criar.isPending || atualizar.isPending}>
          💾 {isEdit ? 'Salvar Rascunho' : 'Salvar Rascunho'}
        </Button>
        <Button onClick={() => salvar('finalizado')} disabled={criar.isPending || atualizar.isPending}>
          <CheckCircle size={16} /> {isEdit ? 'Salvar Alterações' : 'Finalizar Relatório'}
        </Button>
      </div>
    </div>
  )
}

function ListaRelatorios({ onEditar }: { onEditar: (rel: Relatorio) => void }) {
  const { data: relatorios = [], isLoading } = useRelatorios()
  const atualizar = useAtualizarRelatorio()

  async function finalizar(id: string) {
    await atualizar.mutateAsync({ id, data: { status: 'finalizado' } })
  }

  return (
    <div className="flex flex-col gap-4">
      {isLoading ? <p className="text-sm text-gray-400">Carregando...</p> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#1c1c2e] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold">Nº</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Local</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Data</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Painéis</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {relatorios.map((rel) => (
                <tr key={rel._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{rel.numero}</td>
                  <td className="px-4 py-3">{rel.cliente_nome}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{rel.local}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{dataBr(rel.data)}</td>
                  <td className="px-4 py-3 text-xs">{(rel.paineis ?? []).length}</td>
                  <td className="px-4 py-3">
                    <Badge label={STATUS_RELATORIO[rel.status] ?? rel.status} className={STATUS_RELATORIO_COR[rel.status]} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button
                        title="Editar relatório"
                        onClick={() => onEditar(rel)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition"
                      >
                        <Pencil size={15} />
                      </button>
                      <Button size="sm" variant="secondary" onClick={() => baixarPdfRelatorio(rel._id, rel.numero)}>
                        <Download size={13} /> PDF
                      </Button>
                      {rel.status === 'rascunho' && (
                        <Button size="sm" onClick={() => finalizar(rel._id)} disabled={atualizar.isPending}>
                          <CheckCircle size={13} /> Finalizar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {relatorios.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-400">Nenhum relatório encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function Relatorios() {
  const [tab, setTab] = useState(0)
  const [editRel, setEditRel] = useState<Relatorio | null>(null)

  function handleEditar(rel: Relatorio) {
    setEditRel(rel)
    setTab(1)
  }

  function handleSuccess() {
    setEditRel(null)
    setTab(0)
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-[#1c1c2e]">Relatórios de Manutenção</h1>
      <Tabs
        tabs={[
          { label: '📋 Lista', content: <ListaRelatorios onEditar={handleEditar} /> },
          { label: editRel ? '✏️ Editar Relatório' : '➕ Novo Relatório', content: <NovoRelatorioForm editData={editRel} onSuccess={handleSuccess} /> },
        ]}
        defaultIndex={tab}
        key={`${tab}-${editRel?._id ?? 'new'}`}
      />
    </div>
  )
}
