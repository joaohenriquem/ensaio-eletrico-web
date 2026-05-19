import { useState } from 'react'
import { Search, ChevronDown, ChevronUp, Edit2, UserX } from 'lucide-react'
import { useClientes, useCriarCliente, useAtualizarCliente } from '../hooks/useClientes'
import type { Cliente } from '../types'
import Tabs from '../components/ui/Tabs'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

function NovoClienteForm({ onSuccess }: { onSuccess: () => void }) {
  const criar = useCriarCliente()
  const [form, setForm] = useState({
    nome: '', endereco: '', cidade: '', estado: 'SP',
    contato: '', telefone: '', email: '', sindico: '',
    torres: 1, observacoes: '',
  })
  const [error, setError] = useState('')

  function set(k: keyof typeof form, v: string | number) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit() {
    if (!form.nome || !form.cidade) { setError('Nome e cidade são obrigatórios.'); return }
    setError('')
    await criar.mutateAsync({ ...form, ativo: true })
    setForm({ nome: '', endereco: '', cidade: '', estado: 'SP', contato: '', telefone: '', email: '', sindico: '', torres: 1, observacoes: '' })
    onSuccess()
  }

  return (
    <Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Nome / Condomínio *" value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Condomínio Recanto das Flores" />
        <Input label="Endereço" value={form.endereco} onChange={(e) => set('endereco', e.target.value)} />
        <Input label="Cidade *" value={form.cidade} onChange={(e) => set('cidade', e.target.value)} />
        <Input label="Estado" value={form.estado} maxLength={2} onChange={(e) => set('estado', e.target.value.toUpperCase())} />
        <Input label="Contato / Responsável" value={form.contato} onChange={(e) => set('contato', e.target.value)} />
        <Input label="Telefone" value={form.telefone} onChange={(e) => set('telefone', e.target.value)} />
        <Input label="E-mail" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        <Input label="Síndico" value={form.sindico} onChange={(e) => set('sindico', e.target.value)} />
        <Input label="Número de Torres" type="number" min={0} max={20} value={form.torres} onChange={(e) => set('torres', Number(e.target.value))} />
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Observações</label>
          <textarea rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f0a500] focus:outline-none focus:ring-2 focus:ring-[#f0a500]/20" value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} />
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      <div className="mt-4 flex justify-end">
        <Button onClick={handleSubmit} disabled={criar.isPending}>
          {criar.isPending ? 'Salvando...' : 'Cadastrar Cliente'}
        </Button>
      </div>
    </Card>
  )
}

function ClienteRow({ cliente }: { cliente: Cliente }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const atualizar = useAtualizarCliente()
  const [form, setForm] = useState({ ...cliente })

  async function salvar() {
    await atualizar.mutateAsync({ id: cliente._id, data: form })
    setEditing(false)
  }

  async function desativar() {
    if (confirm('Desativar este cliente?')) {
      await atualizar.mutateAsync({ id: cliente._id, data: { ativo: false } })
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
      >
        <div>
          <p className="font-medium text-[#1e3050]">{cliente.nome}</p>
          <p className="text-xs text-gray-500">{cliente.cidade} – {cliente.estado}</p>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          {!editing ? (
            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              {cliente.endereco && <p><span className="font-medium">Endereço:</span> {cliente.endereco}</p>}
              {cliente.contato && <p><span className="font-medium">Contato:</span> {cliente.contato}</p>}
              {cliente.telefone && <p><span className="font-medium">Telefone:</span> {cliente.telefone}</p>}
              {cliente.email && <p><span className="font-medium">E-mail:</span> {cliente.email}</p>}
              {cliente.sindico && <p><span className="font-medium">Síndico:</span> {cliente.sindico}</p>}
              {cliente.torres && <p><span className="font-medium">Torres:</span> {cliente.torres}</p>}
              {cliente.observacoes && <p className="col-span-2"><span className="font-medium">Obs:</span> {cliente.observacoes}</p>}
              <div className="col-span-2 mt-3 flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                  <Edit2 size={13} /> Editar
                </Button>
                <Button variant="danger" size="sm" onClick={desativar}>
                  <UserX size={13} /> Desativar
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nome" value={form.nome ?? ''} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} />
              <Input label="Cidade" value={form.cidade ?? ''} onChange={(e) => setForm(f => ({ ...f, cidade: e.target.value }))} />
              <Input label="Endereço" value={form.endereco ?? ''} onChange={(e) => setForm(f => ({ ...f, endereco: e.target.value }))} />
              <Input label="Telefone" value={form.telefone ?? ''} onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))} />
              <Input label="E-mail" value={form.email ?? ''} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
              <Input label="Síndico" value={form.sindico ?? ''} onChange={(e) => setForm(f => ({ ...f, sindico: e.target.value }))} />
              <div className="col-span-2 flex gap-2">
                <Button size="sm" onClick={salvar} disabled={atualizar.isPending}>Salvar</Button>
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ListaClientes() {
  const [busca, setBusca] = useState('')
  const { data = [], isLoading } = useClientes({ ativo: true })
  const filtrados = data.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.cidade ?? '').toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-[#f0a500] focus:outline-none"
          placeholder="Buscar cliente ou cidade..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>
      {isLoading ? <p className="text-sm text-gray-400">Carregando...</p> : (
        <div className="flex flex-col gap-2">
          {filtrados.map(c => <ClienteRow key={c._id} cliente={c} />)}
          {filtrados.length === 0 && <p className="text-sm text-gray-400">Nenhum cliente encontrado.</p>}
        </div>
      )}
    </div>
  )
}

export default function Clientes() {
  const [tab, setTab] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-[#1e3050]">Clientes</h1>
      <Tabs
        tabs={[
          { label: '📋 Lista de Clientes', content: <ListaClientes /> },
          { label: '➕ Novo Cliente', content: <NovoClienteForm onSuccess={() => setTab(0)} /> },
        ]}
        defaultIndex={tab}
        key={tab}
      />
    </div>
  )
}
