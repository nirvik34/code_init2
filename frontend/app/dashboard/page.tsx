"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { predictDelay, getProfile, saveEmergencyContact } from '../../lib/api'
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

  // Emergency contact
  const [ec, setEc] = useState({ name: '', phone: '', relation: '' })
  const [ecEditing, setEcEditing] = useState(false)
  const [ecSaving, setEcSaving] = useState(false)
  const [ecSaved, setEcSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    let uname = ''
    if (stored) {
      try {
        const u = JSON.parse(stored)
        uname = u.username || ''
        setUsername(uname)
      } catch { }
    }

    // Load emergency contact from backend profile
    if (uname) {
      getProfile(uname).then(profile => {
        if (profile?.emergency_contact) {
          setEc(profile.emergency_contact)
        }
      }).catch(() => { })
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

  // ── Pension Longevity Analyzer ──────────────────────────────
  const [plaOpen, setPlaOpen] = useState(false)
  const [pla, setPla] = useState({
    savings: 500000,
    pension: 21000,
    expenses: 18000,
    age: 63,
    lifeExpectancy: 85,
    inflationRate: 6,
  })

  function runSimulation(
    savings: number, pension: number, monthlyExpenses: number,
    age: number, lifeExp: number, inflRate: number
  ) {
    const r = inflRate / 100
    let balance = savings
    let annualExpenses = monthlyExpenses * 12
    let exhaustionAge: number | null = null
    const timeline: { age: number; balance: number }[] = []
    for (let yr = age; yr <= lifeExp + 1; yr++) {
      balance += pension * 12
      balance -= annualExpenses
      timeline.push({ age: yr, balance })
      if (balance < 0 && exhaustionAge === null) exhaustionAge = yr
      annualExpenses *= (1 + r)
    }
    return { exhaustionAge: exhaustionAge ?? lifeExp + 1, timeline }
  }

  function solveSafeSpend(
    savings: number, pension: number, age: number,
    lifeExp: number, inflRate: number
  ): number {
    let lo = 0, hi = (pension * 12 + savings) / Math.max(lifeExp - age, 1) / 12 * 2
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2
      const { exhaustionAge } = runSimulation(savings, pension, mid, age, lifeExp, inflRate)
      if (exhaustionAge <= lifeExp) hi = mid
      else lo = mid
    }
    return Math.round((lo + hi) / 2)
  }

  const { exhaustionAge, timeline } = runSimulation(
    pla.savings, pla.pension, pla.expenses, pla.age, pla.lifeExpectancy, pla.inflationRate
  )
  const safeSpend = solveSafeSpend(
    pla.savings, pla.pension, pla.age, pla.lifeExpectancy, pla.inflationRate
  )
  const overspendRisk = pla.expenses / Math.max(safeSpend, 1)
  const fundsLastYears = exhaustionAge - pla.age
  const costIn10Yrs = Math.round(pla.expenses * Math.pow(1 + pla.inflationRate / 100, 10))
  const costIn20Yrs = Math.round(pla.expenses * Math.pow(1 + pla.inflationRate / 100, 20))
  const maxBalance = Math.max(...timeline.map(t => t.balance), 1)
  const riskColor = overspendRisk > 1.2 ? 'text-rose-600' : overspendRisk > 0.9 ? 'text-yellow-600' : 'text-emerald-600'
  const riskBg = overspendRisk > 1.2 ? 'bg-rose-50 border-rose-200' : overspendRisk > 0.9 ? 'bg-yellow-50 border-yellow-200' : 'bg-emerald-50 border-emerald-200'
  const riskLabel2 = overspendRisk > 1.2 ? 'High Risk — funds exhausted early' : overspendRisk > 0.9 ? 'Moderate — close to limit' : 'Healthy — within safe zone'

  // ── Expense Breakdown ──────────────────────────────────────
  type ExpCat = { id: string; label: string; icon: string; color: string; amount: number }
  const [expOpen, setExpOpen] = useState(false)
  const [expEditing, setExpEditing] = useState<string | null>(null)
  const [expCats, setExpCats] = useState<ExpCat[]>([
    { id: 'food',      label: 'Food & Groceries',   icon: 'dinner_dining',    color: 'bg-orange-400',  amount: 4500 },
    { id: 'health',    label: 'Medicines & Health',  icon: 'medication',       color: 'bg-rose-500',    amount: 3000 },
    { id: 'rent',      label: 'Rent & Utilities',    icon: 'home',             color: 'bg-blue-500',    amount: 5000 },
    { id: 'transport', label: 'Transport',           icon: 'directions_bus',   color: 'bg-indigo-400',  amount: 1200 },
    { id: 'family',    label: 'Family Support',      icon: 'family_restroom',  color: 'bg-purple-500',  amount: 2000 },
    { id: 'entertain', label: 'Entertainment',       icon: 'tv',               color: 'bg-emerald-500', amount: 800  },
    { id: 'other',     label: 'Other / Misc',        icon: 'more_horiz',       color: 'bg-slate-400',   amount: 1500 },
  ])

  const totalExpenses = expCats.reduce((s, c) => s + c.amount, 0)

  // Auto-sync expense total → longevity analyzer
  useEffect(() => {
    if (totalExpenses > 0) setPla(p => ({ ...p, expenses: totalExpenses }))
  }, [totalExpenses])

  function updateCatAmount(id: string, val: number) {
    setExpCats(cats => cats.map(c => c.id === id ? { ...c, amount: Math.max(0, val) } : c))
  }

  // ── Risk data
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

          {/* ══ Pension Longevity Analyzer ══ */}
          <div className="flex flex-col gap-0 rounded-3xl border border-slate-200 overflow-hidden shadow-sm bg-white">
            {/* Header / toggle */}
            <button
              onClick={() => setPlaOpen(o => !o)}
              className="flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-indigo-600 text-xl">analytics</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-ink text-base">Pension Longevity Analyzer</p>
                  <p className="text-xs text-slate-500">Inflation · Lifetime sim · Safe spend · Overspend risk</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!plaOpen && (
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${riskBg} ${riskColor}`}>
                    {overspendRisk > 1.2 ? '⚠ High Risk' : overspendRisk > 0.9 ? '◉ Moderate' : '✓ Healthy'}
                  </div>
                )}
                <span className={`material-symbols-outlined text-slate-400 transition-transform ${plaOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </div>
            </button>

            {plaOpen && (
              <div className="px-6 pb-6 flex flex-col gap-6 border-t border-slate-100">

                {/* ── Inputs grid ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                  {([
                    { key: 'savings', label: 'Current Savings', prefix: '₹', step: 10000, min: 0, max: 5000000 },
                    { key: 'pension', label: 'Monthly Pension', prefix: '₹', step: 500, min: 0, max: 100000 },
                    { key: 'expenses', label: 'Monthly Expenses', prefix: '₹', step: 500, min: 1000, max: 100000 },
                    { key: 'age', label: 'Current Age', prefix: '', step: 1, min: 40, max: 90 },
                    { key: 'lifeExpectancy', label: 'Life Expectancy', prefix: '', step: 1, min: 60, max: 100 },
                    { key: 'inflationRate', label: 'Inflation Rate %', prefix: '', step: 0.5, min: 1, max: 15 },
                  ] as const).map(({ key, label, prefix, step, min, max }) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
                      <div className="relative">
                        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">{prefix}</span>}
                        <input
                          type="number"
                          step={step}
                          min={min}
                          max={max}
                          value={pla[key]}
                          onChange={e => setPla(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                          className={`w-full h-10 ${prefix ? 'pl-6' : 'pl-3'} pr-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Results row ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3">
                    <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wide">Funds Last</span>
                    <span className="text-2xl font-black text-indigo-700">{fundsLastYears > 0 ? `${fundsLastYears} yrs` : '—'}</span>
                    <span className="text-xs text-indigo-400">
                      {exhaustionAge <= pla.lifeExpectancy
                        ? `Exhausted at age ${exhaustionAge}`
                        : `Beyond age ${pla.lifeExpectancy} ✓`}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">Safe Spend</span>
                    <span className="text-2xl font-black text-emerald-700">₹{safeSpend.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-emerald-500">Max monthly / mo</span>
                  </div>
                  <div className="flex flex-col gap-1 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
                    <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">Cost in 10 yrs</span>
                    <span className="text-2xl font-black text-amber-700">₹{(costIn10Yrs / 1000).toFixed(1)}K</span>
                    <span className="text-xs text-amber-500">@{pla.inflationRate}% inflation</span>
                  </div>
                  <div className="flex flex-col gap-1 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3">
                    <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wide">Cost in 20 yrs</span>
                    <span className="text-2xl font-black text-rose-600">₹{(costIn20Yrs / 1000).toFixed(1)}K</span>
                    <span className="text-xs text-rose-400">@{pla.inflationRate}% inflation</span>
                  </div>
                </div>

                {/* ── Overspend Risk bar ── */}
                <div className={`flex flex-col gap-2 rounded-2xl border px-5 py-4 ${riskBg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-lg ${riskColor}`}>
                        {overspendRisk > 1.2 ? 'warning' : overspendRisk > 0.9 ? 'error_outline' : 'check_circle'}
                      </span>
                      <span className={`text-sm font-bold ${riskColor}`}>Overspend Risk — {riskLabel2}</span>
                    </div>
                    <span className={`text-lg font-black ${riskColor}`}>{(overspendRisk * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        overspendRisk > 1.2 ? 'bg-rose-500' : overspendRisk > 0.9 ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(overspendRisk * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    You spend <strong>₹{pla.expenses.toLocaleString('en-IN')}/mo</strong> vs safe limit of <strong>₹{safeSpend.toLocaleString('en-IN')}/mo</strong> — ratio: <strong>{overspendRisk.toFixed(2)}×</strong>
                  </p>
                </div>

                {/* ── Balance Timeline chart ── */}
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Balance Timeline (₹)</p>
                  <div className="flex items-end gap-0.5 h-20 w-full bg-slate-50 rounded-2xl px-3 py-2 overflow-x-auto">
                    {timeline.map((t) => {
                      const pct = Math.max(t.balance, 0) / Math.max(maxBalance, 1)
                      const isExhausted = t.balance < 0
                      const isLast5 = t.age >= pla.lifeExpectancy - 4
                      return (
                        <div key={t.age} className="flex flex-col items-center justify-end flex-1 min-w-[12px] h-full group relative">
                          <div
                            className={`w-full rounded-t transition-all duration-300 ${
                              isExhausted ? 'bg-rose-400' : isLast5 ? 'bg-amber-400' : 'bg-indigo-500'
                            }`}
                            style={{ height: `${Math.max(pct * 100, isExhausted ? 4 : 2)}%` }}
                          />
                          {(t.age % 5 === 0 || t.age === pla.age || t.age === pla.lifeExpectancy) && (
                            <span className="absolute -bottom-5 text-[9px] text-slate-400 font-medium">{t.age}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-6">
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" /><span className="text-[11px] text-slate-500">Positive balance</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /><span className="text-[11px] text-slate-500">Final 5 years</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-rose-400 inline-block" /><span className="text-[11px] text-slate-500">Exhausted</span></div>
                  </div>
                </div>

              </div>
            )}
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

          {/* ══ Monthly Expense Breakdown ══ */}
          <div className="flex flex-col gap-0 rounded-3xl border border-slate-200 overflow-hidden shadow-sm bg-white">
            <button
              onClick={() => setExpOpen(o => !o)}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-600 text-xl">account_balance_wallet</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-ink text-base">Monthly Expenses</p>
                  <p className="text-xs text-slate-500">Where your pension goes</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-base font-black text-slate-900">₹{totalExpenses.toLocaleString('en-IN')}</p>
                  <p className={`text-[11px] font-semibold ${
                    totalExpenses > pla.pension ? 'text-rose-500' : 'text-emerald-600'
                  }`}>
                    {totalExpenses > pla.pension
                      ? `₹${(totalExpenses - pla.pension).toLocaleString('en-IN')} over pension`
                      : `₹${(pla.pension - totalExpenses).toLocaleString('en-IN')} surplus`
                    }
                  </p>
                </div>
                <span className={`material-symbols-outlined text-slate-400 transition-transform ${expOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </div>
            </button>

            {/* Stacked bar preview – always visible */}
            <div className="flex h-2 w-full overflow-hidden">
              {expCats.map(c => (
                <div
                  key={c.id}
                  className={`${c.color} transition-all duration-500`}
                  style={{ width: `${(c.amount / Math.max(totalExpenses, 1)) * 100}%` }}
                />
              ))}
            </div>

            {expOpen && (
              <div className="px-5 pb-5 flex flex-col gap-4 border-t border-slate-100 pt-4">

                {/* Pension vs Expenses summary */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-0.5 bg-emerald-50 border border-emerald-100 rounded-2xl px-3 py-2.5 text-center">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Pension</span>
                    <span className="text-base font-black text-emerald-700">₹{pla.pension.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 bg-orange-50 border border-orange-100 rounded-2xl px-3 py-2.5 text-center">
                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wide">Spent</span>
                    <span className="text-base font-black text-orange-700">₹{totalExpenses.toLocaleString('en-IN')}</span>
                  </div>
                  <div className={`flex flex-col gap-0.5 rounded-2xl px-3 py-2.5 text-center border ${
                    totalExpenses > pla.pension
                      ? 'bg-rose-50 border-rose-100'
                      : 'bg-indigo-50 border-indigo-100'
                  }`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${
                      totalExpenses > pla.pension ? 'text-rose-500' : 'text-indigo-500'
                    }`}>{totalExpenses > pla.pension ? 'Deficit' : 'Saved'}</span>
                    <span className={`text-base font-black ${
                      totalExpenses > pla.pension ? 'text-rose-600' : 'text-indigo-700'
                    }`}>₹{Math.abs(pla.pension - totalExpenses).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Category list */}
                <div className="flex flex-col gap-2">
                  {expCats.map(c => {
                    const pct = Math.round((c.amount / Math.max(totalExpenses, 1)) * 100)
                    const isEditing = expEditing === c.id
                    return (
                      <div key={c.id} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined text-[16px] ${
                              c.color.replace('bg-', 'text-').replace('-400', '-500').replace('-500', '-600')
                            }`}>{c.icon}</span>
                            <span className="text-sm font-semibold text-slate-700">{c.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                                <input
                                  type="number"
                                  autoFocus
                                  min={0}
                                  step={100}
                                  value={c.amount}
                                  onChange={e => updateCatAmount(c.id, parseInt(e.target.value) || 0)}
                                  onBlur={() => setExpEditing(null)}
                                  onKeyDown={e => e.key === 'Enter' && setExpEditing(null)}
                                  className="w-28 h-7 pl-6 pr-2 bg-white border border-indigo-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                                />
                              </div>
                            ) : (
                              <button
                                onClick={() => setExpEditing(c.id)}
                                className="flex items-center gap-1 group hover:bg-slate-100 rounded-lg px-2 py-0.5 transition-colors"
                              >
                                <span className="text-sm font-bold text-slate-900">₹{c.amount.toLocaleString('en-IN')}</span>
                                <span className="material-symbols-outlined text-slate-300 group-hover:text-indigo-500 text-[13px] transition-colors">edit</span>
                              </button>
                            )}
                            <span className="text-xs font-semibold text-slate-400 w-9 text-right">{pct}%</span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`${c.color} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Tip */}
                {totalExpenses > pla.pension && (
                  <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">
                    <span className="material-symbols-outlined text-rose-500 text-base mt-0.5">warning</span>
                    <p className="text-xs text-rose-700 leading-relaxed">
                      Your expenses exceed your pension by <strong>₹{(totalExpenses - pla.pension).toLocaleString('en-IN')}/mo</strong>. Consider reducing discretionary spend or check savings balance.
                    </p>
                  </div>
                )}
                {totalExpenses <= pla.pension && (
                  <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
                    <span className="material-symbols-outlined text-emerald-600 text-base mt-0.5">check_circle</span>
                    <p className="text-xs text-emerald-700 leading-relaxed">
                      You save <strong>₹{(pla.pension - totalExpenses).toLocaleString('en-IN')}/mo</strong> after all expenses. Great financial discipline!
                    </p>
                  </div>
                )}

                <p className="text-[10px] text-slate-400 text-center">Tap any amount to edit · Changes auto-update the Longevity Analyzer</p>
              </div>
            )}
          </div>

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

          {/* Emergency Contact Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-rose-600 text-base">emergency</span>
                </div>
                <h4 className="font-bold text-ink text-sm">Emergency Contact</h4>
              </div>
              {!ecEditing && (
                <button
                  onClick={() => setEcEditing(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  {ec.name ? 'Edit' : 'Add'}
                </button>
              )}
            </div>

            {!ecEditing ? (
              ec.name ? (
                <div className="px-5 py-4 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-rose-600">person</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{ec.name}</p>
                      <p className="text-xs text-slate-500">{ec.relation}</p>
                    </div>
                  </div>
                  <a
                    href={`tel:${ec.phone}`}
                    className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 transition-colors rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-700"
                  >
                    <span className="material-symbols-outlined text-base">call</span>
                    {ec.phone}
                  </a>
                </div>
              ) : (
                <div className="px-5 py-6 flex flex-col items-center gap-2 text-center">
                  <span className="material-symbols-outlined text-slate-300 text-4xl">person_add</span>
                  <p className="text-sm text-slate-400">No emergency contact added yet.</p>
                  <button
                    onClick={() => setEcEditing(true)}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >+ Add contact</button>
                </div>
              )
            ) : (
              <form
                className="px-5 py-4 flex flex-col gap-3"
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!ec.name || !ec.phone) return
                  setEcSaving(true)
                  try {
                    await saveEmergencyContact({ username, ...ec })
                    setEcSaved(true)
                    setEcEditing(false)
                    setTimeout(() => setEcSaved(false), 3000)
                  } catch { } finally {
                    setEcSaving(false)
                  }
                }}
              >
                {[['Name', 'name', 'person', 'text'], ['Phone', 'phone', 'call', 'tel'], ['Relation', 'relation', 'family_restroom', 'text']].map(([label, field, icon, type]) => (
                  <div key={field} className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">{icon}</span>
                    <input
                      type={type}
                      placeholder={label}
                      required={field !== 'relation'}
                      value={(ec as any)[field]}
                      onChange={e => setEc(prev => ({ ...prev, [field]: e.target.value }))}
                      className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all"
                    />
                  </div>
                ))}
                <div className="flex gap-2 mt-1">
                  <button type="button" onClick={() => setEcEditing(false)} className="flex-1 h-9 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
                  <button type="submit" disabled={ecSaving} className="flex-1 h-9 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow shadow-indigo-200 hover:bg-indigo-700 transition-colors disabled:opacity-60">{ecSaving ? 'Saving…' : 'Save Contact'}</button>
                </div>
                {ecSaved && <p className="text-center text-xs text-emerald-600 font-semibold">✓ Saved successfully</p>}
              </form>
            )}
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
