import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { changePassword } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import logo from '../static/logo.jpeg'

export default function TrocarSenha() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  if (!token) {
    navigate('/login')
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    if (novaSenha !== confirmar) { setErro('As senhas não conferem.'); return }
    if (novaSenha.length < 6) { setErro('A senha deve ter no mínimo 6 caracteres.'); return }
    setLoading(true)
    try {
      await changePassword(novaSenha)
      navigate('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setErro(msg ?? 'Erro ao alterar senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1e3050] p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <img src={logo} alt="Ensaio Elétrico" className="mx-auto mb-4 h-28 w-auto" />
          <h1 className="text-lg font-bold text-gray-800">Troca de senha obrigatória</h1>
          <p className="mt-1 text-sm text-gray-500">
            Por segurança, defina uma nova senha antes de continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nova senha"
            id="novaSenha"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            autoFocus
            required
          />
          <Input
            label="Confirmar senha"
            id="confirmar"
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            placeholder="Repita a senha"
            required
          />

          {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Definir nova senha'}
          </Button>

          <button
            type="button"
            onClick={() => { logout(); navigate('/login') }}
            className="text-center text-sm text-gray-400 hover:text-gray-600"
          >
            Cancelar e sair
          </button>
        </form>
      </div>
    </div>
  )
}
