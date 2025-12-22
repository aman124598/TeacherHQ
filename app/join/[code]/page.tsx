"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Building2, 
  Users, 
  CheckCircle, 
  ArrowRight,
  LogIn,
  Loader2
} from "lucide-react"
import { useAuth } from "@/lib/firebase/AuthContext"
import { getOrganizationByInviteCode, joinOrganization } from "@/lib/firebase/organizations"

export default function JoinOrganizationPage() {
  const router = useRouter()
  const params = useParams()
  const code = params?.code as string
  
  const { user, userData, loading, refreshUserData } = useAuth()
  const [organization, setOrganization] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    loadOrganization()
  }, [code])

  const loadOrganization = async () => {
    if (!code) {
      setError("Invalid invite link")
      setIsLoading(false)
      return
    }

    try {
      const org = await getOrganizationByInviteCode(code.toUpperCase())
      if (org) {
        setOrganization(org)
      } else {
        setError("Invalid or expired invite code")
      }
    } catch (err) {
      setError("Failed to load organization details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!user || !organization) return
    
    setError("")
    setIsJoining(true)

    try {
      const result = await joinOrganization(
        user.uid,
        user.email || '',
        userData?.displayName || '',
        code.toUpperCase()
      )

      if (result.success) {
        setJoined(true)
        await refreshUserData()
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setError(result.error || "Failed to join organization")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsJoining(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl dark:bg-slate-800/90 backdrop-blur-sm border-0 overflow-hidden">
        {joined ? (
          // Success state
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10"></div>
            <CardHeader className="text-center relative">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg animate-bounce">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Welcome to {organization?.name}!</CardTitle>
              <CardDescription className="text-base">
                You've successfully joined the organization
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center relative">
              <p className="text-muted-foreground mb-4">
                Redirecting you to the dashboard...
              </p>
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600" />
            </CardContent>
          </>
        ) : error && !organization ? (
          // Error state - no organization found
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Invalid Invite Link</h2>
            <p className="text-muted-foreground mb-6">
              This invite link is invalid or has expired. Please check with your organization admin for a new link.
            </p>
            <Button onClick={() => router.push('/onboarding')} className="w-full">
              Go to Onboarding
            </Button>
          </CardContent>
        ) : (
          // Organization found - show join option
          <>
            <CardHeader className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-teal-600 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Join {organization?.name}</CardTitle>
              <CardDescription className="text-base">
                You've been invited to join this organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="animate-slide-up">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Organization details */}
              <div className="bg-slate-100 dark:bg-slate-700/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Organization</span>
                  <span className="font-medium">{organization?.name}</span>
                </div>
                {organization?.city && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Location</span>
                    <span className="font-medium">
                      {[organization.city, organization.state, organization.country]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Members</span>
                  <span className="font-medium flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {organization?.memberCount || 1}
                  </span>
                </div>
              </div>

              {!user ? (
                // Not logged in
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Please sign in to join this organization
                  </p>
                  <Button 
                    onClick={() => router.push(`/?redirect=/join/${code}`)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In to Join
                  </Button>
                </div>
              ) : userData?.organizationId === organization?.id ? (
                // Already a member
                <div className="text-center space-y-4">
                  <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>You're already a member of this organization</AlertDescription>
                  </Alert>
                  <Button onClick={() => router.push('/dashboard')} className="w-full">
                    Go to Dashboard
                  </Button>
                </div>
              ) : userData?.organizationId ? (
                // Already in another org
                <div className="text-center space-y-4">
                  <Alert variant="destructive">
                    <AlertDescription>
                      You're already a member of another organization ({userData.organizationName}). 
                      Please leave your current organization before joining a new one.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
                    Go to Dashboard
                  </Button>
                </div>
              ) : (
                // Ready to join
                <Button
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="w-full h-12 bg-gradient-to-r from-teal-600 to-green-600 hover:opacity-90 text-base font-semibold"
                >
                  {isJoining ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                      Joining...
                    </div>
                  ) : (
                    <>
                      Join Organization
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
