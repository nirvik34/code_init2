import { Inter, Work_Sans, Sora, DM_Serif_Display, Public_Sans, DM_Sans, Manrope } from 'next/font/google'
import './globals.css'
import SWRegister from './sw-register'
import PWAInstallPrompt from '../components/PWAInstallPrompt'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const workSans = Work_Sans({ subsets: ['latin'], variable: '--font-work-sans' })
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' })
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400', variable: '--font-dm-serif' })
const publicSans = Public_Sans({ subsets: ['latin'], variable: '--font-public-sans' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-dm-sans' })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' })

export const metadata = {
  title: 'SAMAAN | Pension Assist',
  description: 'Secure, simplified pension management designed for dignity and ease of use. Empowering seniors with digital independence.',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${workSans.variable} ${sora.variable} ${dmSerif.variable} ${publicSans.variable} ${dmSans.variable} ${manrope.variable} font-sans`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* PWA */}
        <SWRegister />
        <PWAInstallPrompt />
      </body>
    </html>
  )
}
