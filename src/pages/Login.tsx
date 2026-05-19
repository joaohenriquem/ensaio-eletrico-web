import { useState, useRef, useEffect, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router'
import { login, verifyOtp } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import logo from '../static/logo.jpeg'
import bgVideo from '../static/animacao.mp4'

export default function Login() {
  const { login: saveAuth } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [userId, setUserId] = useState('')
  const [emailHint, setEmailHint] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const geoRef = useRef<{ latitude: number; longitude: number } | null>(null)

  // Solicita geolocalização assim que a página abre — dá tempo ao usuário aceitar
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        geoRef.current = { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
      },
      () => { geoRef.current = null },
      { timeout: 30000, maximumAge: 60000 }
    )
  }, [])

  async function handleCredentials(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(username, password)
      setUserId(res.userId)
      setEmailHint(res.email)
      setStep('otp')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Usuário ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  async function handleOtp(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const geo = geoRef.current
      const { token, user } = await verifyOtp(userId, otp.trim(), geo?.latitude, geo?.longitude)
      saveAuth(token, user)
      navigate('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Código inválido ou expirado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0 -z-10">
        <video
          src={bgVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1e3050]/60" />
      </div>

      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <img src={logo} alt="Ensaio Elétrico" className="mx-auto mb-4 h-36 w-auto" />
          <p className="mt-1 text-sm text-gray-500">Sistema de Gestão Operacional</p>
        </div>

        {step === 'credentials' ? (
          <form onSubmit={handleCredentials} className="flex flex-col gap-4">
            <Input
              label="Usuário"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder=""
              autoFocus
              required
            />
            <Input
              label="Senha"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
              {loading ? 'Verificando...' : 'Continuar'}
            </Button>

            <div className="flex flex-col items-center gap-1">
              <Link to="/esqueci-senha" className="text-sm text-gray-400 hover:text-gray-600">
                Esqueci minha senha
              </Link>
              <p className="text-sm text-gray-500">
                Não tem acesso?{' '}
                <Link to="/cadastro" className="font-medium text-[#f0a500] hover:underline">
                  Solicitar cadastro
                </Link>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtp} className="flex flex-col gap-4">
            <div className="rounded-lg bg-blue-50 px-4 py-3 text-center text-sm text-blue-700">
              Enviamos um código de 6 dígitos para<br />
              <strong>{emailHint}</strong>
            </div>

            <Input
              label="Código de verificação"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              autoFocus
              required
              maxLength={6}
              className="text-center text-2xl tracking-[0.5em] font-bold"
            />

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading || otp.length < 6}>
              {loading ? 'Verificando...' : 'Entrar'}
            </Button>

            <button
              type="button"
              onClick={() => { setStep('credentials'); setOtp(''); setError('') }}
              className="text-center text-sm text-gray-400 hover:text-gray-600"
            >
              Voltar e tentar novamente
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">v2.0 · Ensaio Elétrico © 2026</p>
      </div>
    </div>
  )
}
