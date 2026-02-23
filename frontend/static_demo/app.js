const BASE = 'http://127.0.0.1:8000'

async function predictDelay(){
  const val = document.getElementById('history').value
  const arr = val.split(',').map(s=>s.trim()).filter(Boolean)
  const resEl = document.getElementById('predictResult')
  resEl.textContent = 'Predicting...'
  try{
    const r = await fetch(`${BASE}/predict-delay`,{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({payment_history:arr})
    })
    const data = await r.json()
    resEl.textContent = JSON.stringify(data,null,2)
  }catch(e){resEl.textContent = 'Error: '+e.message}
}

async function ocrExtract(){
  const file = document.getElementById('ocrFile').files[0]
  const resEl = document.getElementById('ocrResult')
  if(!file){resEl.textContent='Select an image first';return}
  resEl.textContent = 'Uploading...'
  const fd = new FormData(); fd.append('file', file)
  try{
    const r = await fetch(`${BASE}/ocr-extract`, { method:'POST', body:fd })
    const data = await r.json()
    resEl.textContent = JSON.stringify(data,null,2)
  }catch(e){resEl.textContent='Error: '+e.message}
}

async function generateGrievance(){
  const name = document.getElementById('g_name').value
  const scheme = document.getElementById('g_scheme').value
  const last = document.getElementById('g_last').value
  const delay = Number(document.getElementById('g_delay').value || 0)
  const resEl = document.getElementById('grResult')
  resEl.textContent = 'Generating...'
  try{
    const r = await fetch(`${BASE}/generate-grievance`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,scheme,last_payment:last,delay_days:delay})})
    const data = await r.json()
    resEl.textContent = data.letter
  }catch(e){resEl.textContent='Error: '+e.message}
}

async function simplify(){
  const text = document.getElementById('simText').value
  const resEl = document.getElementById('simResult')
  resEl.textContent = 'Simplifying...'
  try{
    const r = await fetch(`${BASE}/simplify-text`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})})
    const data = await r.json()
    resEl.textContent = data.simplified_text
  }catch(e){resEl.textContent='Error: '+e.message}
}

document.getElementById('predictBtn').addEventListener('click', predictDelay)
document.getElementById('ocrBtn').addEventListener('click', ocrExtract)
document.getElementById('grBtn').addEventListener('click', generateGrievance)
document.getElementById('simBtn').addEventListener('click', simplify)

// basic backend health check
fetch(BASE + '/').then(r=>r.json()).then(j=>{document.getElementById('backendUrl').textContent = BASE + ' (up)'}).catch(()=>{document.getElementById('backendUrl').textContent = BASE + ' (unreachable)'});
