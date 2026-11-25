'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import InteractiveBrand from '@/components/landing/interactive-brand'

type AuthMode = 'login' | 'forgot' | 'reset'
const DEMO_ACCOUNTS = [
  { email: 'admin@retailpos.com', password: 'admin123', name: 'Andi Saputra', role: 'Administrator' },
  { email: 'cashier@retailpos.com', password: 'cashier123', name: 'Rina Putri', role: 'Kasir' },
]
const copy: Record<AuthMode, { eyebrow: string; title: string; description: string; button: string }> = {
  login: { eyebrow: 'SELAMAT DATANG KEMBALI', title: 'Masuk ke Tosmart', description: 'Kelola tokomu lebih mudah, mulai dari sini.', button: 'Masuk ke dashboard' },
  forgot: { eyebrow: 'BANTUAN AKUN', title: 'Lupa kata sandi?', description: 'Masukkan email akunmu dan kami akan bantu langkah berikutnya.', button: 'Kirim instruksi' },
  reset: { eyebrow: 'PENGATURAN AKUN', title: 'Atur kata sandi baru', description: 'Pilih kata sandi baru untuk mengamankan akun Tosmart-mu.', button: 'Simpan kata sandi' },
}

function PromoPanel() {
  return (
    <aside className="auth-promo">
      <InteractiveBrand variant="auth" />
      <div className="promo-foot">
        <span><ShieldCheck size={15} /> Dirancang untuk ritel Indonesia</span>
        <span>© Tosmart 2026</span>
      </div>
    </aside>
  )
}

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [email, setEmail] = useState(mode === 'login' ? 'admin@retailpos.com' : '')
  const [password, setPassword] = useState(mode === 'login' ? 'admin123' : '')
  const info = copy[mode]
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setNotice('')
    if (mode === 'login') {
      const account = DEMO_ACCOUNTS.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password)
      if (!account) { setError('Email atau kata sandi tidak sesuai. Gunakan akun demo yang tersedia di bawah.'); return }
      setLoading(true)
      window.setTimeout(() => { window.localStorage.setItem('tosmart-session', JSON.stringify({ name: account.name, email: account.email, role: account.role })); router.push('/dashboard') }, 450)
      return
    }
    if (mode === 'forgot') { setNotice('Jika email terdaftar, instruksi pemulihan akan dikirim. Fitur email tersedia setelah backend terhubung.'); return }
    if (password.length < 8) { setError('Kata sandi minimal 8 karakter.'); return }
    setNotice('Reset kata sandi belum terhubung pada fase demo ini. Silakan kembali ke halaman masuk untuk memakai akun demo.')
  }
  return <main className="auth-layout"><PromoPanel/><section className="auth-content"><div className="auth-mobile-brand"><InteractiveBrand variant="auth"/></div><div className="auth-form-wrap"><Link className="auth-back" href="/"><ArrowLeft size={15}/> Kembali ke beranda</Link><span className="auth-eyebrow">{info.eyebrow}</span><h1>{info.title}</h1><p className="auth-intro">{info.description}</p>
    <form onSubmit={submit} className="auth-form">
      <label>Alamat email<div className="auth-input"><Mail size={17}/><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="nama@toko.com" required autoComplete="email"/></div></label>
      {(mode === 'login' || mode === 'reset') && <label>Kata sandi{mode === 'login' && <Link href="/forgot-password">Lupa kata sandi?</Link>}<div className="auth-input"><LockKeyhole size={17}/><input type={showPassword?'text':'password'} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder={mode==='login'?'Masukkan kata sandi':'Minimal 8 karakter'} required minLength={mode==='login'?1:8} autoComplete={mode==='login'?'current-password':'new-password'}/><button type="button" className="password-toggle" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword?'Sembunyikan kata sandi':'Tampilkan kata sandi'}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>}
      {mode === 'login' && <label className="remember-row"><input type="checkbox" defaultChecked/> <span>Ingat saya di perangkat ini</span></label>}
      {error && <p className="auth-error" role="alert">{error}</p>}{notice && <p className="auth-notice" role="status">{notice}</p>}
      <button className="button button-green auth-submit" type="submit" disabled={loading}>{loading?'Memeriksa akun…':info.button}<ArrowRight size={16}/></button>
    </form>
    {mode === 'login' && <div className="demo-box"><div className="demo-box-title"><span><Sparkles size={14}/> AKUN DEMO SIAP PAKAI</span><span className="demo-badge">Frontend demo</span></div><button type="button" className="demo-account" onClick={()=>{setEmail('admin@retailpos.com');setPassword('admin123')}}><span className="demo-role"><b>Admin</b><small>Kelola dashboard</small></span><span>admin@retailpos.com <b>·</b> admin123</span></button><button type="button" className="demo-account" onClick={()=>{setEmail('cashier@retailpos.com');setPassword('cashier123')}}><span className="demo-role"><b>Kasir</b><small>Akses kasir</small></span><span>cashier@retailpos.com <b>·</b> cashier123</span></button><p>Mode simulasi untuk fase frontend — belum terhubung ke layanan autentikasi produksi.</p></div>}
      {mode === 'login' && <p className="auth-switch">Akun Tosmart dibuat dan diberikan oleh administrator toko.</p>}
    {mode==='forgot' && <Link href="/login" className="auth-secondary-link">Kembali ke halaman masuk</Link>}{mode==='reset' && <Link href="/login" className="auth-secondary-link">Kembali ke halaman masuk</Link>}
    <p className="auth-legal">Dengan melanjutkan, kamu menyetujui <a href="#ketentuan">Ketentuan Layanan</a> dan <a href="#privasi">Kebijakan Privasi</a> Tosmart.</p>
  </div><div className="auth-mobile-foot"><span><ShieldCheck size={14}/> Dibuat untuk ritel Indonesia</span><span>© Tosmart 2026</span></div></section></main>
}
