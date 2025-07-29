"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Menu, Home, Calendar, BarChart, FileText, Bell, Star } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Header() {
  const pathname = usePathname()
  const [teacher, setTeacher] = useState<any>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Get teacher data from localStorage
    const teacherData = localStorage.getItem("teacherData")
    if (teacherData) {
      setTeacher(JSON.parse(teacherData))
    }

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const handleLogout = () => {
    localStorage.removeItem("teacherData")
    // Clear authentication cookie
    document.cookie = "teacher_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = "/"
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <Home className="h-4 w-4 mr-2" /> },
    { name: "Schedule", href: "/schedule", icon: <Calendar className="h-4 w-4 mr-2" /> },
    { name: "Statistics", href: "/statistics", icon: <BarChart className="h-4 w-4 mr-2" /> },
    { name: "Important Dates", href: "/important-dates", icon: <Star className="h-4 w-4 mr-2" /> },
    { name: "Short Notes", href: "/notes", icon: <FileText className="h-4 w-4 mr-2" /> },
  ]

  if (!isMounted) return null

  return (
    <header className="bg-gradient-blue dark:bg-gradient-to-r dark:from-slate-900 dark:to-slate-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 bg-white dark:bg-slate-700 text-blue-800 dark:text-white border-2 border-white dark:border-slate-600 shadow-sm">
              <AvatarFallback>{teacher?.Name ? teacher.Name.charAt(0) : "T"}</AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold">
                {getGreeting()}, {teacher?.Name || "Teacher"}
              </h1>
              <p className="text-xs text-blue-100 dark:text-slate-300">{currentTime.toLocaleString()}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium flex items-center ${
                  pathname === item.href
                    ? "text-white bg-white/20 px-3 py-2 rounded-md"
                    : "text-blue-100 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md"
                }`}
              >
                {item.icon}
                {item.name}
                {item.name === "Short Notes" && <Badge className="ml-2 bg-green-500 hover:bg-green-600">New</Badge>}
                {item.name === "Important Dates" && (
                  <Badge className="ml-2 bg-yellow-500 hover:bg-yellow-600">New</Badge>
                )}
              </Link>
            ))}
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="text-white">
              <Bell className="h-5 w-5" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <div className="flex flex-col h-full">
                  <div className="py-4">
                    <h2 className="text-lg font-semibold">Menu</h2>
                    <p className="text-sm text-muted-foreground">
                      {teacher?.Name || "Teacher"} • ID: {teacher?.Id || "N/A"}
                    </p>
                  </div>
                  <nav className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`p-2 rounded-md flex items-center ${
                          pathname === item.href ? "bg-blue-100 text-blue-800" : "hover:bg-muted"
                        }`}
                      >
                        {item.icon}
                        {item.name}
                        {item.name === "Short Notes" && (
                          <Badge className="ml-2 bg-green-500 hover:bg-green-600">New</Badge>
                        )}
                        {item.name === "Important Dates" && (
                          <Badge className="ml-2 bg-yellow-500 hover:bg-yellow-600">New</Badge>
                        )}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-auto py-4">
                    <Button onClick={handleLogout} className="w-full" variant="destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
