'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '../../components/Header'
import { mapRelationVariationToSummary } from '@/lib/relations'

type VariationSummary = ReturnType<typeof mapRelationVariationToSummary>

const FILTERS = ['all', 'pending', 'approved', 'rejected', 'draft'] as const

export default function VariationsPage() {
  const [variations, setVariations] = useState<VariationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all')

  useEffect(() => {
    const loadVariations = async () => {
      try {
        const response = await fetch('/api/variations')
        if (!response.ok) {
          throw new Error('Failed to load variations')
        }

        const data = await response.json()
        setVariations(data.map(mapRelationVariationToSummary))
      } catch (error) {
        console.error('Failed to load variations:', error)
      } finally {
        setLoading(false)
      }
    }

    void loadVariations()
  }, [])

  const filteredVariations = variations.filter((variation) => {
    if (filter === 'all') return true
    if (filter === 'draft') return variation.status === 'DRAFT'
    return variation.approvalStatus.toLowerCase() === filter
  })

  const approvedValue = variations
    .filter((variation) => variation.approvalStatus === 'APPROVED')
    .reduce((sum, variation) => sum + variation.total, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="text-center text-gray-600">Loading variations...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Pipeline</p>
            <h1 className="text-3xl font-bold text-gray-900">Job variations</h1>
            <p className="mt-2 text-sm text-gray-600">Track drafted, sent, and client-approved variations across your projects.</p>
          </div>

          <Link href="/variations/new" className="btn-primary justify-center">
            Create Variation
          </Link>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-sm text-gray-500">Total variations</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{variations.length}</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-sm text-gray-500">Approved</div>
            <div className="mt-2 text-3xl font-bold text-green-600">
              {variations.filter((variation) => variation.approvalStatus === 'APPROVED').length}
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-sm text-gray-500">Approved value</div>
            <div className="mt-2 text-3xl font-bold text-blue-600">
              {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(approvedValue)}
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 rounded-xl bg-slate-100 p-2">
          {FILTERS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                filter === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredVariations.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center shadow">
              <div className="text-gray-500">No variations match this filter.</div>
            </div>
          ) : (
            filteredVariations.map((variation) => (
              <Link
                key={variation.id}
                href={`/variations/${variation.id}`}
                className="block rounded-xl bg-white p-5 shadow transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                      {variation.projectCode}
                    </div>
                    <h2 className="mt-1 text-xl font-semibold text-gray-900">{variation.projectName}</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {variation.clientName} • {variation.clientEmail}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                      {variation.status}
                    </span>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                      {variation.approvalStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
                  <span>{new Date(variation.createdAt).toLocaleDateString('en-AU')}</span>
                  <span className="text-xl font-bold text-blue-600">
                    {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(variation.total)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
