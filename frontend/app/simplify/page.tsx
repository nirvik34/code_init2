"use client"
import { useState } from 'react'
import { simplifyText } from '../../lib/api'

export default function SimplifyPage(){
  const [text, setText] = useState('')
  const [out, setOut] = useState('')

  const go = async ()=>{
    const res = await simplifyText({text})
    setOut(res.simplified_text)
  }

  return (
    <main className="p-6">
      <h2 className="text-xl font-semibold mb-4">Text Simplifier</h2>
      <textarea value={text} onChange={e=>setText(e.target.value)} className="w-full h-40 p-2 mb-4" />
      <button className="btn-primary" onClick={go}>Simplify</button>
      {out && <div className="mt-4 p-3 bg-white rounded whitespace-pre-wrap">{out}</div>}
    </main>
  )
}
