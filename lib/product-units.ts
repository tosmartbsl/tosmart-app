export const PRODUCT_UNIT_STORAGE_KEY = 'tosmart-master-Satuan'

export const DEFAULT_PRODUCT_UNITS = ['Pcs', 'Botol', 'Pack', 'Kg', 'Karung', 'Kotak', 'Tray', 'Sisir']

export function parseProductUnits(value: string | null): string[] {
  if (!value) return [...DEFAULT_PRODUCT_UNITS]

  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return [...DEFAULT_PRODUCT_UNITS]

    const units = Array.from(new Set(parsed
      .filter((unit): unit is string => typeof unit === 'string')
      .map(unit => unit.trim())
      .filter(Boolean)))

    return units.length ? units : [...DEFAULT_PRODUCT_UNITS]
  } catch {
    return [...DEFAULT_PRODUCT_UNITS]
  }
}
