"use client"
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white text-ink font-display overflow-x-hidden">
      {/* ═══════════ Left Panel: Content & Navigation ═══════════ */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white relative z-10 px-6 py-6 lg:px-12 lg:py-8 xl:px-20 xl:py-10 border-r border-slate-100">

        {/* Header */}
        <header className="flex items-center justify-between mb-16 lg:mb-24">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 text-primary">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4C12.95 4 4 12.95 4 24C4 35.05 12.95 44 24 44C35.05 44 44 35.05 44 24C44 12.95 35.05 4 24 4ZM24 40C15.16 40 8 32.84 8 24C8 15.16 15.16 8 24 8C32.84 8 40 15.16 40 24C40 32.84 32.84 40 24 40Z" fill="currentColor" />
                <path d="M24 14C18.48 14 14 18.48 14 24C14 29.52 18.48 34 24 34C29.52 34 34 29.52 34 24C34 18.48 29.52 14 24 14ZM24 30C20.69 30 18 27.31 18 24C18 20.69 20.69 18 24 18C27.31 18 30 20.69 30 24C30 27.31 27.31 30 24 30Z" fill="currentColor" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-ink">SAMAAN</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">About</Link>
            <Link href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Pensioners</Link>
            <Link href="/auth" className="text-sm font-medium text-primary">Login</Link>
          </nav>
        </header>

        {/* Hero Content */}
        <main className="flex-1 flex flex-col justify-center max-w-xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-accent" />
            </span>
            <span className="text-sm font-medium text-indigo-accent tracking-wide uppercase">Pension Network Active</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-[1.1] mb-8 text-ink">
            Connecting Pensioners <br />
            <span className="text-primary">Across India.</span>
          </h1>

          {/* Separator */}
          <hr className="w-24 border-t-4 border-slate-100 mb-8 rounded-full" />

          {/* Subheader */}
          <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-md">
            Secure, simplified pension management designed for dignity and ease of use. Empowering seniors with digital independence.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-primary text-white font-bold text-base hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200 active:scale-[0.97]"
            >
              Get Started Now
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-slate-50 text-slate-700 font-bold text-base hover:bg-slate-100 transition-colors"
            >
              Learn More
            </Link>
          </div>

          {/* Trust Indicator */}
          <div className="mt-12 flex items-center gap-4 text-slate-400 text-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span>Government Compliant &amp; ISO Certified</span>
          </div>
        </main>
      </div>

      {/* ═══════════ Right Panel: Geometric & Visuals ═══════════ */}
      <div className="w-full lg:w-1/2 bg-cream relative overflow-hidden flex flex-col min-h-[500px] lg:min-h-screen">

        {/* Geometric Decorations */}
        {/* 1. Dot Grid Pattern (Top Right) */}
        <div className="absolute top-0 right-0 w-64 h-64 dot-pattern opacity-30" />

        {/* 2. Large Coral Half-Circle (Bleeding off right edge) */}
        <div className="absolute top-1/2 -translate-y-1/2 -right-[10%] w-[80%] aspect-square rounded-full hidden lg:block bg-primary z-0" />

        {/* 3. Inner White Circle inside Coral */}
        <div className="absolute top-1/2 -translate-y-1/2 right-[5%] w-[50%] aspect-square rounded-full bg-white hidden lg:block z-0 shadow-2xl opacity-90" />

        {/* 4. Floating Indigo Dot (Crossing the Divide) */}
        <div className="absolute top-[20%] -left-8 w-16 h-16 bg-indigo-accent rounded-full shadow-xl z-20 hidden lg:block animate-bounce-slow" />

        {/* Center Visual Content */}
        <div className="flex-1 relative z-10 flex items-center justify-center p-8 lg:p-12">
          {/* Abstract Image Card */}
          <div className="relative w-full max-w-md aspect-[4/5] rounded-4xl overflow-hidden shadow-2xl border-8 border-white bg-slate-100 -rotate-2 hover:rotate-0 transition-transform duration-500 group">
            <Image
              src="/hero-seniors.png"
              alt="Happy senior couple using a tablet device in a cozy living room"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
              <div className="text-white">
                <p className="font-bold text-xl mb-1">Empowering Seniors</p>
                <p className="text-sm opacity-90">Digital access made simple.</p>
              </div>
            </div>
            {/* Floating Badge */}
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-bold text-slate-800">Secure</span>
            </div>
          </div>
        </div>

        {/* Bottom Stats Row */}
        <div className="bg-white/50 backdrop-blur-md border-t border-white/50 p-8 lg:p-12 relative z-10">
          <div className="grid grid-cols-3 gap-4 lg:gap-8 max-w-lg mx-auto lg:mx-0">
            {/* Stat 1 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Users</span>
              </div>
              <p className="text-2xl lg:text-3xl font-black text-ink">50k+</p>
              <p className="text-xs text-slate-500">Active pensioners</p>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col gap-1 border-l border-slate-200 pl-4 lg:pl-8">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Funds</span>
              </div>
              <p className="text-2xl lg:text-3xl font-black text-ink">₹10Cr+</p>
              <p className="text-xs text-slate-500">Disbursed safely</p>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col gap-1 border-l border-slate-200 pl-4 lg:pl-8">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Help</span>
              </div>
              <p className="text-2xl lg:text-3xl font-black text-ink">24/7</p>
              <p className="text-xs text-slate-500">Live support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
