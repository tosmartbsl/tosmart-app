import {
  ArrowUpRight,
  Boxes,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  LayoutDashboard,
  Package,
  ShoppingBasket,
} from 'lucide-react'

const salesBars = [42, 64, 51, 76, 58, 87, 68, 94, 72, 82, 61, 91]

export default function LandingDashboardPreview() {
  return (
    <div className="tara-preview-wrap" aria-label="Contoh tampilan ringkasan Tosmart">
      <div className="tara-preview-orbit tara-preview-orbit-one" aria-hidden="true" />
      <div className="tara-preview-orbit tara-preview-orbit-two" aria-hidden="true" />
      <div className="tara-dashboard">
        <aside className="tara-dashboard-sidebar" aria-label="Navigasi contoh dashboard">
          <div className="tara-dashboard-brand">
            <span className="tara-dashboard-mark"><LayoutDashboard size={15} aria-hidden="true" /></span>
            <span>Tosmart</span>
          </div>
          <span className="tara-dashboard-label">MENU TOKO</span>
          <div className="tara-dashboard-nav is-current"><LayoutDashboard size={14} aria-hidden="true" /> Ringkasan</div>
          <div className="tara-dashboard-nav"><ShoppingBasket size={14} aria-hidden="true" /> Kasir POS</div>
          <div className="tara-dashboard-nav"><Boxes size={14} aria-hidden="true" /> Produk & stok</div>
          <div className="tara-dashboard-nav"><Package size={14} aria-hidden="true" /> Pembelian</div>
          <div className="tara-sidebar-store">
            <span className="tara-store-monogram">T</span>
            <span><b>Toko Harian</b><small>Operasional aktif</small></span>
          </div>
        </aside>

        <div className="tara-dashboard-content">
          <div className="tara-dashboard-topbar">
            <span>RINGKASAN TOKO</span>
            <span className="tara-dashboard-date"><CalendarDays size={12} aria-hidden="true" /> Hari ini <ChevronDown size={12} aria-hidden="true" /></span>
          </div>
          <div className="tara-dashboard-heading">
            <div><h2>Semua terlihat jelas.</h2><p>Aktivitas toko, dalam satu ringkasan.</p></div>
            <span className="tara-avatar" aria-label="Pengguna Tosmart">T</span>
          </div>

          <div className="tara-stat-grid">
            <article className="tara-stat-card">
              <span>Penjualan hari ini</span>
              <b>Rp 2.480.000</b>
              <small className="tara-stat-positive"><ArrowUpRight size={12} aria-hidden="true" /> Ringkasan penjualan</small>
            </article>
            <article className="tara-stat-card">
              <span>Transaksi</span>
              <b>42</b>
              <small>Hari ini</small>
            </article>
            <article className="tara-stat-card">
              <span>Perlu diperiksa</span>
              <b>3 produk</b>
              <small className="tara-stat-alert">Stok menipis</small>
            </article>
          </div>

          <section className="tara-chart-card" aria-label="Contoh grafik penjualan">
            <div className="tara-chart-heading"><span><b>Penjualan toko</b><small>Aktivitas selama 12 hari</small></span><span className="tara-chart-legend"><i /> Penjualan</span></div>
            <div className="tara-chart-area" aria-hidden="true">
              <div className="tara-chart-guides"><i /><i /><i /></div>
              <div className="tara-chart-bars">
                {salesBars.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
              </div>
            </div>
            <div className="tara-chart-days" aria-hidden="true"><span>01</span><span>03</span><span>05</span><span>07</span><span>09</span><span>11</span><span>12</span></div>
          </section>

          <div className="tara-stock-row">
            <span className="tara-stock-icon"><Package size={15} aria-hidden="true" /></span>
            <span className="tara-stock-copy"><b>Stok tetap terpantau</b><small>3 produk perlu dicek</small></span>
            <span className="tara-stock-status"><CircleCheck size={13} aria-hidden="true" /> Terkelola</span>
          </div>
          <span className="tara-preview-caption">CONTOH TAMPILAN TOSMART</span>
        </div>
      </div>
      <div className="tara-floating-note"><span className="tara-floating-icon"><ShoppingBasket size={17} aria-hidden="true" /></span><span><small>TRANSAKSI HARIAN</small><b>Lebih praktis, lebih rapi</b></span></div>
    </div>
  )
}
