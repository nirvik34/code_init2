import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import SWRegister from './sw-register'
import PWAInstallPrompt from '../components/PWAInstallPrompt'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'SAMAAN | Pension Assist',
  description: 'AI-powered, accessibility-first pension companion.',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body className="min-h-screen flex flex-col">
        {/* Navbar */}
        <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-lg border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">SAMAAN</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
              <Link href="/upload-doc" className="nav-link">Upload OCR</Link>
              <Link href="/prediction" className="nav-link">Predictions</Link>
              <Link href="/grievance" className="nav-link">Grievance</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="text-xs font-semibold px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
                Help
              </button>
              <button className="text-xs font-semibold bg-brand-600 text-white px-5 py-2 rounded-full hover:bg-brand-700 transition-shadow shadow-md">
                Sign In
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 bg-surface-50">
          {children}
        </main>

        {/* PWA Registration */}
        <SWRegister />
        <PWAInstallPrompt />

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm text-slate-500">
              © 2024 SAMAAN Pension Assist. Empowering seniors with AI.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
