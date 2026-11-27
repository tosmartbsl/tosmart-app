'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Activity, ArrowDown, ArrowLeftRight, ArrowUp, Check, ChevronRight, CircleDollarSign, ClipboardList, Download, FileText, Package, Plus, Search, ShieldAlert, ShoppingCart, Truck, X } from 'lucide-react'
import { AppSidebar, Topbar } from './dashboard-shell'
import { ensureToscoProducts } from '@/lib/tosco'

type User = { name: string; email: string; role: string }
type Product = { id: number; name: string; sku: string; category: string; price: number; cost: number; stock: number; min: number; status: boolean; unit: string }
type SaleItem = { id: number; name: string; sku: string; quantity: number; price: number; category?: string }
type Sale = { invoice: string; date: string; total: number; payment: string; status?: string; customer?: string; cashier?: string; items?: SaleItem[] }
type Purchase = { id: string; supplier: string; date: string; total: number; status: 'Draft' | 'Pending' | 'Approved' | 'Ordered' | 'Partially Received' | 'Received' | 'Cancelled'; items: { productId: number; name: string; quantity: number; received: number; price: number; purchaseUnit?: string; conversionFactor?: number; sellingPrice?: number }[] }
type Movement = { id: string; date: string; product: string; sku: string; kind: string; quantity: number; reason: string; warehouse: string }
const initialProducts: Product[] = [
  { id: 1, name: 'Beras Premium 5 kg', sku: 'BRG-001', category: 'Sembako', price: 78500, cost: 65000, stock: 42, min: 10, status: true, unit: 'Karung' },
  { id: 2, name: 'Minyak Goreng 2 L', sku: 'BRG-014', category: 'Sembako', price: 36800, cost: 31500, stock: 8, min: 12, status: true, unit: 'Botol' },
  { id: 3, name: 'Gula Pasir 1 kg', sku: 'BRG-006', category: 'Sembako', price: 16800, cost: 14200, stock: 36, min: 10, status: true, unit: 'Pack' },
  { id: 4, name: 'Susu UHT Full Cream', sku: 'BRG-032', category: 'Minuman', price: 18500, cost: 14800, stock: 27, min: 8, status: true, unit: 'Kotak' },
  { id: 5, name: 'Telur Ayam 1 kg', sku: 'BRG-008', category: 'Produk segar', price: 29500, cost: 25000, stock: 19, min: 8, status: true, unit: 'Tray' },
  { id: 6, name: 'Air Mineral 600 ml', sku: 'MIN-011', category: 'Minuman', price: 4500, cost: 2800, stock: 64, min: 18, status: true, unit: 'Botol' },
  { id: 7, name: 'Roti Tawar Gandum', sku: 'ROT-003', category: 'Roti & bakery', price: 19800, cost: 15500, stock: 12, min: 6, status: true, unit: 'Pack' },
  { id: 8, name: 'Pisang Cavendish 1 sisir', sku: 'BUA-016', category: 'Produk segar', price: 22900, cost: 17200, stock: 15, min: 5, status: true, unit: 'Sisir' },
]
const rupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`
const read = <T,>(key: string, fallback: T): T => { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback } catch { return fallback } }
const write = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value))
const labelMap: Record<string, string> = { '/inventory': 'Inventori', '/sales': 'Penjualan', '/purchases': 'Pembelian' }
const links = [{ href: '/inventory', label: 'Produk & inventori', icon: Package }, { href: '/inventory/adjustments', label: 'Penyesuaian stok', icon: ArrowLeftRight }, { href: '/inventory/low-stock', label: 'Stok menipis', icon: ShieldAlert }, { href: '/sales', label: 'Riwayat penjualan', icon: CircleDollarSign }, { href: '/sales/returns', label: 'Retur penjualan', icon: ArrowDown }, { href: '/sales/invoices', label: 'Faktur', icon: FileText }, { href: '/purchases', label: 'Pesanan pembelian', icon: ShoppingCart }, { href: '/purchases/suppliers', label: 'Pemasok', icon: Truck }]

export default function PhaseThreeWorkspace() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [sales, setSales] = useState<Sale[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [dialog, setDialog] = useState<'adjust' | 'transfer' | 'purchase' | 'return' | 'receive' | null>(null)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [form, setForm] = useState({ productId: '', type: 'Tambah stok', quantity: '', reason: '', supplier: '', purchaseUnit: 'Pcs', conversionFactor: '1', purchasePrice: '', sellingPrice: '', warehouse: 'Gudang Utama', sourceWarehouse: 'Gudang Utama', destinationWarehouse: 'Gudang Belakang' })
  const section = pathname.startsWith('/sales') ? 'sales' : pathname.startsWith('/purchases') ? 'purchases' : 'inventory'
  const subpage = pathname.split('/')[2] || ''
  const title = section === 'inventory' ? 'Inventori' : section === 'sales' ? 'Penjualan' : 'Pembelian'

  useEffect(() => {
    const raw = localStorage.getItem('tosmart-session')
    if (raw) { try { setUser(JSON.parse(raw) as User) } catch { localStorage.removeItem('tosmart-session') } }
    setProducts(ensureToscoProducts(read('tosmart-products', initialProducts)))
    setSales(read<Sale[]>('tosmart-sales', []))
    setPurchases(read<Purchase[]>('tosmart-purchases', []))
    setMovements(read<Movement[]>('tosmart-stock-movements', []))
    setReady(true)
  }, [])
  useEffect(() => { if (ready && !user) router.replace('/login') }, [ready, user, router])
  useEffect(() => { if (ready) write('tosmart-products', products) }, [products, ready])
  useEffect(() => { if (ready) write('tosmart-sales', sales) }, [sales, ready])
  useEffect(() => { if (ready) write('tosmart-purchases', purchases) }, [purchases, ready])
  useEffect(() => { if (ready) write('tosmart-stock-movements', movements) }, [movements, ready])
  const visibleProducts = useMemo(() => products.filter(product => `${product.name} ${product.sku}`.toLowerCase().includes(query.toLowerCase())), [products, query])
  const tell = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 3000) }
  const openDialog = (name: typeof dialog) => { const product = products[0]; setForm({ productId: String(product?.id || ''), type: 'Tambah stok', quantity: '', reason: '', supplier: '', purchaseUnit: product?.unit || 'Pcs', conversionFactor: '1', purchasePrice: product ? String(product.cost) : '', sellingPrice: '', warehouse: 'Gudang Utama', sourceWarehouse: 'Gudang Utama', destinationWarehouse: 'Gudang Belakang' }); setDialog(name) }
  const saveMovement = (event: React.FormEvent) => {
    event.preventDefault()
    const product = products.find(item => item.id === Number(form.productId))
    const amount = Number(form.quantity)
    if (!product || !Number.isInteger(amount) || amount <= 0) { tell('Pilih produk dan masukkan jumlah bilangan bulat di atas 0.'); return }
    const isTransfer = dialog === 'transfer'
    const delta = isTransfer ? 0 : form.type === 'Tambah stok' ? amount : form.type === 'Kurangi stok' ? -amount : amount - product.stock
    if (isTransfer && form.sourceWarehouse === form.destinationWarehouse) { tell('Gudang asal dan tujuan harus berbeda.'); return }
    if ((isTransfer && product.stock < amount) || product.stock + delta < 0) { tell('Stok tidak mencukupi untuk penyesuaian ini.'); return }
    if (delta) setProducts(current => current.map(item => item.id === product.id ? { ...item, stock: item.stock + delta } : item))
    const timestamp = Date.now()
    const date = new Date().toISOString()
    const movementRows: Movement[] = isTransfer ? [
      { id: `MOV-${timestamp}-out`, date, product: product.name, sku: product.sku, kind: 'Transfer keluar', quantity: -amount, reason: `${form.sourceWarehouse} → ${form.destinationWarehouse}`, warehouse: form.sourceWarehouse },
      { id: `MOV-${timestamp}-in`, date, product: product.name, sku: product.sku, kind: 'Transfer masuk', quantity: amount, reason: `${form.sourceWarehouse} → ${form.destinationWarehouse}`, warehouse: form.destinationWarehouse },
    ] : [{ id: `MOV-${timestamp}`, date, product: product.name, sku: product.sku, kind: form.type, quantity: delta, reason: form.reason.trim() || 'Penyesuaian stok', warehouse: form.warehouse }]
    setMovements(current => [...movementRows, ...current])
    setDialog(null); tell(isTransfer ? 'Transfer stok berhasil dicatat untuk kedua gudang.' : 'Penyesuaian stok tersimpan dan saldo inventori diperbarui.')
  }
  const createPurchase = (event: React.FormEvent) => {
    event.preventDefault()
    const product = products.find(item => item.id === Number(form.productId))
    const quantity = Number(form.quantity)
    const conversionFactor = Number(form.conversionFactor)
    const purchasePrice = Number(form.purchasePrice)
    const sellingPrice = form.sellingPrice.trim() ? Number(form.sellingPrice) : undefined
    if (!product || !form.supplier.trim() || !Number.isInteger(quantity) || quantity <= 0 || !Number.isInteger(conversionFactor) || conversionFactor <= 0 || !Number.isFinite(purchasePrice) || purchasePrice <= 0 || (sellingPrice !== undefined && (!Number.isFinite(sellingPrice) || sellingPrice <= 0))) { tell('Lengkapi vendor, produk, satuan, jumlah, dan harga pembelian dengan benar.'); return }
    const purchase: Purchase = { id: `PO-${new Date().toISOString().slice(0,10).replaceAll('-', '')}-${String(purchases.length + 1).padStart(3, '0')}`, supplier: form.supplier.trim(), date: new Date().toISOString(), total: purchasePrice * quantity, status: 'Pending', items: [{ productId: product.id, name: product.name, quantity, received: 0, price: purchasePrice, purchaseUnit: form.purchaseUnit.trim() || product.unit, conversionFactor, sellingPrice }] }
    setPurchases(current => [purchase, ...current]); setDialog(null); tell('Pesanan pembelian dibuat. Stok diperbarui setelah barang diterima.')
  }
  const approvePurchase = (purchase: Purchase) => {
    setPurchases(current => current.map(item => item.id === purchase.id ? { ...item, status: 'Approved' } : item))
    tell(`Pesanan ${purchase.id} disetujui. Stok bertambah setelah barang diterima.`)
  }
  const openReceive = (purchase: Purchase) => {
    const line = purchase.items[0]
    const remaining = line ? line.quantity - line.received : 0
    setSelectedPurchase(purchase)
    setForm(current => ({ ...current, productId: String(line?.productId || ''), quantity: String(remaining), purchaseUnit: line?.purchaseUnit || products.find(product => product.id === line?.productId)?.unit || 'unit', conversionFactor: String(line?.conversionFactor || 1), purchasePrice: String(line?.price || 0), sellingPrice: line?.sellingPrice ? String(line.sellingPrice) : '' }))
    setDialog('receive')
  }
  const processReceive = (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedPurchase) return
    const line = selectedPurchase.items.find(item => item.productId === Number(form.productId))
    const quantity = Number(form.quantity)
    const remaining = line ? line.quantity - line.received : 0
    if (!line || !Number.isInteger(quantity) || quantity <= 0 || quantity > remaining) { tell(`Jumlah penerimaan harus antara 1 dan ${remaining} ${line?.purchaseUnit || 'satuan'}.`); return }
    const product = products.find(item => item.id === line.productId)
    if (!product) { tell('Produk tidak ditemukan di inventori.'); return }
    const conversionFactor = Math.max(1, Number(line.conversionFactor) || 1)
    const stockQuantity = quantity * conversionFactor
    const updatedItems = selectedPurchase.items.map(item => item.productId === line.productId ? { ...item, received: item.received + quantity } : item)
    const complete = updatedItems.every(item => item.received >= item.quantity)
    setProducts(current => current.map(item => {
      if (item.id !== line.productId) return item
      const nextStock = item.stock + stockQuantity
      const unitCost = line.price / conversionFactor
      const nextCost = nextStock > 0 ? (item.stock * item.cost + stockQuantity * unitCost) / nextStock : unitCost
      return { ...item, stock: nextStock, cost: Math.round(nextCost), price: line.sellingPrice && line.sellingPrice > 0 ? line.sellingPrice : item.price, status: true }
    }))
    setMovements(current => [{ id: `MOV-${Date.now()}-${line.productId}`, date: new Date().toISOString(), product: line.name, sku: product.sku, kind: 'Penerimaan pembelian', quantity: stockQuantity, reason: `${selectedPurchase.id} · ${quantity} ${line.purchaseUnit || product.unit}`, warehouse: form.warehouse }, ...current])
    setPurchases(current => current.map(item => item.id === selectedPurchase.id ? { ...item, items: updatedItems, status: complete ? 'Received' : 'Partially Received' } : item))
    setDialog(null); setSelectedPurchase(null); tell(`${stockQuantity} ${product.unit} diterima. Stok, HPP, dan status produk diperbarui${complete ? '.' : '; sisa pesanan masih menunggu.'}`)
  }
  const returnSale = (sale: Sale) => {
    if (!sale.items?.length) { tell('Detail item transaksi lama tidak tersedia, jadi stok tidak diubah. Transaksi POS baru sudah menyertakan detail untuk retur.'); return }
    setProducts(current => current.map(product => { const line = sale.items?.find(item => item.id === product.id); return line ? { ...product, stock: product.stock + line.quantity } : product }))
    setMovements(current => [...(sale.items || []).map(item => ({ id: `RET-${Date.now()}-${item.id}`, date: new Date().toISOString(), product: item.name, sku: item.sku, kind: 'Retur penjualan', quantity: item.quantity, reason: sale.invoice, warehouse: 'Gudang Utama' })), ...current])
    setSales(current => current.map(item => item.invoice === sale.invoice ? { ...item, status: 'Diretur' } : item))
    setDialog(null); setSelectedSale(null); tell('Retur diproses. Stok produk yang dikembalikan sudah bertambah.')
  }

  if (!ready || !user) return <div className="app-loading">Menyiapkan Tosmart…</div>
  const lowStock = products.filter(item => item.stock <= item.min)
  const inventoryValue = products.reduce((sum, item) => sum + item.cost * item.stock, 0)
  const isInventory = section === 'inventory'
  const isSales = section === 'sales'
  const isPurchases = section === 'purchases'
  const pageHeading = subpage === 'adjustments' ? 'Penyesuaian stok' : subpage === 'transfers' ? 'Transfer stok' : subpage === 'low-stock' ? 'Stok menipis' : subpage === 'returns' ? 'Retur penjualan' : subpage === 'invoices' ? 'Faktur penjualan' : subpage === 'suppliers' ? 'Pemasok' : isInventory ? 'Ringkasan stok' : isSales ? 'Riwayat penjualan' : 'Pesanan pembelian'

  return <div className={`dashboard-app${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}><AppSidebar open={menuOpen} onClose={() => setMenuOpen(false)} user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(current => !current)}/><div className="app-main"><Topbar user={user} onMenu={() => setMenuOpen(true)}/><main className="dashboard-content phase-content"><div className="dashboard-heading phase-heading"><div><div className="breadcrumb"><Link href="/dashboard">OPERASIONAL TOKO</Link><ChevronRight size={13}/><span>{title.toUpperCase()}</span></div><h1>{pageHeading}</h1><p>{isInventory ? 'Pantau pergerakan, ketersediaan, dan nilai persediaan toko.' : isSales ? 'Kelola transaksi, faktur, dan proses retur pelanggan.' : 'Kelola pesanan ke pemasok dan penerimaan persediaan.'}</p></div><button className="export-button" onClick={() => openDialog(isInventory ? subpage === 'transfers' ? 'transfer' : 'adjust' : isSales ? 'return' : 'purchase')}><Plus size={15}/>{isInventory ? subpage === 'transfers' ? 'Buat transfer' : 'Penyesuaian stok' : isSales ? 'Proses retur' : 'Buat pesanan'}</button></div>
    <div className="phase-three-subnav">{(isInventory ? links.slice(0,3) : isSales ? links.slice(3,6) : links.slice(6)).map(link=><Link key={link.href} href={link.href} className={pathname === link.href ? 'active' : ''}>{link.label}</Link>)}</div>
    {isInventory && <><section className="phase-three-kpis"><article><span>Nilai persediaan</span><b>{rupiah(inventoryValue)}</b><small>berdasarkan harga pokok</small></article><article><span>Jenis produk</span><b>{products.length}</b><small>produk aktif di katalog</small></article><article className={lowStock.length ? 'warning' : ''}><span>Perlu restock</span><b>{lowStock.length}</b><small>produk di bawah batas minimum</small></article><article><span>Pergerakan stok</span><b>{movements.length}</b><small>aktivitas tercatat</small></article></section>
      {subpage === 'low-stock' && <div className="phase-three-alert"><ShieldAlert size={18}/><span><b>Perhatian stok rendah</b><small>Prioritaskan pemesanan produk yang berada di atau di bawah stok minimum.</small></span></div>}
      <section className="panel phase-three-panel"><div className="phase-three-panel-head"><div><h2>{subpage === 'adjustments' ? 'Riwayat penyesuaian stok' : subpage === 'transfers' ? 'Riwayat pergerakan stok' : subpage === 'low-stock' ? 'Produk perlu restock' : 'Posisi persediaan'}</h2><p>{subpage === 'transfers' ? 'Penerimaan, transfer, dan mutasi antar gudang' : 'Saldo stok tersinkron dengan daftar produk dan penyesuaian manual'}</p></div><label className="phase-three-search"><Search size={15}/><input aria-label="Cari produk atau SKU" placeholder="Cari produk atau SKU…" value={query} onChange={event => setQuery(event.target.value)}/></label></div><div className="phase-three-table-wrap"><table className="phase-three-table"><thead><tr><th>Produk</th><th>Kategori</th><th>Stok tersedia</th><th>Stok minimum</th><th>Nilai stok</th><th>Status</th></tr></thead><tbody>{(subpage === 'adjustments' || subpage === 'transfers' ? movements.filter(row => `${row.product} ${row.sku}`.toLowerCase().includes(query.toLowerCase())).map(row => <tr key={row.id}><td><b>{row.product}</b><small>{row.sku}</small></td><td>{row.kind}</td><td className={row.quantity < 0 ? 'negative' : 'positive'}>{row.quantity > 0 ? '+' : ''}{row.quantity}</td><td>{row.reason}</td><td>{row.warehouse}</td><td>{new Date(row.date).toLocaleDateString('id-ID')}</td></tr>) : visibleProducts.filter(product => subpage !== 'low-stock' || product.stock <= product.min).map(product => <tr key={product.id}><td><b>{product.name}</b><small>{product.sku}</small></td><td>{product.category}</td><td><b>{product.stock}</b><small>{product.unit}</small></td><td>{product.min} {product.unit}</td><td>{rupiah(product.cost * product.stock)}</td><td><span className={`phase-status ${product.stock <= product.min ? 'status-warning' : 'status-good'}`}>{product.stock <= product.min ? 'Perlu restock' : 'Stok aman'}</span></td></tr>))}</tbody></table>{!visibleProducts.length && <div className="phase-three-empty">Tidak ada data yang cocok dengan pencarian.</div>}</div></section>
      <section className="panel phase-three-panel"><div className="phase-three-panel-head"><div><h2>Aktivitas stok terbaru</h2><p>Jejak perubahan persediaan yang tercatat</p></div><Activity size={18}/></div>{movements.length ? <div className="phase-three-movements">{movements.slice(0,5).map(row=><div key={row.id}><span className={row.quantity < 0 ? 'movement-down' : 'movement-up'}>{row.quantity < 0 ? <ArrowDown size={15}/> : <ArrowUp size={15}/>}</span><span><b>{row.kind} · {row.product}</b><small>{row.reason} · {row.warehouse}</small></span><strong className={row.quantity < 0 ? 'negative' : 'positive'}>{row.quantity > 0 ? '+' : ''}{row.quantity}</strong><time>{new Date(row.date).toLocaleDateString('id-ID')}</time></div>)}</div> : <div className="phase-three-empty">Belum ada pergerakan stok. Penyesuaian yang dicatat akan tampil di sini.</div>}</section></>}
    {isSales && <section className="panel phase-three-panel"><div className="phase-three-panel-head"><div><h2>{subpage === 'returns' ? 'Transaksi untuk retur' : subpage === 'invoices' ? 'Daftar faktur' : 'Semua transaksi'}</h2><p>Data berasal dari transaksi kasir Tosmart</p></div><label className="phase-three-search"><Search size={15}/><input aria-label="Cari transaksi" placeholder="Cari nomor transaksi…" value={query} onChange={event => setQuery(event.target.value)}/></label></div><div className="phase-three-table-wrap"><table className="phase-three-table"><thead><tr><th>Nomor transaksi</th><th>Tanggal</th><th>Pelanggan / kasir</th><th>Metode</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{sales.filter(sale => sale.invoice.toLowerCase().includes(query.toLowerCase())).map(sale=><tr key={sale.invoice}><td><b>{sale.invoice}</b><small>{sale.items?.length || 0} item</small></td><td>{new Date(sale.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</td><td>{sale.customer || 'Pelanggan umum'}<small>{sale.cashier || 'Kasir Tosmart'}</small></td><td>{sale.payment}</td><td><b>{rupiah(sale.total)}</b></td><td><span className={`phase-status ${sale.status === 'Diretur' ? 'status-neutral' : 'status-good'}`}>{sale.status || 'Selesai'}</span></td><td><button className="phase-action" disabled={sale.status === 'Diretur'} onClick={() => { setSelectedSale(sale); setDialog('return') }}>Proses retur</button></td></tr>)}</tbody></table>{!sales.length && <div className="phase-three-empty"><ClipboardList size={25}/><b>Belum ada transaksi</b><span>Transaksi yang diselesaikan melalui POS akan otomatis muncul di sini.</span><Link href="/pos">Buka kasir POS</Link></div>}</div></section>}
    {isPurchases && <section className="panel phase-three-panel"><div className="phase-three-panel-head"><div><h2>{subpage === 'suppliers' ? 'Daftar pemasok' : 'Pesanan pembelian'}</h2><p>Lacak status pesanan dan penerimaan stok pemasok</p></div><label className="phase-three-search"><Search size={15}/><input aria-label="Cari pesanan" placeholder="Cari nomor PO atau pemasok…" value={query} onChange={event => setQuery(event.target.value)}/></label></div>{subpage === 'suppliers' ? <div className="phase-three-supplier-list">{[...new Set([...purchases.map(purchase => purchase.supplier), 'PT Pangan Sejahtera','CV Segar Makmur','UD Sumber Rezeki'])].map(supplier=><article key={supplier}><span className="supplier-mark"><Truck size={18}/></span><div><b>{supplier}</b><small>{purchases.filter(purchase => purchase.supplier === supplier).length ? `${purchases.filter(purchase => purchase.supplier === supplier).length} pesanan tercatat` : 'Vendor terdaftar'}</small></div><span className="phase-status status-good">Aktif</span></article>)}</div> : <div className="phase-three-table-wrap"><table className="phase-three-table"><thead><tr><th>Nomor PO</th><th>Pemasok</th><th>Tanggal</th><th>Jumlah</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{purchases.filter(item => `${item.id} ${item.supplier}`.toLowerCase().includes(query.toLowerCase())).map(purchase=><tr key={purchase.id}><td><b>{purchase.id}</b></td><td>{purchase.supplier}</td><td>{new Date(purchase.date).toLocaleDateString('id-ID')}</td><td>{purchase.items.map(item => { const product = products.find(row => row.id === item.productId); const factor = Number(item.conversionFactor) || 1; return <span key={item.productId}><b>{item.quantity} {item.purchaseUnit || product?.unit || 'unit'}</b><small>{item.received} diterima · setara {item.quantity * factor} {product?.unit || 'unit'}</small></span>})}</td><td><b>{rupiah(purchase.total)}</b></td><td><span className={`phase-status ${purchase.status === 'Received' ? 'status-good' : 'status-warning'}`}>{purchase.status}</span></td><td><button className="phase-action" disabled={purchase.status === 'Received' || purchase.status === 'Cancelled'} onClick={() => purchase.status === 'Pending' ? approvePurchase(purchase) : openReceive(purchase)}>{purchase.status === 'Received' ? 'Selesai' : purchase.status === 'Pending' ? 'Setujui' : 'Terima stok'}</button></td></tr>)}</tbody></table>{!purchases.length && <div className="phase-three-empty"><ShoppingCart size={25}/><b>Belum ada pesanan pembelian</b><span>Buat pesanan untuk memasukkan stok dari pemasok.</span><button onClick={() => openDialog('purchase')}>Buat pesanan</button></div>}</div>}</section>}
    {notice && <div className="phase-toast" role="status"><Check size={16}/>{notice}</div>}
    {dialog && <div className="phase-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) { setDialog(null); setSelectedSale(null) } }}><section className="phase-modal phase-three-dialog" aria-labelledby="phase-three-dialog-title"><div className="phase-modal-head"><div><h2 id="phase-three-dialog-title">{dialog === 'adjust' ? 'Penyesuaian stok' : dialog === 'transfer' ? 'Transfer stok' : dialog === 'purchase' ? 'Pesanan pembelian baru' : dialog === 'receive' ? 'Penerimaan barang' : 'Konfirmasi retur'}</h2><p>{dialog === 'return' ? `Kembalikan item transaksi ${selectedSale?.invoice || ''} ke persediaan.` : 'Lengkapi detail untuk mencatat perubahan operasional.'}</p></div><button aria-label="Tutup dialog" onClick={() => { setDialog(null); setSelectedSale(null) }}><X size={18}/></button></div>{dialog === 'return' ? <><div className="phase-return-summary"><span>Nomor transaksi</span><b>{selectedSale?.invoice}</b><span>Nilai transaksi</span><b>{rupiah(selectedSale?.total || 0)}</b><span>Item yang akan dikembalikan</span><b>{selectedSale?.items?.map(item => `${item.name} × ${item.quantity}`).join(', ') || 'Detail item tidak tersedia'}</b></div><div className="phase-modal-actions"><button onClick={() => { setDialog(null); setSelectedSale(null) }}>Batal</button><button className="export-button" onClick={() => selectedSale && returnSale(selectedSale)}>Konfirmasi retur</button></div></> : <form onSubmit={dialog === 'purchase' ? createPurchase : dialog === 'receive' ? processReceive : saveMovement}><div className="phase-three-form-grid"><label>Produk<select disabled={dialog === 'receive'} value={form.productId} onChange={event => { const selected = products.find(product => product.id === Number(event.target.value)); setForm({...form, productId:event.target.value, purchaseUnit:selected?.unit || 'Pcs', purchasePrice:selected ? String(selected.cost) : '', sellingPrice:''}) }}>{products.map(product=><option key={product.id} value={product.id}>{product.name} · stok {product.stock}</option>)}</select></label>{dialog === 'adjust' && <label>Jenis penyesuaian<select value={form.type} onChange={event => setForm({...form,type:event.target.value})}><option>Tambah stok</option><option>Kurangi stok</option><option>Atur jumlah pasti</option></select></label>}{dialog === 'purchase' && <><label className="full-field">Nama vendor<input required maxLength={120} placeholder="Contoh: PT Pangan Sejahtera" value={form.supplier} onChange={event => setForm({...form,supplier:event.target.value})}/></label><label>Satuan pembelian<select value={form.purchaseUnit} onChange={event => setForm({...form,purchaseUnit:event.target.value})}>{[...new Set([...products.map(product => product.unit), 'Pcs', 'Pack', 'Box', 'Karton', 'Lusin', 'Dus', 'Karung'])].map(unit => <option key={unit} value={unit}>{unit}</option>)}</select></label><label>Isi per satuan (unit stok)<input type="number" min="1" step="1" required value={form.conversionFactor} onChange={event => setForm({...form,conversionFactor:event.target.value})}/></label><label>Harga beli per satuan (Rp)<input type="number" min="1" step="1" required value={form.purchasePrice} onChange={event => setForm({...form,purchasePrice:event.target.value})}/></label><label>Harga jual per {products.find(product => product.id === Number(form.productId))?.unit || 'unit'} (opsional)<input type="number" min="1" step="1" value={form.sellingPrice} placeholder="Kosongkan untuk tetap" onChange={event => setForm({...form,sellingPrice:event.target.value})}/></label></>}<label>{dialog === 'purchase' ? 'Jumlah dipesan' : dialog === 'transfer' ? 'Jumlah dipindahkan' : dialog === 'receive' ? 'Jumlah diterima' : form.type === 'Atur jumlah pasti' ? 'Jumlah stok baru' : 'Jumlah unit'}<input type="number" min="1" max={dialog === 'receive' ? Math.max(1, (selectedPurchase?.items.find(item => item.productId === Number(form.productId))?.quantity ?? 1) - (selectedPurchase?.items.find(item => item.productId === Number(form.productId))?.received ?? 0)) : undefined} step="1" required value={form.quantity} onChange={event => setForm({...form,quantity:event.target.value})}/></label>{dialog === 'transfer' && <><label>Gudang asal<select value={form.sourceWarehouse} onChange={event => setForm({...form,sourceWarehouse:event.target.value})}><option>Gudang Utama</option><option>Gudang Belakang</option></select></label><label>Gudang tujuan<select value={form.destinationWarehouse} onChange={event => setForm({...form,destinationWarehouse:event.target.value})}><option>Gudang Belakang</option><option>Gudang Utama</option></select></label></>}<label>Gudang<select value={form.warehouse} onChange={event => setForm({...form,warehouse:event.target.value})}><option>Gudang Utama</option><option>Gudang Belakang</option></select></label><label className="full-field">{dialog === 'purchase' ? 'Catatan pesanan' : 'Alasan / catatan'}<input value={form.reason} onChange={event => setForm({...form,reason:event.target.value})} placeholder="Contoh: stok opname, barang rusak…"/></label></div>{dialog === 'purchase' && <div className="purchase-preview" aria-live="polite"><span><b>Masuk ke inventori</b><small>{(Number(form.quantity) || 0) * (Number(form.conversionFactor) || 1)} {products.find(product => product.id === Number(form.productId))?.unit || 'unit'} · HPP dihitung rata-rata saat diterima</small></span><strong>Total pesanan {rupiah((Number(form.quantity) || 0) * (Number(form.purchasePrice) || 0))}</strong></div>}<div className="phase-modal-actions"><button type="button" onClick={() => setDialog(null)}>Batal</button><button type="submit" className="export-button"><Check size={15}/>{dialog === 'purchase' ? 'Simpan pesanan' : dialog === 'transfer' ? 'Konfirmasi transfer' : dialog === 'receive' ? 'Catat penerimaan' : 'Simpan penyesuaian'}</button></div></form>}</section></div>}
    </main></div></div>
}
