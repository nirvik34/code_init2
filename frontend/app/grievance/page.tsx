"use client"
import { useState } from 'react'
import { generateGrievance } from '../../lib/api'
import { jsPDF } from 'jspdf'

export default function GrievancePage(){
  const [form, setForm] = useState({scheme:'IGNOAPS', last_payment:'2024-01-10', delay_days:30, name:'Ramesh Kumar'})
  const [letter, setLetter] = useState('')

  const submit = async ()=>{
    const res = await generateGrievance(form as any)
    setLetter(res.letter)
  }

  const downloadPdf = ()=>{
    const doc = new jsPDF()
    doc.text(letter || 'No letter', 10, 10)
    doc.save('grievance.pdf')
  }

  return (
    <main className="p-6">
      <h2 className="text-xl font-semibold mb-4">Grievance Generator</h2>
      <input className="w-full p-2 mb-2" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Name" />
      <input className="w-full p-2 mb-2" value={form.scheme} onChange={e=>setForm({...form, scheme:e.target.value})} placeholder="Scheme" />
      <input className="w-full p-2 mb-2" value={form.last_payment} onChange={e=>setForm({...form, last_payment:e.target.value})} placeholder="Last Payment (ISO)" />
      <input type="number" className="w-full p-2 mb-4" value={form.delay_days} onChange={e=>setForm({...form, delay_days: Number(e.target.value)})} placeholder="Delay days" />
      <button className="btn-primary" onClick={submit}>Generate Letter</button>
      {letter && (
        <div className="mt-4 p-3 bg-white rounded">
          <pre className="whitespace-pre-wrap text-sm">{letter}</pre>
          <div className="mt-2">
            <button className="btn-primary mr-2" onClick={downloadPdf}>Download as PDF</button>
          </div>
        </div>
      )}
    </main>
  )
}
