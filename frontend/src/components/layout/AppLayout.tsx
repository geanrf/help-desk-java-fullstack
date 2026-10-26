import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#080d18] text-slate-100">
      <a
        className="fixed left-4 top-3 z-[60] -translate-y-20 rounded-lg bg-cyan-300 px-4 py-2 font-semibold text-slate-950 transition focus:translate-y-0"
        href="#main-content"
      >
        Pular para o conteúdo
      </a>
      <Sidebar onClose={() => setSidebarOpen(false)} open={sidebarOpen} user={user} />
      <div className="min-h-screen lg:pl-72">
        <Header onLogout={logout} onMenuOpen={() => setSidebarOpen(true)} user={user} />
        <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8" id="main-content">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
