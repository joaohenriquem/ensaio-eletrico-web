import { useState } from 'react'
import { Search, ChevronDown, Edit2, UserX, Trash2, Plus, Mail, MapPin, Building2, Map } from 'lucide-react'
import { useClientes, useCriarCliente, useAtualizarCliente, useExcluirCliente } from '../hooks/useClientes'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import BottomDrawer from '../components/ui/BottomDrawer'
import MapaModal from '../components/ui/MapaModal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import type { Cliente } from '../types'

const FORM_VAZIO = {
  nome: '', endereco: '', cidade: '', estado: 'SP',
  contato: '', telefone: '', email: '', sindico: '',
  torres: 1, observacoes: '',
}

type FormData = typeof FORM_VAZIO

function ClienteForm({ inicial, onSave, onCancel }: {
  inicial?: Cliente | null
  onSave: (data: FormData) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState<FormData>({
    nome: inicial?.nome ?? '',
    endereco: inicial?.endereco ?? '',
    cidade: inicial?.cidade ?? '',
    estado: inicial?.estado ?? 'SP',
    contato: inicial?.contato ?? '',
    telefone: inicial?.telefone ?? '',
    email: inicial?.email ?? '',
    sindico: inicial?.sindico ?? '',
    torres: inicial?.torres ?? 1,
    observacoes: inicial?.observacoes ?? '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function set(k: keyof FormData, v: string | number) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit() {
    if (!form.nome.trim() || !form.cidade.trim()) {
      setError('Nome e cidade são obrigatórios.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave(form)
    } catch {
      setError('Não foi possível salvar. Verifique sua conexão e tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Input label="Nome / Condomínio *" value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Condomínio Recanto das Flores" />
      <Input label="Endereço" value={form.endereco} onChange={e => set('endereco', e.target.value)} />
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-3">
          <Input label="Cidade *" value={form.cidade} onChange={e => set('cidade', e.target.value)} />
        </div>
        <Input label="Estado" value={form.estado} maxLength={2} onChange={e => set('estado', e.target.value.toUpperCase())} />
      </div>
      <Input label="Contato / Responsável" value={form.contato} onChange={e => set('contato', e.target.value)} />
      <Input label="Telefone" type="tel" value={form.telefone} onChange={e => set('telefone', e.target.value)} />
      <Input label="E-mail" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
      <Input label="Síndico" value={form.sindico} onChange={e => set('sindico', e.target.value)} />
      <Input label="Número de Torres" type="number" min={0} max={99} value={form.torres} onChange={e => set('torres', Number(e.target.value))} />
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Observações</label>
        <textarea
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none focus:ring-2 focus:ring-[#f0a500]/20"
          value={form.observacoes}
          onChange={e => set('observacoes', e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button onClick={handleSubmit} disabled={saving} className="flex-1">
          {saving ? 'Salvando...' : inicial ? 'Salvar Alterações' : 'Cadastrar Cliente'}
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>
      </div>
    </div>
  )
}

function ClienteCard({ cliente, onEdit, onExcluir }: {
  cliente: Cliente
  onEdit: () => void
  onExcluir: () => void
}) {
  const [open, setOpen] = useState(false)
  const [mapaAberto, setMapaAberto] = useState(false)
  const atualizar = useAtualizarCliente()

  const enderecoCompleto = [cliente.endereco, cliente.cidade, cliente.estado].filter(Boolean).join(', ')

  async function desativar() {
    await atualizar.mutateAsync({ id: cliente._id, data: { ativo: false } })
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e3050]/10">
          <Building2 size={16} className="text-[#1e3050]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[#1e3050] text-sm">{cliente.nome}</p>
          {(cliente.cidade || cliente.estado) && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
              <MapPin size={10} />
              {[cliente.cidade, cliente.estado].filter(Boolean).join(' – ')}
            </p>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-4 pb-4 pt-3">
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            {(cliente.endereco || cliente.cidade) && (
              <div className="flex items-start justify-between gap-2">
                <p className="flex items-start gap-2">
                  <MapPin size={13} className="mt-0.5 shrink-0 text-gray-400" />
                  {[cliente.endereco, cliente.cidade, cliente.estado].filter(Boolean).join(', ')}
                </p>
                <button
                  onClick={() => setMapaAberto(true)}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 transition"
                >
                  <Map size={11} /> Mapa
                </button>
              </div>
            )}
            {cliente.telefone && (
              <a
                href={`https://wa.me/55${cliente.telefone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-600 active:opacity-70"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {cliente.telefone}
              </a>
            )}
            {cliente.email && (
              <p className="flex items-center gap-2">
                <Mail size={13} className="shrink-0 text-gray-400" />
                {cliente.email}
              </p>
            )}
            {cliente.contato && (
              <p className="text-xs"><span className="font-medium text-gray-700">Contato:</span> {cliente.contato}</p>
            )}
            {cliente.sindico && (
              <p className="text-xs"><span className="font-medium text-gray-700">Síndico:</span> {cliente.sindico}</p>
            )}
            {cliente.torres ? (
              <p className="text-xs"><span className="font-medium text-gray-700">Torres:</span> {cliente.torres}</p>
            ) : null}
            {cliente.observacoes && (
              <p className="text-xs italic text-gray-500">{cliente.observacoes}</p>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 active:bg-gray-50"
            >
              <Edit2 size={12} /> Editar
            </button>
            <button
              onClick={desativar}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-amber-600 shadow-sm ring-1 ring-amber-200 active:bg-amber-50"
            >
              <UserX size={12} /> Desativar
            </button>
            <button
              onClick={onExcluir}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm ring-1 ring-red-200 active:bg-red-50"
            >
              <Trash2 size={12} /> Excluir
            </button>
          </div>
        </div>
      )}

      {mapaAberto && enderecoCompleto && (
        <MapaModal
          address={enderecoCompleto}
          titulo={cliente.nome}
          onClose={() => setMapaAberto(false)}
        />
      )}
    </div>
  )
}

export default function Clientes() {
  const [busca, setBusca] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editCliente, setEditCliente] = useState<Cliente | null>(null)
  const [excluirId, setExcluirId] = useState<string | null>(null)

  const { data = [], isLoading } = useClientes({ ativo: true })
  const criar = useCriarCliente()
  const atualizar = useAtualizarCliente()
  const excluir = useExcluirCliente()

  const filtrados = data.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.cidade ?? '').toLowerCase().includes(busca.toLowerCase())
  )

  function abrirNovo() {
    setEditCliente(null)
    setDrawerOpen(true)
  }

  function abrirEditar(cliente: Cliente) {
    setEditCliente(cliente)
    setDrawerOpen(true)
  }

  async function salvar(form: FormData) {
    if (editCliente) {
      await atualizar.mutateAsync({ id: editCliente._id, data: form })
    } else {
      await criar.mutateAsync({ ...form, ativo: true })
    }
    setDrawerOpen(false)
  }

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e3050]">Clientes</h1>
          {!isLoading && (
            <p className="text-xs text-gray-400">
              {busca
                ? `${filtrados.length} de ${data.length} cadastrado${data.length !== 1 ? 's' : ''}`
                : `${data.length} cadastrado${data.length !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-[#f0a500] focus:outline-none focus:ring-2 focus:ring-[#f0a500]/20"
          placeholder="Buscar cliente ou cidade..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-gray-400">Carregando...</p>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
          <Building2 size={32} className="opacity-30" />
          <p className="text-sm">Nenhum cliente encontrado.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtrados.map(c => (
            <ClienteCard
              key={c._id}
              cliente={c}
              onEdit={() => abrirEditar(c)}
              onExcluir={() => setExcluirId(c._id)}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={abrirNovo}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0a500] text-[#1e3050] shadow-lg transition-transform active:scale-95 hover:bg-[#d4920a]"
        title="Novo Cliente"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <BottomDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editCliente ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <ClienteForm
          key={editCliente?._id ?? 'new'}
          inicial={editCliente}
          onSave={salvar}
          onCancel={() => setDrawerOpen(false)}
        />
      </BottomDrawer>

      {excluirId && (
        <ConfirmDialog
          mensagem="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
          onConfirm={() => excluir.mutate(excluirId, { onSuccess: () => setExcluirId(null) })}
          onCancel={() => setExcluirId(null)}
          loading={excluir.isPending}
        />
      )}
    </div>
  )
}
