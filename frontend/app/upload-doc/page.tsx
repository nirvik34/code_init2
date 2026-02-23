"use client"
import { useState } from 'react'
import { ocrExtract } from '../../lib/api'
import Link from 'next/link'
import TopNav from '../../components/TopNav'

export default function UploadDoc() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showAccount, setShowAccount] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [logs, setLogs] = useState<string[]>([
    '> Initializing SAMAAN v3.0 kernel...',
    '> User session authenticated.',
    '> Waiting for input stream...',
  ])

  const submit = async () => {
    if (!file) return
    setLoading(true)
    setLogs(prev => [...prev, `> Processing file: ${file.name}...`])
    try {
      const res = await ocrExtract(file)
      setResult(res)
      setLogs(prev => [...prev, '> Document parsed successfully.', `> Extracted ${Object.keys(res || {}).length} fields.`])
    } catch (err) {
      setLogs(prev => [...prev, '> ERROR: Extraction failed. Please retry.'])
      alert("Error extracting text. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="font-display bg-[#f6f6f8] text-slate-900 flex flex-col min-h-screen">
      <TopNav />
      <div className="relative flex flex-1 w-full flex-row">
        {/* ═══════════ Left Panel: Functional Area ═══════════ */}
        <div className="flex flex-col w-full lg:w-2/3 xl:w-7/12 bg-white overflow-y-auto relative z-10 shadow-xl">

          {/* Main Content Area */}
          <div className="flex-1 px-8 py-8 lg:px-12">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 mb-2">Document Reader v3.0</h1>
              <p className="text-slate-500 text-lg">Securely upload and verify your pension documents.</p>
            </div>

            {/* Two Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* Col 1: Upload & Logs */}
              <div className="flex flex-col gap-6">
                {/* Dropzone */}
                <div
                  className="group relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 transition-all hover:border-doc-primary hover:bg-doc-primary/5 cursor-pointer"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                  <div className="rounded-full bg-white p-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-doc-primary text-4xl">
                      {file ? 'check_circle' : 'cloud_upload'}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-900 text-lg font-bold">
                      {file ? file.name : 'Upload Documents'}
                    </p>
                    <p className="text-slate-500 text-sm mt-1">
                      {file ? 'Click to change file' : 'Drag & drop pension documents here'}
                    </p>
                  </div>
                  {!file && (
                    <button className="mt-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50">
                      Browse Files
                    </button>
                  )}
                  {file && !loading && (
                    <button
                      className="mt-2 rounded-lg bg-doc-primary px-6 py-2 text-sm font-bold text-white shadow-sm hover:bg-doc-primary/90"
                      onClick={(e) => { e.stopPropagation(); submit(); }}
                    >
                      Extract Details
                    </button>
                  )}
                  {loading && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <div className="w-5 h-5 border-2 border-doc-primary/30 border-t-doc-primary rounded-full animate-spin" />
                      Processing...
                    </div>
                  )}
                </div>

                {/* Console */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <button
                    className="flex cursor-pointer items-center justify-between bg-slate-50 px-4 py-3 hover:bg-slate-100 transition-colors w-full"
                    onClick={() => setLogOpen(!logOpen)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-600 text-lg">terminal</span>
                      <span className="text-sm font-medium text-slate-700">System Log</span>
                    </div>
                    <span className={`material-symbols-outlined text-slate-400 transition-transform ${logOpen ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  {logOpen && (
                    <div className="bg-slate-900 p-4 font-mono text-xs">
                      {logs.map((l, i) => (
                        <p key={i} className="text-green-400 mb-1">{l}</p>
                      ))}
                      <p className="text-green-400/50 animate-pulse">_</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Col 2: Extracted Data */}
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Extracted Data</h2>
                  {result && (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Verified
                    </span>
                  )}
                </div>

                {!result && !loading && (
                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                    <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">description</span>
                    <p className="text-slate-400 font-medium">Upload a document to see extracted data</p>
                  </div>
                )}

                {loading && (
                  <div className="flex-1 flex flex-col items-center justify-center p-12">
                    <div className="w-12 h-12 border-4 border-doc-primary/20 border-t-doc-primary rounded-full animate-spin mb-4" />
                    <p className="text-slate-500 font-medium animate-pulse">Analyzing document...</p>
                  </div>
                )}

                {result && !loading && (
                  <div className="flex-1 flex flex-col gap-3">
                    {/* Data Row 1 */}
                    <div className="flex flex-col sm:flex-row rounded-lg border border-slate-100 overflow-hidden shadow-sm">
                      <div className="bg-cream-dark/50 sm:w-1/3 px-4 py-3 flex items-center">
                        <span className="text-sm font-medium text-slate-600">Full Name</span>
                      </div>
                      <div className="bg-white flex-1 px-4 py-3 flex items-center border-t sm:border-t-0 sm:border-l border-slate-100">
                        <span className="text-base font-medium text-slate-900">{result.name || '---'}</span>
                      </div>
                    </div>
                    {/* Data Row 2 */}
                    <div className="flex flex-col sm:flex-row rounded-lg border border-slate-100 overflow-hidden shadow-sm">
                      <div className="bg-cream-dark/50 sm:w-1/3 px-4 py-3 flex items-center">
                        <span className="text-sm font-medium text-slate-600">Pension ID</span>
                      </div>
                      <div className="bg-white flex-1 px-4 py-3 flex items-center border-t sm:border-t-0 sm:border-l border-slate-100">
                        <span className="text-base font-medium text-slate-900 font-mono tracking-wide">{result.pension_id || '---'}</span>
                      </div>
                    </div>
                    {/* Data Row 3 (Masked) */}
                    <div className="flex flex-col sm:flex-row rounded-lg border border-slate-100 overflow-hidden shadow-sm ring-1 ring-doc-primary/10">
                      <div className="bg-cream-dark/50 sm:w-1/3 px-4 py-3 flex items-center">
                        <span className="text-sm font-medium text-slate-600">Account No.</span>
                      </div>
                      <div className="bg-white flex-1 px-4 py-3 flex items-center justify-between border-t sm:border-t-0 sm:border-l border-slate-100">
                        <span className="text-base font-medium text-slate-900 font-mono tracking-wider">
                          {showAccount ? (result.account_number || '---') : `•••• •••• ${(result.account_number || '----').slice(-4)}`}
                        </span>
                        <button
                          onClick={() => setShowAccount(!showAccount)}
                          className="text-doc-primary hover:text-doc-primary/80 p-1 rounded hover:bg-doc-primary/5 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {showAccount ? 'visibility' : 'visibility_off'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Raw text */}
                    {result.raw_text && (
                      <div className="mt-4">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Raw Content</p>
                        <div className="bg-slate-900 rounded-xl p-4 text-slate-300 text-sm font-mono overflow-auto max-h-40 leading-relaxed">
                          {result.raw_text}
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <button className="w-full group flex items-center justify-center gap-2 rounded-xl bg-doc-primary py-4 px-6 text-white font-bold shadow-lg shadow-doc-primary/20 hover:bg-doc-primary/90 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                        <span>Use this data across all tools</span>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </button>
                      <p className="text-center text-xs text-slate-400 mt-3">
                        <span className="material-symbols-outlined align-middle text-[14px] mr-1">lock</span>
                        Data is encrypted end-to-end.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ Right Panel: Aesthetic Area ═══════════ */}
        <div className="hidden lg:flex flex-col w-1/3 xl:w-5/12 bg-cream h-screen relative overflow-hidden items-center justify-center">
          {/* Geometric Accent 1: Large Circle */}
          <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-cream-dark rounded-full mix-blend-multiply opacity-60" />
          {/* Geometric Accent 2: Glow */}
          <div className="absolute bottom-40 -left-20 w-80 h-80 bg-orange-100 rounded-full mix-blend-multiply opacity-50 blur-3xl" />

          {/* Geometric Accent 3: Minimalist Circle Graphic */}
          <div className="relative z-10 w-96 h-96">
            <div className="absolute inset-0 border-[40px] border-doc-primary/10 rounded-full border-t-doc-primary/20 border-r-transparent border-b-transparent border-l-transparent rotate-45 scale-150" />
            <div className="absolute inset-0 m-auto w-64 h-64 bg-white rounded-full shadow-2xl flex items-center justify-center">
              <div className="w-48 h-48 bg-doc-primary/5 rounded-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-doc-primary/10 to-transparent" />
                <span className="material-symbols-outlined text-doc-primary text-6xl opacity-20">topic</span>
              </div>
            </div>
          </div>

          {/* Bottom Quote */}
          <div className="absolute bottom-10 left-10 right-10 z-10">
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-sm">
              <p className="text-doc-primary font-bold text-sm mb-1 uppercase tracking-wider">Geometric Warmth</p>
              <p className="text-slate-600 text-sm leading-relaxed">
                &quot;Design is intelligence made visible.&quot; - SAMAAN Design System
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
