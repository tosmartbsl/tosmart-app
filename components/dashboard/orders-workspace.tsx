'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, Coffee, Package, Search } from 'lucide-react'
import { AppSidebar, Topbar } from './dashboard-shell'
import { TOSCO_CATEGORY, ensureToscoProducts } from '@/lib/tosco'

type User = { name: string; email: string; role: string }
type Product = { id: number; name: string; sku: string; category: string }
type SaleItem = { id: number; name: string; sku: string; quantity: number; price: number; category?: string }
type Sale = { invoice: string; date: string; total: number; payment: string; status?: string; orderStatus?: 'waiting' | 'ready'; customer?: string; cashier?: string; items?: SaleItem[] }
type OrderRow = { sale: Sale; toscoItems: SaleItem[]; otherItems: SaleItem[]; toscoTotal: number; toscoQty: number }

const currency = (value: number) => `Rp ${value.toLocaleString('id-ID')}`
const read = <T,>(key: string, fallback: T): T => { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback } catch { return fallback } }
const formatDate = (iso: string) => new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
const formatTime = (iso: string) => `${new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
const dateRanges = ['Semua waktu', 'Hari ini', '7 hari terakhir', 'Bulan ini']
const paymentMethods = ['Semua metode', 'Tunai', 'QRIS', 'Debit']

// Kategori item diambil dari data transaksi terbaru; transaksi lama dicocokkan ke katalog produk.
function resolveCategory(item: SaleItem, products: Product[]): string {
  if (item.category) return item.category
  const byId = products.find(product => product.id === item.id)
  if (byId) return byId.category
  const bySku = products.find(product => item.sku && product.sku === item.sku)
  if (bySku) return bySku.category
  const byName = products.find(product => product.name === item.name)
  if (byName) return byName.category
  return ''
}

export default function OrdersWorkspace() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [dateRange, setDateRange] = useState(dateRanges[0])
  const [payment, setPayment] = useState(paymentMethods[0])
  const [notice, setNotice] = useState('')
  useEffect(() => {
    const raw = localStorage.getItem('tosmart-session')
    if (raw) { try { setUser(JSON.parse(raw) as User) } catch { localStorage.removeItem('tosmart-session') } }
    setProducts(ensureToscoProducts(read<{ id: number; name: string; sku: string; category: string }[]>('tosmart-products', [])))
    setSales(read<Sale[]>('tosmart-sales', []))
    setReady(true)
  }, [])
  useEffect(() => { if (ready) localStorage.setItem('tosmart-sales', JSON.stringify(sales)) }, [sales, ready])
  useEffect(() => { if (ready && !user) router.replace('/login') }, [ready, user, router])
  const tell = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2800) }
  const markOrderReady = (invoice: string) => {
    setSales(current => current.map(sale => sale.invoice === invoice ? { ...sale, orderStatus: 'ready' } : sale))
    tell('Pesanan ditandai siap diambil.')
  }
  const rows = useMemo<OrderRow[]>(() => sales.flatMap(sale => {
    const items = sale.items || []
    const toscoItems = items.filter(item => resolveCategory(item, products) === TOSCO_CATEGORY)
    if (!toscoItems.length) return []
    const otherItems = items.filter(item => !toscoItems.includes(item))
    return [{
      sale,
      toscoItems,
      otherItems,
      toscoTotal: toscoItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      toscoQty: toscoItems.reduce((sum, item) => sum + item.quantity, 0),
    }]
  }), [sales, products])
  const visible = useMemo(() => rows.filter(row => {
    const sale = row.sale
    const haystack = `${sale.invoice} ${sale.customer || ''}`.toLowerCase()
    if (query && !haystack.includes(query.toLowerCase())) return false
    if (payment !== paymentMethods[0] && sale.payment !== payment) return false
    if (dateRange === dateRanges[0]) return true
    const created = new Date(sale.date)
    const now = new Date()
    if (dateRange === 'Hari ini') return created.toDateString() === now.toDateString()
    if (dateRange === '7 hari terakhir') return now.getTime() - created.getTime() >= 0 && now.getTime() - created.getTime() <= 7 * 86400000
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
  }), [rows, query, payment, dateRange])
  const totalCups = visible.reduce((sum, row) => sum + row.toscoQty, 0)
  const totalRevenue = visible.reduce((sum, row) => sum + row.toscoTotal, 0)
  if (!ready || !user) return <div className="app-loading">Menyiapkan Tosmart…</div>
  return <div className="dashboard-app"><AppSidebar open={menuOpen} onClose={() => setMenuOpen(false)} user={user}/><div className="app-main"><Topbar user={user} onMenu={() => setMenuOpen(true)}/><main className="dashboard-content phase-content">
    <div className="dashboard-heading phase-heading"><div><div className="breadcrumb"><Link href="/dashboard">OPERASIONAL TOKO</Link><span>›</span><span>DAFTAR PESANAN</span></div><h1>Daftar Pesanan Kopi Tosco</h1><p>Pantau pesanan kopi yang sudah dibayar dan tandai siap saat selesai dibuat.</p></div></div>
    <section className="product-summary orders-summary" aria-label="Ringkasan pesanan Tosco">
      <div data-testid="orders-metric-tosco-count"><span>Total pesanan Tosco</span><b>{visible.length}</b><small>Transaksi memuat kopi</small></div>
      <div data-testid="orders-metric-tosco-cups"><span>Cup kopi terjual</span><b>{totalCups}</b><small>Total porsi minuman kopi</small></div>
      <div data-testid="orders-metric-tosco-revenue"><span>Omzet kopi Tosco</span><b>{currency(totalRevenue)}</b><small>Subtotal khusus produk Tosco</small></div>
    </section>
    <div className="panel product-table-panel orders-panel">
      <div className="product-toolbar orders-toolbar">
        <label className="product-search"><Search size={16}/><input data-testid="orders-search-input" aria-label="Cari pesanan" placeholder="Cari no. invoice atau pelanggan…" value={query} onChange={event => setQuery(event.target.value)}/></label>
        <select data-testid="orders-filter-date" aria-label="Filter waktu transaksi" value={dateRange} onChange={event => setDateRange(event.target.value)}>{dateRanges.map(option => <option key={option}>{option}</option>)}</select>
        <select data-testid="orders-filter-payment" aria-label="Filter metode pembayaran" value={payment} onChange={event => setPayment(event.target.value)}>{paymentMethods.map(option => <option key={option}>{option}</option>)}</select>
        {(query || dateRange !== dateRanges[0] || payment !== paymentMethods[0]) && <button className="orders-reset" onClick={() => { setQuery(''); setDateRange(dateRanges[0]); setPayment(paymentMethods[0]) }}>Atur ulang</button>}
      </div>
      {visible.length ? <>
        <div className="table-scroll"><table className="product-table orders-table" data-testid="orders-tosco-table">
          <thead><tr><th scope="col">NO. INVOICE</th><th scope="col">WAKTU</th><th scope="col">PELANGGAN</th><th scope="col">ITEM PESANAN</th><th scope="col">TOTAL TRANSAKSI</th><th scope="col">OMZET TOSCO</th><th scope="col">STATUS</th></tr></thead>
          <tbody>{visible.map(row => <tr key={row.sale.invoice} data-testid={`orders-row-${row.sale.invoice}`}>
            <td><b>{row.sale.invoice}</b><br/><small data-testid="order-payment-method">{row.sale.payment}</small></td>
            <td>{formatDate(row.sale.date)}<br/><small>{formatTime(row.sale.date)}</small></td>
            <td>{row.sale.customer || 'Pelanggan umum'}</td>
            <td><div className="order-items">{row.toscoItems.map(item => <span key={`tosco-${item.id}-${item.sku}`} className="coffee-badge" data-testid="order-coffee-badge"><Coffee size={12}/>{item.name} × {item.quantity}</span>)}{row.otherItems.map(item => <span key={`other-${item.id}-${item.sku}`} className="muted-item-tag"><Package size={11}/>{item.name} × {item.quantity}</span>)}</div></td>
            <td><b>{currency(row.sale.total)}</b></td>
            <td><b className="tosco-amount">{currency(row.toscoTotal)}</b><br/><small>{row.toscoQty} cup kopi</small></td>
            <td><div className="order-status-cell"><span data-testid={`orders-status-${row.sale.invoice}`} className={`order-status-badge ${row.sale.orderStatus === 'waiting' ? 'is-waiting' : 'is-ready'}`}>{row.sale.orderStatus === 'waiting' ? 'Dalam pembuatan' : row.sale.orderStatus === 'ready' ? 'Siap diambil' : row.sale.status || 'Selesai'}</span>{row.sale.orderStatus === 'waiting' && <button type="button" className="order-ready-button" data-testid={`orders-ready-${row.sale.invoice}`} aria-label={`Tandai pesanan ${row.sale.invoice} siap diambil`} onClick={() => markOrderReady(row.sale.invoice)}><Check size={13}/>Tandai siap</button>}</div></td>
          </tr>)}</tbody>
        </table></div>
        <div className="table-bottom">Menampilkan {visible.length} pesanan kategori Tosco <span>Item non-kopi tetap ditampilkan sebagai bagian transaksi</span></div>
      </> : <div className="orders-empty" data-testid="orders-empty-state"><span className="orders-empty-icon"><Coffee size={26}/></span><b>Belum ada transaksi kopi Tosco</b><p>Transaksi kasir POS yang memesan menu kategori Tosco akan otomatis tercatat dan tersaring di halaman ini.</p><Link href="/pos" className="export-button" data-testid="orders-empty-pos-button" onClick={() => tell('Pilih menu kopi di katalog Kasir POS lalu selesaikan pembayaran.')}>Buat pesanan kopi di POS</Link></div>}
    </div>
    {notice && <div className="phase-toast" role="status"><Check size={16}/>{notice}</div>}
  </main></div></div>
}
