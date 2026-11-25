'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Download,
  Package,
  RotateCw,
  ShoppingBasket,
  Sparkles,
  TriangleAlert,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TOSCO_CATEGORY } from '@/lib/tosco'
import styles from './dashboard-overview.module.css'

type User = { name: string; email: string; role: string }
type Product = {
  id: number
  name: string
  sku: string
  category: string
  price: number
  cost: number
  stock: number
  min: number
  status?: boolean
  unit?: string
}
type SaleItem = {
  id: number
  name: string
  sku: string
  quantity: number
  price: number
  category?: string
}
type Sale = {
  invoice: string
  date: string
  total: number
  payment: string
  status?: string
  customer?: string
  cashier?: string
  items?: SaleItem[]
}
type Range = 'today' | 'week' | 'month' | 'year'
type DateWindow = { start: Date; end: Date }
type DashboardSnapshot = { sales: Sale[]; products: Product[]; categories: string[] }
type Trend = { label: string; direction: 'up' | 'down' | 'flat' }
type Metric = {
  label: string
  value: string
  note: string
  icon: LucideIcon
  tone: 'violet' | 'teal' | 'blue' | 'orange'
  trend?: Trend
}
type ChartPoint = { label: string; sales: number; previous: number }
type CategoryTotal = { name: string; amount: number; color: string }
type TopProduct = {
  key: string
  name: string
  sku: string
  category: string
  quantity: number
  revenue: number
  stock?: number
}

const DEFAULT_CATEGORIES = [
  'Sembako',
  'Minuman',
  'Produk segar',
  'Roti & bakery',
  TOSCO_CATEGORY,
]
const CATEGORY_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]
const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: 'today', label: 'Hari ini' },
  { value: 'week', label: '7 hari terakhir' },
  { value: 'month', label: 'Bulan ini' },
  { value: 'year', label: 'Tahun ini' },
]
const SALES_CHART_CONFIG = {
  sales: { label: 'Periode ini', color: 'var(--chart-1)' },
  previous: { label: 'Periode lalu', color: 'var(--chart-4)' },
} satisfies ChartConfig
const CATEGORY_CHART_CONFIG = {
  amount: { label: 'Penjualan', color: 'var(--chart-1)' },
} satisfies ChartConfig

const formatCurrency = (value: number) => `Rp ${Math.round(value || 0).toLocaleString('id-ID')}`
const formatNumber = (value: number) => Math.round(value || 0).toLocaleString('id-ID')

function readStoredArray<T>(key: string): T[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(value) ? value as T[] : []
  } catch {
    return []
  }
}

function loadDashboardSnapshot(): DashboardSnapshot {
  const savedCategories = readStoredArray<string>('tosmart-categories')
  return {
    sales: readStoredArray<Sale>('tosmart-sales'),
    products: readStoredArray<Product>('tosmart-products'),
    categories: savedCategories.length ? savedCategories : DEFAULT_CATEGORIES,
  }
}

function startOfDay(date: Date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function getDateWindows(range: Range, now: Date) {
  const today = startOfDay(now)

  if (range === 'today') {
    const end = new Date(today)
    end.setDate(end.getDate() + 1)
    const previousStart = new Date(today)
    previousStart.setDate(previousStart.getDate() - 1)
    return { current: { start: today, end }, previous: { start: previousStart, end: today } }
  }

  if (range === 'week') {
    const start = new Date(today)
    start.setDate(start.getDate() - 6)
    const end = new Date(today)
    end.setDate(end.getDate() + 1)
    const previousStart = new Date(start)
    previousStart.setDate(previousStart.getDate() - 7)
    return { current: { start, end }, previous: { start: previousStart, end: start } }
  }

  if (range === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return { current: { start, end }, previous: { start: previousStart, end: start } }
  }

  const start = new Date(now.getFullYear(), 0, 1)
  const end = new Date(now.getFullYear() + 1, 0, 1)
  const previousStart = new Date(now.getFullYear() - 1, 0, 1)
  return { current: { start, end }, previous: { start: previousStart, end: start } }
}

function isCountableSale(sale: Sale) {
  const status = sale.status?.trim().toLocaleLowerCase('id-ID')
  return !['batal', 'dibatalkan', 'cancelled', 'canceled', 'void'].includes(status || '')
}

function saleDate(sale: Sale) {
  const date = new Date(sale.date)
  return Number.isNaN(date.getTime()) ? null : date
}

function saleTotal(sale: Sale) {
  const total = Number(sale.total)
  if (Number.isFinite(total)) return total
  return (sale.items || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0)
}

function getProductForItem(
  item: SaleItem,
  productsById: Map<number, Product>,
  productsBySku: Map<string, Product>,
) {
  return productsById.get(Number(item.id)) || productsBySku.get(item.sku.toLocaleLowerCase('id-ID'))
}

function visibleCategory(value?: string) {
  const name = value?.trim()
  if (!name || name.toLocaleLowerCase('id-ID') === 'kebutuhan rumah' || name.toLocaleLowerCase('id-ID') === 'semua produk') return ''
  return name
}

function itemCategory(
  item: SaleItem,
  productsById: Map<number, Product>,
  productsBySku: Map<string, Product>,
) {
  const productCategory = visibleCategory(getProductForItem(item, productsById, productsBySku)?.category)
  const recordedCategory = visibleCategory(item.category)
  return productCategory || recordedCategory || 'Belum dikategorikan'
}

function isInWindow(sale: Sale, window: DateWindow) {
  const date = saleDate(sale)
  return Boolean(date && isCountableSale(sale) && date >= window.start && date < window.end)
}

function profitForSales(
  sales: Sale[],
  productsById: Map<number, Product>,
  productsBySku: Map<string, Product>,
) {
  return sales.reduce((total, sale) => total + (sale.items || []).reduce((subtotal, item) => {
    const product = getProductForItem(item, productsById, productsBySku)
    const cost = Number(product?.cost)
    if (!Number.isFinite(cost)) return subtotal
    return subtotal + (Number(item.price || 0) - cost) * Number(item.quantity || 0)
  }, 0), 0)
}

function makeTrend(current: number, previous: number): Trend {
  if (previous === 0) {
    if (current === 0) return { label: 'Belum ada data', direction: 'flat' }
    return { label: 'Baru tercatat', direction: 'up' }
  }

  const percent = ((current - previous) / Math.abs(previous)) * 100
  const direction = percent > 0 ? 'up' : percent < 0 ? 'down' : 'flat'
  const sign = percent > 0 ? '+' : ''
  return {
    label: `${sign}${percent.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`,
    direction,
  }
}

function createChartSeries(range: Range, now: Date, sales: Sale[], windows: ReturnType<typeof getDateWindows>) {
  const labels: string[] = []
  const current = sales.filter((sale) => isInWindow(sale, windows.current))
  const previous = sales.filter((sale) => isInWindow(sale, windows.previous))
  let count = 0

  if (range === 'today') {
    count = 24
    for (let hour = 0; hour < count; hour += 1) labels.push(`${String(hour).padStart(2, '0')}:00`)
  } else if (range === 'week') {
    count = 7
    for (let day = 0; day < count; day += 1) {
      const date = new Date(windows.current.start)
      date.setDate(date.getDate() + day)
      labels.push(new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(date))
    }
  } else if (range === 'month') {
    count = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    for (let day = 1; day <= count; day += 1) labels.push(String(day))
  } else {
    count = 12
    for (let month = 0; month < count; month += 1) {
      labels.push(new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(new Date(now.getFullYear(), month, 1)))
    }
  }

  const points: ChartPoint[] = labels.map((label) => ({ label, sales: 0, previous: 0 }))
  const bucketFor = (sale: Sale, window: DateWindow) => {
    const date = saleDate(sale)
    if (!date) return -1
    if (range === 'today') return date.getHours()
    if (range === 'week') return Math.floor((startOfDay(date).getTime() - window.start.getTime()) / 86400000)
    if (range === 'month') return date.getDate() - 1
    return date.getMonth()
  }

  current.forEach((sale) => {
    const index = bucketFor(sale, windows.current)
    if (index >= 0 && index < points.length) points[index].sales += saleTotal(sale)
  })
  previous.forEach((sale) => {
    const index = bucketFor(sale, windows.previous)
    if (index >= 0 && index < points.length) points[index].previous += saleTotal(sale)
  })

  return points
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon
  const TrendIcon = metric.trend?.direction === 'down'
    ? ArrowDownRight
    : metric.trend?.direction === 'up'
      ? ArrowUpRight
      : null

  return (
    <Card className={`${styles.metricCard} ${styles[`metric${metric.tone[0].toUpperCase()}${metric.tone.slice(1)}`]}`}>
      <CardHeader className={styles.metricHeader}>
        <CardTitle className={styles.metricLabel}>{metric.label}</CardTitle>
        <span className={styles.metricIcon}><Icon aria-hidden="true" size={18} /></span>
      </CardHeader>
      <CardContent className={styles.metricContent}>
        <strong className={styles.metricValue}>{metric.value}</strong>
        <div className={styles.metricFoot}>
          {metric.trend && (
            <span className={`${styles.trend} ${styles[`trend${metric.trend.direction[0].toUpperCase()}${metric.trend.direction.slice(1)}`]}`}>
              {TrendIcon && <TrendIcon aria-hidden="true" size={13} />}
              {metric.trend.label}
            </span>
          )}
          <span>{metric.note}</span>
        </div>
      </CardContent>
      <span className={styles.metricDecoration} aria-hidden="true" />
    </Card>
  )
}

export default function DashboardOverview({ user }: { user: User }) {
  const [range, setRange] = useState<Range>('week')
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [storedCategories, setStoredCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [now, setNow] = useState<Date>(() => new Date())

  const refreshDashboard = useCallback(() => {
    const snapshot = loadDashboardSnapshot()
    setSales(snapshot.sales)
    setProducts(snapshot.products)
    setStoredCategories(snapshot.categories)
    const refreshedAt = new Date()
    setUpdatedAt(refreshedAt)
    setNow(refreshedAt)
  }, [])

  useEffect(() => {
    refreshDashboard()
    const refreshOnStorageChange = () => refreshDashboard()
    window.addEventListener('storage', refreshOnStorageChange)
    window.addEventListener('tosmart:data-updated', refreshOnStorageChange)
    return () => {
      window.removeEventListener('storage', refreshOnStorageChange)
      window.removeEventListener('tosmart:data-updated', refreshOnStorageChange)
    }
  }, [refreshDashboard])

  const productsById = useMemo(() => new Map(products.map((product) => [Number(product.id), product])), [products])
  const productsBySku = useMemo(() => new Map(products.map((product) => [product.sku.toLocaleLowerCase('id-ID'), product])), [products])
  const windows = useMemo(() => getDateWindows(range, now), [range, now])
  const currentSales = useMemo(() => sales.filter((sale) => isInWindow(sale, windows.current)), [sales, windows])
  const previousSales = useMemo(() => sales.filter((sale) => isInWindow(sale, windows.previous)), [sales, windows])
  const currentRevenue = useMemo(() => currentSales.reduce((total, sale) => total + saleTotal(sale), 0), [currentSales])
  const previousRevenue = useMemo(() => previousSales.reduce((total, sale) => total + saleTotal(sale), 0), [previousSales])
  const currentProfit = useMemo(() => profitForSales(currentSales, productsById, productsBySku), [currentSales, productsById, productsBySku])
  const previousProfit = useMemo(() => profitForSales(previousSales, productsById, productsBySku), [previousSales, productsById, productsBySku])
  const lowStockProducts = useMemo(() => products
    .filter((product) => product.status !== false && Number.isFinite(Number(product.stock)) && Number(product.stock) <= Number(product.min || 0))
    .sort((first, second) => Number(first.stock) - Number(second.stock)), [products])

  const categoryNames = useMemo(() => {
    const names = new Set<string>(DEFAULT_CATEGORIES)
    storedCategories.forEach((category) => {
      const name = visibleCategory(category)
      if (name) names.add(name)
    })
    products.forEach((product) => {
      const name = visibleCategory(product.category)
      if (name) names.add(name)
    })
    sales.forEach((sale) => (sale.items || []).forEach((item) => {
      const name = itemCategory(item, productsById, productsBySku)
      if (name !== 'Belum dikategorikan') names.add(name)
    }))
    return [...names]
  }, [products, productsById, productsBySku, sales, storedCategories])

  const categoryTotals = useMemo<CategoryTotal[]>(() => {
    const totals = new Map(categoryNames.map((name) => [name, 0]))
    currentSales.forEach((sale) => (sale.items || []).forEach((item) => {
      const category = itemCategory(item, productsById, productsBySku)
      totals.set(category, (totals.get(category) || 0) + Number(item.price || 0) * Number(item.quantity || 0))
    }))
    const categories = [...totals.entries()].map(([name, amount], index) => ({
      name,
      amount,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))
    return categories.sort((first, second) => {
      const firstDefault = DEFAULT_CATEGORIES.indexOf(first.name)
      const secondDefault = DEFAULT_CATEGORIES.indexOf(second.name)
      if (firstDefault !== -1 || secondDefault !== -1) {
        if (firstDefault === -1) return 1
        if (secondDefault === -1) return -1
        return firstDefault - secondDefault
      }
      return second.amount - first.amount || first.name.localeCompare(second.name, 'id')
    })
  }, [categoryNames, currentSales, productsById, productsBySku])

  const categoryRevenue = categoryTotals.reduce((sum, category) => sum + category.amount, 0)
  const chartCategories = categoryTotals.filter((category) => category.amount > 0)
  const topProducts = useMemo<TopProduct[]>(() => {
    const totals = new Map<string, TopProduct>()
    currentSales.forEach((sale) => (sale.items || []).forEach((item) => {
      const product = getProductForItem(item, productsById, productsBySku)
      const category = itemCategory(item, productsById, productsBySku)
      if (selectedCategory && selectedCategory !== category) return
      const key = item.sku || `${item.id}-${item.name}`
      const current = totals.get(key) || {
        key,
        name: item.name,
        sku: item.sku || 'SKU belum tersedia',
        category,
        quantity: 0,
        revenue: 0,
        stock: product?.stock,
      }
      current.quantity += Number(item.quantity || 0)
      current.revenue += Number(item.price || 0) * Number(item.quantity || 0)
      totals.set(key, current)
    }))
    return [...totals.values()].sort((first, second) => second.revenue - first.revenue).slice(0, 5)
  }, [currentSales, productsById, productsBySku, selectedCategory])

  const chartSeries = useMemo(() => createChartSeries(range, now, sales, windows), [now, range, sales, windows])
  const metrics: Metric[] = [
    {
      label: 'Omzet penjualan',
      value: formatCurrency(currentRevenue),
      note: 'dibanding periode sebelumnya',
      icon: CircleDollarSign,
      tone: 'violet',
      trend: makeTrend(currentRevenue, previousRevenue),
    },
    {
      label: 'Transaksi',
      value: formatNumber(currentSales.length),
      note: 'transaksi tercatat',
      icon: ShoppingBasket,
      tone: 'teal',
      trend: makeTrend(currentSales.length, previousSales.length),
    },
    {
      label: 'Estimasi laba kotor',
      value: formatCurrency(currentProfit),
      note: 'berdasarkan harga modal produk',
      icon: TrendingUp,
      tone: 'blue',
      trend: makeTrend(currentProfit, previousProfit),
    },
    {
      label: 'Stok menipis',
      value: formatNumber(lowStockProducts.length),
      note: lowStockProducts.length ? 'produk perlu diperiksa' : 'semua stok dalam batas aman',
      icon: TriangleAlert,
      tone: 'orange',
    },
  ]
  const periodLabel = RANGE_OPTIONS.find((option) => option.value === range)?.label || '7 hari terakhir'
  const greeting = now.getHours() < 11 ? 'Selamat pagi' : now.getHours() < 15 ? 'Selamat siang' : now.getHours() < 19 ? 'Selamat sore' : 'Selamat malam'
  const leadingCategory = [...categoryTotals].sort((first, second) => second.amount - first.amount)[0]
  const briefing = currentSales.length
    ? `Toko mencatat ${formatNumber(currentSales.length)} transaksi dan omzet ${formatCurrency(currentRevenue)} pada ${periodLabel.toLocaleLowerCase('id-ID')}. ${leadingCategory?.amount ? `${leadingCategory.name} menjadi kategori dengan penjualan tertinggi.` : ''}`
    : `Belum ada transaksi pada ${periodLabel.toLocaleLowerCase('id-ID')}. Transaksi kasir akan langsung mengisi tren dan kategori penjualan di sini.`

  const exportCsv = () => {
    const rows = [
      ['Ringkasan dashboard Tosmart', ''],
      ['Periode', periodLabel],
      ['Omzet penjualan', formatCurrency(currentRevenue)],
      ['Transaksi', formatNumber(currentSales.length)],
      ['Estimasi laba kotor', formatCurrency(currentProfit)],
      ['Stok menipis', formatNumber(lowStockProducts.length)],
      ['', ''],
      ['Penjualan per kategori', 'Omzet'],
      ...categoryTotals.map((category) => [category.name, formatCurrency(category.amount)]),
    ]
    const csv = `\uFEFF${rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')}`
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'tosmart-ringkasan-dashboard.csv'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.breadcrumb}><span>RINGKASAN</span><ArrowRight aria-hidden="true" size={13} /><span>OVERVIEW</span></div>
          <p className={styles.eyebrow}>RUANG KENDALI TOKO</p>
          <h1>Dashboard</h1>
          <p className={styles.greeting}>{greeting}, {user.name.split(' ')[0]}. Pantau performa dan operasional tokomu.</p>
        </div>
        <div className={styles.controls}>
          <label className={styles.rangeControl}>
            <CalendarDays aria-hidden="true" size={16} />
            <span className="sr-only">Pilih periode dashboard</span>
            <select value={range} onChange={(event) => setRange(event.target.value as Range)} aria-label="Pilih periode dashboard">
              {RANGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <button className={styles.exportButton} type="button" onClick={exportCsv}>
            <Download aria-hidden="true" size={16} />
            <span>Ekspor</span>
          </button>
        </div>
      </div>

      <section className={styles.briefing} aria-label="Ringkasan periode">
        <span className={styles.briefingIcon}><Sparkles aria-hidden="true" size={19} /></span>
        <div className={styles.briefingCopy}>
          <strong>{currentSales.length ? 'Sorotan performa tokomu' : 'Dashboard siap mencatat performa toko'}</strong>
          <p>{briefing}</p>
        </div>
        <Link href="/reports" className={styles.briefingLink}>Lihat laporan <ArrowRight aria-hidden="true" size={15} /></Link>
      </section>

      <section className={styles.metricsGrid} aria-label="Ringkasan performa toko">
        {metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
      </section>

      <div className={styles.primaryGrid}>
        <Card className={styles.panel}>
          <CardHeader className={styles.panelHeader}>
            <div>
              <CardTitle className={styles.panelTitle}><h2>Performa penjualan</h2></CardTitle>
              <CardDescription className={styles.panelDescription}>Pergerakan omzet dibanding periode sebelumnya</CardDescription>
            </div>
            <div className={styles.legend} aria-label="Legenda grafik">
              <span><i className={styles.legendCurrent} /> Periode ini</span>
              <span><i className={styles.legendPrevious} /> Periode lalu</span>
            </div>
          </CardHeader>
          <CardContent className={styles.panelContent}>
            <div className={styles.chartSummary}>
              <strong>{formatCurrency(currentRevenue)}</strong>
              <span className={`${styles.summaryChange} ${styles[`summary${makeTrend(currentRevenue, previousRevenue).direction[0].toUpperCase()}${makeTrend(currentRevenue, previousRevenue).direction.slice(1)}`]}`}>
                {makeTrend(currentRevenue, previousRevenue).direction === 'down' ? <ArrowDownRight aria-hidden="true" size={14} /> : makeTrend(currentRevenue, previousRevenue).direction === 'up' ? <ArrowUpRight aria-hidden="true" size={14} /> : null}
                {makeTrend(currentRevenue, previousRevenue).label}
              </span>
              <span className={styles.summaryCaption}>total omzet</span>
            </div>
            <ChartContainer className={styles.salesChart} config={SALES_CHART_CONFIG} role="img" aria-label={`Grafik omzet ${periodLabel.toLocaleLowerCase('id-ID')}`}>
              <AreaChart data={chartSeries} accessibilityLayer margin={{ top: 10, right: 10, left: 2, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-sales)" stopOpacity={0.27} />
                    <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0.015} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#e8eaf1" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  minTickGap={18}
                  interval={range === 'today' ? 3 : range === 'month' ? Math.ceil(chartSeries.length / 8) : 'preserveStartEnd'}
                />
                <YAxis tickLine={false} axisLine={false} width={46} tickFormatter={(value: number) => value >= 1000000 ? `Rp ${(value / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt` : value >= 1000 ? `${Math.round(value / 1000)} rb` : String(value)} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => <span>{name === 'previous' ? 'Periode lalu' : 'Periode ini'} · {formatCurrency(Number(value))}</span>} />} />
                <Area type="monotone" dataKey="previous" stroke="var(--color-previous)" strokeWidth={2} strokeDasharray="5 5" fill="transparent" activeDot={false} />
                <Area type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={3} fill="url(#salesGradient)" activeDot={{ r: 5, fill: 'var(--color-sales)', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ChartContainer>
            {!currentRevenue && <p className={styles.chartEmptyNote}>Belum ada omzet pada periode ini. <Link href="/pos">Mulai transaksi <ArrowRight aria-hidden="true" size={13} /></Link></p>}
          </CardContent>
        </Card>

        <Card className={styles.panel}>
          <CardHeader className={styles.panelHeader}>
            <div>
              <CardTitle className={styles.panelTitle}><h2>Penjualan per kategori</h2></CardTitle>
              <CardDescription className={styles.panelDescription}>Sesuai kategori produk di katalog tokomu</CardDescription>
            </div>
            <Link href="/catalog" className={styles.panelAction} aria-label="Kelola kategori produk"><ArrowRight aria-hidden="true" size={17} /></Link>
          </CardHeader>
          <CardContent className={styles.categoryContent}>
            <div className={styles.donutWrap}>
              <ChartContainer className={styles.donutChart} config={CATEGORY_CHART_CONFIG} role="img" aria-label="Bagan penjualan per kategori produk">
                <PieChart accessibilityLayer>
                  <Pie data={chartCategories} dataKey="amount" nameKey="name" innerRadius={66} outerRadius={90} paddingAngle={3} stroke="none" isAnimationActive>
                    {chartCategories.map((category, index) => (
                      <Cell
                        key={category.name}
                        fill={category.color}
                        fillOpacity={selectedCategory && selectedCategory !== category.name ? 0.35 : 1}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" formatter={(value, _name, item) => <span>{item.payload?.name} · {formatCurrency(Number(value))}</span>} />} />
                </PieChart>
              </ChartContainer>
              {categoryRevenue > 0 ? (
                <div className={styles.donutCenter} aria-live="polite">
                  <span>Total kategori</span>
                  <strong>{formatCurrency(categoryRevenue)}</strong>
                </div>
              ) : (
                <div className={`${styles.donutCenter} ${styles.donutCenterEmpty}`}>
                  <span>Belum ada</span>
                  <strong>penjualan</strong>
                </div>
              )}
            </div>
            <div className={styles.categoryLegend}>
              {categoryTotals.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  className={`${styles.categoryRow} ${selectedCategory === category.name ? styles.categoryRowActive : ''}`}
                  onClick={() => setSelectedCategory((current) => current === category.name ? null : category.name)}
                  aria-pressed={selectedCategory === category.name}
                  aria-label={`Filter produk kategori ${category.name}, omzet ${formatCurrency(category.amount)}`}
                >
                  <span className={styles.categoryName}><i style={{ background: category.color }} />{category.name}</span>
                  <strong>{formatCurrency(category.amount)}</strong>
                </button>
              ))}
            </div>
            {selectedCategory && <button className={styles.clearCategory} type="button" onClick={() => setSelectedCategory(null)}>Hapus filter kategori</button>}
          </CardContent>
        </Card>
      </div>

      <div className={styles.secondaryGrid}>
        <Card className={styles.panel}>
          <CardHeader className={styles.panelHeader}>
            <div>
              <CardTitle className={styles.panelTitle}><h2>Produk terlaris</h2></CardTitle>
              <CardDescription className={styles.panelDescription}>{selectedCategory ? `Kategori: ${selectedCategory}` : `Produk dengan omzet tertinggi · ${periodLabel.toLocaleLowerCase('id-ID')}`}</CardDescription>
            </div>
            {selectedCategory ? (
              <button className={styles.panelTextAction} type="button" onClick={() => setSelectedCategory(null)}>Reset filter</button>
            ) : (
              <Link href="/inventory" className={styles.panelTextAction}>Lihat inventori <ArrowRight aria-hidden="true" size={13} /></Link>
            )}
          </CardHeader>
          <CardContent className={styles.panelContent}>
            {topProducts.length ? (
              <div className={styles.productList}>
                {topProducts.map((product, index) => (
                  <div className={styles.productRow} key={product.key}>
                    <span className={`${styles.productRank} ${styles[`rank${index + 1}`]}`}>{String(index + 1).padStart(2, '0')}</span>
                    <span className={styles.productInfo}>
                      <strong>{product.name}</strong>
                      <small>{product.sku} · {product.category}</small>
                    </span>
                    <span className={styles.productUnits}>{formatNumber(product.quantity)} unit</span>
                    <span className={styles.productRevenue}>{formatCurrency(product.revenue)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}><ClipboardList aria-hidden="true" size={19} /></span>
                <strong>{selectedCategory ? 'Belum ada penjualan di kategori ini' : 'Belum ada produk terjual'}</strong>
                <p>Data produk terlaris akan muncul setelah transaksi tercatat.</p>
                <Link href="/pos">Buka kasir <ArrowRight aria-hidden="true" size={14} /></Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={styles.panel}>
          <CardHeader className={styles.panelHeader}>
            <div>
              <CardTitle className={styles.panelTitle}><h2>Stok perlu perhatian</h2></CardTitle>
              <CardDescription className={styles.panelDescription}>Produk dengan stok pada atau di bawah batas minimum</CardDescription>
            </div>
            <span className={styles.stockCount}>{formatNumber(lowStockProducts.length)} produk</span>
          </CardHeader>
          <CardContent className={styles.panelContent}>
            {lowStockProducts.length ? (
              <div className={styles.stockList}>
                {lowStockProducts.slice(0, 4).map((product) => (
                  <Link href="/inventory" className={styles.stockRow} key={product.sku || product.id}>
                    <span className={styles.stockIcon}><Package aria-hidden="true" size={17} /></span>
                    <span className={styles.stockInfo}>
                      <strong>{product.name}</strong>
                      <small>{product.sku} · minimum {formatNumber(Number(product.min || 0))} {product.unit || 'unit'}</small>
                    </span>
                    <span className={styles.stockValue}>{formatNumber(Number(product.stock || 0))}<small>{product.unit || 'unit'}</small></span>
                    <ArrowRight aria-hidden="true" size={15} className={styles.stockArrow} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className={`${styles.emptyState} ${styles.stockEmpty}`}>
                <span className={`${styles.emptyIcon} ${styles.emptyIconSafe}`}><Package aria-hidden="true" size={19} /></span>
                <strong>Stok toko aman</strong>
                <p>Belum ada produk yang menyentuh batas minimum stok.</p>
                <Link href="/inventory">Lihat inventori <ArrowRight aria-hidden="true" size={14} /></Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <footer className={styles.dashboardFooter}>
        <span><i /> Data berasal dari transaksi dan inventori Tosmart</span>
        <span>
          {updatedAt ? `Terakhir diperbarui ${new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(updatedAt)} WIB` : 'Memuat data'}
          <button type="button" onClick={refreshDashboard} aria-label="Muat ulang data dashboard"><RotateCw aria-hidden="true" size={13} />Muat ulang</button>
        </span>
      </footer>
    </main>
  )
}
