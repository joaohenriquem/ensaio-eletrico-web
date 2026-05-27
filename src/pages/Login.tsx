import { useState, useRef, useEffect, useMemo, type FormEvent } from 'react'
import { Moon } from 'lucide-react'
import { useNavigate, Link } from 'react-router'
import { Eye, EyeOff } from 'lucide-react'
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
  const [showPassword, setShowPassword] = useState(false)
  const geoRef = useRef<{ latitude: number; longitude: number } | null>(null)

  const apiOffline = useMemo(() => {
    const now = new Date()
    const brtMinutes = ((now.getUTCHours() * 60 + now.getUTCMinutes()) - 3 * 60 + 1440) % 1440
    return brtMinutes >= 22 * 60 + 30 || brtMinutes < 8 * 60 + 30
  }, [])

  async function getIpGeo(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const res = await fetch('https://ipapi.co/json/')
      const data = await res.json()
      if (data.latitude && data.longitude) {
        return { latitude: Number(data.latitude), longitude: Number(data.longitude) }
      }
    } catch { }
    return null
  }

  useEffect(() => {
    async function initGeo() {
      if (!navigator.geolocation) {
        geoRef.current = await getIpGeo()
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          geoRef.current = { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
        },
        async () => {
          // usuário negou ou timeout — fallback para geolocalização por IP
          geoRef.current = await getIpGeo()
        },
        { timeout: 8000, maximumAge: 60000 }
      )
    }
    initGeo()
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
      if (!geoRef.current) geoRef.current = await getIpGeo()
      const geo = geoRef.current
      const res = await verifyOtp(userId, otp.trim(), geo?.latitude, geo?.longitude)
      saveAuth(res.token, res.user)
      navigate(res.trocarSenha ? '/trocar-senha' : '/')
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

      {apiOffline && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-10">
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/90 backdrop-blur px-4 py-3 text-white shadow-lg">
            <Moon size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Sistema fora do ar</p>
              <p className="text-xs opacity-90">A API está offline entre 22h30 e 8h30 para economizar recursos. Tente novamente após as 8h30.</p>
            </div>
          </div>
        </div>
      )}

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
            <div className="relative">
              <Input
                label="Senha"
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

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
