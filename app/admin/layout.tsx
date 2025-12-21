"use client"

import { useAuth } from "@/lib/firebase/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import AdminSidebar from "@/components/admin-sidebar"
import AdminLogin from "@/components/admin-login"
import { isAdminAuthenticated, clearAdminAuth } from "@/lib/admin-auth"
import { Menu, LogOut } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isAdminAuth, setIsAdminAuth] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    setMounted(true)
    // Check if user is logged in first
    if (!loading && !user) {
      router.push("/")
      return
    }
    
    // Check admin authentication status
    if (mounted) {
      setIsAdminAuth(isAdminAuthenticated())
      setCheckingAuth(false)
    }
  }, [user, loading, router, mounted])

  const handleAdminLoginSuccess = () => {
    setIsAdminAuth(true)
  }

  const handleAdminLogout = () => {
    clearAdminAuth()
    setIsAdminAuth(false)
    router.push("/dashboard")
  }

  // Loading state for initial Firebase auth check
  if (!mounted || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Not logged in to Firebase
  if (!user) return null

  // Show admin login if not authenticated as admin
  if (!isAdminAuth) {
    return <AdminLogin onSuccess={handleAdminLoginSuccess} />
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white dark:bg-slate-800 border-b dark:border-slate-700 flex items-center px-4 justify-between shrink-0">
          <div className="font-bold text-lg">Admin Panel</div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleAdminLogout}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <AdminSidebar />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Desktop Header with logout */}
        <header className="hidden md:flex h-14 bg-white dark:bg-slate-800 border-b dark:border-slate-700 items-center px-6 justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Logged in as admin</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAdminLogout}
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Exit Admin
          </Button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
