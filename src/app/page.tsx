import Link from 'next/link';
import { Header } from '../components/Header';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            VariationVault
          </h1>
          <p className="text-gray-600">
            Quick variation approvals for Australian tradies
          </p>
        </div>

        <div className="space-y-4">
          <Link 
            href="/variations/new"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center block transition-colors"
          >
            Create New Variation
          </Link>
          
          <Link 
            href="/variations"
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg text-center block transition-colors"
          >
            View All Variations
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">&lt;60s</div>
            <div className="text-sm text-gray-600">Create</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">&lt;30s</div>
            <div className="text-sm text-gray-600">Approve</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">&lt;15s</div>
            <div className="text-sm text-gray-600">Export</div>
          </div>
        </div>
      </div>
    </div>
  );
}