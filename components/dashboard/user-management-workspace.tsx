'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, Mail, Plus, Search, ShieldCheck, Trash2, UserPlus, Users, X } from 'lucide-react'
import { AppSidebar, Topbar } from './dashboard-shell'

type SessionUser = { name: string; email: string; role: string }
type ManagedAccount = { id: string; name: string; email: string; role: string; active: boolean }
type AccountFilter = 'Semua status' | 'Aktif' | 'Nonaktif'

const roles = ['Super Admin', 'Admin', 'Manajer', 'Kasir', 'Staf inventori']
const initialAccounts: ManagedAccount[] = [
  { id: 'USR-001', name: 'Andi Saputra', email: 'admin@retailpos.com', role: 'Super Admin', active: true },
  { id: 'USR-002', name: 'Rina Putri', email: 'cashier@retailpos.com', role: 'Kasir', active: true },
  { id: 'USR-003', name: 'Maya Lestari', email: 'maya@tosmart.id', role: 'Staf inventori', active: false },
]

export default function UserManagementWorkspace() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [ready, setReady] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [accounts, setAccounts] = useState(initialAccounts)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<AccountFilter>('Semua status')
  const [formOpen, setFormOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ name: '', email: '', role: 'Kasir' })

  useEffect(() => {
    const raw = window.localStorage.getItem('tosmart-session')
    if (raw) {
      try {
        setUser(JSON.parse(raw) as SessionUser)
      } catch {
        window.localStorage.removeItem('tosmart-session')
      }
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready && !user) router.replace('/login')
  }, [ready, user, router])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(''), 2800)
    return () => window.clearTimeout(timeout)
  }, [notice])

  useEffect(() => {
    if (!formOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFormOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [formOpen])

  const canManageUsers = Boolean(user && (user.role.toLowerCase() === 'super admin' || user.email.toLowerCase() === 'admin@retailpos.com'))
  const visibleAccounts = useMemo(() => accounts.filter(account => {
    const matchesQuery = `${account.name} ${account.email} ${account.role}`.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = filter === 'Semua status' || (filter === 'Aktif' ? account.active : !account.active)
    return matchesQuery && matchesStatus
  }), [accounts, filter, query])
  const activeCount = accounts.filter(account => account.active).length
  const adminCount = accounts.filter(account => account.role === 'Super Admin' || account.role === 'Admin').length

  const registerAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = form.name.trim()
    const email = form.email.trim().toLowerCase()
    if (!name || !email) return
    if (accounts.some(account => account.email.toLowerCase() === email)) {
      setNotice('Email tersebut sudah terdaftar dalam daftar akun demo.')
      return
    }
    setAccounts(current => [{ id: `USR-${String(Date.now()).slice(-6)}`, name, email, role: form.role, active: true }, ...current])
    setForm({ name: '', email: '', role: 'Kasir' })
    setFormOpen(false)
    setNotice('Akun demo berhasil ditambahkan ke daftar sementara.')
  }

  const updateRole = (id: string, role: string) => {
    setAccounts(current => current.map(account => account.id === id ? { ...account, role } : account))
    setNotice('Hak akses akun demo diperbarui.')
  }

  const toggleActive = (account: ManagedAccount) => {
    if (account.email.toLowerCase() === user?.email.toLowerCase()) return
    setAccounts(current => current.map(item => item.id === account.id ? { ...item, active: !item.active } : item))
    setNotice(account.active ? 'Akun demo dinonaktifkan.' : 'Akun demo diaktifkan kembali.')
  }

  const removeAccount = (account: ManagedAccount) => {
    if (account.email.toLowerCase() === user?.email.toLowerCase()) return
    if (!window.confirm(`Hapus ${account.name} dari daftar akun demo?`)) return
    setAccounts(current => current.filter(item => item.id !== account.id))
    setNotice('Akun demo dihapus dari daftar sementara.')
  }

  if (!ready || !user) {
    return <div className="app-loading"><Image src="/tosmart-full.png" alt="" width={115} height={38} className="loading-logo"/><span>Menyiapkan Tosmart…</span></div>
  }

  return (
    <div className={`dashboard-app${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <AppSidebar open={menuOpen} onClose={() => setMenuOpen(false)} user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(current => !current)}/>
      <div className="app-main">
        <Topbar user={user} onMenu={() => setMenuOpen(true)}/>
        <main className="dashboard-content phase-content user-admin-content">
          <div className="dashboard-heading phase-heading">
            <div>
              <div className="breadcrumb"><Link href="/dashboard">AKUN & AKSES</Link><ChevronRight size={13}/><span>MANAJEMEN PENGGUNA</span></div>
              <h1>Manajemen pengguna</h1>
              <p>Atur akun tim toko dan peran yang dapat mereka akses.</p>
            </div>
            {canManageUsers && <button className="export-button" onClick={() => setFormOpen(true)}><UserPlus size={15}/> Tambah pengguna</button>}
          </div>

          {!canManageUsers ? (
            <section className="panel users-access-denied" role="alert">
              <ShieldCheck size={23}/>
              <div><h2>Akses khusus Super Admin</h2><p>Gunakan akun Super Admin untuk mengelola daftar pengguna.</p></div>
              <Link href="/dashboard">Kembali ke dashboard</Link>
            </section>
          ) : (
            <>
              <div className="users-demo-notice" role="note"><ShieldCheck size={17}/><p><b>Mode frontend demo.</b> Perubahan akun hanya tersimpan sementara di halaman ini. Pembuatan login dan penyimpanan aman akan dihubungkan setelah backend siap.</p></div>
              <section className="users-metrics" aria-label="Ringkasan akun">
                <article><span className="users-metric-icon"><Users size={17}/></span><small>Total akun</small><strong>{accounts.length}</strong><span>akun terdaftar</span></article>
                <article><span className="users-metric-icon users-metric-active"><Check size={17}/></span><small>Akun aktif</small><strong>{activeCount}</strong><span>dapat digunakan</span></article>
                <article><span className="users-metric-icon users-metric-admin"><ShieldCheck size={17}/></span><small>Akun berakses admin</small><strong>{adminCount}</strong><span>akses pengelolaan</span></article>
                <article><span className="users-metric-icon users-metric-inactive"><X size={17}/></span><small>Nonaktif</small><strong>{accounts.length - activeCount}</strong><span>akses dijeda</span></article>
              </section>

              <section className="panel users-table-panel" aria-labelledby="users-list-title">
                <div className="users-panel-heading"><div><h2 id="users-list-title">Daftar pengguna</h2><p>Atur status dan peran akun demo di toko.</p></div><span className="users-total-pill">{accounts.length} akun</span></div>
                <div className="users-toolbar">
                  <label className="users-search"><Search size={16}/><input aria-label="Cari pengguna" placeholder="Cari nama, email, atau peran…" value={query} onChange={event => setQuery(event.target.value)}/></label>
                  <label className="users-filter-label"><span className="sr-only">Filter status akun</span><select value={filter} onChange={event => setFilter(event.target.value as AccountFilter)}><option>Semua status</option><option>Aktif</option><option>Nonaktif</option></select></label>
                </div>
                <div className="users-table-wrap">
                  <table className="users-table">
                    <thead><tr><th>Pengguna</th><th>ID akun</th><th>Peran</th><th>Status</th><th><span className="sr-only">Aksi</span></th></tr></thead>
                    <tbody>
                      {visibleAccounts.map(account => {
                        const isCurrentUser = account.email.toLowerCase() === user.email.toLowerCase()
                        return <tr key={account.id}>
                          <td><div className="managed-user"><span className="managed-avatar">{account.name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()}</span><span><b>{account.name}{isCurrentUser && <small className="current-user-tag">Kamu</small>}</b><small>{account.email}</small></span></div></td>
                          <td className="account-id">{account.id}</td>
                          <td><label><span className="sr-only">Peran untuk {account.name}</span><select className="account-role-select" value={account.role} onChange={event => updateRole(account.id, event.target.value)} disabled={isCurrentUser}>{roles.map(role => <option key={role}>{role}</option>)}</select></label></td>
                          <td><button type="button" className={`account-status ${account.active ? 'is-active' : 'is-inactive'}`} aria-pressed={account.active} disabled={isCurrentUser} onClick={() => toggleActive(account)}><i/>{account.active ? 'Aktif' : 'Nonaktif'}</button></td>
                          <td><button type="button" className="account-delete" aria-label={`Hapus akun ${account.name}`} title={isCurrentUser ? 'Akun yang sedang digunakan tidak dapat dihapus' : `Hapus ${account.name}`} disabled={isCurrentUser} onClick={() => removeAccount(account)}><Trash2 size={15}/></button></td>
                        </tr>
                      })}
                    </tbody>
                  </table>
                  {!visibleAccounts.length && <div className="users-empty"><Users size={22}/><b>Tidak ada pengguna ditemukan</b><span>Coba kata kunci atau filter yang berbeda.</span></div>}
                </div>
              </section>
              <p className="users-self-note">Akun yang sedang digunakan tidak dapat dinonaktifkan atau dihapus dari halaman ini.</p>
            </>
          )}
        </main>
      </div>

      {formOpen && <div className="users-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setFormOpen(false) }}>
        <section className="users-modal" role="dialog" aria-modal="true" aria-labelledby="users-modal-title">
          <div className="users-modal-head"><span className="users-modal-icon"><UserPlus size={19}/></span><button type="button" aria-label="Tutup form" onClick={() => setFormOpen(false)}><X size={18}/></button></div>
          <h2 id="users-modal-title">Tambah pengguna</h2>
          <p className="users-modal-intro">Daftarkan profil anggota tim dan tentukan akses awalnya.</p>
          <form onSubmit={registerAccount} className="users-form">
            <label>Nama lengkap<input autoFocus required maxLength={80} value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="Contoh: Maya Lestari"/></label>
            <label>Email<input required type="email" maxLength={160} autoComplete="email" value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} placeholder="nama@toko.com"/></label>
            <label>Peran dan akses<select value={form.role} onChange={event => setForm(current => ({ ...current, role: event.target.value }))}>{roles.map(role => <option key={role}>{role}</option>)}</select></label>
            <p className="users-form-note"><Mail size={14}/> Login belum dibuat pada prototipe ini. Akun nyata dan undangan akan aktif setelah autentikasi backend disambungkan.</p>
            <div className="users-form-actions"><button type="button" onClick={() => setFormOpen(false)}>Batal</button><button type="submit" className="export-button"><Plus size={15}/> Tambahkan akun demo</button></div>
          </form>
        </section>
      </div>}
      {notice && <div className="users-toast" role="status"><Check size={16}/>{notice}</div>}
    </div>
  )
}
