import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Boxes,
  ClipboardList,
  PackageCheck,
  ShoppingBasket,
  Store,
} from 'lucide-react'

const features = [
  {
    icon: ShoppingBasket,
    eyebrow: '01 / PENJUALAN',
    title: 'Kasir yang sigap',
    description: 'Catat transaksi harian dan layani pelanggan lewat alur kasir yang praktis.',
  },
  {
    icon: Boxes,
    eyebrow: '02 / INVENTORI',
    title: 'Stok lebih terkendali',
    description: 'Kelola produk dan pantau persediaan agar kebutuhan toko tetap terlihat.',
  },
  {
    icon: ClipboardList,
    eyebrow: '03 / PEMBELIAN',
    title: 'Pembelian tercatat',
    description: 'Rapikan catatan pemasok dan pembelian dalam satu tempat yang mudah dicari.',
  },
  {
    icon: BarChart3,
    eyebrow: '04 / LAPORAN',
    title: 'Pahami usaha dari data',
    description: 'Lihat ringkasan penjualan dan aktivitas toko untuk membantu mengambil keputusan.',
  },
]

const steps = [
  { number: '01', title: 'Rapikan data toko', description: 'Mulai dengan menyiapkan produk dan informasi toko yang biasa kamu kelola.' },
  { number: '02', title: 'Catat aktivitas harian', description: 'Gunakan alur kasir, stok, dan pembelian untuk mencatat kegiatan operasional.' },
  { number: '03', title: 'Lihat gambaran usaha', description: 'Buka ringkasan dan laporan saat kamu ingin memahami performa toko.' },
]

function FeatureSection() {
  return (
    <section className="tara-features-section" id="fitur" aria-labelledby="tara-features-title">
      <div className="tara-section-heading">
        <span className="tara-eyebrow">SATU TEMPAT UNTUK OPERASIONAL</span>
        <h2 id="tara-features-title">Lebih sedikit urusan yang tercecer.</h2>
        <p>Dari transaksi sampai laporan, pekerjaan penting tokomu punya alurnya sendiri.</p>
      </div>
      <div className="tara-feature-grid">
        {features.map(({ icon: Icon, eyebrow, title, description }) => (
          <article className="tara-feature-card" key={title}>
            <div className="tara-feature-top"><span className="tara-feature-icon"><Icon size={19} strokeWidth={1.7} aria-hidden="true" /></span><span>{eyebrow}</span></div>
            <h3>{title}</h3>
            <p>{description}</p>
            <span className="tara-feature-arrow" aria-hidden="true"><ArrowRight size={17} /></span>
          </article>
        ))}
      </div>
    </section>
  )
}

function StoreStorySection() {
  return (
    <section className="tara-story-section" id="manfaat" aria-labelledby="tara-story-title">
      <div className="tara-story-visual">
        <Image
          src="/cashier-experience.png"
          alt="Pemilik toko melayani pelanggan menggunakan perangkat kasir"
          fill
          sizes="(max-width: 760px) 100vw, 48vw"
          className="tara-story-image"
        />
        <div className="tara-story-image-shade" aria-hidden="true" />
        <div className="tara-story-image-label"><span><Store size={16} aria-hidden="true" /></span><small>UNTUK TOKO YANG TERUS BERGERAK</small></div>
        <div className="tara-story-note"><PackageCheck size={17} aria-hidden="true" /><span><b>Operasional lebih tertata</b><small>Satu langkah kecil setiap hari</small></span></div>
      </div>
      <div className="tara-story-copy">
        <span className="tara-eyebrow">WAKTUNYA FOKUS KE TOKO</span>
        <h2 id="tara-story-title">Biar kamu fokus melayani, bukan mencari catatan.</h2>
        <p>Tosmart membantu menyatukan aktivitas toko yang biasanya tersebar. Informasi yang kamu perlukan terasa lebih dekat, tanpa membuat rutinitas jadi rumit.</p>
        <ul>
          <li><span><PackageCheck size={15} aria-hidden="true" /></span>Produk dan stok mudah ditinjau</li>
          <li><span><ShoppingBasket size={15} aria-hidden="true" /></span>Transaksi harian lebih praktis dicatat</li>
          <li><span><BarChart3 size={15} aria-hidden="true" /></span>Ringkasan usaha siap saat dibutuhkan</li>
        </ul>
        <Link className="tara-text-link" href="/login">Kenali dashboard Tosmart <ArrowRight size={15} aria-hidden="true" /></Link>
      </div>
    </section>
  )
}

function WorkflowSection() {
  return (
    <section className="tara-workflow-section" id="cara-kerja" aria-labelledby="tara-workflow-title">
      <div className="tara-workflow-intro">
        <span className="tara-eyebrow">MULAI DARI YANG SEDERHANA</span>
        <h2 id="tara-workflow-title">Satu langkah rapi, setiap hari.</h2>
        <p>Alur kerja yang mudah diikuti membantu kamu mengelola toko dengan lebih terarah.</p>
      </div>
      <div className="tara-steps-grid">
        {steps.map((step) => (
          <article className="tara-step-card" key={step.number}>
            <span className="tara-step-number">{step.number}</span>
            <span className="tara-step-rule" aria-hidden="true" />
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function ClosingSection() {
  return (
    <section className="tara-closing-section" aria-labelledby="tara-closing-title">
      <div className="tara-closing-orb" aria-hidden="true" />
      <div className="tara-closing-content">
        <span className="tara-eyebrow">TOKO HARIAN, LANGKAH LEBIH RINGAN</span>
        <h2 id="tara-closing-title">Siap bikin urusan toko terasa lebih sederhana?</h2>
        <p>Masuk ke Tosmart dan mulai kelola aktivitas tokomu dengan lebih rapi.</p>
        <Link href="/login" className="tara-button tara-button-light">Masuk ke Tosmart <ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
      <div className="tara-closing-seal" aria-hidden="true"><Store size={21} /></div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="tara-footer">
      <Link href="/" className="tara-footer-brand" aria-label="Tosmart beranda">
        <Image src="/tosmart-full.png" alt="Tosmart" width={140} height={55} />
      </Link>
      <p>Operasional toko, lebih teratur.</p>
      <div className="tara-footer-links"><Link href="#fitur">Fitur</Link><Link href="#cara-kerja">Cara kerja</Link><Link href="/login">Masuk</Link></div>
      <span className="tara-footer-copyright">© {new Date().getFullYear()} Tosmart</span>
    </footer>
  )
}

export default function LandingSections() {
  return (
    <>
      <FeatureSection />
      <StoreStorySection />
      <WorkflowSection />
      <ClosingSection />
      <Footer />
    </>
  )
}
