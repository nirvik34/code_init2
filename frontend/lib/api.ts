import axios from 'axios'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function healthCheck() {
  const res = await axios.get(`${BASE}/`)
  return res.data
}

export async function predictDelay(payload: { payment_history: string[] }) {
  const res = await axios.post(`${BASE}/predict-delay`, payload)
  return res.data
}

export async function ocrExtract(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await axios.post(`${BASE}/ocr-extract`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  return res.data
}

export async function generateGrievance(payload: { scheme: string, last_payment: string, delay_days: number, name: string }) {
  const res = await axios.post(`${BASE}/generate-grievance`, payload)
  return res.data
}

export async function simplifyText(payload: { text: string; language?: string; mode?: 'simplify' | 'translate' }) {
  const res = await axios.post(`${BASE}/simplify-text`, payload)
  return res.data
}

export async function fetchDashboardData() {
  // Returns prediction data that the dashboard can use
  try {
    const res = await axios.get(`${BASE}/`)
    return res.data
  } catch {
    return null
  }
}

export async function listUsers() {
  const res = await axios.get(`${BASE}/users`)
  return res.data
}

export interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

export async function sendChatMessage(messages: ChatMsg[]): Promise<string> {
  try {
    const res = await axios.post(`${BASE}/chat`, { messages })
    return res.data.reply
  } catch {
    return 'Sorry, I could not connect to the server. Please try again.'
  }
}
