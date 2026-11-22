'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Coffee, Croissant, Package, Wheat } from 'lucide-react'

const products = [
  {
    id: 'groceries',
    label: 'Sembako',
    note: 'Kebutuhan pokok',
    detail: 'Beras, minyak, telur, dan kebutuhan harian lainnya.',
    Icon: Wheat,
  },
  {
    id: 'bakery',
    label: 'Roti',
    note: 'Roti & camilan',
    detail: 'Aneka roti dan camilan untuk teman setiap hari.',
    Icon: Croissant,
  },
  {
    id: 'coffee',
    label: 'Kopi',
    note: 'Kopi & minuman',
    detail: 'Kopi, minuman dingin, dan teman santai lainnya.',
    Icon: Coffee,
  },
  {
    id: 'essentials',
    label: 'Lainnya',
    note: 'Produk harian',
    detail: 'Beragam produk rumah tangga dari toko sekitar.',
    Icon: Package,
  },
]

type ProductShowcaseProps = {
  variant?: 'landing' | 'auth'
}

export default function ProductShowcase({ variant = 'landing' }: ProductShowcaseProps) {
  const [activeId, setActiveId] = useState(products[0].id)
  const activeProduct = products.find((product) => product.id === activeId) ?? products[0]
  const ActiveIcon = activeProduct.Icon

  return (
    <section className={`product-showcase product-showcase-${variant}`} aria-label="Jelajahi kategori produk toko">
      <div className="product-showcase-heading">
        <div>
          <span className="product-showcase-eyebrow">ETALASE TOKO HARIAN</span>
          <h2>Pilih yang kamu cari</h2>
        </div>
        <span className="product-showcase-hint">Sentuh kartu untuk melihat</span>
      </div>

      <div className="product-showcase-photo">
        <Image
          src="/cashier-experience.png"
          alt="Aneka sembako, roti, kopi, minuman, dan kebutuhan toko"
          fill
          priority={variant === 'landing'}
          sizes={variant === 'landing' ? '(max-width: 760px) 100vw, 52vw' : '(max-width: 760px) 100vw, 50vw'}
          className="product-showcase-image"
        />
        <div className="product-showcase-photo-shade" />
        <span className="product-showcase-photo-label">Kebutuhan sehari-hari, semua ada</span>
        <div key={activeProduct.id} className="product-detail-card" aria-live="polite">
          <span className="product-detail-icon"><ActiveIcon size={18} strokeWidth={1.8} /></span>
          <span className="product-detail-copy">
            <small>KATEGORI PILIHAN</small>
            <strong>{activeProduct.label}</strong>
            <span>{activeProduct.detail}</span>
          </span>
          <span className="product-detail-index">0{products.findIndex((product) => product.id === activeProduct.id) + 1}</span>
        </div>
      </div>

      <div key={`mobile-${activeProduct.id}`} className="product-mobile-detail" aria-live="polite">
        <span className="product-detail-icon"><ActiveIcon size={17} strokeWidth={1.8} /></span>
        <span className="product-detail-copy">
          <small>KATEGORI PILIHAN</small>
          <strong>{activeProduct.label}</strong>
          <span>{activeProduct.detail}</span>
        </span>
      </div>

      <div className="product-category-grid" role="group" aria-label="Kategori produk">
        {products.map(({ id, label, note, Icon }) => (
          <button
            key={id}
            type="button"
            className={`product-category-card${activeId === id ? ' is-active' : ''}`}
            aria-pressed={activeId === id}
            onClick={() => setActiveId(id)}
          >
            <span className="product-category-icon"><Icon size={18} strokeWidth={1.8} /></span>
            <span className="product-category-copy"><strong>{label}</strong><small>{note}</small></span>
            <span className="product-category-indicator" aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  )
}
