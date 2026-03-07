'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';

interface Variation {
  id: string;
  jobId: string;
  description: string;
  totalCost: number;
  status: string;
  createdAt: string;
  clientEmail: string;
}

export default function VariationsPage() {
  const [variations, setVariations] = useState<Variation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadVariations();
  }, []);

  const loadVariations = async () => {
    try {
      const response = await fetch('/api/variations');
      if (response.ok) {
        const data = await response.json();
        setVariations(data);
      }
    } catch (error) {
      console.error('Failed to load variations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
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

  const filteredVariations = variations.filter(variation => {
    if (filter === 'all') return true;
    return variation.status.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="text-center">Loading variations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Variations</h1>
          <Link 
            href="/variations/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
          >
            New
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-200 rounded-lg p-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                filter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Variations List */}
        <div className="space-y-4">
          {filteredVariations.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">No variations found</div>
              <Link 
                href="/variations/new"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Create First Variation
              </Link>
            </div>
          ) : (
            filteredVariations.map((variation) => (
              <Link
                key={variation.id}
                href={`/variations/${variation.id}`}
                className="block bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">
                      Job {variation.jobId}
                    </div>
                    <div className="text-sm text-gray-600">
                      {variation.description.length > 50
                        ? `${variation.description.substring(0, 50)}...`
                        : variation.description}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(variation.status)}`}>
                    {variation.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(variation.totalCost)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(variation.createdAt)}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {variations.length > 0 && (
          <div className="mt-8 bg-white rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {variations.length}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {variations.filter(v => v.status.toLowerCase() === 'approved').length}
                </div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(
                    variations
                      .filter(v => v.status.toLowerCase() === 'approved')
                      .reduce((sum, v) => sum + v.totalCost, 0)
                  )}
                </div>
                <div className="text-sm text-gray-600">Value</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}