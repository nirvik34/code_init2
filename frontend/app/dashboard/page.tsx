"use client"
import { useState } from 'react'
import { predictDelay } from '../../lib/api'

export default function Dashboard() {
  const [history, setHistory] = useState('2024-01-10,2024-02-10')
  const [result, setResult] = useState<any>(null)

  const submit = async () => {
    const arr = history.split(',').map(s => s.trim())
    const res = await predictDelay({ payment_history: arr })
    setResult(res)
  }

  return (
    <main className="p-6">
      <h2 className="text-xl font-semibold mb-4">Pension Dashboard</h2>
      <label className="block mb-2">Payment history (comma separated ISO dates)</label>
      <textarea value={history} onChange={e => setHistory(e.target.value)} className="w-full p-2 mb-4 h-24" />
      <button className="btn-primary" onClick={submit}>Predict Delay</button>

      {result && (
        <div className="mt-4 p-3 bg-white rounded">
          <div><strong>Status:</strong> {result.status}</div>
          <div><strong>Risk Score:</strong> {result.risk_score}</div>
          <div><strong>Expected Next Date:</strong> {result.expected_next_date}</div>
        </div>
      )}
    </main>
  )
}
