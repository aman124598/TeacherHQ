import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { DarkModeWrapper } from "@/components/dark-mode-wrapper"
import { AuthProvider } from "@/lib/firebase/AuthContext"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Teacher Attendance System",
  description: "Location-based attendance system for teachers",
  generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground transition-colors duration-300`} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <DarkModeWrapper>
              {children}
            </DarkModeWrapper>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

