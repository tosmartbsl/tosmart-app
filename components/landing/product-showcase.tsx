'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Coffee, Croissant, Package, ShoppingBag, Store, Wheat } from 'lucide-react'

const products = [
  { id: 'groceries', label: 'Sembako', note: 'Kebutuhan pokok', detail: 'Beras, minyak, telur, dan kebutuhan harian lainnya.', Icon: Wheat },
  { id: 'bakery', label: 'Roti', note: 'Roti & camilan', detail: 'Aneka roti dan camilan untuk teman setiap hari.', Icon: Croissant },
  { id: 'coffee', label: 'Kopi', note: 'Kopi & minuman', detail: 'Kopi, minuman dingin, dan teman santai lainnya.', Icon: Coffee },
  { id: 'essentials', label: 'Lainnya', note: 'Produk harian', detail: 'Beragam produk rumah tangga dari toko sekitar.', Icon: Package },
]

type ProductShowcaseProps = {
  variant?: 'landing' | 'auth'
}

export default function ProductShowcase({ variant = 'landing' }: ProductShowcaseProps) {
  const [activeId, setActiveId] = useState(products[0].id)
  const activeProduct = products.find((product) => product.id === activeId) ?? products[0]
  const ActiveIcon = activeProduct.Icon

  return (
    <section className={`product-showcase product-showcase-${variant}`} aria-label="Etalase kebutuhan toko harian">
      <div className="product-showcase-heading">
        <div>
          <span className="product-showcase-eyebrow">CERITA TOKO HARIAN</span>
          <h2>Semua kebutuhan, satu toko.</h2>
        </div>
        <span className="product-showcase-hint">Belanja lokal, lebih mudah</span>
      </div>

      <div className="showcase-photo">
        <Image
          src="/cashier-experience.png"
          alt="Aneka bahan pokok, roti, minuman, dan kebutuhan rumah untuk toko harian"
          fill
          loading="eager"
          sizes={variant === 'landing' ? '(max-width: 760px) 100vw, 55vw' : '(max-width: 760px) 100vw, 42vw'}
          className="showcase-product-image"
        />
        <span className="showcase-photo-shade" aria-hidden="true" />
        <span className="showcase-photo-stamp"><ShoppingBag size={14} /> Pilihan toko harian</span>
        <div className="showcase-photo-caption">
          <span className="showcase-caption-icon"><Store size={17} /></span>
          <span><small>RAPI, SIAP MELAYANI</small><strong>Temukan kebutuhan tokomu.</strong></span>
        </div>
      </div>

      <div className="product-detail-card" aria-live="polite">
        <span className="product-detail-icon"><ActiveIcon size={18} strokeWidth={1.8} /></span>
        <span className="product-detail-copy">
          <small>KATEGORI PILIHAN</small>
          <strong>{activeProduct.label}</strong>
          <span>{activeProduct.detail}</span>
        </span>
        <span className="product-detail-index">0{products.findIndex((product) => product.id === activeProduct.id) + 1}</span>
      </div>

      <div className="product-category-grid" role="group" aria-label="Pilih kategori produk">
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
