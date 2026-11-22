export const TOSCO_CATEGORY = 'Tosco'

type ToscoSeed = {
  id: number
  name: string
  sku: string
  category: string
  price: number
  cost: number
  stock: number
  min: number
  status: boolean
  color: string
  unit: string
}

export const toscoSeedProducts: ToscoSeed[] = [
  { id: 9, name: 'Espresso Tosco', sku: 'TSC-001', category: TOSCO_CATEGORY, price: 18000, cost: 7000, stock: 50, min: 10, status: true, color: 'coffee', unit: 'Cup' },
  { id: 10, name: 'Americano', sku: 'TSC-002', category: TOSCO_CATEGORY, price: 22000, cost: 8500, stock: 50, min: 10, status: true, color: 'coffee', unit: 'Cup' },
  { id: 11, name: 'Cappuccino', sku: 'TSC-003', category: TOSCO_CATEGORY, price: 28000, cost: 11000, stock: 45, min: 10, status: true, color: 'coffee', unit: 'Cup' },
  { id: 12, name: 'Caffè Latte', sku: 'TSC-004', category: TOSCO_CATEGORY, price: 28000, cost: 11000, stock: 45, min: 10, status: true, color: 'coffee', unit: 'Cup' },
  { id: 13, name: 'Kopi Susu Gula Aren', sku: 'TSC-005', category: TOSCO_CATEGORY, price: 24000, cost: 9500, stock: 60, min: 12, status: true, color: 'coffee', unit: 'Cup' },
  { id: 14, name: 'Mocha', sku: 'TSC-006', category: TOSCO_CATEGORY, price: 30000, cost: 12000, stock: 40, min: 10, status: true, color: 'coffee', unit: 'Cup' },
]

// Pastikan kategori Tosco selalu ada; diletakkan paling depan agar tampil sebagai
// seksi kopi tersendiri tepat setelah "Semua produk" di terminal POS.
export function ensureToscoCategory(categories: string[]): string[] {
  if (categories.includes(TOSCO_CATEGORY)) return categories
  return [TOSCO_CATEGORY, ...categories]
}

// Tambahkan menu kopi Tosco yang belum ada pada data produk tersimpan (dicocokkan lewat SKU).
export function ensureToscoProducts<T extends { sku: string }>(products: T[]): T[] {
  const missing = toscoSeedProducts.filter(seed => !products.some(product => product.sku === seed.sku))
  if (!missing.length) return products
  return [...products, ...(missing as unknown as T[])]
}
