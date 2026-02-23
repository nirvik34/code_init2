"use client"
import Link from 'next/link'

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">SAMAAN Pension Assist</h1>
      <p className="mb-4">AI-powered, accessibility-first pension companion.</p>
      <nav className="space-y-2">
        <Link className="btn-primary block" href="/dashboard">Open Dashboard</Link>
        <Link className="btn-primary block mt-2" href="/upload-doc">Upload Document (OCR)</Link>
        <Link className="btn-primary block mt-2" href="/prediction">Prediction</Link>
        <Link className="btn-primary block mt-2" href="/grievance">Generate Grievance</Link>
        <Link className="btn-primary block mt-2" href="/simplify">Simplify Text</Link>
      </nav>
    </main>
  )
}
