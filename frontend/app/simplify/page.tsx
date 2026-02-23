"use client"
import { useState, useRef, useEffect } from 'react'
import { simplifyText } from '../../lib/api'
import TopNav from '../../components/TopNav'

// All 22 scheduled languages of India + English
const LANGUAGES = [
  { code: 'en',  label: 'English',          flag: '🇬🇧', voiceLang: 'en-IN'  },
  { code: 'hi',  label: 'हिन्दी',             flag: '🇮🇳', voiceLang: 'hi-IN'  },
  { code: 'bn',  label: 'বাংলা',             flag: '🇮🇳', voiceLang: 'bn-IN'  },
  { code: 'ta',  label: 'தமிழ்',              flag: '🇮🇳', voiceLang: 'ta-IN'  },
  { code: 'te',  label: 'తెలుగు',            flag: '🇮🇳', voiceLang: 'te-IN'  },
  { code: 'mr',  label: 'मराठी',              flag: '🇮🇳', voiceLang: 'mr-IN'  },
  { code: 'gu',  label: 'ગુજરાતી',           flag: '🇮🇳', voiceLang: 'gu-IN'  },
  { code: 'kn',  label: 'ಕನ್ನಡ',             flag: '🇮🇳', voiceLang: 'kn-IN'  },
  { code: 'ml',  label: 'മലയാളം',            flag: '🇮🇳', voiceLang: 'ml-IN'  },
  { code: 'pa',  label: 'ਪੰਜਾਬੀ',            flag: '🇮🇳', voiceLang: 'pa-IN'  },
  { code: 'or',  label: 'ଓଡ଼ିଆ',              flag: '🇮🇳', voiceLang: 'or-IN'  },
  { code: 'as',  label: 'অসমীয়া',           flag: '🇮🇳', voiceLang: 'as-IN'  },
  { code: 'ur',  label: 'اردو',               flag: '🇮🇳', voiceLang: 'ur-IN'  },
  { code: 'ne',  label: 'नेपाली',             flag: '🇮🇳', voiceLang: 'ne-IN'  },
  { code: 'ks',  label: 'کٲشُر',             flag: '🇮🇳', voiceLang: 'ks-IN'  },
  { code: 'kok', label: 'कोंकणी',            flag: '🇮🇳', voiceLang: 'kok-IN' },
  { code: 'mai', label: 'मैथिली',             flag: '🇮🇳', voiceLang: 'mai-IN' },
  { code: 'sd',  label: 'سنڌي',               flag: '🇮🇳', voiceLang: 'sd-IN'  },
  { code: 'sa',  label: 'संस्कृतम्',          flag: '🇮🇳', voiceLang: 'sa-IN'  },
  { code: 'doi', label: 'डोगरी',              flag: '🇮🇳', voiceLang: 'doi-IN' },
  { code: 'brx', label: 'बड़ो',               flag: '🇮🇳', voiceLang: 'brx-IN' },
  { code: 'mni', label: 'মৈতৈলোন্',          flag: '🇮🇳', voiceLang: 'mni-IN' },
  { code: 'sat', label: 'ᱥᱟᱱᱛᱟᱲᱤ',          flag: '🇮🇳', voiceLang: 'sat-IN' },
]

const EXAMPLE_TEXT = `Pursuant to the amendments of Section 401(k) subsection 4(b) regarding annual cost-of-living adjustments, beneficiaries are hereby notified that the indexation factor for the upcoming fiscal quarter has been recalibrated to align with the Consumer Price Index (CPI-W) fluctuations observed in the preceding bi-annual period. Failure to submit form 1099-R by the stipulated deadline may result in a temporary suspension of disbursement.`

export default function SimplifyPage() {
  const [text, setText] = useState('')
  const [out, setOut] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [language, setLanguage] = useState('en')
  const [mode, setMode] = useState<'simplify' | 'translate'>('simplify')
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [error, setError] = useState('')

  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
      recognitionRef.current?.stop()
    }
  }, [])

  const go = async () => {
    if (!text.trim()) return
    setLoading(true)
    setOut('')
    setError('')
    try {
      const res = await simplifyText({ text, language, mode })
      setOut(res.simplified_text)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser. Try Chrome.')
      return
    }
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    const rec = new SpeechRecognition()
    rec.lang = LANGUAGES.find(l => l.code === language)?.voiceLang || 'en-IN'
    rec.continuous = true
    rec.interimResults = false
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results as SpeechRecognitionResultList)
        .map((r: SpeechRecognitionResult) => r[0].transcript)
        .join(' ')
      setText(prev => prev ? prev + ' ' + transcript : transcript)
    }
    rec.onerror = () => { setListening(false); setError('Mic error. Allow microphone access and try again.') }
    rec.onend = () => setListening(false)
    recognitionRef.current = rec
    rec.start()
    setListening(true)
    setError('')
  }

  const toggleSpeak = () => {
    if (!out) return
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return }
    const utterance = new SpeechSynthesisUtterance(out)
    utterance.lang = LANGUAGES.find(l => l.code === language)?.voiceLang || 'en-IN'
    utterance.rate = 0.9
    const voices = window.speechSynthesis.getVoices()
    const match = voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0]))
    if (match) utterance.voice = match
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  const copyText = () => {
    navigator.clipboard.writeText(out)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const printText = () => {
    const pw = window.open('', '_blank')
    if (pw) {
      const modeLabel = mode === 'translate' ? 'Translated' : 'Simplified'
      pw.document.write(`<html><head><title>SAMAAN – ${modeLabel}</title>
        <style>body{font-family:system-ui,sans-serif;max-width:700px;margin:40px auto;padding:40px;line-height:1.8;font-size:18px;color:#181311}</style>
        </head><body><h2 style="color:#fa6c38;margin-bottom:24px">SAMAAN — ${modeLabel} Text</h2><p>${out}</p></body></html>`)
      pw.document.close()
      pw.print()
    }
  }

  const loadExample = () => { setText(EXAMPLE_TEXT); setOut(''); setError('') }
  const clear = () => { setText(''); setOut(''); setError(''); window.speechSynthesis?.cancel(); setSpeaking(false) }
  const selectedLang = LANGUAGES.find(l => l.code === language)!

  return (
    <div className="min-h-screen flex flex-col bg-bg-light font-sans">
      <TopNav />

      {/* Page Header */}
      <div className="bg-white border-b border-[#f5f1f0] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink font-sora tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-dash-primary text-2xl">translate</span>
            {mode === 'translate' ? 'Translator' : 'Language Simplifier'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {mode === 'translate' ? 'Translate any text into your preferred Indian language' : 'Turn complex pension & legal text into plain, easy language'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
            <button
              onClick={() => { setMode('simplify'); setOut('') }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'simplify' ? 'bg-white text-dash-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">auto_fix_high</span>
              Simplify
            </button>
            <button
              onClick={() => { setMode('translate'); setOut('') }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'translate' ? 'bg-white text-dash-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">g_translate</span>
              Translate
            </button>
          </div>
          {/* Language selector */}
          <div className="relative">
            <select
              value={language}
              onChange={e => { setLanguage(e.target.value); setOut('') }}
              className="appearance-none pl-9 pr-8 py-2 rounded-xl border border-[#ece8e6] bg-white text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-dash-primary/30 focus:border-dash-primary cursor-pointer"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
              ))}
            </select>
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-base pointer-events-none">{selectedLang.flag}</span>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-gray-400 pointer-events-none">expand_more</span>
          </div>
          <button
            onClick={loadExample}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dash-primary/30 text-dash-primary text-sm font-semibold hover:bg-dash-primary/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[17px]">auto_fix_high</span>
            Try example
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mt-4 flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">
          <span className="material-symbols-outlined text-rose-500 text-[18px]">error</span>
          <p className="text-sm text-rose-700 font-medium flex-1">{error}</p>
          <button onClick={() => setError('')}><span className="material-symbols-outlined text-[17px] text-rose-400">close</span></button>
        </div>
      )}

      {/* Main Split */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0">

        {/* ── Left: Input ── */}
        <section className="w-full lg:w-1/2 bg-white flex flex-col border-b lg:border-b-0 lg:border-r border-[#f5f1f0]">
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#f5f1f0]">
            <div className="flex items-center gap-2 text-gray-400">
              <span className="material-symbols-outlined text-[17px]">description</span>
              <span className="text-xs font-bold uppercase tracking-widest">Original Text</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleVoiceInput}
                title={listening ? 'Stop recording' : `Speak in ${selectedLang.label}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  listening ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-dash-primary/10 hover:text-dash-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{listening ? 'mic_off' : 'mic'}</span>
                {listening ? 'Stop' : 'Speak'}
              </button>
              {text && (
                <button onClick={clear} className="text-xs font-semibold text-rose-400 hover:text-rose-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">close</span>Clear
                </button>
              )}
            </div>
          </div>

          {listening && (
            <div className="flex items-center gap-2 px-6 py-2 bg-rose-50 border-b border-rose-100">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
              </span>
              <span className="text-xs font-semibold text-rose-600">Listening in {selectedLang.label}… speak now</span>
            </div>
          )}

          <div className="flex-1 flex flex-col p-6 gap-4">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              className="flex-1 min-h-[200px] w-full p-4 text-slate-700 leading-relaxed outline-none resize-none bg-[#fafaf9] border border-[#ece8e6] rounded-2xl text-sm focus:ring-2 focus:ring-dash-primary/20 focus:border-dash-primary transition-all placeholder:text-gray-300"
              placeholder="Paste a government notice, pension order, or legal letter here… or tap the mic to speak"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{text.length} characters</span>
              <button
                onClick={go}
                disabled={!text.trim() || loading}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                  !text.trim() || loading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-dash-primary text-white shadow-lg shadow-dash-primary/25 hover:bg-orange-600 active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{mode === 'translate' ? 'Translating…' : 'Simplifying…'}</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">{mode === 'translate' ? 'g_translate' : 'auto_fix_high'}</span>{mode === 'translate' ? `Translate to ${selectedLang.label}` : `Simplify in ${selectedLang.label}`}</>
                )}
              </button>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="bg-dash-primary/5 border border-dash-primary/10 rounded-2xl p-4 flex gap-3">
              <span className="material-symbols-outlined text-dash-primary text-[18px] mt-0.5 shrink-0">tips_and_updates</span>
              <p className="text-xs text-gray-600 leading-relaxed">
                {mode === 'translate'
                  ? <>Works with any text. Select your language above — AI will give you a <strong>full accurate translation</strong>, preserving all details.</>
                  : <>Works best with <strong>pension orders, circulars and legal notices</strong>. Select your preferred language above — AI will reply in that language.</>}
              </p>
            </div>
          </div>
        </section>

        {/* ── Right: Output ── */}
        <section className="w-full lg:w-1/2 bg-[#fffbf7] flex flex-col">
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#f5f1f0]">
            <div className="flex items-center gap-2 text-dash-primary">
              <span className="material-symbols-outlined text-[17px]">translate</span>
              <span className="text-xs font-bold uppercase tracking-widest">{mode === 'translate' ? `Translated to ${selectedLang.label}` : `In Plain ${selectedLang.label}`}</span>
            </div>
            {out && (
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleSpeak}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    speaking ? 'bg-dash-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-dash-primary/10 hover:text-dash-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{speaking ? 'stop_circle' : 'volume_up'}</span>
                  {speaking ? 'Stop' : 'Read aloud'}
                </button>
                <button onClick={copyText} className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-dash-primary transition-colors">
                  <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={printText} className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-dash-primary transition-colors">
                  <span className="material-symbols-outlined text-[16px]">print</span>Print
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col p-6">
            {!out && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-12">
                <div className="w-20 h-20 rounded-full bg-dash-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-dash-primary text-4xl">translate</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-400 text-lg">{mode === 'translate' ? 'Ready to translate' : 'Ready to simplify'}</p>
                  <p className="text-sm text-gray-300 mt-1">Your {selectedLang.label} {mode === 'translate' ? 'translation' : 'explanation'} will appear here</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-[#ece8e6] rounded-2xl px-4 py-3 text-xs text-gray-500 max-w-xs">
                  <span className="material-symbols-outlined text-[16px] text-dash-primary">mic</span>
                  <span>Tap the <strong>Speak</strong> button to use your voice instead of typing</span>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex-1 flex flex-col gap-4 pt-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-5 h-5 border-[3px] border-dash-primary/20 border-t-dash-primary rounded-full animate-spin" />
                  <span className="text-sm font-medium text-gray-400 animate-pulse">AI is {mode === 'translate' ? 'translating' : 'simplifying'} in {selectedLang.label}…</span>
                </div>
                <div className="space-y-3">
                  {[95, 80, 90, 65, 55].map((w, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded-full animate-pulse" style={{ width: `${w}%`, animationDelay: `${i * 0.08}s` }} />
                  ))}
                </div>
              </div>
            )}

            {out && !loading && (
              <div className="flex-1 flex flex-col gap-5">
                {speaking && (
                  <div className="flex items-center gap-2 bg-dash-primary/10 rounded-xl px-4 py-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dash-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-dash-primary" />
                    </span>
                    <span className="text-xs font-semibold text-dash-primary">Reading aloud in {selectedLang.label}…</span>
                    <button onClick={toggleSpeak} className="ml-auto text-xs font-bold text-dash-primary hover:text-orange-700">Stop</button>
                  </div>
                )}

                <div className="bg-white border border-[#ece8e6] rounded-2xl p-6 shadow-sm">
                  <p className="text-base leading-relaxed text-ink">{out}</p>
                </div>

                <div className="bg-white border-l-4 border-dash-primary rounded-r-2xl p-4 flex gap-3 shadow-sm">
                  <span className="material-symbols-outlined text-dash-primary mt-0.5 shrink-0">lightbulb</span>
                  <div>
                    <p className="text-sm font-bold text-ink mb-0.5">Key Insight</p>
                    <p className="text-sm text-gray-500">
                      {mode === 'translate'
                        ? `Full meaning translated to ${selectedLang.label} above. Share this with someone who reads ${selectedLang.label}.`
                        : 'Main action items simplified above. If unsure, visit your nearest pension office with this summary.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-auto flex-wrap">
                  <button
                    onClick={toggleSpeak}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      speaking ? 'border-dash-primary bg-dash-primary text-white' : 'border-[#ece8e6] text-gray-600 hover:border-dash-primary hover:text-dash-primary bg-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px]">{speaking ? 'stop_circle' : 'volume_up'}</span>
                    {speaking ? 'Stop' : 'Read Aloud'}
                  </button>
                  <button
                    onClick={copyText}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      copied ? 'border-green-300 text-green-600 bg-green-50' : 'border-[#ece8e6] text-gray-600 hover:border-dash-primary hover:text-dash-primary bg-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px]">{copied ? 'check_circle' : 'content_copy'}</span>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={printText}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#ece8e6] text-sm font-semibold text-gray-600 hover:border-dash-primary hover:text-dash-primary bg-white transition-all"
                  >
                    <span className="material-symbols-outlined text-[17px]">print</span>Print
                  </button>
                  <button
                    onClick={clear}
                    className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dash-primary/10 text-dash-primary text-sm font-semibold hover:bg-dash-primary/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[17px]">refresh</span>New
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
