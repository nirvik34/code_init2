"use client"
import { useState } from 'react'
import { simplifyText } from '../../lib/api'

export default function SimplifyPage() {
  const [text, setText] = useState('')
  const [out, setOut] = useState('')
  const [loading, setLoading] = useState(false)

  const go = async () => {
    if (!text) return
    setLoading(true)
    try {
      const res = await simplifyText({ text })
      setOut(res.simplified_text)
    } finally {
      setLoading(false)
    }
  }

  const copyText = () => {
    navigator.clipboard.writeText(out)
  }

  const printText = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>SAMAAN - Simplified Text</title>
        <style>body { font-family: system-ui, sans-serif; max-width: 700px; margin: 40px auto; padding: 40px; line-height: 1.8; font-size: 18px; }</style>
        </head><body>${out}</body></html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Demo text for placeholder
  const demoSource = `"Pursuant to the amendments of Section 401(k) subsection 4(b) regarding annual cost-of-living adjustments, beneficiaries are hereby notified that the indexation factor for the upcoming fiscal quarter has been recalibrated to align with the Consumer Price Index (CPI-W) fluctuations observed in the preceding bi-annual period. Failure to submit form 1099-R by the stipulated deadline may result in a temporary suspension of disbursement."`

  return (
    <div className="bg-[#f6f8f6] font-public-sans antialiased h-screen flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <header className="flex-none flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 px-6 py-4 bg-white z-20 relative">
        <div className="flex items-center gap-4 text-samaan-ink">
          <div className="w-8 h-8 text-clarifier-green">
            <span className="material-symbols-outlined text-3xl">spa</span>
          </div>
          <h2 className="text-samaan-ink text-xl font-bold leading-tight tracking-tight">SAMAAN</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:block text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Language Clarifier v3.0
          </span>
          <div className="w-10 h-10 rounded-full bg-clarifier-green/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-clarifier-green">person</span>
          </div>
        </div>
      </header>

      {/* Main Split Canvas */}
      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">

        {/* ═══════════ Left Panel: Government Notice (Source) ═══════════ */}
        <section className="flex-1 bg-white p-8 lg:p-12 flex flex-col gap-6 border-r border-slate-100 relative z-10 overflow-y-auto">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="material-symbols-outlined text-[20px]">description</span>
            <h3 className="text-sm font-bold uppercase tracking-wider">Government Notice</h3>
          </div>

          <div className="flex-1">
            {/* If user has typed something, show their text */}
            {text ? (
              <p className="font-dm-serif italic text-3xl lg:text-4xl leading-snug text-samaan-ink-mid opacity-90">
                &ldquo;{text}&rdquo;
              </p>
            ) : (
              <p className="font-dm-serif italic text-3xl lg:text-4xl leading-snug text-samaan-ink-mid opacity-90">
                {demoSource}
              </p>
            )}
          </div>

          {/* Text input area */}
          <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paste complex text below</label>
              {text && (
                <button
                  onClick={() => { setText(''); setOut(''); }}
                  className="text-xs font-bold text-griev-primary hover:text-griev-primary-dark"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full h-32 p-4 text-slate-700 leading-relaxed outline-none resize-none bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-clarifier-green/20 focus:border-clarifier-green transition-all"
              placeholder="Paste government notices, legal text, pension rules, or any complex document here..."
            />
            <button
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-bold transition-all ${!text || loading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-clarifier-green text-white shadow-lg hover:bg-green-500 active:scale-[0.98]'
                }`}
              onClick={go}
              disabled={!text || loading}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>{loading ? 'Simplifying...' : 'Clarify Now'}</span>
            </button>
          </div>

          {/* Source context */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Source: Dept of Social Security • Document ID: #882-Alpha
            </p>
          </div>
        </section>

        {/* ═══════════ Right Panel: In Plain Words (Output) ═══════════ */}
        <section className="flex-1 bg-cream-clarifier p-8 lg:p-12 flex flex-col gap-6 relative overflow-hidden">
          {/* Decorative Coral Half-Circle */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-samaan-coral rounded-full opacity-20 pointer-events-none" />

          <div className="flex items-center gap-2 text-clarifier-green z-10">
            <span className="material-symbols-outlined text-[20px]">translate</span>
            <h3 className="text-sm font-bold uppercase tracking-wider">In Plain Words</h3>
          </div>

          <div className="flex-1 z-10 overflow-y-auto">
            {/* Empty state */}
            {!out && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center px-8">
                <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">translate</span>
                <p className="font-dm-sans font-light text-xl text-slate-400">
                  Simplified text will appear here.<br />No more legal headaches.
                </p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-clarifier-green/20 border-t-clarifier-green rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium animate-pulse">Consulting AI experts...</p>
              </div>
            )}

            {/* Output */}
            {out && !loading && (
              <p className="font-dm-sans font-light text-xl lg:text-2xl leading-relaxed text-samaan-ink">
                {out}
              </p>
            )}
          </div>

          {/* Insight Banner + Actions (show when we have output) */}
          {out && !loading && (
            <div className="mt-auto z-10">
              {/* Key Insight */}
              <div className="bg-white border-l-4 border-clarifier-green shadow-sm rounded-r-lg p-5 mb-8 flex gap-4 items-start">
                <span className="material-symbols-outlined text-clarifier-green mt-0.5">lightbulb</span>
                <div>
                  <p className="text-sm font-bold text-samaan-ink mb-1">Key Insight</p>
                  <p className="text-sm text-slate-600 font-dm-sans">
                    The main takeaway has been highlighted above. Any action items are marked for your attention.
                  </p>
                </div>
              </div>

              {/* Ghost Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={copyText}
                  className="group flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 hover:border-clarifier-green hover:text-clarifier-green transition-colors bg-transparent backdrop-blur-sm"
                >
                  <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">content_copy</span>
                  <span className="text-sm font-medium">Copy Text</span>
                </button>
                <button
                  onClick={printText}
                  className="group flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 hover:border-clarifier-green hover:text-clarifier-green transition-colors bg-transparent backdrop-blur-sm"
                >
                  <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">print</span>
                  <span className="text-sm font-medium">Print</span>
                </button>
                <button className="ml-auto group flex items-center gap-2 px-3 py-2.5 rounded-lg text-slate-400 hover:text-samaan-coral transition-colors">
                  <span className="material-symbols-outlined text-[20px]">thumb_up</span>
                </button>
                <button className="group flex items-center gap-2 px-3 py-2.5 rounded-lg text-slate-400 hover:text-samaan-coral transition-colors">
                  <span className="material-symbols-outlined text-[20px]">thumb_down</span>
                </button>
              </div>
            </div>
          )}

          {/* Show source context when no output */}
          {!out && !loading && (
            <div className="mt-auto z-10">
              <div className="bg-white/60 backdrop-blur-md border-l-4 border-clarifier-green/30 rounded-r-lg p-5 flex gap-4 items-start">
                <span className="material-symbols-outlined text-clarifier-green/50 mt-0.5">lightbulb</span>
                <div>
                  <p className="text-sm font-bold text-samaan-ink/50 mb-1">How it works</p>
                  <p className="text-sm text-slate-400 font-dm-sans">
                    Paste any complex legal text, government notice, or pension rule on the left. Our AI will break it down into simple, everyday language.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
