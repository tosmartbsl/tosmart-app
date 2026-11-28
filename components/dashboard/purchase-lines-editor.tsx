'use client'

import { Plus, Trash2 } from 'lucide-react'

export type PurchaseLineDraft = {
  productId: string
  quantity: string
  purchaseUnit: string
  conversionFactor: string
  purchasePrice: string
  sellingPrice: string
}

type ProductOption = {
  id: number
  name: string
  sku: string
  cost: number
  stock: number
  unit: string
}

type PurchaseLinesEditorProps = {
  products: ProductOption[]
  units: string[]
  lines: PurchaseLineDraft[]
  onChangeLine: (index: number, field: keyof PurchaseLineDraft, value: string) => void
  onAddLine: () => void
  onRemoveLine: (index: number) => void
}

export default function PurchaseLinesEditor({ products, units, lines, onChangeLine, onAddLine, onRemoveLine }: PurchaseLinesEditorProps) {
  return (
    <section className="purchase-lines full-field" aria-labelledby="purchase-lines-title">
      <div className="purchase-lines-heading">
        <div>
          <h3 id="purchase-lines-title">Produk dalam pesanan</h3>
          <p>Harga beli diisi per satuan beli; stok dan HPP dihitung saat barang diterima.</p>
        </div>
        <button className="purchase-add-line" type="button" onClick={onAddLine} disabled={lines.length >= products.length}>
          <Plus aria-hidden="true" /> Tambah produk
        </button>
      </div>
      {lines.map((line, index) => {
        const product = products.find((item) => item.id === Number(line.productId))
        const availableProducts = products.filter((item) => item.id === Number(line.productId) || !lines.some((other, otherIndex) => otherIndex !== index && Number(other.productId) === item.id))
        return (
          <fieldset className="purchase-line-card" key={`${line.productId}-${index}`}>
            <legend className="sr-only">Item pesanan {index + 1}</legend>
            <div className="purchase-line-heading">
              <b>Item {index + 1}</b>
              <button className="purchase-remove-line" type="button" onClick={() => onRemoveLine(index)} disabled={lines.length === 1} aria-label={`Hapus item ${index + 1}`}>
                <Trash2 aria-hidden="true" />
              </button>
            </div>
            <div className="purchase-line-fields">
              <label className="purchase-line-product">Produk
                <select required value={line.productId} onChange={(event) => onChangeLine(index, 'productId', event.target.value)}>
                  {availableProducts.map((item) => <option key={item.id} value={item.id}>{item.name} · stok {item.stock.toLocaleString('id-ID')} {item.unit}</option>)}
                </select>
              </label>
              <label>Jumlah dipesan
                <input type="number" min="0.001" step="0.001" required value={line.quantity} onChange={(event) => onChangeLine(index, 'quantity', event.target.value)} />
              </label>
              <label>Satuan beli
                <select required value={line.purchaseUnit} onChange={(event) => onChangeLine(index, 'purchaseUnit', event.target.value)}>
                  {units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                </select>
              </label>
              <label>Isi per {line.purchaseUnit || 'satuan'}
                <input type="number" min="0.001" step="0.001" required aria-label={`Isi per ${line.purchaseUnit || 'satuan'} untuk ${product?.name || `item ${index + 1}`}`} value={line.conversionFactor} onChange={(event) => onChangeLine(index, 'conversionFactor', event.target.value)} />
                <small>Unit stok: {product?.unit || 'unit'}</small>
              </label>
              <label>Harga beli (Rp)
                <input type="number" min="1" step="1" required aria-label={`Harga beli per ${line.purchaseUnit || 'satuan'} untuk ${product?.name || `item ${index + 1}`}`} value={line.purchasePrice} onChange={(event) => onChangeLine(index, 'purchasePrice', event.target.value)} />
              </label>
              <label>Harga jual / unit stok (opsional)
                <input type="number" min="1" step="1" aria-label={`Harga jual per ${product?.unit || 'unit'} untuk ${product?.name || `item ${index + 1}`}`} value={line.sellingPrice} placeholder="Kosongkan untuk tetap" onChange={(event) => onChangeLine(index, 'sellingPrice', event.target.value)} />
              </label>
            </div>
            {product && line.conversionFactor && Number(line.conversionFactor) > 0 && line.purchasePrice && Number(line.purchasePrice) > 0 && (
              <p className="purchase-line-hint">{line.quantity || '0'} {line.purchaseUnit} = {(Number(line.quantity) * Number(line.conversionFactor)).toLocaleString('id-ID', { maximumFractionDigits: 3 })} {product.unit} · HPP masuk sekitar Rp {Math.round(Number(line.purchasePrice) / Number(line.conversionFactor)).toLocaleString('id-ID')} / {product.unit}</p>
            )}
          </fieldset>
        )
      })}
    </section>
  )
}
