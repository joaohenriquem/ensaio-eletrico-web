import { useState } from 'react'
import type { ReactNode } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuth } from '../../hooks/useAuth'

interface Props {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

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
          <span className="text-sm font-semibold text-[#1e3050]">Ensaio Elétrico</span>
        </header>

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
