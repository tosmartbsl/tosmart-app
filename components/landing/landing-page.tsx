import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowRight } from 'lucide-react'
import LandingDashboardPreview from '@/components/landing/landing-dashboard-preview'
import LandingSections from '@/components/landing/landing-sections'

function Brand() {
  return (
    <Link href="/" className="tara-brand" aria-label="Tosmart beranda">
      <Image src="/tosmart-full.png" alt="Tosmart" width={150} height={58} priority />
    </Link>
  )
}

function HeroSection() {
  return (
    <section className="tara-hero" aria-labelledby="landing-title">
      <div className="tara-hero-inner">
        <div className="tara-hero-copy">
          <span className="tara-eyebrow"><i aria-hidden="true" /> SELAMAT DATANG DI TOSMART APP</span>
          <h1 id="landing-title">Belanja tanpa drama,<br /><span>transaksi tanpa ribet.</span></h1>
          <p>Karena waktu lebih baik dihabiskan untuk melayani pelanggan, bukan untuk mengurus transaksi yang rumit.</p>
          <div className="tara-hero-actions">
            <Link href="/login" className="tara-button tara-button-primary">Masuk ke akun <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link href="#fitur" className="tara-button tara-button-quiet">Kenali Tosmart <ArrowDown size={15} aria-hidden="true" /></Link>
          </div>
          <div className="tara-hero-footnote"><span className="tara-footnote-mark"><span /><span /><span /></span><span>Lebih teratur, tanpa menambah rumit harimu.</span></div>
        </div>
        <div className="tara-hero-visual"><LandingDashboardPreview /></div>
      </div>
      <div className="tara-hero-bottom" aria-label="Fitur utama Tosmart">
        <span><i aria-hidden="true" /> KASIR</span><span><i aria-hidden="true" /> PRODUK & STOK</span><span><i aria-hidden="true" /> PEMBELIAN</span><span><i aria-hidden="true" /> LAPORAN</span>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <main className="tara-landing">
      <header className="tara-header">
        <div className="tara-header-inner">
          <Brand />
          <nav className="tara-nav" aria-label="Navigasi utama">
            <Link href="#fitur">Fitur</Link>
            <Link href="#manfaat">Manfaat</Link>
            <Link href="#cara-kerja">Cara kerja</Link>
          </nav>
          <Link className="tara-header-cta" href="/login">Masuk <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      </header>
      <HeroSection />
      <LandingSections />
    </main>
  )
}
