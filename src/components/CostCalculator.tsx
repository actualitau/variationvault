'use client';

import { useState, useEffect } from 'react';

interface CostCalculatorProps {
  onCostUpdate: (material: number, labor: number, gst: number, total: number) => void;
}

export function CostCalculator({ onCostUpdate }: CostCalculatorProps) {
  const [materialCost, setMaterialCost] = useState(0);
  const [laborCost, setLaborCost] = useState(0);
  const [gstRate] = useState(0.1); // 10% GST for Australia

  useEffect(() => {
    const subtotal = materialCost + laborCost;
    const gst = subtotal * gstRate;
    const total = subtotal + gst;
    
    onCostUpdate(materialCost, laborCost, gst, total);
  }, [materialCost, laborCost, gstRate, onCostUpdate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const subtotal = materialCost + laborCost;
  const gst = subtotal * gstRate;
  const total = subtotal + gst;

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h2 className="text-lg font-semibold mb-4">Cost Breakdown</h2>
      
      <div className="space-y-4">
        {/* Material Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Material Cost
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              value={materialCost || ''}
              onChange={(e) => setMaterialCost(Number(e.target.value) || 0)}
              className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* Labor Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Labor Cost
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              value={laborCost || ''}
              onChange={(e) => setLaborCost(Number(e.target.value) || 0)}
              className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Quick Add</div>
          <div className="grid grid-cols-4 gap-2">
            {[50, 100, 250, 500].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setLaborCost(prev => prev + amount)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm transition-colors"
              >
                +${amount}
              </button>
            ))}
          </div>
        </div>

        {/* Cost Summary */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">GST (10%):</span>
            <span className="font-medium">{formatCurrency(gst)}</span>
          </div>
          
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span className="text-blue-600">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Cost Per Hour Calculator */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-700 mb-2">Labor Rate Helper</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-gray-600">Apprentice</div>
              <div className="font-medium">$25-35/hr</div>
            </div>
            <div className="text-center">
              <div className="text-gray-600">Tradesman</div>
              <div className="font-medium">$45-65/hr</div>
            </div>
            <div className="text-center">
              <div className="text-gray-600">Specialist</div>
              <div className="font-medium">$75-95/hr</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}