"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, BookOpen, MapPin, School, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { signInWithEmail, signInWithGoogle } from "@/lib/firebase/auth"
import { useAuth } from "@/lib/firebase/AuthContext"

export default function LoginPage() {
  const router = useRouter()
  const { loading: authLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await signInWithEmail(email, password)
    
    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.error || "Login failed")
    }
    
    setIsLoading(false)
  }

  const handleGoogleLogin = async () => {
    setError("")
    setIsLoading(true)

    try {
      const result = await signInWithGoogle()
      
      if (result.success && result.user) {
        // Popup successful, redirect to dashboard
        console.log('Google login successful, redirecting to dashboard...'); // DEBUG LOG
        router.push("/dashboard")
      } else if (result.error) {
        setError(result.error)
      }
    } catch (err: any) {
      console.error('Google login error:', err)
      setError("An error occurred during sign in")
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left side - Enhanced Gradient Hero */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-blue relative items-center justify-center p-12 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-lg text-white relative z-10 animate-slide-in-left">
          <div className="mb-8">
            <School className="h-20 w-20 mb-6 float-animation drop-shadow-2xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Teacher Attendance System
          </h1>
          <p className="text-lg text-white/90 mb-10 leading-relaxed">
            A smart location-based attendance system that allows teachers to mark their attendance digitally when they're
            within the college premises.
          </p>
          <div className="space-y-6">
            <div className="flex items-start glass-effect rounded-xl p-4 hover-lift">
              <MapPin className="h-6 w-6 mr-3 mt-1 text-white flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Location Verification</h3>
                <p className="text-sm text-white/80 leading-relaxed">Uses GPS to verify you're within 700 meters of the college campus</p>
              </div>
            </div>
            <div className="flex items-start glass-effect rounded-xl p-4 hover-lift">
              <BookOpen className="h-6 w-6 mr-3 mt-1 text-white flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Digital Records</h3>
                <p className="text-sm text-white/80 leading-relaxed">View your schedule, attendance statistics, and manage daily tasks</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Enhanced Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-purple opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-teal opacity-10 rounded-full blur-3xl"></div>
        
        <Card className="w-full max-w-md shadow-premium border-0 dark:border dark:border-slate-700 animate-slide-in-right backdrop-blur-sm bg-white/95 dark:bg-slate-800/95 relative z-10">
          <CardHeader className="space-y-2 pb-4">
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-gradient-blue rounded-2xl shadow-lg">
                <School className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-center text-purple-700 dark:text-white">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-base dark:text-slate-400">
              Sign in to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="animate-slide-up border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="h-11 pl-10 border-gray-200 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-200 hover:border-gray-300 dark:hover:border-slate-500"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="h-11 pl-10 pr-10 border-gray-200 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-200 hover:border-gray-300 dark:hover:border-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium">
                  Forgot password?
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-blue hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 btn-glow text-base" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin mr-2 h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200 dark:border-slate-700"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-800 px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button 
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-11 font-semibold border-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 pb-6">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/signup" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-semibold">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
