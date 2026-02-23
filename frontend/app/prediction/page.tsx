"use client"
import { useState } from 'react'
import { predictDelay } from '../../lib/api'

export default function PredictionPage() {
  const [dates, setDates] = useState('')
  const [out, setOut] = useState<any>(null)

  const go = async () => {
    const arr = dates.split(',').map(s => s.trim()).filter(Boolean)
    const res = await predictDelay({ payment_history: arr })
    setOut(res)
  }

  return (
    <main className="p-6">
      <h2 className="text-xl font-semibold mb-4">Delay Prediction</h2>
      <input placeholder="2024-01-10,2024-02-11" value={dates} onChange={e=>setDates(e.target.value)} className="w-full p-2 mb-4" />
      <button className="btn-primary" onClick={go}>Predict</button>
      {out && (
        <div className="mt-4 p-3 bg-white rounded">
          <div><strong>Status:</strong> {out.status}</div>
          <div><strong>Risk Score:</strong> {out.risk_score}</div>
          <div><strong>Expected Next:</strong> {out.expected_next_date}</div>
        </div>
      )}
    </main>
  )
}
