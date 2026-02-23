"use client"
import { useState } from "react"
import FingerprintScanner from "./FingerprintScanner"
import Toast from "./Toast"
import { useRouter } from "next/navigation"

const API = (process.env.NEXT_PUBLIC_API_URL as string) || "http://localhost:8000"

type AuthMethod = "fingerprint" | "standard"

export default function AuthSlider() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [method, setMethod] = useState<AuthMethod>("fingerprint")
  const [stage, setStage] = useState<"scan" | "username">("scan")
  const [fingerprint, setFingerprint] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null)

  function showToast(type: string, message: string) {
    setToast({ type, message })
  }

  function switchMode(m: "login" | "register") {
    setMode(m)
    setStage("scan")
    setFingerprint(null)
    setMethod(m === "login" ? "fingerprint" : "standard")
  }

  async function completeRegister(e: any) {
    e.preventDefault()
    const username = (e.target.username.value as string).trim()
    const password = e.target.password?.value || null

    if (!username) {
      showToast("error", "Username is required")
      return
    }

    setLoading(true)
    try {
      let endpoint = `${API}/signup`
      let payload: any = { username, password: password || "temp_pass" }

      if (method === "fingerprint") {
        if (!fingerprint) throw new Error("Please scan your fingerprint first")
        endpoint = `${API}/register/fingerprint`
        payload = { username, fingerprint }
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.detail || "Registration failed")

      showToast("success", `Account created for ${username}!`)
      setMode("login")
      setMethod(method)
    } catch (err: any) {
      showToast("error", err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e: any) {
    e.preventDefault()
    const username = e.target.username.value.trim()
    const password = e.target.password.value

    setLoading(true)
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.detail || "Login failed")

      showToast("success", `Welcome back, ${j.username}!`)
      localStorage.setItem("user", JSON.stringify(j))
      setTimeout(() => router.push("/dashboard"), 1000)
    } catch (err: any) {
      showToast("error", err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  async function loginWithFingerprint(fp: string) {
    setLoading(true)
    try {
      const res = await fetch(`${API}/login/fingerprint`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fingerprint: fp }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.detail || "Login failed")

      showToast("success", `Welcome back, ${j.username}!`)
      localStorage.setItem("user", JSON.stringify(j))
      setTimeout(() => router.push("/dashboard"), 1000)
    } catch (err: any) {
      showToast("error", err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  /* ────────── SAMAAN Leaf Logo SVG ────────── */
  const SamaanLogo = () => (
    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <g clipPath="url(#clip0_6_543)">
        <path d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z" fill="currentColor" />
        <path clipRule="evenodd" d="M7.24189 26.4066C7.31369 26.4411 7.64204 26.5637 8.52504 26.3738C9.59462 26.1438 11.0343 25.5311 12.7183 24.4963C14.7583 23.2426 17.0256 21.4503 19.238 19.238C21.4503 17.0256 23.2426 14.7583 24.4963 12.7183C25.5311 11.0343 26.1438 9.59463 26.3738 8.52504C26.5637 7.64204 26.4411 7.31369 26.4066 7.24189C26.345 7.21246 26.143 7.14535 25.6664 7.1918C24.9745 7.25925 23.9954 7.5498 22.7699 8.14278C20.3369 9.32007 17.3369 11.4915 14.4142 14.4142C11.4915 17.3369 9.32007 20.3369 8.14278 22.7699C7.5498 23.9954 7.25925 24.9745 7.1918 25.6664C7.14534 26.143 7.21246 26.345 7.24189 26.4066ZM29.9001 10.7285C29.4519 12.0322 28.7617 13.4172 27.9042 14.8126C26.465 17.1544 24.4686 19.6641 22.0664 22.0664C19.6641 24.4686 17.1544 26.465 14.8126 27.9042C13.4172 28.7617 12.0322 29.4519 10.7285 29.9001L21.5754 40.747C21.6001 40.7606 21.8995 40.931 22.8729 40.7217C23.9424 40.4916 25.3821 39.879 27.0661 38.8441C29.1062 37.5904 31.3734 35.7982 33.5858 33.5858C35.7982 31.3734 37.5904 29.1062 38.8441 27.0661C39.879 25.3821 40.4916 23.9425 40.7216 22.8729C40.931 21.8995 40.7606 21.6001 40.747 21.5754L29.9001 10.7285ZM29.2403 4.41187L43.5881 18.7597C44.9757 20.1473 44.9743 22.1235 44.6322 23.7139C44.2714 25.3919 43.4158 27.2666 42.252 29.1604C40.8128 31.5022 38.8165 34.012 36.4142 36.4142C34.012 38.8165 31.5022 40.8128 29.1604 42.252C27.2666 43.4158 25.3919 44.2714 23.7139 44.6322C22.1235 44.9743 20.1473 44.9757 18.7597 43.5881L4.41187 29.2403C3.29027 28.1187 3.08209 26.5973 3.21067 25.2783C3.34099 23.9415 3.8369 22.4852 4.54214 21.0277C5.96129 18.0948 8.43335 14.7382 11.5858 11.5858C14.7382 8.43335 18.0948 5.9613 21.0277 4.54214C22.4852 3.8369 23.9415 3.34099 25.2783 3.21067C26.5973 3.08209 28.1187 3.29028 29.2403 4.41187Z" fill="currentColor" fillRule="evenodd" />
      </g>
      <defs>
        <clipPath id="clip0_6_543"><rect fill="white" height="48" width="48" /></clipPath>
      </defs>
    </svg>
  )

  /* ══════════════════════════ LOGIN CARD ══════════════════════════ */
  if (mode === "login") {
    return (
      <div className="bg-[#0f172a] font-manrope text-slate-900 flex min-h-screen flex-col items-center justify-center p-4 transition-colors duration-300">
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* Header */}
        <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 text-primary">
              <SamaanLogo />
            </div>
            <span className="text-white font-bold tracking-tight text-lg">SAMAAN</span>
          </div>
        </header>

        {/* Main Floating Card */}
        <main className="relative z-0 w-full max-w-[820px] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto min-h-[580px]">
          {/* Left Panel: Login Form */}
          <div className="w-full md:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-between">
            <div>
              {/* Eyebrow */}
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Secure Access</span>
              </div>
              {/* Headline */}
              <h1 className="text-4xl font-extrabold text-slate-900 leading-[1.1] mb-8">
                Welcome<br />Back<span className="text-primary">.</span>
              </h1>
              {/* Tabs */}
              <div className="flex items-center border-b border-slate-100 mb-8">
                <button
                  onClick={() => setMethod("fingerprint")}
                  className={`relative pb-3 px-1 text-sm font-bold transition-colors ${method === "fingerprint" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                >
                  Touch ID
                  {method === "fingerprint" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                </button>
                <button
                  onClick={() => setMethod("standard")}
                  className={`pb-3 px-4 text-sm font-medium transition-colors ${method === "standard" ? "text-slate-900 font-bold" : "text-slate-400 hover:text-slate-600"}`}
                >
                  Password
                  {method === "standard" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                </button>
              </div>

              {/* Touch ID method */}
              {method === "fingerprint" ? (
                <div className="bg-[#f4f4f8] rounded-xl p-8 flex flex-col items-center justify-center text-center h-48 mb-6 relative group cursor-pointer transition-all hover:bg-indigo-50/50">
                  <FingerprintScanner
                    label={loading ? "Authenticating..." : "Touch ID Sensor Active"}
                    onResult={(fp: string) => { if (!loading) loginWithFingerprint(fp) }}
                  />
                  <p className="text-slate-400 text-xs mt-2">Waiting for verification...</p>
                </div>
              ) : (
                /* Password method */
                <form onSubmit={handleLogin} className="space-y-4 mb-6">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 text-sm font-semibold ml-1">Username</label>
                    <div className="relative flex items-center">
                      <input
                        name="username"
                        required
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                      <span className="material-symbols-outlined absolute right-4 text-slate-400 pointer-events-none">person</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-700 text-sm font-semibold ml-1">Password</label>
                    <div className="relative flex items-center">
                      <input
                        name="password"
                        type="password"
                        required
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                      />
                      <span className="material-symbols-outlined absolute right-4 text-slate-400 pointer-events-none">lock</span>
                    </div>
                  </div>
                  <button
                    disabled={loading}
                    className="w-full h-12 bg-primary hover:bg-[#e06538] text-white rounded-lg text-sm font-bold tracking-wide transition-all shadow-lg shadow-primary/30 disabled:opacity-50 mt-2"
                  >
                    {loading ? "Verifying..." : "Sign In"}
                  </button>
                </form>
              )}
            </div>
            {/* Footer Links */}
            <div className="flex justify-between items-center text-xs mt-4">
              <a className="text-slate-400 hover:text-primary transition-colors" href="#">Forgot details?</a>
              <a className="text-slate-400 hover:text-primary transition-colors" href="#">Help Center</a>
            </div>
          </div>

          {/* Right Panel: Geometry & Marketing */}
          <div className="w-full md:w-1/2 bg-cream relative overflow-hidden flex flex-col justify-center p-8 md:p-12">
            {/* Geometric Background Elements */}
            <div className="absolute inset-0 z-0">
              {/* Dot Grid */}
              <div className="absolute top-0 right-0 w-full h-full opacity-20" style={{ backgroundImage: 'radial-gradient(#fb7e51 2px, transparent 2px)', backgroundSize: '24px 24px' }} />
              {/* Coral Half Circle */}
              <div className="absolute top-1/2 -right-24 -translate-y-1/2 w-64 h-64 bg-primary rounded-full opacity-90 blur-[1px]" />
              {/* Indigo Float Dot */}
              <div className="absolute top-24 right-12 w-8 h-8 bg-indigo-accent rounded-full shadow-lg animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            {/* Content */}
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
                First time with SAMAAN?
              </h2>
              <p className="text-slate-600 mb-8 max-w-xs leading-relaxed">
                Join over 2 million pensioners managing their benefits with ease and dignity.
              </p>
              <button
                onClick={() => switchMode("register")}
                className="group flex items-center justify-center gap-2 w-fit px-6 py-3 rounded-lg border-2 border-slate-900 text-slate-900 font-bold text-sm transition-all hover:bg-slate-900 hover:text-white hover:border-slate-900"
              >
                <span>Create Account</span>
                <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
              </button>
            </div>
            {/* Bottom Tagline */}
            <div className="absolute bottom-8 left-12 right-12 z-10 border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-400 font-medium">Pension Assist v3.0</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  /* ══════════════════════════ SIGNUP CARD ══════════════════════════ */
  return (
    <div className="bg-[#0f172a] min-h-screen flex items-center justify-center font-manrope p-4">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Floating Card Container */}
      <div className="flex flex-col md:flex-row w-full max-w-[960px] h-auto md:min-h-[640px] bg-white rounded-[24px] overflow-hidden shadow-2xl relative">

        {/* Left Panel: Geometric Warmth */}
        <div className="hidden md:flex flex-col w-5/12 bg-cream relative overflow-hidden p-10 justify-center items-start z-10">
          {/* Coral Half Circle */}
          <div className="absolute w-[300px] h-[300px] bg-primary rounded-full -left-[150px] bottom-[20%] opacity-90" />
          {/* Dark Dot */}
          <div className="absolute w-16 h-16 bg-[#23140f] rounded-full right-10 top-10 opacity-80" />

          {/* Content */}
          <div className="relative z-20 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-[#23140f] font-sora text-4xl font-bold leading-tight">
                Already<br />with us?
              </h2>
              <p className="text-[#55413a] text-base font-normal leading-relaxed max-w-[240px]">
                Welcome back to the community. Your pension companion awaits.
              </p>
            </div>
            <button
              onClick={() => switchMode("login")}
              className="group flex items-center justify-center gap-2 border-2 border-[#23140f] hover:bg-[#23140f] hover:text-white transition-all duration-300 rounded-full h-12 px-8 text-[#23140f] text-sm font-bold tracking-wider uppercase w-fit"
            >
              <span>Log In</span>
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Right Panel: Form Area */}
        <div className="flex-1 bg-white p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
          {/* Mobile Header */}
          <div className="md:hidden mb-8 flex justify-between items-center">
            <span className="text-2xl font-bold text-slate-900">SAMAAN</span>
            <button onClick={() => switchMode("login")} className="text-primary text-sm font-bold">Log In</button>
          </div>

          <div className="flex flex-col h-full justify-center max-w-md mx-auto w-full">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-slate-400 text-xs font-bold tracking-[0.15em] uppercase">New Account</span>
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            {/* Headline */}
            <h1 className="text-slate-900 font-sora text-4xl md:text-[40px] font-bold leading-[1.1] mb-8">
              Create<br />Account<span className="text-primary">.</span>
            </h1>
            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-8 gap-8">
              <button
                onClick={() => { setMethod("standard"); setStage("scan"); }}
                className={`relative pb-3 text-sm tracking-wide transition-colors ${method === "standard" ? "text-slate-900 font-bold" : "text-slate-400 font-medium hover:text-slate-600"}`}
              >
                Standard
                {method === "standard" && <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-slate-900" />}
              </button>
              <button
                onClick={() => { setMethod("fingerprint"); setStage("scan"); }}
                className={`relative pb-3 text-sm tracking-wide transition-colors ${method === "fingerprint" ? "text-slate-900 font-bold" : "text-slate-400 font-medium hover:text-slate-600"}`}
              >
                Biometric
                {method === "fingerprint" && <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-slate-900" />}
              </button>
            </div>

            {/* Biometric Scan Phase */}
            {method === "fingerprint" && stage === "scan" ? (
              <div className="flex flex-col items-center gap-6 py-8">
                <FingerprintScanner
                  label="Initialize Scanner"
                  onResult={(fp: string) => {
                    setFingerprint(fp)
                    setStage("username")
                    showToast("success", "Encrypted key generated")
                  }}
                />
                <p className="text-xs text-slate-400 italic">Phase 1: Key Generation</p>
              </div>
            ) : (
              /* Standard or Biometric Username Phase */
              <form onSubmit={completeRegister} className="flex flex-col gap-5">
                {fingerprint && method === "fingerprint" && (
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 text-xs text-emerald-700">
                    <span className="p-1 bg-emerald-500 rounded-full text-white text-[8px]">✓</span>
                    <span className="font-mono">Secure Key: {fingerprint.slice(0, 16)}...</span>
                  </div>
                )}

                {/* Full Name */}
                <div className="flex flex-col gap-1.5 group">
                  <label className="text-slate-700 text-sm font-semibold ml-1">Full Name</label>
                  <div className="relative flex items-center">
                    <input
                      name="username"
                      required
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <span className="material-symbols-outlined absolute right-4 text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors">person</span>
                  </div>
                </div>

                {/* Password (Standard only) */}
                {method === "standard" && (
                  <div className="flex flex-col gap-1.5 group">
                    <label className="text-slate-700 text-sm font-semibold ml-1">Password</label>
                    <div className="relative flex items-center">
                      <input
                        name="password"
                        type="password"
                        required
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                      />
                      <span className="material-symbols-outlined absolute right-4 text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors">lock</span>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  disabled={loading}
                  className="mt-4 flex items-center justify-center w-full h-12 bg-primary hover:bg-[#e66a3c] text-white rounded-lg text-sm font-bold tracking-wide transition-all shadow-lg shadow-primary/30 disabled:opacity-50"
                  type="submit"
                >
                  {loading ? "Creating..." : method === "fingerprint" ? "Finalize Profile" : "Create Account"}
                </button>

                {method === "fingerprint" && (
                  <button
                    type="button"
                    onClick={() => setStage("scan")}
                    className="w-full text-center text-xs text-slate-400 font-medium hover:text-slate-600 py-1"
                  >
                    ← Re-scan Biometric
                  </button>
                )}

                <p className="text-center text-xs text-slate-400 mt-2">
                  By creating an account, you agree to our{" "}
                  <a className="underline hover:text-primary" href="#">Terms</a> &{" "}
                  <a className="underline hover:text-primary" href="#">Privacy</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
