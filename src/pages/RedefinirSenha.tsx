import { useState, type FormEvent } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { redefinirSenha } from '../api/auth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import logo from '../static/logo.jpeg'

export default function RedefinirSenha() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1e3050] p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
          <p className="mb-4 text-gray-600">Link inválido ou expirado.</p>
          <Link to="/esqueci-senha" className="text-sm font-medium text-[#f0a500] hover:underline">
            Solicitar novo link
          </Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    if (novaSenha !== confirmar) {
      setErro('As senhas não conferem.')
      return
    }
    if (novaSenha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    setLoading(true)
    try {
      await redefinirSenha(token, novaSenha)
      setSucesso(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setErro(msg ?? 'Erro ao redefinir senha. Solicite um novo link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1e3050] p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <img src={logo} alt="Ensaio Elétrico" className="mx-auto mb-4 h-28 w-auto" />
          <h1 className="text-lg font-bold text-gray-800">Nova senha</h1>
          <p className="mt-1 text-sm text-gray-500">Defina sua nova senha de acesso</p>
        </div>

        {sucesso ? (
          <div className="text-center">
            <div className="mb-4 text-5xl">✅</div>
            <p className="mb-2 font-semibold text-gray-800">Senha redefinida!</p>
            <p className="text-sm text-gray-500">Redirecionando para o login...</p>
          </div>
        ) : (
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
              label="Confirmar nova senha"
              id="confirmar"
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="Repita a senha"
              required
            />

            {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Salvando...' : 'Redefinir senha'}
            </Button>

            <Link to="/login" className="text-center text-sm text-gray-400 hover:text-gray-600">
              Voltar ao login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
