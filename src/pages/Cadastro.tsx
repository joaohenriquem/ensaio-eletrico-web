import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { registrar } from '../api/auth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import logo from '../static/logo_ensaio_eletrico.png'

const PERFIS = [
  { value: 'Técnico', label: 'Técnico' },
  { value: 'Administrador', label: 'Administrador' },
]

export default function Cadastro() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    username: '',
    senha: '',
    confirmarSenha: '',
    perfil: 'Técnico',
  })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [loading, setLoading] = useState(false)

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')

    if (form.senha !== form.confirmarSenha) {
      setErro('As senhas não conferem.')
      return
    }
    if (form.senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      await registrar({
        nome: form.nome,
        email: form.email,
        username: form.username,
        senha: form.senha,
        perfil: form.perfil,
      })
      setSucesso(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setErro(msg ?? 'Erro ao realizar cadastro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1c1c2e] p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <img src={logo} alt="Ensaio Elétrico" className="mx-auto mb-4 h-28 w-auto" />
          <p className="text-sm text-gray-500">Solicitar Acesso ao Sistema</p>
        </div>

        {sucesso ? (
          <div className="text-center">
            <div className="mb-4 text-5xl">✅</div>
            <h2 className="mb-2 text-lg font-semibold text-gray-800">Cadastro enviado!</h2>
            <p className="mb-6 text-sm text-gray-500">
              Seu cadastro foi recebido e está aguardando aprovação. Você receberá um e-mail assim que o acesso for liberado.
            </p>
            <Link
              to="/login"
              className="text-sm font-medium text-[#f0a500] hover:underline"
            >
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              label="Nome completo"
              id="nome"
              value={form.nome}
              onChange={(e) => set('nome', e.target.value)}
              placeholder="João Silva"
              required
              autoFocus
            />
            <Input
              label="E-mail"
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="joao@exemplo.com"
              required
            />
            <Input
              label="Usuário"
              id="username"
              value={form.username}
              onChange={(e) => set('username', e.target.value)}
              placeholder="joaosilva"
              required
            />
            <Select
              label="Perfil"
              id="perfil"
              value={form.perfil}
              onChange={(e) => set('perfil', e.target.value)}
              options={PERFIS}
            />
            <Input
              label="Senha"
              id="senha"
              type="password"
              value={form.senha}
              onChange={(e) => set('senha', e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
            <Input
              label="Confirmar senha"
              id="confirmarSenha"
              type="password"
              value={form.confirmarSenha}
              onChange={(e) => set('confirmarSenha', e.target.value)}
              placeholder="Repita a senha"
              required
            />

            {erro && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>
            )}

            <Button type="submit" size="lg" className="mt-1 w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Solicitar acesso'}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Já tem acesso?{' '}
              <Link to="/login" className="font-medium text-[#f0a500] hover:underline">
                Fazer login
              </Link>
            </p>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">v2.0 · Ensaio Elétrico © 2026</p>
      </div>
    </div>
  )
}
