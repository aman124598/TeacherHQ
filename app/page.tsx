"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, BookOpen, MapPin, School } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [teacherId, setTeacherId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teacherId, password }),
      })

      const data = await response.json()

      if (data.success) {
        // Store teacher data in localStorage
        console.log("Login successful:", data.teacher)
        
        // Ensure we're on the client side before using localStorage and cookies
        if (typeof window !== 'undefined') {
          localStorage.setItem("teacherData", JSON.stringify(data.teacher))
          
          // Set authentication cookie for middleware
          document.cookie = `teacher_auth=${data.teacher.Id}; path=/; max-age=86400; SameSite=Lax`
        }
        
        router.push("/dashboard")
      } else {
        setError(data.message || "Invalid credentials")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Image/Gradient */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-blue dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 items-center justify-center p-8">
        <div className="max-w-md text-white">
          <School className="h-16 w-16 mb-6" />
          <h1 className="text-3xl font-bold mb-4">Teacher Attendance System</h1>
          <p className="text-blue-100 dark:text-slate-300 mb-6">
            A location-based attendance system that allows teachers to mark their attendance digitally when they're
            within the college premises.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 mr-2 mt-0.5 text-blue-200 dark:text-slate-400" />
              <div>
                <h3 className="font-medium">Location Verification</h3>
                <p className="text-sm text-blue-200 dark:text-slate-400">Uses GPS to verify you're within 500 meters of the college</p>
              </div>
            </div>
            <div className="flex items-start">
              <BookOpen className="h-5 w-5 mr-2 mt-0.5 text-blue-200 dark:text-slate-400" />
              <div>
                <h3 className="font-medium">Digital Records</h3>
                <p className="text-sm text-blue-200 dark:text-slate-400">View your schedule, attendance statistics, and manage tasks</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-gray-50 dark:bg-slate-900">
        <Card className="w-full max-w-md shadow-lg animate-fade-in dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center dark:text-white">Sign In</CardTitle>
            <CardDescription className="text-center dark:text-slate-400">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <label htmlFor="teacherId" className="text-sm font-medium">
                  Teacher ID
                </label>
                <Input
                  id="teacherId"
                  type="text"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  placeholder="Enter your ID"
                  required
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="border-gray-300"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-blue" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-center text-sm text-muted-foreground">
              <p>College Attendance Management System</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
