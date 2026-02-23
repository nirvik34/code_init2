"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Scanner', href: '/upload-doc', icon: 'document_scanner' },
  { label: 'Forecast', href: '/prediction', icon: 'trending_up' },
  { label: 'Grievance', href: '/grievance', icon: 'gavel' },
  { label: 'Simplify', href: '/simplify', icon: 'translate' },
]

export default function TopNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [username, setUsername] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        const u = JSON.parse(stored)
        setUsername(u.username || '')
      } catch { }
    }
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  const logout = () => {
    localStorage.removeItem('user')
    router.push('/auth')
  }

  const displayName = username ? `${username} Ji` : 'User'

  return (
    <header className="w-full bg-white border-b border-[#f5f1f0] sticky top-0 z-50">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 flex items-center justify-center text-dash-primary bg-dash-primary/10 rounded-full">
            <span className="material-symbols-outlined text-2xl">spa</span>
          </div>
          <h1 className="text-ink text-lg font-bold tracking-tight font-sora">SAMAAN</h1>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                pathname === item.href
                  ? 'bg-dash-primary/10 text-dash-primary'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-ink'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Username pill — hidden on small */}
          <span className="hidden sm:block text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {displayName}
          </span>

          {/* Logout button */}
          <button
            onClick={logout}
            title="Logout"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="hidden sm:inline">Logout</span>
          </button>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 text-ink hover:bg-gray-200 transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[22px]">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-[#f5f1f0] bg-white px-4 py-3 flex flex-col gap-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                pathname === item.href
                  ? 'bg-dash-primary/10 text-dash-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-ink'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between px-2">
            <span className="text-sm font-semibold text-gray-500">{displayName}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Logout
            </button>
          </div>
        </nav>
      )}
    </header>
  )
}
