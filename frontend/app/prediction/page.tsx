"use client"
import { useState } from 'react'
import { predictDelay } from '../../lib/api'
import AppShell from '../../components/AppShell'

export default function PredictionPage() {
  const [dates, setDates] = useState('2024-01-10, 2024-02-11, 2024-03-15')
  const [out, setOut] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const go = async () => {
    if (!dates) return
    setLoading(true)
    try {
      const arr = dates.split(',').map(s => s.trim()).filter(Boolean)
      const res = await predictDelay({ payment_history: arr })
      setOut(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Payout Forecaster</h2>
          <p className="text-slate-500">Analyze your payment history to identify risks of delays and predict when your next pension will arrive.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Input & History */}
          <div className="space-y-6">
            <div className="glass-card p-8">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span>📅</span> Payment Record History
              </h3>
              <p className="text-xs font-semibold text-slate-400 uppercase mb-4 tracking-wider">Instructions</p>
              <p className="text-sm text-slate-600 mb-6">Enter the dates of your last 3-5 pension payments separated by commas (YYYY-MM-DD).</p>

              <textarea
                placeholder="e.g. 2024-01-10, 2024-02-11, 2024-03-15"
                value={dates}
                onChange={e => setDates(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-700 font-mono text-sm min-h-[150px] outline-none focus:border-brand-500 transition-colors"
              />

              <button
                className={`w-full mt-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-brand-600 text-white shadow-xl shadow-brand-600/20 hover:bg-brand-700'
                  }`}
                onClick={go}
                disabled={loading}
              >
                {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                {loading ? 'Forecasting...' : 'Run Analysis'}
              </button>
            </div>

            <div className="bg-brand-50 border border-brand-100 p-6 rounded-3xl">
              <div className="flex gap-4">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-bold text-brand-900 text-sm mb-1">How it works</h4>
                  <p className="text-xs text-brand-700 leading-relaxed">Our AI uses trend analysis on your historical payout dates to identify patterns that might indicate administrative bottlenecks.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="space-y-6">
            {!out && !loading && (
              <div className="h-full border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center opacity-70">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-4">🔮</div>
                <h4 className="font-bold text-slate-400">Analysis Pending</h4>
                <p className="text-slate-300 text-sm max-w-[200px]">Provide your payment dates to see prediction data.</p>
              </div>
            )}

            {loading && (
              <div className="glass-card p-12 h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin mb-6"></div>
                <p className="text-slate-500 font-medium animate-pulse">Running simulation models...</p>
              </div>
            )}

            {out && !loading && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
                {/* Risk Score Card */}
                <div className="glass-card p-10 overflow-hidden relative">
                  <div className="relative z-10">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Overall Risk Level</p>
                    <div className="flex items-end gap-3 mb-8">
                      <span className={`text-5xl font-black ${out.risk_score > 0.7 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {Math.round(out.risk_score * 100)}%
                      </span>
                      <span className="text-slate-400 font-bold mb-1">/ 100</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${out.risk_score > 0.7 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${out.risk_score * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm font-semibold text-slate-600 capitalize">Analysis: {out.status}</p>
                  </div>

                  {/* Decorative background circle */}
                  <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-5 blur-3xl ${out.risk_score > 0.7 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                </div>

                {/* Timeline Card */}
                <div className="glass-card p-10 bg-slate-900 border-0 text-white">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Predicted Arrival</p>
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">EXPECTED</span>
                      <span className="text-2xl">🗓️</span>
                    </div>
                    <div>
                      <h4 className="text-3xl font-black tracking-tight">{out.expected_next_date}</h4>
                      <p className="text-emerald-400 text-sm font-bold mt-1 inline-flex items-center gap-1">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                        Estimated based on 1.2x delay factor
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
