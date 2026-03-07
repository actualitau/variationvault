import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-xl font-bold">VariationVault</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/dashboard" className="hover:text-blue-400 transition">Dashboard</Link>
          <Link href="/new" className="hover:text-blue-400 transition">New Estimate</Link>
          <a href="#features" className="hover:text-blue-400 transition">Features</a>
        </nav>
        <a 
          href="/dashboard" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          Dashboard
        </a>
      </div>
    </header>
  )
}
