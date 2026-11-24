'use client'

import { useState } from 'react'
import { ArrowUpRight, Check, Coffee, Croissant, Package, ShoppingBag, Store, Wheat } from 'lucide-react'

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
        <span className="product-showcase-hint">Pilih kategori di bawah</span>
      </div>

      <div className="showcase-stage" aria-label="Ilustrasi dashboard toko Tosmart">
        <span className="showcase-orbit showcase-orbit-one" aria-hidden="true" />
        <span className="showcase-orbit showcase-orbit-two" aria-hidden="true" />
        <div className="showcase-topline">
          <span className="showcase-store-icon"><Store size={16} /></span>
          <span><strong>Toko Utama</strong><small>Ringkasan hari ini</small></span>
          <span className="showcase-live"><i /> AKTIF</span>
        </div>
        <div className="showcase-receipt">
          <div className="showcase-receipt-heading"><span>RINGKASAN PENJUALAN</span><small>HARI INI</small></div>
          <div className="showcase-receipt-total"><strong>Rp 4.870.000</strong><span><ArrowUpRight size={13} /> 12,8%</span></div>
          <div className="showcase-chart" aria-hidden="true">
            {[34, 52, 41, 70, 55, 85, 63, 92].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
          </div>
          <span className="showcase-receipt-note"><Check size={12} /> 248 transaksi tercatat</span>
        </div>
        <div className="showcase-float showcase-float-category">
          <span className="showcase-float-icon"><ActiveIcon size={16} /></span>
          <span><small>KATEGORI PILIHAN</small><strong>{activeProduct.label}</strong></span>
        </div>
        <div className="showcase-float showcase-float-stock">
          <span className="showcase-float-icon"><Package size={16} /></span>
          <span><small>STOK TERSEDIA</small><strong>124 produk</strong></span>
          <span className="showcase-stock-dot" />
        </div>
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
