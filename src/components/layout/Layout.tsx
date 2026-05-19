import { useState } from 'react'
import type { ReactNode } from 'react'
import { Menu, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'
import Sidebar from './Sidebar'
import { useAuth } from '../../hooks/useAuth'

interface Props {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  function handleLogoutMobile() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        nome={user?.nome ?? ''}
        perfil={user?.perfil ?? ''}
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

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
