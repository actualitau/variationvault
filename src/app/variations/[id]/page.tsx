'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Header } from '../../../components/Header'
import { getVariationImages } from '@/lib/variation-contract'
import { mapRelationVariationToDetail } from '@/lib/relations'

type VariationDetail = ReturnType<typeof mapRelationVariationToDetail>

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount)
}

export default function VariationDetailPage() {
  const params = useParams<{ id: string }>()
  const [variation, setVariation] = useState<VariationDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadVariation = async () => {
      if (!params.id) return

      try {
        const response = await fetch(`/api/variations/${params.id}`)
        if (!response.ok) throw new Error('Failed to load variation')
        const data = await response.json()
        setVariation(mapRelationVariationToDetail(data))
      } catch (error) {
        console.error('Failed to load variation:', error)
      } finally {
        setLoading(false)
      }
    }

    void loadVariation()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-4xl px-4 py-10 text-center text-gray-600">Loading variation...</div>
      </div>
    )
  }

  if (!variation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-4xl px-4 py-10 text-center">
          <div className="text-gray-500">Variation not found.</div>
          <Link href="/variations" className="mt-4 inline-flex text-blue-600 hover:text-blue-800">
            Back to variations
          </Link>
        </div>
      </div>
    )
  }

  const images = getVariationImages(variation)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-blue-200">{variation.projectCode}</div>
            <h1 className="mt-2 text-3xl font-bold">{variation.projectName}</h1>
            <p className="mt-2 text-sm text-slate-200">
              {variation.clientName} • {variation.clientEmail} • {variation.clientPhone}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{variation.status}</span>
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-100">
              {variation.approvalStatus.replace('_', ' ')}
            </span>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">
              Version {variation.version}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <section className="rounded-xl bg-white p-5 shadow">
              <h2 className="text-lg font-semibold text-gray-900">Scope</h2>
              <p className="mt-3 whitespace-pre-wrap text-gray-700">{variation.description}</p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-gray-500">Measurements</div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{variation.measurements}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Total Area</div>
                  <p className="mt-1 text-sm text-gray-700">{variation.totalArea}</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="text-sm font-medium text-gray-500">Items</div>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  {variation.items}
                </pre>
              </div>

              {variation.notes ? (
                <div className="mt-5">
                  <div className="text-sm font-medium text-gray-500">Notes</div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{variation.notes}</p>
                </div>
              ) : null}
            </section>

            {images.length > 0 ? (
              <section className="rounded-xl bg-white p-5 shadow">
                <h2 className="text-lg font-semibold text-gray-900">Evidence</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {images.map((image, index) => (
                    <img key={`${image}-${index}`} src={image} alt={`Variation evidence ${index + 1}`} className="h-40 w-full rounded-xl object-cover" />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <div className="space-y-6">
            <section className="rounded-xl bg-white p-5 shadow">
              <h2 className="text-lg font-semibold text-gray-900">Client & Site</h2>

              <div className="mt-4 space-y-4 text-sm text-gray-700">
                <div>
                  <div className="font-medium text-gray-500">Client</div>
                  <div>{variation.clientName}</div>
                  <div>{variation.clientEmail}</div>
                  <div>{variation.clientPhone}</div>
                </div>

                <div>
                  <div className="font-medium text-gray-500">Address</div>
                  <div>{variation.address}</div>
                  <div>
                    {variation.suburb}, {variation.state} {variation.postcode}
                  </div>
                </div>

                <div>
                  <div className="font-medium text-gray-500">Created</div>
                  <div>{new Date(variation.createdAt).toLocaleString('en-AU')}</div>
                </div>
              </div>
            </section>

            <section className="rounded-xl bg-white p-5 shadow">
              <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Labor</span>
                  <span>{formatCurrency(variation.totalLabor)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Materials</span>
                  <span>{formatCurrency(variation.totalMaterials)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>{formatCurrency(variation.tax)}</span>
                </div>
                <div className="flex justify-between border-t pt-3 text-xl font-bold text-blue-600">
                  <span>Total</span>
                  <span>{formatCurrency(variation.total)}</span>
                </div>
              </div>
            </section>

            <section className="rounded-xl bg-white p-5 shadow">
              <h2 className="text-lg font-semibold text-gray-900">Actions</h2>

              <div className="mt-4 space-y-3">
                <a href={`/api/export?variationId=${variation.id}`} className="btn-primary w-full justify-center">
                  Export PDF
                </a>
                <Link href={`/approve/${variation.id}`} className="flex w-full justify-center rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700">
                  Open Approval View
                </Link>
                <Link href="/variations" className="btn-secondary w-full justify-center">
                  Back to Variations
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
