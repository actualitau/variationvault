'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '../../../components/Header';

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
  createdAt: string;
  photos: string[];
  approvedAt?: string;
  rejectedAt?: string;
  notes?: string;
}

export default function VariationDetailPage() {
  const params = useParams();
  const [variation, setVariation] = useState<Variation | null>(null);
  const [loading, setLoading] = useState(true);

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

  const exportToPDF = async () => {
    if (!variation) return;
    
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variationId: variation.id }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `variation-${variation.jobId}-${variation.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to export PDF');
      }
    } catch (error) {
      alert('Error exporting PDF');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-AU');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="text-center">Loading variation...</div>
        </div>
      </div>
    );
  }

  if (!variation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-gray-500 mb-4">Variation not found</div>
            <a href="/variations" className="text-blue-600 hover:text-blue-800">
              Back to variations
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Job {variation.jobId}
          </h1>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(variation.status)}`}>
            {variation.status}
          </span>
        </div>

        {/* Variation Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold mb-3">Details</h2>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Client</div>
                <div className="font-medium">{variation.clientEmail}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Description</div>
                <div>{variation.description}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Reason</div>
                <div className="capitalize">{variation.reason.replace('-', ' ')}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Scope Change</div>
                <div>{variation.scopeChange}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Created</div>
                <div>{formatDate(variation.createdAt)}</div>
              </div>
            </div>
          </div>

          {/* Photo Evidence */}
          {variation.photos.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow">
              <h2 className="text-lg font-semibold mb-3">Photo Evidence</h2>
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
          <div className="bg-white rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold mb-3">Cost Breakdown</h2>
            
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
              
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-blue-600">{formatCurrency(variation.totalCost)}</span>
              </div>
            </div>
          </div>

          {/* Status Information */}
          {(variation.approvedAt || variation.rejectedAt || variation.notes) && (
            <div className="bg-white rounded-lg p-4 shadow">
              <h2 className="text-lg font-semibold mb-3">Status Details</h2>
              
              <div className="space-y-2">
                {variation.approvedAt && (
                  <div>
                    <div className="text-sm text-gray-600">Approved</div>
                    <div>{formatDate(variation.approvedAt)}</div>
                  </div>
                )}
                
                {variation.rejectedAt && (
                  <div>
                    <div className="text-sm text-gray-600">Rejected</div>
                    <div>{formatDate(variation.rejectedAt)}</div>
                  </div>
                )}
                
                {variation.notes && (
                  <div>
                    <div className="text-sm text-gray-600">Notes</div>
                    <div>{variation.notes}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={exportToPDF}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Export PDF
            </button>
            
            {variation.status.toLowerCase() === 'pending' && (
              <a
                href={`/approve/${variation.id}`}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center block"
              >
                Send for Approval
              </a>
            )}
            
            <a
              href="/variations"
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors text-center block"
            >
              Back to Variations
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}