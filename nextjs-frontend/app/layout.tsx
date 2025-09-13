import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans'
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-serif'
})

const jetbrains = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono'
})

export const metadata = {
  title: 'BuildBidz - Construction Procurement Platform',
  description: 'Premium construction procurement marketplace connecting companies, suppliers, and NGOs for competitive bidding and project management.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}