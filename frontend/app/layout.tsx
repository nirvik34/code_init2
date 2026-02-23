import './globals.css'
import SWRegister from './sw-register'

export const metadata = {
  title: 'SAMAAN Pension Assist',
  description: 'Accessibility-first pension companion',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-elderBlue text-primary">{children}</div>
        <SWRegister />
      </body>
    </html>
  )
}
