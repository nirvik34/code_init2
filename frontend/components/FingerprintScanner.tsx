"use client"
import { useState, useEffect, useRef } from "react"

interface Props {
  label?: string
  onResult?: (fp: string) => void
}

// Particle positions for burst animation
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  angle: (i / 12) * 360,
  dist: 60 + Math.random() * 20,
}))

export default function FingerprintScanner({ label = "Tap to scan", onResult }: Props) {
  const [phase, setPhase] = useState<"idle" | "scanning" | "done" | "error">("idle")
  const [scanY, setScanY] = useState(0)
  const [showParticles, setShowParticles] = useState(false)
  const [capturedKey, setCapturedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const pulseRef = useRef<number>(0)

  // Scanning beam animation
  useEffect(() => {
    if (phase !== "scanning") return
    let y = 0
    let dir = 1
    const iv = setInterval(() => {
      y += dir * 4
      if (y >= 100) dir = -1
      if (y <= 0) dir = 1
      setScanY(y)
    }, 12)
    return () => clearInterval(iv)
  }, [phase])

  // Particle burst timeout
  useEffect(() => {
    if (!showParticles) return
    const t = setTimeout(() => setShowParticles(false), 800)
    return () => clearTimeout(t)
  }, [showParticles])

  async function generateDeviceFingerprint(): Promise<string> {
    const signals: string[] = []

    // 1. Screen geometry
    signals.push(`${screen.width}x${screen.height}x${screen.colorDepth}`)
    signals.push(`dpr${Math.round((window.devicePixelRatio || 1) * 100)}`)

    // 2. Platform / locale / hardware
    signals.push(navigator.language || "unknown")
    signals.push(`cpu${navigator.hardwareConcurrency || 0}`)
    signals.push(navigator.platform || "unknown")
    signals.push(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC")
    signals.push(navigator.userAgent.slice(0, 60))

    // 3. Canvas fingerprint — most stable signal
    try {
      const c = document.createElement("canvas")
      c.width = 280; c.height = 80
      const ctx = c.getContext("2d")!
      ctx.fillStyle = "#f72585"
      ctx.fillRect(10, 5, 80, 40)
      ctx.fillStyle = "#3a0ca3"
      ctx.font = "bold 16px Arial"
      ctx.fillText("SAMAAN-fp-v2 ©", 5, 60)
      ctx.fillStyle = "rgba(76,201,240,0.7)"
      ctx.fillText("SAMAAN-fp-v2 ©", 7, 62)
      // Add a gradient
      const g = ctx.createLinearGradient(0, 0, 280, 0)
      g.addColorStop(0, "rgba(114,9,183,0.5)")
      g.addColorStop(1, "rgba(72,149,239,0.5)")
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 280, 80)
      signals.push(c.toDataURL().slice(-120))
    } catch {
      signals.push("no-canvas")
    }

    // 4. WebGL renderer
    try {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl") as WebGLRenderingContext | null
      if (gl) {
        const ext = gl.getExtension("WEBGL_debug_renderer_info")
        if (ext) {
          signals.push(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL))
        }
      }
    } catch { /* skip */ }

    // 5. Stable two-chunk hash
    const raw = signals.join("||")
    let h1 = 0x9e3779b9, h2 = 0x6c62272e, h3 = 0xd37e9a1c
    for (let i = 0; i < raw.length; i++) {
      const c = raw.charCodeAt(i)
      h1 = Math.imul(h1 ^ c, 0x9f4f2906) >>> 0
      h2 = Math.imul(h2 ^ c, 0x2e1a9f4f) >>> 0
      h3 = Math.imul(h3 ^ c, 0x6b43a9aa) >>> 0
    }
    const p1 = (h1 >>> 0).toString(16).padStart(8, "0")
    const p2 = (h2 >>> 0).toString(16).padStart(8, "0")
    const p3 = (h3 >>> 0).toString(16).padStart(8, "0")
    return `fp_${p1}${p2}${p3}`
  }

  async function handleScan() {
    if (phase === "scanning") return
    setPhase("scanning")
    setScanY(0)
    setCapturedKey(null)

    await new Promise((r) => setTimeout(r, 2000))

    try {
      const fp = await generateDeviceFingerprint()
      setCapturedKey(fp)
      setPhase("done")
      setShowParticles(true)
      onResult && onResult(fp)
      setTimeout(() => setPhase("idle"), 3000)
    } catch {
      setPhase("error")
      setTimeout(() => setPhase("idle"), 2000)
    }
  }

  function copyKey() {
    if (!capturedKey) return
    navigator.clipboard.writeText(capturedKey).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const colors = {
    idle: { ring: "#94a3b8", glow: "transparent", bg: "#f8fafc", text: "#64748b" },
    scanning: { ring: "#6366f1", glow: "rgba(99,102,241,0.25)", bg: "#eef2ff", text: "#4f46e5" },
    done: { ring: "#10b981", glow: "rgba(16,185,129,0.25)", bg: "#ecfdf5", text: "#059669" },
    error: { ring: "#ef4444", glow: "rgba(239,68,68,0.2)", bg: "#fef2f2", text: "#dc2626" },
  }
  const c = colors[phase]

  // Fingerprint arc paths (realistic ridges)
  const ridges = [
    "M 60 30 Q 85 40 85 62 Q 85 84 60 94 Q 35 84 35 62 Q 35 40 60 30",
    "M 60 22 Q 93 34 93 62 Q 93 90 60 102 Q 27 90 27 62 Q 27 34 60 22",
    "M 60 14 Q 101 28 101 62 Q 101 96 60 110 Q 19 96 19 62 Q 19 28 60 14",
    "M 60 38 Q 77 46 77 62 Q 77 78 60 86 Q 43 78 43 62 Q 43 46 60 38",
    "M 60 46 Q 69 52 69 62 Q 69 72 60 78 Q 51 72 51 62 Q 51 52 60 46",
  ]

  const phaseLabel = {
    idle: label,
    scanning: "Scanning biometrics…",
    done: "Identity captured ✓",
    error: "Scan failed — retry",
  }

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Main button */}
      <button
        onClick={handleScan}
        className="relative focus:outline-none group"
        aria-label="Scan fingerprint"
        disabled={phase === "scanning"}
      >
        {/* Multi-ring pulse when scanning */}
        {phase === "scanning" && (
          <>
            <span className="absolute inset-[-12px] rounded-full border-2 border-indigo-400/40 animate-ping" />
            <span
              className="absolute inset-[-24px] rounded-full border border-indigo-300/20 animate-ping"
              style={{ animationDelay: "0.3s" }}
            />
          </>
        )}

        {/* Particle burst on done */}
        {showParticles && PARTICLES.map((p, i) => {
          const rad = (p.angle * Math.PI) / 180
          const tx = Math.cos(rad) * p.dist
          const ty = Math.sin(rad) * p.dist
          return (
            <span
              key={i}
              className="absolute w-2 h-2 rounded-full bg-emerald-400"
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px)`,
                opacity: 0,
                animation: "particle-burst 0.7s ease-out forwards",
              }}
            />
          )
        })}

        {/* Circle container */}
        <div
          className="relative w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500"
          style={{
            background: c.bg,
            boxShadow: `0 0 0 4px ${c.glow}, 0 8px 32px rgba(0,0,0,0.10)`,
          }}
        >
          <svg viewBox="0 0 120 120" width="92" height="92" style={{ overflow: "visible" }}>
            {/* Glow filter */}
            <defs>
              <filter id="fp-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="fp-scan-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.9" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>

            {/* Fingerprint ridges */}
            {ridges.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={c.ring}
                strokeWidth={phase === "idle" ? "1.8" : "2.4"}
                strokeLinecap="round"
                opacity={phase === "idle" ? 0.3 + i * 0.08 : 0.7 + i * 0.06}
                filter={phase !== "idle" ? "url(#fp-glow)" : undefined}
                style={{ transition: "stroke 0.4s, opacity 0.4s, stroke-width 0.4s" }}
              />
            ))}

            {/* Scanning beam */}
            {phase === "scanning" && (
              <rect
                x="10"
                y={scanY + 8}
                width="100"
                height="4"
                rx="2"
                fill="url(#fp-scan-grad)"
                opacity="0.85"
              />
            )}

            {/* Done tick */}
            {phase === "done" && (
              <>
                <circle cx="60" cy="60" r="24" fill="#10b981" opacity="0.12" />
                <path
                  d="M48 60 L57 69 L74 50"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </>
            )}

            {/* Error X */}
            {phase === "error" && (
              <>
                <circle cx="60" cy="60" r="24" fill="#ef4444" opacity="0.10" />
                <path
                  d="M50 50 L70 70 M70 50 L50 70"
                  stroke="#ef4444"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            )}
          </svg>
        </div>
      </button>

      {/* Label */}
      <span
        className="text-sm font-semibold tracking-wide transition-colors duration-300"
        style={{ color: c.text }}
      >
        {phaseLabel[phase]}
      </span>

      {/* Hash key preview after capture */}
      {capturedKey && phase !== "scanning" && (
        <div className="flex items-center gap-2 mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <span className="font-mono text-[11px] text-slate-500 tracking-tight">
            {capturedKey.slice(0, 20)}…
          </span>
          <button
            onClick={copyKey}
            className="ml-1 p-1 rounded hover:bg-slate-200 transition-colors"
            title="Copy full key"
          >
            {copied
              ? <span className="text-emerald-500 text-[13px]">✓</span>
              : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
            }
          </button>
        </div>
      )}

      {/* CSS particle animation */}
      <style>{`
        @keyframes particle-burst {
          0%   { opacity: 1; transform: translate(-50%, -50%) translate(0px, 0px) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) translate(var(--tx, 60px), var(--ty, 60px)) scale(0.2); }
        }
      `}</style>
    </div>
  )
}
