"use client"
import { useState } from 'react'
import { ocrExtract } from '../../lib/api'

export default function UploadDoc() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)

  const submit = async () => {
    if (!file) return
    const res = await ocrExtract(file)
    setResult(res)
  }

  return (
    <main className="p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Document (OCR)</h2>
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mb-4" />
      <button className="btn-primary" onClick={submit}>Upload & Extract</button>

      {result && (
        <div className="mt-4 p-3 bg-white rounded">
          <div><strong>Name:</strong> {result.name}</div>
          <div><strong>Pension ID:</strong> {result.pension_id}</div>
          <div><strong>Account:</strong> {result.account_number}</div>
          <div className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{result.raw_text}</div>
        </div>
      )}
    </main>
  )
}
