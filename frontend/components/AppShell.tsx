"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const navItems = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Upload OCR', href: '/upload-doc' },
        { label: 'Predictions', href: '/prediction' },
        { label: 'Grievance', href: '/grievance' },
        { label: 'Simplify', href: '/simplify' },
    ]

    return (
        <>
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-lg border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 text-primary">
                            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 4C12.95 4 4 12.95 4 24C4 35.05 12.95 44 24 44C35.05 44 44 35.05 44 24C44 12.95 35.05 4 24 4ZM24 40C15.16 40 8 32.84 8 24C8 15.16 15.16 8 24 8C32.84 8 40 15.16 40 24C40 32.84 32.84 40 24 40Z" fill="currentColor" />
                                <path d="M24 14C18.48 14 14 18.48 14 24C14 29.52 18.48 34 24 34C29.52 34 34 29.52 34 24C34 18.48 29.52 14 24 14ZM24 30C20.69 30 18 27.31 18 24C18 20.69 20.69 18 24 18C27.31 18 30 20.69 30 24C30 27.31 27.31 30 24 30Z" fill="currentColor" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold tracking-tight text-ink">SAMAAN</span>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-8">
                        {navItems.map(item => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-link ${pathname === item.href ? 'text-primary font-semibold' : ''}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-4">
                        <button className="text-xs font-semibold px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
                            Help
                        </button>
                        <Link href="/auth" className="text-xs font-semibold bg-primary text-white px-5 py-2 rounded-full hover:bg-orange-600 transition-shadow shadow-md">
                            Sign In
                        </Link>
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <div className="flex-1 bg-surface-50">
                {children}
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm text-slate-500">
                        © 2025 SAMAAN Pension Assist. Empowering seniors with AI.
                    </p>
                </div>
            </footer>
        </>
    )
}
