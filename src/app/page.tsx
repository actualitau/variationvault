import Link from 'next/link'
import { Header } from '../components/Header'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-600">VariationVault</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Estimate, approve, and document variation work without losing context.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-600">
              VariationVault captures project scope, client details, evidence images, pricing, and approvals in one
              workflow built for tradie teams.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/variations/new" className="btn-primary justify-center">
                Create Estimate
              </Link>
              <Link href="/variations" className="btn-secondary justify-center">
                View Pipeline
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl bg-white p-5 shadow">
              <div className="text-sm text-gray-500">What the product now tracks</div>
              <ul className="mt-4 space-y-3 text-sm text-gray-700">
                <li>Project ID, project name, client details, and full site address</li>
                <li>Measurements, total area, line items, labor, materials, and tax</li>
                <li>Version history, evidence images, PDF exports, and approval status</li>
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-900 p-4 text-white shadow">
                <div className="text-2xl font-bold">&lt;60s</div>
                <div className="mt-1 text-sm text-slate-300">Estimate creation</div>
              </div>
              <div className="rounded-2xl bg-emerald-600 p-4 text-white shadow">
                <div className="text-2xl font-bold">Client</div>
                <div className="mt-1 text-sm text-emerald-100">Approval workflow</div>
              </div>
              <div className="rounded-2xl bg-blue-600 p-4 text-white shadow">
                <div className="text-2xl font-bold">PDF</div>
                <div className="mt-1 text-sm text-blue-100">Exportable record</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
