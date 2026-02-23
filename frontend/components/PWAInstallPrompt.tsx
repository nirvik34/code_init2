"use client"
import { useState, useEffect } from 'react'

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [showPrompt, setShowPrompt] = useState(false)

    useEffect(() => {
        console.log("PWA: Install listener attached")

        const handler = (e: any) => {
            console.log("PWA: beforeinstallprompt event caught!")
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault()
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e)

            // Wait for user interaction or show immediately
            const dismissed = sessionStorage.getItem('pwa-prompt-dismissed')
            if (!dismissed) {
                setShowPrompt(true)
            }
        }

        window.addEventListener('beforeinstallprompt', handler)

        // Log current installation state
        window.addEventListener('appinstalled', () => {
            console.log('PWA: App was installed')
            setShowPrompt(false)
        })

        // Check if already in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log("PWA: Already running in standalone mode")
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            console.error("PWA: No deferred prompt available")
            return
        }

        // Show the install prompt
        deferredPrompt.prompt()

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice
        console.log(`PWA: User response to the install prompt: ${outcome}`)

        // We've used the prompt, and can't use it again
        setDeferredPrompt(null)
        setShowPrompt(false)
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        sessionStorage.setItem('pwa-prompt-dismissed', 'true')
    }

    if (!showPrompt) return null

    return (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 z-[100] animate-in slide-in-from-bottom-10 duration-500">
            <div className="glass-card p-6 border-brand-200 bg-white/95 shadow-22xl relative overflow-hidden backdrop-blur-xl">
                {/* Subtle background glow */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl font-sans"></div>

                <div className="flex gap-4 items-start relative z-10">
                    <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-brand-600/20">
                        <span className="text-white font-bold text-xl">S</span>
                    </div>

                    <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-lg mb-1 tracking-tight">Install SAMAAN App</h4>
                        <p className="text-slate-500 text-sm leading-relaxed mb-4">
                            Access your pension companion instantly from your home screen, even offline.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={handleInstallClick}
                                className="flex-1 bg-brand-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-brand-700 transition-colors shadow-md active:scale-95"
                            >
                                Install Now
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="flex-1 bg-slate-100 text-slate-600 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-colors active:scale-95"
                            >
                                Later
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
