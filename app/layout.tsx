import type React from "react"
import type { Metadata } from "next"
import { Inter, Roboto_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Trade - Gaming Item Trading Platform",
  description: "Trade items across MM2, SAB, Adopt Me and more",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var ls = localStorage.getItem('theme');
    // default to dark if unset
    var wantDark = ls ? (ls === 'dark' || (ls === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) : true;
    document.documentElement.classList.toggle('dark', !!wantDark);
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();`,
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
