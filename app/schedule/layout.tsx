import type React from "react"
import Header from "@/components/header"

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  )
}
