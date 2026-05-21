import { useState } from 'react'
import type { ReactNode } from 'react'
import { Menu, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'
import Sidebar from './Sidebar'
import { useAuth } from '../../hooks/useAuth'

interface Props {
  children: ReactNode
  onFotoChange?: (url: string) => void
}

export default function Layout({ children, onFotoChange }: Props) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  function handleLogoutMobile() {
    logout()
    navigate('/login')
  }

  const initials = user?.nome ? user.nome.charAt(0).toUpperCase() : '?'

  function Avatar({ size = 9 }: { size?: number }) {
    const cls = `h-${size} w-${size} rounded-full object-cover ring-2 ring-[#f0a500]/40`
    const textCls = `flex h-${size} w-${size} items-center justify-center rounded-full bg-[#f0a500] font-bold text-[#1e3050]`
    return user?.foto_url
      ? <img src={user.foto_url} alt={user.nome} className={cls} />
      : <div className={textCls} style={{ fontSize: size <= 8 ? '0.75rem' : '0.875rem' }}>{initials}</div>
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        nome={user?.nome ?? ''}
        perfil={user?.perfil ?? ''}
        fotoUrl={user?.foto_url}
        onFotoChange={onFotoChange}
        onLogout={logout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />

      <div className="flex flex-1 flex-col">
        {/* Top bar mobile */}
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100"
          >
            <Menu size={22} />
          </button>
          <span className="flex-1 text-sm font-semibold text-[#1e3050]">Ensaio Elétrico</span>
          <Avatar size={8} />
          <button
            onClick={handleLogoutMobile}
            className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </header>

        {/* Top bar desktop */}
        <header className="sticky top-0 z-10 hidden items-center justify-end border-b border-gray-200 bg-white px-6 py-3 lg:flex">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{user?.nome}</p>
              <p className="text-xs text-gray-500">{user?.perfil}</p>
            </div>
            <Avatar size={9} />
          </div>
        </header>

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
