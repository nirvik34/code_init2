"use client"
import { useState, useRef } from 'react'
import { ocrExtract } from '../../lib/api'
import TopNav from '../../components/TopNav'

type OcrResult = {
  doc_name?: string
  name?: string
  dob?: string
  age?: string
  pension_id?: string
  account_number?: string
  ifsc?: string
  address?: string
  raw_text?: string
  ai_fields?: Record<string, string>
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={copy}
      title="Copy"
      className="ml-2 shrink-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors group"
    >
      {copied ? (
        <span className="text-emerald-500 text-xs font-bold">✓</span>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className="text-slate-400 group-hover:text-slate-700 transition-colors">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  )
}

function FieldRow({ label, value, mono = false, masked = false }: {
  label: string; value?: string | null; mono?: boolean; masked?: boolean
}) {
  const [show, setShow] = useState(!masked)
  const display = value || '—'
  const visibleVal = masked && !show
    ? `•••• •••• ${display.slice(-4)}`
    : display

  return (
    <div className="group flex items-center rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all bg-white">
      <div className="bg-slate-50 w-36 shrink-0 px-4 py-3 flex items-center border-r border-slate-100">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex-1 px-4 py-3 flex items-center justify-between min-w-0">
        <span className={`text-sm font-medium text-slate-900 truncate ${mono ? 'font-mono tracking-wide' : ''}`}>
          {visibleVal}
        </span>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {masked && value && (
            <button
              onClick={() => setShow(s => !s)}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
              title={show ? 'Hide' : 'Show'}
            >
              {show ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
          {value && <CopyButton value={value} />}
        </div>
      </div>
    </div>
  )
}

function DocTypeBadge({ filename }: { filename: string }) {
  const isPDF = filename.toLowerCase().endsWith('.pdf')
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${isPDF ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
      }`}>
      <span className="material-symbols-outlined text-[14px]">
        {isPDF ? 'picture_as_pdf' : 'image'}
      </span>
      {isPDF ? 'PDF' : 'Image'}
    </span>
  )
}

export default function UploadDoc() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<OcrResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAccount, setShowAccount] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [logs, setLogs] = useState<string[]>([
    '> SAMAAN Document Reader v3.1 ready.',
    '> OCR engine loaded (Tesseract + AI naming).',
    '> Waiting for document upload…',
  ])
  const [dragOver, setDragOver] = useState(false)
  const [savedToProfile, setSavedToProfile] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function addLog(msg: string) {
    setLogs(prev => [...prev, `> ${msg}`])
  }

  function handleFileChange(f: File | null) {
    if (!f) return
    setFile(f)
    setResult(null)
    setError(null)
    setSavedToProfile(false)
    addLog(`File selected: ${f.name} (${(f.size / 1024).toFixed(1)} KB)`)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFileChange(f)
  }

  const submit = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    addLog(`Uploading ${file.name}…`)
    addLog('Running OCR extraction…')
    try {
      const res = await ocrExtract(file)
      setResult(res)
      addLog(`AI document name: "${res.doc_name || 'unknown'}"`)
      const aiFieldCount = res.ai_fields ? Object.keys(res.ai_fields).length : 0
      addLog(`AI labeled ${aiFieldCount} field${aiFieldCount !== 1 ? 's' : ''} from document.`)
      addLog(`Extracted ${Object.values(res).filter(v => v && v !== res.raw_text).length} fields.`)
      addLog('Extraction complete. ✓')
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Extraction failed.'
      setError(msg)
      addLog(`ERROR: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  function saveToProfile() {
    if (!result) return
    const stored = localStorage.getItem('user')
    if (!stored) return
    const user = JSON.parse(stored)
    const profileData = {
      ...(JSON.parse(localStorage.getItem('samaan_profile') || '{}')),
      doc_name: result.doc_name,
      name: result.name || user.username,
      dob: result.dob,
      age: result.age,
      pension_id: result.pension_id,
      account_number: result.account_number,
      ifsc: result.ifsc,
      address: result.address,
    }
    localStorage.setItem('samaan_profile', JSON.stringify(profileData))
    setSavedToProfile(true)
    addLog('Profile data saved to local storage. ✓')
  }

  const hasResult = result && !loading

  return (
    <div className="font-display bg-[#f6f6f8] text-slate-900 flex flex-col min-h-screen">
      <TopNav />
      <div className="relative flex flex-1 w-full flex-row">

        {/* ═══════════ Left Panel ═══════════ */}
        <div className="flex flex-col w-full lg:w-2/3 xl:w-7/12 bg-white overflow-y-auto relative z-10 shadow-xl">
          <div className="flex-1 px-8 py-8 lg:px-12">

            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-900 mb-1">Document Reader</h1>
                <p className="text-slate-500">Upload any document — image or PDF — for instant AI extraction.</p>
              </div>
              <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </span>
                AI Powered
              </span>
            </div>

            {/* Upload zone + extracted data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">

              {/* Col 1: Upload + Logs */}
              <div className="flex flex-col gap-5">

                {/* Dropzone */}
                <div
                  className={`group relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-10 transition-all cursor-pointer ${dragOver
                      ? 'border-indigo-400 bg-indigo-50 scale-[1.01]'
                      : file
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/40'
                    }`}
                  onClick={() => inputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />

                  {/* Icon */}
                  <div className={`rounded-2xl p-4 shadow-sm transition-transform duration-300 group-hover:scale-110 ${file ? 'bg-emerald-100' : 'bg-white'
                    }`}>
                    <span className={`material-symbols-outlined text-4xl ${file ? 'text-emerald-600' : 'text-indigo-500'}`}>
                      {file ? 'check_circle' : 'cloud_upload'}
                    </span>
                  </div>

                  <div className="text-center">
                    <p className="text-slate-900 font-bold text-base">
                      {file ? file.name : 'Drop your document here'}
                    </p>
                    <p className="text-slate-500 text-sm mt-0.5">
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports JPG, PNG, WEBP, PDF'}
                    </p>
                  </div>

                  {/* Doc type badge */}
                  {file && <DocTypeBadge filename={file.name} />}

                  {/* Buttons */}
                  {!file && (
                    <button className="mt-1 rounded-xl bg-white px-5 py-2 text-sm font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
                      Browse Files
                    </button>
                  )}
                  {file && !loading && (
                    <div className="flex gap-3">
                      <button
                        className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                        onClick={e => { e.stopPropagation(); setFile(null); setResult(null); setError(null) }}
                      >
                        Change
                      </button>
                      <button
                        className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors"
                        onClick={e => { e.stopPropagation(); submit() }}
                      >
                        Extract
                      </button>
                    </div>
                  )}
                  {loading && (
                    <div className="flex items-center gap-2.5 text-sm text-slate-500">
                      <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                      <span className="animate-pulse">Processing document…</span>
                    </div>
                  )}
                </div>

                {/* Error message */}
                {error && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                    <span className="material-symbols-outlined text-red-500 text-lg mt-0.5">error</span>
                    <p>{error}</p>
                  </div>
                )}

                {/* Console log */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <button
                    className="flex cursor-pointer items-center justify-between bg-slate-50 px-4 py-3 hover:bg-slate-100 transition-colors w-full"
                    onClick={() => setLogOpen(!logOpen)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-lg">terminal</span>
                      <span className="text-sm font-semibold text-slate-700">System Log</span>
                    </div>
                    <span className={`material-symbols-outlined text-slate-400 transition-transform text-sm ${logOpen ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  {logOpen && (
                    <div className="bg-[#0d1117] p-4 font-mono text-xs max-h-36 overflow-auto">
                      {logs.map((l, i) => (
                        <p key={i} className={`mb-1 ${l.includes('ERROR') ? 'text-red-400' : l.includes('✓') ? 'text-emerald-400' : 'text-slate-400'}`}>{l}</p>
                      ))}
                      <p className="text-slate-600 animate-pulse">▊</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Col 2: Extracted Data */}
              <div className="flex flex-col min-h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Extracted Fields</h2>
                  {hasResult && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Verified
                    </span>
                  )}
                </div>

                {/* Empty state */}
                {!result && !loading && !error && (
                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
                    <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">description</span>
                    <p className="text-slate-400 font-medium text-sm">Upload a document to see extracted data</p>
                  </div>
                )}

                {/* Loading state */}
                {loading && (
                  <div className="flex-1 flex flex-col items-center justify-center p-10 gap-4">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                      <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin" />
                    </div>
                    <p className="text-slate-500 font-medium animate-pulse">Analyzing document with AI…</p>
                  </div>
                )}

                {/* Results */}
                {hasResult && (
                  <div className="flex flex-col gap-3">
                    {/* AI Doc Name badge */}
                    {result.doc_name && (
                      <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl px-4 py-3">
                        <span className="text-2xl">🏷️</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">AI Document Name</p>
                          <p className="text-base font-bold text-slate-900 truncate">{result.doc_name}</p>
                        </div>
                        <CopyButton value={result.doc_name} />
                      </div>
                    )}

                    {/* Field rows */}
                    <FieldRow label="Full Name" value={result.name} />
                    <FieldRow label="Date of Birth" value={result.dob} />
                    <FieldRow label="Age" value={result.age} />
                    <FieldRow label="Pension ID" value={result.pension_id} mono />
                    <FieldRow label="Account No." value={result.account_number} mono masked />
                    <FieldRow label="IFSC Code" value={result.ifsc} mono />
                    <FieldRow label="Address" value={result.address} />

                    {/* AI Labeled Fields */}
                    {result.ai_fields && Object.keys(result.ai_fields).length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="material-symbols-outlined text-purple-600 text-lg">auto_awesome</span>
                          <h3 className="text-sm font-bold text-slate-700">AI Labeled Fields</h3>
                          <span className="ml-auto rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                            {Object.keys(result.ai_fields).length} fields
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {Object.entries(result.ai_fields).map(([label, value]) => (
                            <div key={label} className="group flex items-center rounded-xl border border-purple-100 overflow-hidden shadow-sm hover:shadow-md transition-all bg-white">
                              <div className="bg-purple-50 w-36 shrink-0 px-4 py-2.5 flex items-center border-r border-purple-100">
                                <span className="text-[11px] font-semibold text-purple-500 uppercase tracking-wide leading-tight">{label}</span>
                              </div>
                              <div className="flex-1 px-4 py-2.5 flex items-center justify-between min-w-0">
                                <span className="text-sm font-medium text-slate-900 truncate">{value}</span>
                                <CopyButton value={value} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Raw text */}
                    {result.raw_text && (
                      <details className="mt-2 group">
                        <summary className="cursor-pointer text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 hover:text-slate-600 transition-colors">
                          <span className="material-symbols-outlined text-[14px] group-open:rotate-90 transition-transform">chevron_right</span>
                          Raw OCR Text
                        </summary>
                        <div className="mt-2 bg-[#0d1117] rounded-xl p-4 text-slate-300 text-xs font-mono overflow-auto max-h-36 leading-relaxed whitespace-pre-wrap">
                          {result.raw_text}
                        </div>
                      </details>
                    )}

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
                      <button
                        onClick={saveToProfile}
                        disabled={savedToProfile}
                        className={`w-full group flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 font-bold text-sm shadow-md transition-all duration-200 ${savedToProfile
                            ? 'bg-emerald-500 text-white shadow-emerald-200'
                            : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-lg'
                          }`}
                      >
                        {savedToProfile ? (
                          <><span className="material-symbols-outlined text-lg">check_circle</span> Saved to Profile</>
                        ) : (
                          <><span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">save</span> Use data across all tools</>
                        )}
                      </button>
                      <p className="text-center text-xs text-slate-400">
                        <span className="material-symbols-outlined align-middle text-[13px] mr-1">lock</span>
                        Data is processed locally — never stored on servers.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ Right Panel ═══════════ */}
        <div className="hidden lg:flex flex-col w-1/3 xl:w-5/12 bg-gradient-to-br from-[#f0f4ff] to-[#ede9fe] h-screen relative overflow-hidden items-center justify-center">
          {/* Blobs */}
          <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-3xl" />
          <div className="absolute bottom-20 -left-10 w-72 h-72 bg-purple-200/50 rounded-full blur-3xl" />

          {/* Animated scan illustration */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Document card with scan line */}
            <div className="relative w-64 h-80 bg-white rounded-2xl shadow-2xl border border-white/80 overflow-hidden">
              {/* Doc header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-12 flex items-center px-5 gap-3">
                <span className="material-symbols-outlined text-white text-xl">description</span>
                <div className="flex flex-col gap-1">
                  <div className="h-2 w-24 bg-white/60 rounded-full" />
                  <div className="h-1.5 w-16 bg-white/30 rounded-full" />
                </div>
              </div>
              {/* Doc lines */}
              <div className="p-5 flex flex-col gap-3">
                {[["w-full", "w-3/4"], ["w-4/5", "w-1/2"], ["w-full", "w-2/3"], ["w-3/5", "w-4/5"]].map(([a, b], i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className={`h-2 ${a} bg-slate-200 rounded-full`} />
                    <div className={`h-2 ${b} bg-slate-100 rounded-full`} />
                  </div>
                ))}
                {/* Highlighted extraction */}
                <div className="mt-2 bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex flex-col gap-1.5">
                  <div className="h-2 w-20 bg-indigo-300 rounded-full" />
                  <div className="h-2 w-28 bg-indigo-200 rounded-full" />
                </div>
              </div>
              {/* Animated scan beam */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80"
                style={{ animation: 'scan-beam 2.5s ease-in-out infinite', top: '40px' }} />
            </div>

            {/* Info chips */}
            <div className="flex flex-col gap-3 w-72">
              {[
                { icon: 'picture_as_pdf', text: 'Supports PDFs & Images', color: 'bg-red-100 text-red-700' },
                { icon: 'auto_awesome', text: 'AI labels Name, Age, DOB …', color: 'bg-purple-100 text-purple-700' },
                { icon: 'content_copy', text: 'One-tap copy all fields', color: 'bg-blue-100 text-blue-700' },
              ].map(({ icon, text, color }, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm border border-white/60">
                  <span className={`material-symbols-outlined text-base p-1.5 rounded-lg ${color}`}>{icon}</span>
                  <span className="text-sm font-semibold text-slate-700">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <style>{`
            @keyframes scan-beam {
              0%   { top: 40px;  opacity: 0.3; }
              50%  { top: 280px; opacity: 0.85; }
              100% { top: 40px;  opacity: 0.3; }
            }
          `}</style>
        </div>
      </div>
    </div>
  )
}
