"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, School, Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { resetPassword } from "@/lib/firebase/auth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    const result = await resetPassword(email)
    
    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || "Failed to send reset email")
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-12 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-purple opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-teal opacity-10 rounded-full blur-3xl"></div>
      
      <Card className="w-full max-w-md shadow-premium border-0 dark:border dark:border-slate-700 animate-fade-in backdrop-blur-sm bg-white/95 dark:bg-slate-800/95 relative z-10">
        <CardHeader className="space-y-2 pb-4">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-gradient-blue rounded-2xl shadow-lg">
              <School className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center text-purple-700 dark:text-white">
            Reset Password
          </CardTitle>
          <CardDescription className="text-center text-base dark:text-slate-400">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          {success ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertDescription className="font-medium">
                  Password reset email sent! Check your inbox for a link to reset your password.
                </AlertDescription>
              </Alert>
              <Link href="/">
                <Button className="w-full h-11 bg-gradient-blue hover:opacity-90 text-white font-semibold shadow-lg transition-all duration-300">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
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
                    className="h-11 pl-10 border-gray-200 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-200"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-blue hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 btn-glow text-base" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin mr-2 h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 pb-6">
          <Link href="/" className="flex items-center justify-center text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
