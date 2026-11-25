'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AppSidebar, Topbar } from './dashboard-shell'
import DashboardOverview from './dashboard-overview'

type User = { name: string; email: string; role: string }

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('tosmart-session')
    if (stored) {
      try {
        setUser(JSON.parse(stored) as User)
      } catch {
        localStorage.removeItem('tosmart-session')
      }
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready && !user) router.replace('/login')
  }, [ready, user, router])

  if (!ready || !user) {
    return (
      <div className="app-loading">
        <Image src="/tosmart-full.png" alt="" width={115} height={38} className="loading-logo" />
        <span>Menyiapkan Tosmart…</span>
      </div>
    )
  }

  return (
    <div className={`dashboard-app${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <AppSidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((current) => !current)}
      />
      <div className="app-main">
        <Topbar user={user} onMenu={() => setMenuOpen(true)} />
        <DashboardOverview user={user} />
      </div>
    </div>
  )
}
