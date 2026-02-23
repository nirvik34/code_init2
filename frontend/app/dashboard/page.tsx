"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { predictDelay } from '../../lib/api'
import ChatBot from '../../components/ChatBot'
import TopNav from '../../components/TopNav'

export default function Dashboard() {
  const [username, setUsername] = useState('')
  const [chatOpen, setChatOpen] = useState(false)

  // Prediction data from API
  const [prediction, setPrediction] = useState<{
    risk_score: number
    status: string
    expected_next_date: string | null
  } | null>(null)
  const [predLoading, setPredLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        const u = JSON.parse(stored)
        setUsername(u.username || '')
      } catch { }
    }

    // Fetch prediction from backend with sample payment history
    async function loadPrediction() {
      try {
        const today = new Date()
        const dates = []
        for (let i = 5; i >= 1; i--) {
          const d = new Date(today)
          d.setMonth(d.getMonth() - i)
          d.setDate(1 + Math.floor(Math.random() * 4))
          dates.push(d.toISOString().split('T')[0])
        }
        const res = await predictDelay({ payment_history: dates })
        setPrediction(res)
      } catch {
        setPrediction({ risk_score: 0.12, status: 'Low Risk', expected_next_date: null })
      } finally {
        setPredLoading(false)
      }
    }
    loadPrediction()
  }, [])

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const displayName = username ? `${username} Ji` : 'User'

  // Risk data
  const riskPct = prediction ? Math.round(prediction.risk_score * 100) : 0
  const riskLabel = prediction?.status || 'Loading...'
  const isHighRisk = riskPct > 50

  // Expected date formatting
  const formatExpectedDate = () => {
    if (!prediction?.expected_next_date) return { month: '—', day: '' }
    const d = new Date(prediction.expected_next_date)
    const month = d.toLocaleString('en-IN', { month: 'long' })
    const day = d.getDate()
    const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'
    return { month, day: `${day}${suffix}` }
  }
  const expected = formatExpectedDate()

  // Confidence based on risk
  const confidence = riskPct < 30 ? 'High' : riskPct < 60 ? 'Medium' : 'Low'
  const confidenceColor = riskPct < 30 ? 'text-dash-primary' : riskPct < 60 ? 'text-yellow-500' : 'text-rose-500'

  // Generate pension slip PDF
  const downloadPensionSlip = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const name = username || 'Pensioner'
    const now = new Date()
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const monthStr = prevMonth.toLocaleString('en-IN', { month: 'long', year: 'numeric' })

    // Header
    doc.setFillColor(26, 31, 53)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.text('SAMAAN', 20, 22)
    doc.setFontSize(10)
    doc.text('Pension Assist v3.0', 20, 30)
    doc.setFontSize(10)
    doc.text(`Generated: ${now.toLocaleDateString('en-IN')}`, 140, 30)

    // Body
    doc.setTextColor(30, 30, 30)
    doc.setFontSize(16)
    doc.text(`Pension Slip — ${monthStr}`, 20, 55)

    doc.setFontSize(11)
    doc.setTextColor(80, 80, 80)
    const rows = [
      ['Pensioner Name', name],
      ['Pension ID', 'PEN-' + (username || 'XXXX').toUpperCase().slice(0, 6) + '-2024'],
      ['Month', monthStr],
      ['Scheme', 'National Pension System (NPS)'],
      ['Bank Account', 'SBI •••• 4582'],
      ['Gross Amount', '₹ 21,000.00'],
      ['Deductions', '₹ 0.00'],
      ['Net Credited', '₹ 21,000.00'],
      ['Status', 'Credited'],
      ['Risk Score', `${riskPct}% — ${riskLabel}`],
    ]

    let y = 70
    rows.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(50, 50, 50)
      doc.text(label, 20, y)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(90, 90, 90)
      doc.text(value, 90, y)
      y += 10
    })

    // Footer
    doc.setDrawColor(200, 200, 200)
    doc.line(20, y + 5, 190, y + 5)
    doc.setFontSize(9)
    doc.setTextColor(140, 140, 140)
    doc.text('This is a system-generated document from SAMAAN Pension Assist.', 20, y + 15)
    doc.text('For queries, visit your nearest pension office or use SAMAAN support.', 20, y + 22)

    doc.save(`Pension_Slip_${monthStr.replace(' ', '_')}.pdf`)
  }

  return (
    <div className="bg-bg-light min-h-screen flex flex-col text-slate-900 font-sans">
      {/* Top Navigation */}
      <TopNav />

      {/* Main Layout: Split Canvas */}
      <main className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto">
        {/* ═══════════ Left Panel: Operational (White) ═══════════ */}
        <div className="w-full lg:w-[60%] bg-white p-6 lg:p-12 flex flex-col gap-8 lg:border-r border-[#f5f1f0]">

          {/* Greeting */}
          <div className="flex flex-col gap-1">
            <h2 className="text-ink text-3xl md:text-4xl font-semibold font-sora tracking-tight">
              {getGreeting()}, {displayName}.
            </h2>
            <p className="text-gray-500 font-medium">Here&apos;s what&apos;s happening with your pension today.</p>
          </div>

          {/* Delay Probability Meter Section */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Circular Gauge */}
            <div className="relative flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-bg-light border border-gray-100 shadow-sm w-full md:w-auto min-w-[280px]">
              {predLoading ? (
                <div className="w-40 h-40 md:w-48 md:h-48 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-dash-primary rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="relative w-40 h-40 md:w-48 md:h-48">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="currentColor" strokeWidth="3"
                      />
                      <path
                        className={isHighRisk ? 'text-rose-500 drop-shadow-md' : 'text-dash-primary drop-shadow-md'}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="currentColor"
                        strokeDasharray={`${riskPct}, 100`}
                        strokeLinecap="round" strokeWidth="3"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl md:text-5xl font-bold text-ink font-sora">{riskPct}%</span>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Probability</span>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-ink font-semibold text-lg">{riskLabel}</p>
                    <p className={`text-sm font-medium flex items-center justify-center gap-1 ${isHighRisk ? 'text-rose-500' : 'text-success'}`}>
                      <span className="material-symbols-outlined text-sm">{isHighRisk ? 'trending_up' : 'trending_down'}</span>
                      {isHighRisk ? 'Attention required' : 'On track this cycle'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Contextual Info */}
            <div className="flex flex-col justify-center gap-4 py-4 flex-1">
              <div className="bg-[#f0f9ff] p-5 rounded-2xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-blue-600 mt-1">info</span>
                  <div>
                    <h4 className="font-bold text-blue-900 mb-1">Documents verified</h4>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      Your life certificate was successfully processed. No further action is needed for this cycle.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Ledger */}
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-ink font-sora">Activity Ledger</h3>
              <Link href="/prediction" className="text-sm font-semibold text-dash-primary hover:text-orange-600 transition-colors">View All</Link>
            </div>
            <div className="flex flex-col gap-3">
              {/* Item 1 */}
              <div className="group flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer bg-white shadow-sm hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-ink text-base">Latest Pension</span>
                    <span className="text-sm text-gray-500">Credited to SBI •••• 4582</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Received</span>
                  <span className="text-xs text-gray-400 font-medium">{new Date(Date.now() - 7 * 86400000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Item 2 */}
              <div className="group flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer bg-white shadow-sm hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <span className="material-symbols-outlined">pending_actions</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-ink text-base">Previous Arrears</span>
                    <span className="text-sm text-gray-500">Processing via Treasury</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-dash-primary/10 text-dash-primary">{riskPct > 40 ? 'Delayed' : 'Cleared'}</span>
                  <span className="text-xs text-gray-400 font-medium">{new Date(Date.now() - 37 * 86400000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Item 3 */}
              <Link href="/upload-doc" className="group flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer bg-white shadow-sm hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-ink text-base">Life Certificate Update</span>
                    <span className="text-sm text-gray-500">Jeevan Pramaan Digital</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">Processed</span>
                  <span className="text-xs text-gray-400 font-medium">{new Date(Date.now() - 4 * 86400000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ═══════════ Right Panel: Informational (Cream) ═══════════ */}
        <div className="w-full lg:w-[40%] bg-cream p-6 lg:p-12 flex flex-col gap-8">

          {/* Prediction Widget Card */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink font-sora">Next Payment Prediction</h3>
              <span className="material-symbols-outlined text-gray-400">calendar_month</span>
            </div>

            <div className="relative w-full bg-ink rounded-[2rem] p-8 text-white shadow-xl overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-dash-primary rounded-full opacity-90" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-10">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <span className="text-gray-400 font-medium text-sm uppercase tracking-wider">Expected Date</span>
                    {predLoading ? (
                      <div className="w-32 h-16 bg-white/10 rounded-xl animate-pulse" />
                    ) : (
                      <h2 className="text-5xl font-bold font-sora leading-tight">
                        {expected.month}<br />{expected.day}
                      </h2>
                    )}
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl border border-white/10">
                    <span className="material-symbols-outlined text-white text-2xl">event</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${confidence === 'High' ? 'bg-dash-primary/20 text-dash-primary' : confidence === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    <span className="material-symbols-outlined text-lg">verified</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-bold text-sm ${confidenceColor}`}>{confidence} confidence</span>
                    <span className="text-gray-400 text-xs">Based on payment trend analysis</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tools Grid */}
          <div className="flex flex-col gap-5">
            <h3 className="text-lg font-bold text-ink font-sora">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={downloadPensionSlip} className="flex items-center p-4 bg-white rounded-2xl border border-transparent hover:border-dash-primary/30 hover:shadow-lg transition-all group text-left">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-dash-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">download</span>
                </div>
                <div className="ml-4 flex flex-col items-start">
                  <span className="font-bold text-ink text-base">Download Pension Slip</span>
                  <span className="text-xs text-gray-500">Get the PDF for last month</span>
                </div>
                <span className="material-symbols-outlined ml-auto text-gray-300 group-hover:text-dash-primary">arrow_forward_ios</span>
              </button>

              <Link href="/upload-doc" className="flex items-center p-4 bg-white rounded-2xl border border-transparent hover:border-dash-primary/30 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-dash-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">book</span>
                </div>
                <div className="ml-4 flex flex-col items-start">
                  <span className="font-bold text-ink text-base">Passbook View</span>
                  <span className="text-xs text-gray-500">Check comprehensive history</span>
                </div>
                <span className="material-symbols-outlined ml-auto text-gray-300 group-hover:text-dash-primary">arrow_forward_ios</span>
              </Link>

              <Link href="/grievance" className="flex items-center p-4 bg-white rounded-2xl border border-transparent hover:border-dash-primary/30 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-dash-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">support_agent</span>
                </div>
                <div className="ml-4 flex flex-col items-start">
                  <span className="font-bold text-ink text-base">Contact Support</span>
                  <span className="text-xs text-gray-500">File a grievance letter</span>
                </div>
                <span className="material-symbols-outlined ml-auto text-gray-300 group-hover:text-dash-primary">arrow_forward_ios</span>
              </Link>
            </div>
          </div>

          {/* Support Banner */}
          <div className="mt-auto bg-[#FDF2EE] rounded-2xl p-6 flex flex-col gap-3 border border-orange-100">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-ink text-lg">Need help with Arrears?</h4>
              <span className="material-symbols-outlined text-dash-primary text-3xl">help</span>
            </div>
            <p className="text-sm text-gray-600">Our AI assistant can help you track delayed payments, understand schemes, and get answers instantly.</p>
            <button
              onClick={() => setChatOpen(true)}
              className="mt-2 w-full py-3 rounded-xl bg-dash-primary text-white font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">smart_toy</span>
              Start Chat
            </button>
          </div>
        </div>
      </main>

      {/* Floating Chat Button (visible when chat is closed) */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1a1f35] text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
          title="Chat with SAMAAN Assistant"
        >
          <span className="material-symbols-outlined text-2xl">chat</span>
        </button>
      )}

      {/* ChatBot Component */}
      <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}
