'use client'

import Image from 'next/image'
import { useId, useState } from 'react'
import { ArrowDown, ArrowUp, PackageCheck, Receipt, Store } from 'lucide-react'

type InteractiveBrandProps = {
  variant?: 'landing' | 'auth'
}

export default function InteractiveBrand({ variant = 'landing' }: InteractiveBrandProps) {
  const [isOpen, setIsOpen] = useState(false)
  const detailsId = useId()

  return (
    <section
      id={variant === 'landing' ? 'brand-feature' : undefined}
      className={`brand-feature brand-feature-${variant}`}
      aria-label="Logo interaktif Tosmart"
    >
      <div className="brand-feature-heading">
        <span className="brand-feature-kicker">TOSMART UNTUK TOKO HARIAN</span>
        <span className="brand-feature-status"><Store size={14} aria-hidden="true" /> Siap membantu tokomu</span>
      </div>

      <button
        type="button"
        className="brand-feature-toggle"
        aria-expanded={isOpen}
        aria-controls={detailsId}
        aria-label={isOpen ? 'Tutup informasi Tosmart' : 'Buka informasi Tosmart'}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Image
          src="/tosmart-full.png"
          alt="Logo resmi Tosmart"
          width={772}
          height={290}
          priority={variant === 'landing'}
          sizes={variant === 'landing' ? '(max-width: 760px) 90vw, 48vw' : '(max-width: 760px) 88vw, 38vw'}
          className="brand-feature-logo"
        />
        <span className="brand-feature-toggle-label">
          {isOpen ? 'Sembunyikan informasi' : 'Klik logo untuk mengenal Tosmart'}
          {isOpen ? <ArrowUp size={16} aria-hidden="true" /> : <ArrowDown size={16} aria-hidden="true" />}
        </span>
      </button>

      <div id={detailsId} className="brand-feature-details" hidden={!isOpen}>
        <p>Kelola aktivitas toko lebih praktis, agar waktumu bisa fokus melayani pelanggan.</p>
        <ul aria-label="Fitur Tosmart">
          <li><Receipt size={15} aria-hidden="true" /> Kasir</li>
          <li><PackageCheck size={15} aria-hidden="true" /> Produk & stok</li>
          <li><Store size={15} aria-hidden="true" /> Operasional toko</li>
        </ul>
      </div>
    </section>
  )
}
