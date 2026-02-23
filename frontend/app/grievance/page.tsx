"use client"
import { useState } from 'react'
import { generateGrievance } from '../../lib/api'
import { jsPDF } from 'jspdf'

export default function GrievancePage() {
  const [form, setForm] = useState({
    scheme: 'IGNOAPS',
    last_payment: '2024-01-10',
    delay_days: 45,
    name: 'Ramesh Kumar',
  })
  const [letter, setLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [grievanceType, setGrievanceType] = useState('Delayed Pension Payment')
  const [recipient, setRecipient] = useState('Central Pension Accounting Office')
  const [ppo, setPpo] = useState('PPO-2849-KJD-2023')
  const [incidentDate, setIncidentDate] = useState('2023-10-15')
  const [subject, setSubject] = useState('')

  const submit = async () => {
    setLoading(true)
    try {
      const res = await generateGrievance(form as any)
      setLetter(res.letter)
    } finally {
      setLoading(false)
    }
  }

  const downloadPdf = () => {
    const doc = new jsPDF()
    const textLines = doc.splitTextToSize(letter || 'No letter generated.', 180)
    doc.text(textLines, 15, 20)
    doc.save('Grievance_Letter_SAMAAN.pdf')
  }

  const copyText = () => {
    navigator.clipboard.writeText(letter)
  }

  const printLetter = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>SAMAAN Grievance Letter</title>
        <style>body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 40px; line-height: 1.8; }</style>
        </head><body><pre style="white-space: pre-wrap; font-family: Georgia, serif;">${letter}</pre></body></html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Get formatted date
  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="bg-cream-griev text-ink font-public-sans min-h-screen flex flex-col antialiased selection:bg-griev-primary/20 selection:text-griev-primary overflow-hidden">
      {/* Top Navigation */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-border-color sticky top-0 z-50 h-16 flex items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-2">
          {/* Logo S. */}
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-indigo-logo tracking-tighter">S</span>
            <span className="text-3xl font-bold text-griev-primary">.</span>
          </div>
          <div className="h-6 w-px bg-border-color mx-4" />
          <h1 className="text-sm font-semibold text-text-muted uppercase tracking-wide hidden sm:block">
            Grievance Letter Generator v3.0
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-text-muted hover:text-griev-primary transition-colors rounded-full hover:bg-cream-griev">
            <span className="material-symbols-outlined text-[24px]">help</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-cream-griev hover:bg-border-color/30 transition-colors rounded-full border border-border-color">
            <span className="material-symbols-outlined text-[20px] text-ink">person</span>
            <span className="text-sm font-medium text-ink pr-1">{form.name.split(' ')[0]}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">

        {/* ═══════════ LEFT: Input Form ═══════════ */}
        <aside className="w-full lg:w-[420px] bg-white border-r border-border-color flex flex-col h-full z-10 shadow-soft">
          <div className="p-6 border-b border-border-color bg-white">
            <h2 className="text-2xl font-bold text-indigo-logo mb-1">Letter Details</h2>
            <p className="text-text-muted text-sm">Fill in the details to draft your formal grievance.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">Full Name</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-border-color bg-white text-ink focus:ring-2 focus:ring-griev-primary/20 focus:border-griev-primary transition-shadow placeholder:text-text-muted/50 font-medium outline-none"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
              />
            </div>

            {/* Grievance Type / Scheme */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">Pension Scheme</label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-10 py-3 rounded-lg border border-border-color bg-cream-griev text-ink focus:ring-2 focus:ring-griev-primary/20 focus:border-griev-primary appearance-none transition-shadow cursor-pointer outline-none"
                  value={form.scheme}
                  onChange={e => setForm({ ...form, scheme: e.target.value })}
                >
                  <option value="IGNOAPS">Indira Gandhi Old Age Pension (IGNOAPS)</option>
                  <option value="IGNWPS">Indira Gandhi Widow Pension (IGNWPS)</option>
                  <option value="EPF95">EPF Scheme 1995</option>
                  <option value="Railway">Railway Pension</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                  <span className="material-symbols-outlined">expand_more</span>
                </span>
              </div>
            </div>

            {/* Recipient Authority */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">Recipient Authority</label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-10 py-3 rounded-lg border border-border-color bg-cream-griev text-ink focus:ring-2 focus:ring-griev-primary/20 focus:border-griev-primary appearance-none transition-shadow cursor-pointer outline-none"
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                >
                  <option>Central Pension Accounting Office</option>
                  <option>Bank Branch Manager</option>
                  <option>District Treasury Officer</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                  <span className="material-symbols-outlined">expand_more</span>
                </span>
              </div>
            </div>

            {/* Last Payment Date */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">Last Payment Date</label>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-lg border border-border-color bg-white text-ink focus:ring-2 focus:ring-griev-primary/20 focus:border-griev-primary transition-shadow font-medium outline-none"
                value={form.last_payment}
                onChange={e => setForm({ ...form, last_payment: e.target.value })}
              />
            </div>

            {/* Days of Delay */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">Days of Delay</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-lg border border-border-color bg-white text-ink focus:ring-2 focus:ring-griev-primary/20 focus:border-griev-primary transition-shadow font-medium outline-none"
                value={form.delay_days}
                onChange={e => setForm({ ...form, delay_days: Number(e.target.value) })}
              />
            </div>

            {/* Subject Override*/}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">Subject Line Override (Optional)</label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-border-color bg-white text-ink focus:ring-2 focus:ring-griev-primary/20 focus:border-griev-primary transition-shadow resize-none placeholder:text-text-muted/50 outline-none"
                placeholder="Auto-generated based on selection..."
                rows={2}
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>
          </div>

          {/* Action Area */}
          <div className="p-6 border-t border-border-color bg-cream-griev/50">
            <button
              className={`w-full font-bold py-3.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group ${loading
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-griev-primary hover:bg-griev-primary-dark text-white'
                }`}
              onClick={submit}
              disabled={loading}
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {!loading && <span className="material-symbols-outlined group-hover:animate-pulse">auto_fix_high</span>}
              {loading ? 'Drafting Letter...' : 'Generate Letter'}
            </button>
            <p className="text-xs text-center text-text-muted mt-3">
              {letter ? 'Letter generated successfully' : 'Click to generate your letter'}
            </p>
          </div>
        </aside>

        {/* ═══════════ RIGHT: Preview Area ═══════════ */}
        <section className="flex-1 bg-cream-griev relative flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="h-16 flex items-center justify-between px-6 lg:px-12 border-b border-border-color/50 bg-cream-griev/80 backdrop-blur-sm z-20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-griev-primary">description</span>
              <span className="text-sm font-semibold text-indigo-logo">Preview Mode</span>
            </div>
            {letter && (
              <div className="flex items-center gap-2">
                <button
                  onClick={printLetter}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text-muted hover:text-indigo-logo hover:bg-white rounded-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  Print
                </button>
                <button
                  onClick={downloadPdf}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text-muted hover:text-indigo-logo hover:bg-white rounded-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  PDF
                </button>
                <button
                  onClick={copyText}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-griev-primary bg-griev-primary/10 hover:bg-griev-primary/20 rounded-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  Copy Text
                </button>
              </div>
            )}
          </div>

          {/* Paper Container */}
          <div className="flex-1 overflow-y-auto p-8 lg:p-12 flex justify-center bg-[radial-gradient(#e6dedb_1px,transparent_1px)] [background-size:16px_16px]">
            {/* Empty State */}
            {!letter && !loading && (
              <div className="w-full max-w-[800px] bg-white shadow-paper rounded-sm min-h-[600px] p-12 lg:p-16 relative mx-auto flex flex-col items-center justify-center text-center bg-gradient-to-b from-white to-[#fafafa]">
                <span className="material-symbols-outlined text-border-color text-7xl mb-6">edit_document</span>
                <h3 className="text-2xl font-bold text-indigo-logo mb-2 font-dm-serif">Ready to Draft</h3>
                <p className="text-text-muted max-w-sm">
                  Fill in the details on the left panel and click &quot;Generate Letter&quot; to see your formal grievance appear here.
                </p>
                {/* Watermark */}
                <div className="absolute bottom-8 left-0 w-full text-center">
                  <p className="text-[10px] text-border-color uppercase tracking-[0.2em]">Generated via Samaan v3.0</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="w-full max-w-[800px] bg-white shadow-paper rounded-sm min-h-[600px] p-12 lg:p-16 relative mx-auto flex flex-col items-center justify-center bg-gradient-to-b from-white to-[#fafafa]">
                <div className="w-16 h-16 border-4 border-border-color border-t-griev-primary rounded-full animate-spin mb-6" />
                <p className="text-text-muted font-medium animate-pulse">Our AI legal assistant is drafting your letter...</p>
              </div>
            )}

            {/* Letter Preview */}
            {letter && !loading && (
              <div className="w-full max-w-[800px] bg-white shadow-paper rounded-sm min-h-[1000px] p-12 lg:p-16 relative mx-auto mb-12 bg-gradient-to-b from-white to-[#fafafa]">
                {/* Letter Header */}
                <div className="flex justify-between items-start mb-12">
                  <div className="font-dm-serif text-ink">
                    <p className="text-lg font-bold">{form.name}</p>
                    <p className="text-text-muted italic">Pensioner • {form.scheme}</p>
                    <p className="text-sm mt-1 text-text-muted">Pension Scheme: {form.scheme}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-ink">{formatDate()}</p>
                  </div>
                </div>

                {/* Recipient */}
                <div className="mb-10 text-sm text-ink">
                  <p className="font-bold uppercase tracking-wide text-xs text-text-muted mb-1">To,</p>
                  <p className="font-bold">{recipient},</p>
                  <p className="text-text-muted">Government of India</p>
                </div>

                {/* Subject */}
                <div className="mb-8">
                  <p className="font-dm-serif text-lg font-bold text-indigo-logo border-b-2 border-griev-primary/20 pb-2 inline-block">
                    Subject: {subject || `Grievance regarding delay in pension credit — ${form.scheme}`}
                  </p>
                </div>

                {/* Body */}
                <div className="space-y-6 text-base leading-relaxed text-ink font-dm-serif text-justify">
                  <pre className="whitespace-pre-wrap font-dm-serif leading-relaxed">{letter}</pre>
                </div>

                {/* Closing */}
                <div className="mt-16">
                  <p className="font-dm-serif text-base text-ink mb-8">Sincerely,</p>
                  <div className="h-20 flex items-end">
                    <span className="font-dm-serif text-4xl text-indigo-logo italic opacity-80">
                      {form.name.split(' ')[0]}
                    </span>
                  </div>
                  <p className="mt-2 font-bold text-sm text-ink uppercase tracking-wider border-t border-border-color pt-2 inline-block">
                    {form.name}
                  </p>
                </div>

                {/* Watermark */}
                <div className="absolute bottom-8 left-0 w-full text-center">
                  <p className="text-[10px] text-border-color uppercase tracking-[0.2em]">Generated via Samaan v3.0</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
