import { useState } from 'react'
import { Plus, Trash2, Download, CheckCircle, ChevronDown, Pencil, Wrench, Hammer, MapPin, User } from 'lucide-react'
import ImageUpload from '../components/ui/ImageUpload'
import AnexoUpload from '../components/ui/AnexoUpload'
import SignaturePad from '../components/ui/SignaturePad'
import { useRelatorios, useCriarRelatorio, useAtualizarRelatorio, useExcluirRelatorio } from '../hooks/useRelatorios'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import BottomDrawer from '../components/ui/BottomDrawer'
import { useClientes } from '../hooks/useClientes'
import {
  NORMAS_PADRAO, TIPOS_PAINEL, ITENS_INSPECAO_VISUAL, ITENS_LIMPEZA,
  ITENS_REAPERTO, ITENS_VERIFICACAO_ELETRICA, STATUS_RELATORIO, STATUS_RELATORIO_COR,
  painelVazio, servicoVazio,
} from '../utils/constants'
import { dataBr } from '../utils/formatters'
import { baixarPdfRelatorio } from '../api/relatorios'
import { foiEnfileirado } from '../offline/outboxMutation'
import { useOutbox } from '../offline/useOutbox'
import { remover } from '../offline/outbox'
import type { Anexo, Painel, Relatorio, ServicoCorretivo, TipoRelatorio } from '../types'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'

function PainelForm({ painel, index, onChange }: {
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

  const CheckItem = ({ grupo, chave, rotulo }: {
    grupo: keyof Pick<Painel, 'inspecao_visual' | 'limpeza_tecnica' | 'reaperto_mecanico'>
    chave: string
    rotulo: string
  }) => {
    const val = painel[grupo][chave] ?? 'conforme'
    return (
      <div className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 px-2 py-1.5">
        <span className="text-xs">{rotulo}</span>
        <div className="flex gap-1">
          <button onClick={() => setChecklist(grupo, chave, 'conforme')} className={`rounded px-2 py-0.5 text-xs font-medium transition ${val === 'conforme' ? 'bg-green-500 text-white' : 'bg-white text-gray-500 border'}`}>✓</button>
          <button onClick={() => setChecklist(grupo, chave, 'nao_conforme')} className={`rounded px-2 py-0.5 text-xs font-medium transition ${val === 'nao_conforme' ? 'bg-red-500 text-white' : 'bg-white text-gray-500 border'}`}>✗</button>
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
        <ChevronDown size={16} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
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
            <div className="flex flex-col gap-1.5">
              {Object.entries(ITENS_INSPECAO_VISUAL).map(([k, v]) => (
                <CheckItem key={k} grupo="inspecao_visual" chave={k} rotulo={v} />
              ))}
            </div>
            <ImageUpload fotos={painel.fotos_inspecao_visual ?? []} onChange={(fotos) => onChange({ ...painel, fotos_inspecao_visual: fotos })} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-[#f0a500] uppercase tracking-wide">Limpeza Técnica</p>
            <div className="flex flex-col gap-1.5">
              {Object.entries(ITENS_LIMPEZA).map(([k, v]) => (
                <CheckItem key={k} grupo="limpeza_tecnica" chave={k} rotulo={v} />
              ))}
            </div>
            <ImageUpload fotos={painel.fotos_limpeza_tecnica ?? []} onChange={(fotos) => onChange({ ...painel, fotos_limpeza_tecnica: fotos })} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-[#f0a500] uppercase tracking-wide">Reaperto Mecânico</p>
            <div className="flex flex-col gap-1.5">
              {Object.entries(ITENS_REAPERTO).map(([k, v]) => (
                <CheckItem key={k} grupo="reaperto_mecanico" chave={k} rotulo={v} />
              ))}
            </div>
            <ImageUpload fotos={painel.fotos_reaperto_mecanico ?? []} onChange={(fotos) => onChange({ ...painel, fotos_reaperto_mecanico: fotos })} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-[#f0a500] uppercase tracking-wide">Verificação Elétrica</p>
            <div className="flex flex-col gap-2">
              <Input label="Medição de Tensão" value={painel.verificacao_eletrica.medicao_tensao} onChange={(e) => setVerificacao('medicao_tensao', e.target.value)} />
              <Input label="Medição de Corrente" value={painel.verificacao_eletrica.medicao_corrente} onChange={(e) => setVerificacao('medicao_corrente', e.target.value)} />
              {['equilibrio_fases', 'continuidade_condutor_pe'].map(k => {
                const val = painel.verificacao_eletrica[k] ?? 'conforme'
                return (
                  <div key={k} className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 px-2 py-1.5">
                    <span className="text-xs">{ITENS_VERIFICACAO_ELETRICA[k]}</span>
                    <div className="flex gap-1">
                      <button onClick={() => setVerificacao(k, 'conforme')} className={`rounded px-2 py-0.5 text-xs font-medium ${val === 'conforme' ? 'bg-green-500 text-white' : 'bg-white text-gray-500 border'}`}>✓</button>
                      <button onClick={() => setVerificacao(k, 'nao_conforme')} className={`rounded px-2 py-0.5 text-xs font-medium ${val === 'nao_conforme' ? 'bg-red-500 text-white' : 'bg-white text-gray-500 border'}`}>✗</button>
                    </div>
                  </div>
                )
              })}
            </div>
            <ImageUpload fotos={painel.fotos_verificacao_eletrica ?? []} onChange={(fotos) => onChange({ ...painel, fotos_verificacao_eletrica: fotos })} />
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

function ServicoForm({ servico, index, onChange, onRemove }: {
  servico: ServicoCorretivo
  index: number
  onChange: (s: ServicoCorretivo) => void
  onRemove?: () => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 hover:bg-gray-50"
      >
        <span className="truncate text-left font-medium text-sm">Serviço {index + 1}{servico.descricao ? `: ${servico.descricao}` : ''}</span>
        <ChevronDown size={16} className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 pb-5 pt-4 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Descrição</label>
            <textarea rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none" value={servico.descricao} onChange={(e) => onChange({ ...servico, descricao: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold text-[#f0a500] uppercase tracking-wide">Foto Antes</p>
              <ImageUpload max={1} fotos={servico.foto_antes ? [servico.foto_antes] : []} onChange={(fotos) => onChange({ ...servico, foto_antes: fotos[0] ?? '' })} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-[#f0a500] uppercase tracking-wide">Foto Depois</p>
              <ImageUpload max={1} fotos={servico.foto_depois ? [servico.foto_depois] : []} onChange={(fotos) => onChange({ ...servico, foto_depois: fotos[0] ?? '' })} />
            </div>
          </div>
          {onRemove && (
            <div className="flex justify-end">
              <Button size="sm" variant="secondary" onClick={onRemove}>
                <Trash2 size={14} /> Remover serviço
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RelatorioForm({ tipo, editData, onSuccess, onCancel }: {
  tipo: TipoRelatorio
  editData?: Relatorio | null
  onSuccess: () => void
  onCancel: () => void
}) {
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
    texto_manutencao: editData?.texto_manutencao ?? '',
    conclusao: editData?.conclusao ?? '',
  })
  const [normas, setNormas] = useState<string[]>(editData?.normas ?? [])
  const [paineis, setPaineis] = useState<Painel[]>((editData?.paineis as Painel[] | undefined) ?? [painelVazio('Painel 1') as Painel])
  const [servicos, setServicos] = useState<ServicoCorretivo[]>(editData?.servicos?.length ? editData.servicos : [servicoVazio()])
  const [anexos, setAnexos] = useState<Anexo[]>(editData?.anexos ?? [])
  const [assinatura, setAssinatura] = useState(editData?.assinatura ?? '')
  const [nomeAprovador, setNomeAprovador] = useState(editData?.nome_aprovador ?? '')
  const [assinaturaContratado, setAssinaturaContratado] = useState(editData?.assinatura_contratado ?? '')
  const [nomeContratado, setNomeContratado] = useState(editData?.nome_contratado ?? '')
  const [error, setError] = useState('')
  const [savedId, setSavedId] = useState<string | null>(null)
  const [perguntarPdf, setPerguntarPdf] = useState<{ id: string; numero: string } | null>(null)

  const clienteNome = clienteId ? (clientes.find(c => c._id === clienteId)?.nome ?? '') : clienteManual

  function addPainel() {
    setPaineis(p => [...p, painelVazio(`Painel ${p.length + 1}`) as Painel])
  }

  function removePainel() {
    if (paineis.length > 1) setPaineis(p => p.slice(0, -1))
  }

  async function salvar(status: 'rascunho' | 'finalizado') {
    if (!clienteNome || !form.local) { setError('Cliente e endereço são obrigatórios.'); return }
    setError('')
    const corretiva = tipo === 'corretiva'
    const payload = {
      ...form,
      tipo,
      cliente_id: clienteId || undefined,
      cliente_nome: clienteNome,
      normas, anexos,
      // A corretiva usa a lista de serviços no lugar dos painéis.
      paineis: corretiva ? [] : paineis,
      servicos: corretiva ? servicos : [],
      texto_manutencao: corretiva ? form.texto_manutencao : '',
      assinatura: assinatura || undefined,
      nome_aprovador: nomeAprovador || undefined,
      assinatura_contratado: assinaturaContratado || undefined,
      nome_contratado: nomeContratado || undefined,
      status,
    }
    try {
      if (isEdit) {
        const res = await atualizar.mutateAsync({ id: editData!._id, data: payload })
        if (foiEnfileirado(res)) {
          onSuccess()
        } else if (status === 'finalizado') {
          setPerguntarPdf({ id: editData!._id, numero: editData!.numero })
        } else {
          onSuccess()
        }
      } else {
        const res = await criar.mutateAsync(payload)
        if (foiEnfileirado(res)) {
          onSuccess()
        } else {
          setSavedId(res.id)
          if (status === 'finalizado') {
            setPerguntarPdf({ id: res.id, numero: res.numero })
          }
        }
      }
    } catch {
      setError('Não foi possível salvar. Verifique sua conexão e tente novamente.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card title="Dados Gerais">
        <div className="flex flex-col gap-3">
          <Select
            label="Cliente"
            options={[
              { value: '', label: '– Selecione –' },
              { value: '__manual__', label: '– Digitar manualmente –' },
              ...clientes.map(c => ({ value: c._id, label: c.nome })),
            ]}
            value={clienteId}
            onChange={(e) => {
              const id = e.target.value
              if (id === '__manual__') {
                setClienteId('')
              } else {
                setClienteId(id)
                const cliente = clientes.find(c => c._id === id)
                if (cliente) {
                  const cidadeEstado = [cliente.cidade, cliente.estado].filter(Boolean).join(' – ')
                  setForm(f => ({
                    ...f,
                    local: cliente.endereco || f.local,
                    endereco: cidadeEstado || f.endereco,
                  }))
                }
              }
              setClienteManual('')
            }}
          />
          {!clienteId && <Input label="Ou digite o cliente" value={clienteManual} onChange={(e) => setClienteManual(e.target.value)} />}
          <Input label="Endereço *" value={form.local} onChange={(e) => setForm(f => ({ ...f, local: e.target.value }))} placeholder="Avenida Hilário Pereira de Souza, 492" />
          <Input label="Cidade / Estado" value={form.endereco} onChange={(e) => setForm(f => ({ ...f, endereco: e.target.value }))} placeholder="Osasco – SP" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Data" type="date" value={form.data} onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))} />
            <Input label="Técnico" value={form.tecnico} onChange={(e) => setForm(f => ({ ...f, tecnico: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="CFT" value={form.cft} onChange={(e) => setForm(f => ({ ...f, cft: e.target.value }))} />
            <Input label="TRT" value={form.trt} onChange={(e) => setForm(f => ({ ...f, trt: e.target.value }))} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Normas Aplicáveis</p>
            <div className="flex flex-col gap-1.5">
              {NORMAS_PADRAO.map(n => (
                <label key={n} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={normas.includes(n)} onChange={(e) => setNormas(prev => e.target.checked ? [...prev, n] : prev.filter(x => x !== n))} className="accent-[#f0a500]" />
                  {n}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Objetivo</label>
            <textarea rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none" value={form.objetivo} onChange={(e) => setForm(f => ({ ...f, objetivo: e.target.value }))} />
          </div>
          {tipo === 'corretiva' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Texto do item 4 – Manutenção Corretiva</label>
              <textarea rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none" placeholder="Descreva a manutenção corretiva realizada (sai no item 4 do relatório)" value={form.texto_manutencao} onChange={(e) => setForm(f => ({ ...f, texto_manutencao: e.target.value }))} />
            </div>
          )}
        </div>
      </Card>

      {tipo === 'corretiva' ? (
        <>
          <h3 className="font-semibold text-[#1e3050]">Serviços ({servicos.length})</h3>

          {servicos.map((sv, i) => (
            <ServicoForm
              key={i}
              servico={sv}
              index={i}
              onChange={(ns) => setServicos(prev => prev.map((x, idx) => idx === i ? ns : x))}
              onRemove={servicos.length > 1 ? () => setServicos(prev => prev.filter((_, idx) => idx !== i)) : undefined}
            />
          ))}

          <div className="flex justify-end gap-2">
            <Button size="sm" onClick={() => setServicos(s => [...s, servicoVazio()])}><Plus size={14} /> Adicionar serviço</Button>
          </div>
        </>
      ) : (
        <>
          <h3 className="font-semibold text-[#1e3050]">Painéis ({paineis.length})</h3>

          {paineis.map((p, i) => (
            <PainelForm key={i} painel={p} index={i} onChange={(np) => setPaineis(prev => prev.map((x, idx) => idx === i ? np : x))} />
          ))}

          <div className="flex justify-end gap-2">
            <Button size="sm" onClick={addPainel}><Plus size={14} /> Adicionar</Button>
            <Button size="sm" variant="secondary" onClick={removePainel} disabled={paineis.length <= 1}>
              <Trash2 size={14} /> Remover
            </Button>
          </div>
        </>
      )}

      <Card title="Complementos">
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Conclusão</label>
            <textarea rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none" value={form.conclusao} onChange={(e) => setForm(f => ({ ...f, conclusao: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Anexos</label>
            <AnexoUpload anexos={anexos} onChange={setAnexos} max={5} />
          </div>
        </div>
      </Card>

      <Card title="Assinaturas">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Input label="Nome do Aprovador" placeholder="Nome completo de quem aprova" value={nomeAprovador} onChange={(e) => setNomeAprovador(e.target.value)} />
            <SignaturePad label="Assinatura do Aprovador" value={assinatura} onChange={setAssinatura} />
          </div>
          <div className="flex flex-col gap-3">
            <Input label="Nome do Técnico Responsável" placeholder="Nome do técnico que executou" value={nomeContratado} onChange={(e) => setNomeContratado(e.target.value)} />
            <SignaturePad label="Assinatura do Técnico" value={assinaturaContratado} onChange={setAssinaturaContratado} />
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
        <Button variant="secondary" onClick={() => salvar('rascunho')} disabled={criar.isPending || atualizar.isPending} className="flex-1">
          💾 Rascunho
        </Button>
        <Button onClick={() => salvar('finalizado')} disabled={criar.isPending || atualizar.isPending} className="flex-1">
          <CheckCircle size={15} /> {isEdit ? 'Salvar' : 'Finalizar'}
        </Button>
      </div>

      {perguntarPdf && (
        <ConfirmDialog
          titulo="Relatório finalizado"
          mensagem="Deseja gerar o relatório em PDF agora? O download começa automaticamente."
          confirmLabel="Gerar PDF"
          confirmVariant="primary"
          cancelLabel="Agora não"
          onConfirm={() => { baixarPdfRelatorio(perguntarPdf.id, perguntarPdf.numero); setPerguntarPdf(null); onSuccess() }}
          onCancel={() => { setPerguntarPdf(null); onSuccess() }}
        />
      )}
      <Button variant="outline" onClick={onCancel} className="w-full">Cancelar</Button>
    </div>
  )
}

function RelatorioCard({ relatorio, onEdit, onExcluir }: {
  relatorio: Relatorio
  onEdit: () => void
  onExcluir: () => void
}) {
  const [open, setOpen] = useState(false)
  const atualizar = useAtualizarRelatorio()
  const corretiva = relatorio.tipo === 'corretiva'
  const Icone = corretiva ? Hammer : Wrench
  const qtd = corretiva ? (relatorio.servicos ?? []).length : (relatorio.paineis ?? []).length

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left active:bg-gray-50"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e3050]/10 mt-0.5">
          <Icone size={16} className="text-[#1e3050]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-gray-400">{relatorio.numero}</span>
            <Badge label={STATUS_RELATORIO[relatorio.status] ?? relatorio.status} className={`${STATUS_RELATORIO_COR[relatorio.status]} text-xs`} />
          </div>
          <p className="mt-0.5 truncate font-semibold text-[#1e3050] text-sm">{relatorio.cliente_nome}</p>
          <p className="text-xs text-gray-400">{relatorio.local} · {dataBr(relatorio.data)}</p>
        </div>
        <ChevronDown size={16} className={`mt-1 shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-4 pb-4 pt-3">
          <div className="flex flex-col gap-1.5 text-xs text-gray-500">
            {relatorio.endereco && (
              <p className="flex items-center gap-1.5">
                <MapPin size={11} className="shrink-0 text-gray-400" /> {relatorio.endereco}
              </p>
            )}
            {relatorio.tecnico && (
              <p className="flex items-center gap-1.5">
                <User size={11} className="shrink-0 text-gray-400" /> {relatorio.tecnico}
              </p>
            )}
            <p className="flex items-center gap-1.5">
              <Icone size={11} className="shrink-0 text-gray-400" /> {corretiva
                ? `${qtd} serviço${qtd !== 1 ? 's' : ''}`
                : `${qtd} painel${qtd !== 1 ? 'is' : ''}`}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={onEdit} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 active:bg-gray-50">
              <Pencil size={12} /> Editar
            </button>
            <button onClick={() => baixarPdfRelatorio(relatorio._id, relatorio.numero)} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 active:bg-gray-50">
              <Download size={12} /> PDF
            </button>
            {relatorio.status === 'rascunho' && (
              <button
                onClick={() => atualizar.mutateAsync({ id: relatorio._id, data: { tipo: relatorio.tipo ?? 'preventiva', status: 'finalizado' } })}
                className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-green-700 shadow-sm ring-1 ring-green-200 active:bg-green-50"
              >
                <CheckCircle size={12} /> Finalizar
              </button>
            )}
            <button onClick={onExcluir} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm ring-1 ring-red-200 active:bg-red-50">
              <Trash2 size={12} /> Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function RelatorioCardPendente({ item, onDescartar }: { item: import('../offline/outbox').OutboxItem; onDescartar: () => void }) {
  const payload = item.payload as Partial<Relatorio>
  const corretiva = payload.tipo === 'corretiva'
  const Icone = corretiva ? Hammer : Wrench
  const qtdItens = corretiva ? (payload.servicos ?? []).length : (payload.paineis ?? []).length
  const rotuloItens = corretiva
    ? `${qtdItens} serviço${qtdItens !== 1 ? 's' : ''}`
    : `${qtdItens} painel${qtdItens !== 1 ? 'is' : ''}`
  const qtdAnexos = (payload.anexos ?? []).length
  return (
    <div className="overflow-hidden rounded-xl border border-dashed border-amber-300 bg-amber-50/60 px-4 py-3.5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 mt-0.5">
          <Icone size={16} className="text-amber-600" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            {item.ultimoErro ? 'Erro ao sincronizar' : 'Pendente de sincronização'}
          </span>
          <p className="mt-0.5 truncate font-semibold text-[#1e3050] text-sm">{payload.cliente_nome ?? '—'}</p>
          <p className="text-xs text-gray-500">
            {payload.local} · {rotuloItens}{qtdAnexos ? ` · ${qtdAnexos} anexo${qtdAnexos !== 1 ? 's' : ''}` : ''}
          </p>
          {item.ultimoErro && <p className="mt-1 text-xs text-red-600">{item.ultimoErro}</p>}
        </div>
        <button onClick={onDescartar} className="shrink-0 rounded-lg bg-white px-2 py-1 text-xs text-red-600 shadow-sm ring-1 ring-red-200 active:bg-red-50">
          Descartar
        </button>
      </div>
    </div>
  )
}

const TITULOS: Record<TipoRelatorio, string> = {
  preventiva: 'Manutenção Preventiva',
  corretiva: 'Manutenção Corretiva',
}

export default function Relatorios({ tipo = 'preventiva' }: { tipo?: TipoRelatorio }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editRel, setEditRel] = useState<Relatorio | null>(null)
  const [excluirId, setExcluirId] = useState<string | null>(null)
  const [novoRelKey, setNovoRelKey] = useState(0)

  const { data: relatorios = [], isLoading } = useRelatorios({ tipo })
  const excluir = useExcluirRelatorio()
  // A fila offline é compartilhada pelos dois tipos; cada tela mostra só os seus.
  const pendentes = useOutbox('relatorios').filter(item => (item.payload.tipo ?? 'preventiva') === tipo)
  const Icone = tipo === 'corretiva' ? Hammer : Wrench

  function abrirNovo() { setEditRel(null); setNovoRelKey(k => k + 1); setDrawerOpen(true) }
  function abrirEditar(rel: Relatorio) { setEditRel(rel); setDrawerOpen(true) }

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div>
        <h1 className="text-xl font-bold text-[#1e3050]">{TITULOS[tipo]}</h1>
        {!isLoading && <p className="text-xs text-gray-400">{relatorios.length} relatório{relatorios.length !== 1 ? 's' : ''}</p>}
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-gray-400">Carregando...</p>
      ) : relatorios.length === 0 && pendentes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
          <Icone size={32} className="opacity-30" />
          <p className="text-sm">Nenhum relatório encontrado.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pendentes.map(item => (
            <RelatorioCardPendente key={item.localId} item={item} onDescartar={() => remover(item.localId)} />
          ))}
          {relatorios.map(rel => (
            <RelatorioCard
              key={rel._id}
              relatorio={rel}
              onEdit={() => abrirEditar(rel)}
              onExcluir={() => setExcluirId(rel._id)}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={abrirNovo}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0a500] text-[#1e3050] shadow-lg transition-transform active:scale-95 hover:bg-[#d4920a]"
        title="Novo Relatório"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <BottomDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editRel ? 'Editar Relatório' : 'Novo Relatório'}>
        <RelatorioForm tipo={tipo} key={editRel?._id ?? `new-${novoRelKey}`} editData={editRel} onSuccess={() => setDrawerOpen(false)} onCancel={() => setDrawerOpen(false)} />
      </BottomDrawer>

      {excluirId && (
        <ConfirmDialog
          mensagem="Tem certeza que deseja excluir este relatório? Esta ação não pode ser desfeita."
          onConfirm={() => excluir.mutate(excluirId, { onSuccess: () => setExcluirId(null) })}
          onCancel={() => setExcluirId(null)}
          loading={excluir.isPending}
        />
      )}
    </div>
  )
}
