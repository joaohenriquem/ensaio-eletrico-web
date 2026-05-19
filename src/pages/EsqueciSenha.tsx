import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { esqueceuSenha } from '../api/auth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import logo from '../static/logo.jpeg'

export default function EsqueciSenha() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await esqueceuSenha(email)
      setEnviado(true)
    } catch {
      setErro('Erro ao enviar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1e3050] p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <img src={logo} alt="Ensaio Elétrico" className="mx-auto mb-4 h-28 w-auto" />
          <h1 className="text-lg font-bold text-gray-800">Esqueci minha senha</h1>
          <p className="mt-1 text-sm text-gray-500">Informe seu e-mail para receber o link de redefinição</p>
        </div>

        {enviado ? (
          <div className="text-center">
            <div className="mb-4 text-5xl">📧</div>
            <p className="mb-6 text-sm text-gray-600">
              Se este e-mail estiver cadastrado, você receberá as instruções em breve. Verifique também a caixa de spam.
            </p>
            <Link to="/login" className="text-sm font-medium text-[#f0a500] hover:underline">
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="E-mail"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoFocus
              required
            />

            {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar link de redefinição'}
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
