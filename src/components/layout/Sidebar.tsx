import { NavLink, useNavigate } from 'react-router'
import { useEffect, useState } from 'react'
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
import logo from '../../static/logo_ensaio_eletrico.png'

const navBase = [
  { to: '/', label: 'Início', icon: Zap, exact: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: false },
  { to: '/clientes', label: 'Clientes', icon: Users, exact: false },
  { to: '/ordens', label: 'Ordens de Serviço', icon: ClipboardList, exact: false },
  { to: '/relatorios', label: 'Relatórios de Manutenção', icon: Wrench, exact: false },
  { to: '/propostas', label: 'Propostas Comerciais', icon: FileText, exact: false },
]

const navAdmin = [
  { to: '/usuarios', label: 'Usuários', icon: ShieldCheck, exact: false },
]

interface Props {
  nome: string
  perfil: string
  onLogout: () => void
  open: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export default function Sidebar({ nome, perfil, onLogout, open, onClose, collapsed, onToggleCollapse }: Props) {
  const navigate = useNavigate()
  const isAdmin = perfil === 'Administrador' || perfil === 'Admin'
  const nav = isAdmin ? [...navBase, ...navAdmin] : navBase
  const [spinning, setSpinning] = useState(false)

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
              'w-auto transition-[height,width] duration-300',
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
        <div className={cn('border-b border-white/10 px-5 py-3', collapsed && 'lg:hidden')}>
          <p className="text-sm font-medium text-white/90">{nome}</p>
          <p className="text-xs text-white/50">{perfil}</p>
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
