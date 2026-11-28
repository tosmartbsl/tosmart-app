const QUANTITY_PRECISION = 1_000

export function normalizeStockQuantity(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.round((value + Number.EPSILON) * QUANTITY_PRECISION) / QUANTITY_PRECISION
}

export function toStockQuantity(purchaseQuantity: number, unitsPerPurchase: number) {
  return normalizeStockQuantity(purchaseQuantity * unitsPerPurchase)
}

export function isValidInventoryQuantity(value: number) {
  return Number.isFinite(value) && value > 0 && Math.abs(value * QUANTITY_PRECISION - Math.round(value * QUANTITY_PRECISION)) < 1e-7
}

export function calculateMovingAverageHpp({
  currentStock,
  currentHpp,
  purchaseQuantity,
  purchasePrice,
  unitsPerPurchase,
}: {
  currentStock: number
  currentHpp: number
  purchaseQuantity: number
  purchasePrice: number
  unitsPerPurchase: number
}) {
  const normalizedStock = Math.max(0, Number.isFinite(currentStock) ? currentStock : 0)
  const normalizedHpp = Math.max(0, Number.isFinite(currentHpp) ? currentHpp : 0)
  const normalizedQuantity = Math.max(0, Number.isFinite(purchaseQuantity) ? purchaseQuantity : 0)
  const normalizedPrice = Math.max(0, Number.isFinite(purchasePrice) ? purchasePrice : 0)
  const conversion = Number.isFinite(unitsPerPurchase) && unitsPerPurchase > 0 ? unitsPerPurchase : 1
  const nextStock = normalizedStock + normalizedQuantity * conversion

  if (nextStock <= 0) return Math.round(normalizedHpp)

  const currentInventoryValue = normalizedStock * normalizedHpp
  const receivedPurchaseValue = normalizedQuantity * normalizedPrice
  return Math.round((currentInventoryValue + receivedPurchaseValue) / nextStock)
}
