'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getVariationImages, normalizeApprovalDecision, type ApprovalDecision } from '@/lib/variation-contract'
import { mapRelationVariationToDetail } from '@/lib/relations'

type VariationDetail = ReturnType<typeof mapRelationVariationToDetail>

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount)
}

export default function ApprovalPage() {
  const params = useParams<{ id: string }>()
  const [variation, setVariation] = useState<VariationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [decision, setDecision] = useState<ApprovalDecision | null>(null)
  const [notes, setNotes] = useState('')
  const [signature, setSignature] = useState('')
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null)

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

  const submitDecision = async () => {
    if (!variation || !decision || !signature.trim()) return

    setSubmitting(true)

    try {
      const status = normalizeApprovalDecision(decision)
      const response = await fetch('/api/approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variationId: variation.id,
          status,
          comments: notes,
          signature,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit approval')
      setSubmittedStatus(status)
    } catch (error) {
      console.error('Failed to submit approval:', error)
      alert('Failed to submit approval')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-600">Loading variation...</div>
  }

  if (!variation) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-600">Variation not found.</div>
  }

  if (submittedStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow">
          <h1 className="text-2xl font-bold text-slate-900">
            {submittedStatus === 'APPROVED' ? 'Variation approved' : 'Response received'}
          </h1>
          <p className="mt-2 text-gray-600">Your decision has been recorded and the contractor has been notified.</p>
        </div>
      </div>
    )
  }

  if (variation.approvalStatus !== 'PENDING') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow">
          <h1 className="text-2xl font-bold text-slate-900">Already processed</h1>
          <p className="mt-2 text-gray-600">
            This variation has already been marked as {variation.approvalStatus.replace('_', ' ').toLowerCase()}.
          </p>
        </div>
      </div>
    )
  }

  const images = getVariationImages(variation)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-slate-900 text-white shadow-sm">
        <div className="mx-auto max-w-3xl px-4 py-4 text-center">
          <h1 className="text-xl font-bold">Variation Approval</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="space-y-6">
          <section className="rounded-xl bg-white p-5 shadow">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{variation.projectCode}</div>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{variation.projectName}</h2>
            <p className="mt-2 text-sm text-gray-600">
              {variation.clientName} • {variation.clientEmail}
            </p>
            <div className="mt-5 whitespace-pre-wrap text-sm text-gray-700">{variation.description}</div>
          </section>

          {images.length > 0 ? (
            <section className="rounded-xl bg-white p-5 shadow">
              <h3 className="text-lg font-semibold text-slate-900">Evidence</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {images.map((image, index) => (
                  <img key={`${image}-${index}`} src={image} alt={`Evidence ${index + 1}`} className="h-40 w-full rounded-xl object-cover" />
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-xl bg-white p-5 shadow">
            <h3 className="text-lg font-semibold text-slate-900">Variation Total</h3>
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
            <h3 className="text-lg font-semibold text-slate-900">Your Decision</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button type="button" onClick={() => setDecision('approved')} className="rounded-lg bg-emerald-100 px-4 py-4 font-semibold text-emerald-800">
                Approve
              </button>
              <button type="button" onClick={() => setDecision('changes_requested')} className="rounded-lg bg-amber-100 px-4 py-4 font-semibold text-amber-900">
                Request Changes
              </button>
              <button type="button" onClick={() => setDecision('rejected')} className="rounded-lg bg-rose-100 px-4 py-4 font-semibold text-rose-800">
                Reject
              </button>
            </div>

            {decision ? (
              <div className="mt-5 space-y-4">
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="form-input"
                  rows={4}
                  placeholder="Add any notes for the contractor."
                />
                <input
                  type="text"
                  value={signature}
                  onChange={(event) => setSignature(event.target.value)}
                  className="form-input"
                  placeholder="Type your full name"
                  required
                />
                <button type="button" onClick={submitDecision} disabled={!signature.trim() || submitting} className="btn-primary w-full justify-center">
                  {submitting ? 'Submitting...' : 'Submit Response'}
                </button>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  )
}
