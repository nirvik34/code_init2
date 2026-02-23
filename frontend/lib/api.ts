import axios from 'axios'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function predictDelay(payload: { payment_history: string[] }){
  const res = await axios.post(`${BASE}/predict-delay`, payload)
  return res.data
}

export async function ocrExtract(file: File){
  const fd = new FormData()
  fd.append('file', file)
  const res = await axios.post(`${BASE}/ocr-extract`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  return res.data
}

export async function generateGrievance(payload: { scheme: string, last_payment: string, delay_days: number, name: string }){
  const res = await axios.post(`${BASE}/generate-grievance`, payload)
  return res.data
}

export async function simplifyText(payload: { text: string }){
  const res = await axios.post(`${BASE}/simplify-text`, payload)
  return res.data
}
