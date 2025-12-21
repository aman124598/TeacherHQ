"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Calendar, CheckSquare, BarChart4, LogOut, ArrowLeft } from "lucide-react"

export default function AdminSidebar() {
  const pathname = usePathname()

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Manage Users", icon: Users },
    { href: "/admin/schedule", label: "Schedule Editor", icon: Calendar },
    { href: "/admin/tasks", label: "Tasks & Events", icon: CheckSquare },
    { href: "/admin/stats", label: "Statistics", icon: BarChart4 },
  ]

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r dark:border-slate-700 h-full">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            Admin Panel
          </span>
        </div>

        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                    : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/50"
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-white" : "text-gray-500 dark:text-slate-500 group-hover:text-purple-600"}`} />
                <span className="font-medium">{link.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t dark:border-slate-700">
        <Link 
          href="/dashboard"
          className="flex items-center px-4 py-3 rounded-xl text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-3" />
          <span className="font-medium">Back to App</span>
        </Link>
      </div>
    </aside>
  )
}
