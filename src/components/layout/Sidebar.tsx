import { NavLink, useNavigate } from 'react-router'
import { useEffect, useState, useRef } from 'react'
import { uploadImagem } from '../../api/uploads'
import { atualizarFotoPerfil } from '../../api/auth'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Wrench,
  FileText,
  Zap,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import logo from '../../static/logo.jpeg'

const navBase = [
  { to: '/', label: 'Início', icon: Zap, exact: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: false },
  { to: '/clientes', label: 'Clientes', icon: Users, exact: false },
  { to: '/ordens', label: 'Ordens de Serviço', icon: ClipboardList, exact: false },
  { to: '/propostas', label: 'Propostas Comerciais', icon: FileText, exact: false },
  { to: '/relatorios', label: 'Relatórios de Manutenção', icon: Wrench, exact: false },
]

const navAdmin = [
  { to: '/usuarios', label: 'Usuários', icon: ShieldCheck, exact: false },
]

interface Props {
  nome: string
  perfil: string
  fotoUrl?: string
  onFotoChange?: (url: string) => void
  onLogout: () => void
  open: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export default function Sidebar({ nome, perfil, fotoUrl, onFotoChange, onLogout, open, onClose, collapsed, onToggleCollapse }: Props) {
  const navigate = useNavigate()
  const isAdmin = perfil === 'Administrador' || perfil === 'Admin'
  const nav = isAdmin ? [...navBase, ...navAdmin] : navBase
  const [spinning, setSpinning] = useState(false)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const fotoInputRef = useRef<HTMLInputElement>(null)

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingFoto(true)
    try {
      const url = await uploadImagem(file)
      await atualizarFotoPerfil(url)
      onFotoChange?.(url)
    } catch { /* silencioso */ } finally {
      setUploadingFoto(false)
      e.target.value = ''
    }
  }

  useEffect(() => {
    setSpinning(true)
    const t = setTimeout(() => setSpinning(false), 500)
    return () => clearTimeout(t)
  }, [collapsed])

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex h-screen flex-col bg-[#1e3050] text-white shadow-xl transition-all duration-300 lg:sticky lg:top-0 lg:translate-x-0 lg:z-auto w-64',
          open ? 'translate-x-0' : '-translate-x-full',
          collapsed && 'lg:w-16'
        )}
      >
        {/* Logo / header */}
        <div className={cn(
          'flex items-center justify-between border-b border-white/10 px-5 py-4 transition-all duration-300',
          collapsed && 'lg:flex-col lg:items-center lg:justify-start lg:gap-2 lg:px-2 lg:py-3'
        )}>
          {/* Desktop collapse toggle — topo quando colapsado, direita quando expandido */}
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            className={cn(
              'hidden lg:flex rounded-lg p-1.5 text-white/50 hover:text-white hover:bg-white/10 transition',
              !collapsed && 'order-last'
            )}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <img
            src={logo}
            alt="Ensaio Elétrico"
            className={cn(
              'mx-auto w-auto transition-[height,width] duration-300',
              collapsed ? 'lg:h-9' : 'h-20',
              spinning && 'animate-[spin_0.5s_ease-in-out]'
            )}
          />

          {/* Mobile close */}
          <button onClick={onClose} className="rounded p-1 text-white/50 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        </div>

        {/* User info — hidden when collapsed on desktop */}
        <div className={cn('border-b border-white/10 px-5 py-3 flex items-center gap-3', collapsed && 'lg:hidden')}>
          <label className="relative shrink-0 cursor-pointer" title="Alterar foto">
            {fotoUrl ? (
              <img src={fotoUrl} alt={nome} className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0a500] text-sm font-bold text-[#1e3050]">
                {nome.charAt(0).toUpperCase()}
              </div>
            )}
            {uploadingFoto && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}
            <input ref={fotoInputRef} type="file" accept="image/*" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" onChange={handleFotoChange} disabled={uploadingFoto} />
          </label>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white/90">{nome}</p>
            <p className="text-xs text-white/50">{perfil}</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4">
          {nav.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={onClose}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-5 py-3 text-sm transition-all duration-300',
                  collapsed && 'lg:justify-center lg:px-0',
                  isActive
                    ? 'bg-[#f0a500]/15 text-[#f0a500] font-medium border-r-2 border-[#f0a500]'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                )
              }
            >
              <Icon size={17} className="shrink-0" />
              <span className={cn('truncate transition-all duration-300', collapsed && 'lg:hidden')}>
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            title={collapsed ? 'Sair' : undefined}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition',
              collapsed && 'lg:justify-center lg:px-0'
            )}
          >
            <LogOut size={16} className="shrink-0" />
            <span className={cn(collapsed && 'lg:hidden')}>Sair</span>
          </button>
        </div>
      </aside>
    </>
  )
}
