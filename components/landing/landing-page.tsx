import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductShowcase from '@/components/landing/product-showcase'

function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Tosmart beranda">
      <Image src="/tosmart-full.png" alt="Tosmart" width={154} height={58} className="brand-logo" priority />
    </Link>
  )
}

export default function LandingPage() {
  return (
    <main className="landing landing-simplified">
      <header className="site-header">
        <div className="site-header-inner">
          <Brand />
          <div className="header-actions">
            <Link className="login-link" href="/login">Masuk</Link>
            <Link className="button button-green header-cta" href="/register">
              Mulai sekarang <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>
      <section className="hero-section" aria-labelledby="landing-title">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="section-kicker">TEMAN TOKO HARIANMU</span>
            <h1 id="landing-title">Semua urusan toko,<br /><span>jadi lebih tertata.</span></h1>
            <p className="hero-description">
              Dari transaksi kasir sampai kelola produk, Tosmart bantu operasional toko harian terasa lebih sederhana.
            </p>
            <div className="hero-buttons">
              <Link href="/register" className="button button-green button-large">
                Mulai gratis <ArrowRight size={17} />
              </Link>
              <Link href="/login" className="button button-outline button-large">Masuk ke akun</Link>
            </div>
          </div>
          <div className="hero-visual">
            <ProductShowcase />
          </div>
        </div>
      </section>
    </main>
  )
}
