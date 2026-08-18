import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, Download, FileSignature, ChevronDown, MapPin, Link2, Mail, Check, PenLine, ScrollText, Copy } from 'lucide-react'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import BottomDrawer from '../components/ui/BottomDrawer'
import { useContratos, useCriarContrato, useAtualizarContrato, useExcluirContrato } from '../hooks/useContratos'
import { useClientes } from '../hooks/useClientes'
import { STATUS_CONTRATO, STATUS_CONTRATO_COR } from '../utils/constants'
import { dataBr, formatarMoeda } from '../utils/formatters'
import { baixarPdfContrato, gerarLinkAssinatura, enviarEmailContrato } from '../api/contratos'
import type { Contrato } from '../types'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import SignaturePad from '../components/ui/SignaturePad'
import Modal from '../components/ui/Modal'
import ContratoConteudo from '../components/ContratoConteudo'

function ContratoForm({ editData, onSuccess, onCancel }: {
  editData?: Contrato | null
  onSuccess: () => void
  onCancel: () => void
}) {
  const criar = useCriarContrato()
  const atualizar = useAtualizarContrato()
  const isEdit = !!editData?._id
  const { data: clientes = [] } = useClientes({ ativo: true })
  const [clienteId, setClienteId] = useState(editData?.cliente_id ?? '')
  const [clienteManual, setClienteManual] = useState(editData?.cliente_id ? '' : (editData?.cliente_nome ?? ''))
  const [form, setForm] = useState({
    cliente_endereco: editData?.cliente_endereco ?? '',
    data: String(editData?.data ?? new Date().toISOString()).split('T')[0],
    qtd_paineis: String(editData?.qtd_paineis ?? ''),
    locais_paineis: editData?.locais_paineis ?? '',
    periodicidade: editData?.periodicidade ?? '',
    qtd_manutencoes: String(editData?.qtd_manutencoes ?? ''),
    valor_total: String(editData?.valor_total ?? ''),
    forma_pagamento: editData?.forma_pagamento ?? '',
    vigencia_meses: String(editData?.vigencia_meses ?? '12'),
    data_inicio: editData?.data_inicio ? String(editData.data_inicio).split('T')[0] : '',
    data_fim: editData?.data_fim ? String(editData.data_fim).split('T')[0] : '',
    taxa_visita: String(editData?.taxa_visita ?? '200'),
    cronograma_tempo: editData?.cronograma_tempo ?? '1 dia (podendo ser num sábado)',
    cronograma_horario: editData?.cronograma_horario ?? 'das 08h00 às 16h00',
    responsavel_tecnico: editData?.responsavel_tecnico ?? 'AMAURI MOURA BIATO DA SILVA',
    cft: editData?.cft ?? '38346090803',
  })
  const [assinaturaContratada, setAssinaturaContratada] = useState(editData?.assinatura_contratada ?? '')
  const [nomeContratada, setNomeContratada] = useState(editData?.nome_contratada ?? '')
  const [error, setError] = useState('')
  const [savedId, setSavedId] = useState<string | null>(null)
  const [savedNumero, setSavedNumero] = useState<string>('')
  const geoRef = useRef<{ latitude: number; longitude: number } | null>(null)

  useEffect(() => {
    if (editData?.assinatura_contratada) return // já assinado, não precisa capturar de novo
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => { geoRef.current = { latitude: pos.coords.latitude, longitude: pos.coords.longitude } },
      () => { /* usuário negou ou timeout — segue sem localização */ },
      { timeout: 8000, maximumAge: 60000 }
    )
  }, [editData?.assinatura_contratada])

  const clienteSelecionado = clientes.find(c => c._id === clienteId)
  const clienteNome = clienteId ? (clienteSelecionado?.nome ?? '') : clienteManual

  function num(v: string): number {
    return parseFloat(v.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0
  }

  async function salvar(status?: Contrato['status']) {
    if (!clienteNome) { setError('Cliente é obrigatório.'); return }
    setError('')
    const payload = {
      cliente_id: clienteId || undefined,
      cliente_nome: clienteNome,
      cliente_endereco: clienteSelecionado?.endereco ?? form.cliente_endereco,
      data: form.data,
      qtd_paineis: parseInt(form.qtd_paineis, 10) || 0,
      locais_paineis: form.locais_paineis,
      periodicidade: form.periodicidade,
      qtd_manutencoes: parseInt(form.qtd_manutencoes, 10) || 0,
      valor_total: num(form.valor_total),
      forma_pagamento: form.forma_pagamento,
      vigencia_meses: parseInt(form.vigencia_meses, 10) || 12,
      data_inicio: form.data_inicio || undefined,
      data_fim: form.data_fim || undefined,
      taxa_visita: num(form.taxa_visita),
      cronograma_tempo: form.cronograma_tempo,
      cronograma_horario: form.cronograma_horario,
      responsavel_tecnico: form.responsavel_tecnico,
      cft: form.cft,
      assinatura_contratada: assinaturaContratada || undefined,
      nome_contratada: nomeContratada || undefined,
      latitude_contratada: geoRef.current?.latitude,
      longitude_contratada: geoRef.current?.longitude,
      status: status ?? editData?.status ?? 'rascunho',
    }
    try {
      if (isEdit) {
        await atualizar.mutateAsync({ id: editData!._id, data: payload })
        onSuccess()
      } else {
        const res = await criar.mutateAsync(payload)
        setSavedId(res.id)
        setSavedNumero(res.numero)
      }
    } catch {
      setError('Não foi possível salvar. Verifique sua conexão e tente novamente.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
        O texto do contrato é fixo (definido pelo template). Preencha somente os dados variáveis abaixo — eles serão
        aplicados nas cláusulas automaticamente.
      </p>

      <Card title="Identificação">
        <div className="flex flex-col gap-3">
          <Select
            label="Cliente *"
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
          <Input label="Data do Contrato" type="date" value={form.data} onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))} />
        </div>
      </Card>

      <Card title="Objeto do Contrato">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Qtde de Painéis" type="number" value={form.qtd_paineis} onChange={(e) => setForm(f => ({ ...f, qtd_paineis: e.target.value }))} placeholder="19" />
            <Input label="Qtde de Manutenções" type="number" value={form.qtd_manutencoes} onChange={(e) => setForm(f => ({ ...f, qtd_manutencoes: e.target.value }))} placeholder="6" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Locais dos Painéis</label>
            <textarea rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none" value={form.locais_paineis} onChange={(e) => setForm(f => ({ ...f, locais_paineis: e.target.value }))} placeholder="Subsolo, Guarita, Térreo, Primeiro Andar, Shaft torres..." />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Periodicidade (Cláusula 3)</label>
            <textarea rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none" value={form.periodicidade} onChange={(e) => setForm(f => ({ ...f, periodicidade: e.target.value }))} placeholder="Trimestral (3) ao ano sendo, (1) a cada (4) meses. Totalizando 6 manutenção no período vigente deste contrato." />
          </div>
        </div>
      </Card>

      <Card title="Valores (Cláusula 7)">
        <div className="flex flex-col gap-3">
          <Input label="Valor Total (R$)" value={form.valor_total} onChange={(e) => setForm(f => ({ ...f, valor_total: e.target.value }))} placeholder="30000,00" />
          <Input label="Forma de Pagamento" value={form.forma_pagamento} onChange={(e) => setForm(f => ({ ...f, forma_pagamento: e.target.value }))} placeholder="24 parcelas fixas no valor de R$ 1.250,00 reais mensais." />
          <Input label="Taxa de Visita Avulsa (R$)" value={form.taxa_visita} onChange={(e) => setForm(f => ({ ...f, taxa_visita: e.target.value }))} placeholder="200,00" />
        </div>
      </Card>

      <Card title="Vigência (Cláusula 8)">
        <div className="grid grid-cols-3 gap-3">
          <Input label="Meses" type="number" value={form.vigencia_meses} onChange={(e) => setForm(f => ({ ...f, vigencia_meses: e.target.value }))} />
          <Input label="Início" type="date" value={form.data_inicio} onChange={(e) => setForm(f => ({ ...f, data_inicio: e.target.value }))} />
          <Input label="Fim" type="date" value={form.data_fim} onChange={(e) => setForm(f => ({ ...f, data_fim: e.target.value }))} />
        </div>
      </Card>

      <Card title="Cronograma e Responsável Técnico">
        <div className="flex flex-col gap-3">
          <Input label="Tempo de Atividade" value={form.cronograma_tempo} onChange={(e) => setForm(f => ({ ...f, cronograma_tempo: e.target.value }))} />
          <Input label="Horário de Execução" value={form.cronograma_horario} onChange={(e) => setForm(f => ({ ...f, cronograma_horario: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Responsável Técnico" value={form.responsavel_tecnico} onChange={(e) => setForm(f => ({ ...f, responsavel_tecnico: e.target.value }))} />
            <Input label="CFT" value={form.cft} onChange={(e) => setForm(f => ({ ...f, cft: e.target.value }))} />
          </div>
        </div>
      </Card>

      <Card title="Assinatura do Técnico Responsável (contratada)">
        <div className="flex flex-col gap-3">
          <Input label="Nome do Técnico" value={nomeContratada} onChange={(e) => setNomeContratada(e.target.value)} placeholder="Nome do técnico que assina pela empresa" />
          <SignaturePad label="Assinatura do Técnico" value={assinaturaContratada} onChange={setAssinaturaContratada} />
        </div>
      </Card>

      {editData?.assinado_contratante_em && (
        <p className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-800">
          <Check size={14} /> Cliente {editData.nome_contratante} assinou em {new Date(editData.assinado_contratante_em).toLocaleString('pt-BR')}.
        </p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {savedId && (
        <button
          onClick={() => baixarPdfContrato(savedId, savedNumero)}
          className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
        >
          <Download size={16} /> Baixar PDF do Contrato
        </button>
      )}

      {savedId ? (
        <Button variant="outline" onClick={onSuccess} className="w-full">Concluir</Button>
      ) : (
        <>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => salvar('rascunho')} disabled={criar.isPending || atualizar.isPending} className="flex-1">
              💾 Rascunho
            </Button>
            <Button onClick={() => salvar()} disabled={criar.isPending || atualizar.isPending} className="flex-1">
              ✅ Salvar
            </Button>
          </div>
          <Button variant="outline" onClick={onCancel} className="w-full">Cancelar</Button>
        </>
      )}
    </div>
  )
}

function EnviarLinkDrawer({ contrato, open, onClose }: { contrato: Contrato | null; open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [linkCopiado, setLinkCopiado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  async function copiarLink() {
    if (!contrato) return
    setErro('')

    let link: string
    try {
      link = await gerarLinkAssinatura(contrato._id)
    } catch (err) {
      console.error('Erro ao gerar link de assinatura:', err)
      setErro('Não foi possível gerar o link.')
      return
    }

    try {
      await navigator.clipboard.writeText(link)
      setLinkCopiado(true)
      setTimeout(() => setLinkCopiado(false), 3000)
    } catch (err) {
      console.error('Erro ao copiar link para a área de transferência:', err)
      // fallback para quando a Clipboard API falha (ex.: documento sem foco)
      const textarea = document.createElement('textarea')
      textarea.value = link
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        setLinkCopiado(true)
        setTimeout(() => setLinkCopiado(false), 3000)
      } catch {
        setErro(`Não foi possível copiar automaticamente. Link: ${link}`)
      } finally {
        document.body.removeChild(textarea)
      }
    }
  }

  async function enviarEmail() {
    if (!contrato || !email) return
    setErro('')
    setEnviando(true)
    try {
      await enviarEmailContrato(contrato._id, email)
      setEnviado(true)
      setTimeout(() => { setEnviado(false); onClose() }, 2000)
    } catch {
      setErro('Não foi possível enviar o e-mail.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <BottomDrawer open={open} onClose={onClose} title="Enviar para Assinatura">
      <div className="flex flex-col gap-4">
        {contrato && (
          <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
            <span className="font-medium">{contrato.numero}</span> · {contrato.cliente_nome}
          </p>
        )}

        <Button onClick={copiarLink} variant="secondary" className="w-full">
          {linkCopiado ? <><Check size={16} /> Link copiado!</> : <><Link2 size={16} /> Copiar link de assinatura</>}
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">ou enviar por e-mail</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <Input label="E-mail do cliente" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@exemplo.com" />

        {erro && <p className="text-sm text-red-500">{erro}</p>}

        <Button onClick={enviarEmail} disabled={enviando || !email} className="w-full">
          {enviado ? <><Check size={16} /> Enviado!</> : enviando ? 'Enviando...' : <><Mail size={16} /> Enviar por e-mail</>}
        </Button>
      </div>
    </BottomDrawer>
  )
}

function ContratoCard({ contrato, onEdit, onClonar, onVer, onEnviar, onExcluir }: {
  contrato: Contrato
  onEdit: () => void
  onClonar: () => void
  onVer: () => void
  onEnviar: () => void
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
          <FileSignature size={16} className="text-[#1e3050]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-gray-400">{contrato.numero}</span>
            <Badge label={STATUS_CONTRATO[contrato.status] ?? contrato.status} className={`${STATUS_CONTRATO_COR[contrato.status]} text-xs`} />
          </div>
          <p className="mt-0.5 truncate font-semibold text-[#1e3050] text-sm">{contrato.cliente_nome}</p>
          <p className="text-xs text-gray-400 truncate">
            {contrato.vigencia_meses ? `${contrato.vigencia_meses} meses` : ''}{contrato.qtd_paineis ? ` · ${contrato.qtd_paineis} painéis` : ''}
          </p>
        </div>
        <div className="shrink-0 text-right ml-2">
          {contrato.valor_total ? <p className="text-sm font-bold text-[#1e3050]">{formatarMoeda(contrato.valor_total)}</p> : null}
          <p className="text-xs text-gray-400">{dataBr(contrato.data)}</p>
        </div>
        <ChevronDown size={16} className={`mt-1 shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-4 pb-4 pt-3">
          {contrato.cliente_endereco && (
            <p className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <MapPin size={12} className="shrink-0 text-gray-400" /> {contrato.cliente_endereco}
            </p>
          )}
          <div className="flex flex-col gap-1 mb-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <PenLine size={12} className={contrato.assinado_contratada_em ? 'text-green-500' : 'text-gray-300'} />
              Técnico: {contrato.assinado_contratada_em ? `assinado em ${new Date(contrato.assinado_contratada_em).toLocaleDateString('pt-BR')}` : 'pendente'}
            </span>
            <span className="flex items-center gap-1.5">
              <PenLine size={12} className={contrato.assinado_contratante_em ? 'text-green-500' : 'text-gray-300'} />
              Cliente: {contrato.assinado_contratante_em ? `assinado em ${new Date(contrato.assinado_contratante_em).toLocaleDateString('pt-BR')}` : 'pendente'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={onVer} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-[#1e3050] shadow-sm ring-1 ring-gray-200 active:bg-gray-50">
              <ScrollText size={12} /> Ver Contrato
            </button>
            <button onClick={onEdit} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 active:bg-gray-50">
              Editar
            </button>
            <button onClick={onClonar} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 active:bg-gray-50">
              <Copy size={12} /> Clonar
            </button>
            <button onClick={() => baixarPdfContrato(contrato._id, contrato.numero)} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 active:bg-gray-50">
              <Download size={12} /> PDF
            </button>
            {!contrato.assinado_contratante_em && (
              <button onClick={onEnviar} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-[#1e3050] shadow-sm ring-1 ring-gray-200 active:bg-gray-50">
                <Link2 size={12} /> Enviar p/ Assinatura
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

export default function Contratos() {
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroBusca, setFiltroBusca] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [enviarDrawerOpen, setEnviarDrawerOpen] = useState(false)
  const [editContrato, setEditContrato] = useState<Contrato | null>(null)
  const [novoContratoKey, setNovoContratoKey] = useState(0)
  const [enviarContrato, setEnviarContrato] = useState<Contrato | null>(null)
  const [verContrato, setVerContrato] = useState<Contrato | null>(null)
  const [excluirId, setExcluirId] = useState<string | null>(null)

  const excluir = useExcluirContrato()
  const { data: contratos = [], isLoading } = useContratos({
    status: filtroStatus === 'todos' ? undefined : filtroStatus,
    cliente: filtroBusca || undefined,
  })

  function abrirNovo() { setEditContrato(null); setNovoContratoKey(k => k + 1); setDrawerOpen(true) }
  function abrirEditar(ct: Contrato) { setEditContrato(ct); setDrawerOpen(true) }
  function abrirEnviar(ct: Contrato) { setEnviarContrato(ct); setEnviarDrawerOpen(true) }

  function abrirClonar(ct: Contrato) {
    setEditContrato({
      ...ct,
      _id: '',
      numero: '',
      guid: undefined,
      status: 'rascunho',
      assinatura_contratada: undefined,
      nome_contratada: undefined,
      assinado_contratada_em: undefined,
      latitude_contratada: undefined,
      longitude_contratada: undefined,
      endereco_contratada: undefined,
      assinatura_contratante: undefined,
      nome_contratante: undefined,
      assinado_contratante_em: undefined,
      latitude_contratante: undefined,
      longitude_contratante: undefined,
      endereco_contratante: undefined,
      criado_em: undefined,
    })
    setNovoContratoKey(k => k + 1)
    setDrawerOpen(true)
  }

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div>
        <h1 className="text-xl font-bold text-[#1e3050]">Contratos</h1>
        {!isLoading && <p className="text-xs text-gray-400">{contratos.length} contrato{contratos.length !== 1 ? 's' : ''}</p>}
      </div>

      <div className="flex gap-2">
        <Select
          options={[{ value: 'todos', label: 'Todos os status' }, ...Object.entries(STATUS_CONTRATO).map(([k, v]) => ({ value: k, label: v }))]}
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
      ) : contratos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
          <FileSignature size={32} className="opacity-30" />
          <p className="text-sm">Nenhum contrato encontrado.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {contratos.map(ct => (
            <ContratoCard
              key={ct._id}
              contrato={ct}
              onEdit={() => abrirEditar(ct)}
              onClonar={() => abrirClonar(ct)}
              onVer={() => setVerContrato(ct)}
              onEnviar={() => abrirEnviar(ct)}
              onExcluir={() => setExcluirId(ct._id)}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={abrirNovo}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0a500] text-[#1e3050] shadow-lg transition-transform active:scale-95 hover:bg-[#d4920a]"
        title="Novo Contrato"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <BottomDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editContrato?._id ? 'Editar Contrato' : 'Novo Contrato'}>
        <ContratoForm key={editContrato?._id ?? `new-${novoContratoKey}`} editData={editContrato} onSuccess={() => setDrawerOpen(false)} onCancel={() => setDrawerOpen(false)} />
      </BottomDrawer>

      <EnviarLinkDrawer contrato={enviarContrato} open={enviarDrawerOpen} onClose={() => setEnviarDrawerOpen(false)} />

      <Modal open={!!verContrato} onClose={() => setVerContrato(null)} title={verContrato ? `Contrato ${verContrato.numero}` : ''} wide>
        {verContrato && <ContratoConteudo contrato={verContrato} />}
      </Modal>

      {excluirId && (
        <ConfirmDialog
          mensagem="Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita."
          onConfirm={() => excluir.mutate(excluirId, { onSuccess: () => setExcluirId(null) })}
          onCancel={() => setExcluirId(null)}
          loading={excluir.isPending}
        />
      )}
    </div>
  )
}
