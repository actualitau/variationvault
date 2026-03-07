'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Variation {
  id: string;
  jobId: string;
  clientEmail: string;
  description: string;
  reason: string;
  scopeChange: string;
  materialCost: number;
  laborCost: number;
  gst: number;
  totalCost: number;
  status: string;
  photos: string[];
}

export default function ApprovalPage() {
  const params = useParams();
  const [variation, setVariation] = useState<Variation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null);
  const [notes, setNotes] = useState('');
  const [signature, setSignature] = useState('');

  useEffect(() => {
    if (params.id) {
      loadVariation(params.id as string);
    }
  }, [params.id]);

  const loadVariation = async (id: string) => {
    try {
      const response = await fetch(`/api/variations/${id}`);
      if (response.ok) {
        const data = await response.json();
        setVariation(data);
      }
    } catch (error) {
      console.error('Failed to load variation:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitDecision = async () => {
    if (!variation || !decision) return;
    
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variationId: variation.id,
          decision,
          notes,
          signature
        }),
      });

      if (response.ok) {
        // Show success message
        setDecision(decision); // This will trigger the success view
      } else {
        alert('Failed to submit decision');
      }
    } catch (error) {
      alert('Error submitting decision');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Loading variation...</div>
          <div className="text-gray-600">Please wait</div>
        </div>
      </div>
    );
  }

  if (!variation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Variation not found</div>
          <div className="text-gray-600">This approval link may be invalid or expired</div>
        </div>
      </div>
    );
  }

  if (variation.status !== 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Already processed</div>
          <div className="text-gray-600">This variation has already been {variation.status}</div>
        </div>
      </div>
    );
  }

  // Success view after submission
  if (submitting === false && decision) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            decision === 'approved' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <div className={`text-2xl ${decision === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
              {decision === 'approved' ? '✓' : '✗'}
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">
            Variation {decision === 'approved' ? 'Approved' : 'Rejected'}
          </h1>
          
          <p className="text-gray-600 mb-6">
            Thank you for your decision. The contractor has been notified.
          </p>
          
          <div className="bg-white rounded-lg p-4 shadow text-left">
            <div className="text-sm text-gray-600">Job {variation.jobId}</div>
            <div className="font-medium">{variation.description}</div>
            <div className="text-lg font-bold text-blue-600 mt-2">
              {formatCurrency(variation.totalCost)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-center">Variation Approval</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Variation Summary */}
        <div className="bg-white rounded-lg p-4 shadow mb-6">
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-gray-900">Job {variation.jobId}</div>
            <div className="text-gray-600">{variation.clientEmail}</div>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Description</div>
              <div className="font-medium">{variation.description}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">Reason for change</div>
              <div className="capitalize">{variation.reason.replace('-', ' ')}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">What's changing</div>
              <div>{variation.scopeChange}</div>
            </div>
          </div>
        </div>

        {/* Photos */}
        {variation.photos.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow mb-6">
            <h3 className="font-semibold mb-3">Photos</h3>
            <div className="grid grid-cols-2 gap-3">
              {variation.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Evidence ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                  onClick={() => window.open(photo, '_blank')}
                />
              ))}
            </div>
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="bg-white rounded-lg p-4 shadow mb-6">
          <h3 className="font-semibold mb-3">Cost</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Materials:</span>
              <span>{formatCurrency(variation.materialCost)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Labor:</span>
              <span>{formatCurrency(variation.laborCost)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">GST (10%):</span>
              <span>{formatCurrency(variation.gst)}</span>
            </div>
            
            <div className="flex justify-between text-xl font-bold border-t pt-2">
              <span>Total:</span>
              <span className="text-blue-600">{formatCurrency(variation.totalCost)}</span>
            </div>
          </div>
        </div>

        {/* Decision Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setDecision('approved')}
              className={`py-4 px-6 rounded-lg font-semibold transition-colors ${
                decision === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 hover:bg-green-200 text-green-800'
              }`}
            >
              ✓ Approve
            </button>
            
            <button
              onClick={() => setDecision('rejected')}
              className={`py-4 px-6 rounded-lg font-semibold transition-colors ${
                decision === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 hover:bg-red-200 text-red-800'
              }`}
            >
              ✗ Reject
            </button>
          </div>

          {/* Notes */}
          {decision && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Any additional comments..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Digital Signature
                </label>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your full name"
                  required
                />
              </div>

              <button
                onClick={submitDecision}
                disabled={!signature || submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
              >
                {submitting ? 'Submitting...' : `Submit ${decision === 'approved' ? 'Approval' : 'Rejection'}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}