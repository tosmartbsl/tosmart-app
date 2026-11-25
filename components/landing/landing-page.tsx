import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import InteractiveBrand from '@/components/landing/interactive-brand'

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
            <Link className="button button-green header-cta" href="/login">
              Masuk <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>
      <section className="hero-section" aria-labelledby="landing-title">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="section-kicker">SELAMAT DATANG DI TOSMART APP</span>
            <h1 id="landing-title">Belanja tanpa drama,<br /><span>transaksi tanpa ribet.</span></h1>
            <p className="hero-description">
              Karena waktu lebih baik dihabiskan untuk melayani pelanggan, bukan untuk mengurus transaksi yang rumit.
            </p>
            <div className="hero-buttons">
              <Link href="/login" className="button button-green button-large">
                Masuk ke akun <ArrowRight size={17} />
              </Link>
              <Link href="#brand-feature" className="button button-outline button-large">Kenali Tosmart</Link>
            </div>
          </div>
          <div className="hero-visual">
            <InteractiveBrand variant="landing" />
          </div>
        </div>
      </section>
    </main>
  )
}
