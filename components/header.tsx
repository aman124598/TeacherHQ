"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Menu, Home, Calendar, BarChart, FileText, Bell, Star, Shield, Building2, Users, Settings } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/firebase/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const pathname = usePathname()
  const { user, userData, organization, signOut } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isMounted, setIsMounted] = useState(false)

  const isOrgAdmin = userData?.organizationRole === 'admin'

  useEffect(() => {
    setIsMounted(true)

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

  const handleLogout = async () => {
    await signOut()
  }

  // Get display name from Firebase user or userData
  const displayName = userData?.displayName || user?.displayName || "Teacher"
  const photoURL = user?.photoURL
  const userInitial = displayName.charAt(0).toUpperCase()

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <Home className="h-4 w-4 mr-2" /> },
    { name: "Schedule", href: "/schedule", icon: <Calendar className="h-4 w-4 mr-2" /> },
    { name: "Statistics", href: "/statistics", icon: <BarChart className="h-4 w-4 mr-2" /> },
    { name: "Important Dates", href: "/important-dates", icon: <Star className="h-4 w-4 mr-2" /> },
    { name: "Short Notes", href: "/notes", icon: <FileText className="h-4 w-4 mr-2" /> },
  ]

  // Add admin link only for global admins (not org admins)
  if (userData?.role === 'admin') {
    navItems.push({ name: "Admin", href: "/admin", icon: <Shield className="h-4 w-4 mr-2" /> })
  }

  if (!isMounted) return null

  return (
    <header className="bg-gradient-blue shadow-lg backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 animate-slide-in-left">
            <Avatar className="h-12 w-12 bg-white/90 dark:bg-slate-700 text-purple-700 dark:text-white border-2 border-white/50 dark:border-slate-600 shadow-lg hover-lift cursor-pointer">
              {photoURL && <AvatarImage src={photoURL} alt={displayName} />}
              <AvatarFallback className="text-lg font-bold">{userInitial}</AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-white drop-shadow-sm">
                {getGreeting()}, {displayName}
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-white/80 font-medium">{currentTime.toLocaleString()}</p>
                {organization && (
                  <>
                    <span className="text-white/50">•</span>
                    <p className="text-xs text-white/80 font-medium flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {organization.name}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 animate-slide-in-right">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium flex items-center transition-all duration-200 px-4 py-2.5 rounded-lg relative group ${
                  pathname === item.href
                    ? "text-white bg-white/25 shadow-md"
                    : "text-white/90 hover:text-white hover:bg-white/15"
                }`}
              >
                {item.icon}
                {item.name}
                {item.name === "Short Notes" && <Badge className="ml-2 bg-green-500 hover:bg-green-600 shadow-sm">New</Badge>}
                {item.name === "Important Dates" && (
                  <Badge className="ml-2 bg-yellow-500 hover:bg-yellow-600 shadow-sm">New</Badge>
                )}
                {pathname !== item.href && (
                  <span className="absolute inset-0 rounded-lg bg-white/0 group-hover:bg-white/5 transition-all duration-200"></span>
                )}
              </Link>
            ))}
            
            {/* Organization Menu - for org admins */}
            {isOrgAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`text-sm font-medium flex items-center transition-all duration-200 px-4 py-2.5 rounded-lg ${
                      pathname.startsWith('/org')
                        ? "text-white bg-white/25 shadow-md"
                        : "text-white/90 hover:text-white hover:bg-white/15"
                    }`}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Organization
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Organization</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/org/members">
                    <DropdownMenuItem className="cursor-pointer">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Members
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/org/settings">
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <div className="ml-2">
              <ThemeToggle />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="bg-white/15 hover:bg-white/25 text-white border-white/30 hover:border-white/50 font-medium shadow-md hover:shadow-lg transition-all duration-200 ml-2"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/15">
              <Bell className="h-5 w-5" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/15">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] dark:bg-slate-900 dark:border-slate-800">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Access navigation links and your profile</SheetDescription>
                <div className="flex flex-col h-full">
                  <div className="py-6 border-b dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-12 w-12 bg-gradient-blue border-2 border-purple-200 dark:border-purple-700">
                        {photoURL && <AvatarImage src={photoURL} alt={displayName} />}
                        <AvatarFallback className="text-white font-bold">{userInitial}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-base font-bold dark:text-white">{displayName}</h2>
                        <p className="text-xs text-muted-foreground">
                          {user?.email || "No email"}
                        </p>
                      </div>
                    </div>
                    {organization && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                        <Building2 className="h-4 w-4" />
                        <span>{organization.name}</span>
                        {isOrgAdmin && <Badge variant="secondary" className="ml-auto text-xs">Admin</Badge>}
                      </div>
                    )}
                  </div>
                  <nav className="flex flex-col gap-2 py-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`p-3 rounded-lg flex items-center font-medium transition-all duration-200 ${
                          pathname === item.href 
                            ? "bg-gradient-blue text-white shadow-md" 
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {item.icon}
                        {item.name}
                        {item.name === "Short Notes" && (
                          <Badge className="ml-auto bg-green-500 hover:bg-green-600">New</Badge>
                        )}
                        {item.name === "Important Dates" && (
                          <Badge className="ml-auto bg-yellow-500 hover:bg-yellow-600">New</Badge>
                        )}
                      </Link>
                    ))}
                    
                    {/* Organization links for admins */}
                    {isOrgAdmin && (
                      <>
                        <div className="my-2 border-t dark:border-slate-800"></div>
                        <p className="px-3 text-xs text-muted-foreground font-medium uppercase">Organization</p>
                        <Link
                          href="/org/members"
                          className={`p-3 rounded-lg flex items-center font-medium transition-all duration-200 ${
                            pathname === "/org/members" 
                              ? "bg-gradient-blue text-white shadow-md" 
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-200"
                          }`}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Manage Members
                        </Link>
                        <Link
                          href="/org/settings"
                          className={`p-3 rounded-lg flex items-center font-medium transition-all duration-200 ${
                            pathname === "/org/settings" 
                              ? "bg-gradient-blue text-white shadow-md" 
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-200"
                          }`}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Org Settings
                        </Link>
                      </>
                    )}
                  </nav>
                  <div className="mt-auto py-4 border-t dark:border-slate-800">
                    <Button onClick={handleLogout} className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-md" variant="destructive">
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

