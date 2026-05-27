import { useState, useMemo } from 'react'
import type { ReactNode } from 'react'
import { Menu, LogOut, Moon } from 'lucide-react'
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

  const apiOffline = useMemo(() => {
    const brtHour = (new Date().getUTCHours() - 3 + 24) % 24
    return brtHour >= 20 || brtHour < 8
  }, [])

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
          <button
            onClick={handleLogoutMobile}
            className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </header>

        {apiOffline && (
          <div className="flex items-center gap-2 bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-amber-800">
            <Moon size={15} className="shrink-0" />
            <p className="text-xs font-medium">Sistema em modo econômico — API offline entre 20h e 8h. Algumas funções podem não responder.</p>
          </div>
        )}
        <main className="p-4 pt-6 lg:px-6 lg:pb-6 lg:pt-3">{children}</main>
      </div>
    </div>
  )
}
