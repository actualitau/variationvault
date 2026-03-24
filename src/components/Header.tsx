import Link from 'next/link'

export const Header = () => {
  return (
    <header className="bg-slate-900 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-600 p-2">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <div className="text-lg font-bold">VariationVault</div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Job Variations</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/variations" className="text-sm text-slate-200 transition hover:text-white">
            Pipeline
          </Link>
          <Link href="/variations/new" className="text-sm text-slate-200 transition hover:text-white">
            New Variation
          </Link>
        </nav>

        <Link href="/variations" className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700">
          Open App
        </Link>
      </div>
    </header>
  )
}

export default Header
