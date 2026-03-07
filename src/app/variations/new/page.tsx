'use client';

import { useState } from 'react';
import { Header } from '../../../components/Header';
import { PhotoUpload } from '../../../components/PhotoUpload';
import { CostCalculator } from '../../../components/CostCalculator';

export default function NewVariationPage() {
  const [formData, setFormData] = useState({
    jobId: '',
    clientEmail: '',
    description: '',
    reason: '',
    scopeChange: '',
    materialCost: 0,
    laborCost: 0,
    gst: 0,
    totalCost: 0,
    photos: [] as string[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/variations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const variation = await response.json();
        window.location.href = `/variations/${variation.id}`;
      } else {
        alert('Failed to create variation');
      }
    } catch (error) {
      alert('Error creating variation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCosts = (material: number, labor: number, gst: number, total: number) => {
    setFormData(prev => ({
      ...prev,
      materialCost: material,
      laborCost: labor,
      gst,
      totalCost: total
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Create Variation
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Details */}
          <div className="bg-white rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold mb-4">Job Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job ID
                </label>
                <input
                  type="text"
                  value={formData.jobId}
                  onChange={(e) => setFormData(prev => ({ ...prev, jobId: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter job ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Email
                </label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="client@example.com"
                  required
                />
              </div>
            </div>
          </div>

          {/* Variation Description */}
          <div className="bg-white rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold mb-4">Variation Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the variation work"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Change
                </label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select reason</option>
                  <option value="client-request">Client Request</option>
                  <option value="site-conditions">Site Conditions</option>
                  <option value="material-change">Material Change</option>
                  <option value="scope-addition">Additional Scope</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scope Change
                </label>
                <textarea
                  value={formData.scopeChange}
                  onChange={(e) => setFormData(prev => ({ ...prev, scopeChange: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="What's changing from the original scope?"
                  required
                />
              </div>
            </div>
          </div>

          {/* Photo Evidence */}
          <PhotoUpload 
            photos={formData.photos}
            onPhotosChange={(photos) => setFormData(prev => ({ ...prev, photos }))}
          />

          {/* Cost Calculator */}
          <CostCalculator onCostUpdate={updateCosts} />

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Variation'}
          </button>
        </form>
      </div>
    </div>
  );
}