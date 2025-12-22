"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Building2, 
  Users, 
  ArrowRight, 
  ArrowLeft,
  MapPin,
  CheckCircle,
  Sparkles,
  Shield,
  ClipboardList,
  Globe
} from "lucide-react"
import { useAuth } from "@/lib/firebase/AuthContext"
import { createOrganization, joinOrganization, userHasOrganization } from "@/lib/firebase/organizations"

type OnboardingStep = 'choice' | 'create' | 'join' | 'success'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, userData, loading } = useAuth()
  const [step, setStep] = useState<OnboardingStep>('choice')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [successOrg, setSuccessOrg] = useState<any>(null)

  // Create organization form
  const [orgName, setOrgName] = useState("")
  const [orgAddress, setOrgAddress] = useState("")
  const [orgCity, setOrgCity] = useState("")
  const [orgState, setOrgState] = useState("")
  const [orgCountry, setOrgCountry] = useState("")

  // Join organization form
  const [inviteCode, setInviteCode] = useState("")

  useEffect(() => {
    // Check if user already has an organization
    const checkOrg = async () => {
      if (user?.uid) {
        const result = await userHasOrganization(user.uid)
        if (result.hasOrg) {
          router.push('/dashboard')
        }
      }
    }
    
    if (!loading && user) {
      checkOrg()
    }
  }, [user, loading, router])

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    if (!orgName.trim()) {
      setError("Organization name is required")
      setIsSubmitting(false)
      return
    }

    try {
      const org = await createOrganization(
        user!.uid,
        user!.email || '',
        {
          name: orgName.trim(),
          address: orgAddress.trim(),
          city: orgCity.trim(),
          state: orgState.trim(),
          country: orgCountry.trim(),
        }
      )
      setSuccessOrg(org)
      setStep('success')
    } catch (err: any) {
      console.error('Error creating organization:', err)
      setError("Failed to create organization. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    if (!inviteCode.trim()) {
      setError("Invite code is required")
      setIsSubmitting(false)
      return
    }

    try {
      const result = await joinOrganization(
        user!.uid,
        user!.email || '',
        userData?.displayName || '',
        inviteCode.trim().toUpperCase()
      )

      if (result.success && result.organization) {
        setSuccessOrg(result.organization)
        setStep('success')
      } else {
        setError(result.error || "Failed to join organization")
      }
    } catch (err: any) {
      console.error('Error joining organization:', err)
      setError("Failed to join organization. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg mb-4">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
            Welcome to Attendance System
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {step === 'choice' && "Let's get you set up with your organization"}
            {step === 'create' && "Create a new organization for your team"}
            {step === 'join' && "Join an existing organization"}
            {step === 'success' && "You're all set!"}
          </p>
        </div>

        {/* Choice Step */}
        {step === 'choice' && (
          <div className="grid md:grid-cols-2 gap-6 animate-slide-in-right">
            {/* Create Organization Card */}
            <Card 
              className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-400 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden"
              onClick={() => setStep('create')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 group-hover:from-purple-500/10 group-hover:to-blue-500/10 transition-colors"></div>
              <CardHeader className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Create Organization</CardTitle>
                <CardDescription className="text-base">
                  Start fresh with your own organization. Perfect for school administrators and team leads.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 mr-2 text-purple-500" />
                    Full admin control
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                    Invite unlimited teachers
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <ClipboardList className="h-4 w-4 mr-2 text-teal-500" />
                    Manage attendance & schedules
                  </div>
                </div>
                <Button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 group-hover:shadow-lg transition-all">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Join Organization Card */}
            <Card 
              className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-teal-400 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden"
              onClick={() => setStep('join')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-green-500/5 group-hover:from-teal-500/10 group-hover:to-green-500/10 transition-colors"></div>
              <CardHeader className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-teal-600 to-green-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Join Organization</CardTitle>
                <CardDescription className="text-base">
                  Already have an invite code? Join your organization in seconds.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 mr-2 text-teal-500" />
                    Quick one-step joining
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 text-green-500" />
                    Location-based attendance
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Globe className="h-4 w-4 mr-2 text-blue-500" />
                    Access from anywhere
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-6 border-2 border-teal-400 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 group-hover:shadow-lg transition-all">
                  Enter Invite Code
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Organization Step */}
        {step === 'create' && (
          <Card className="max-w-xl mx-auto animate-slide-in-right shadow-2xl dark:bg-slate-800/90 backdrop-blur-sm border-0">
            <CardHeader>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('choice')}
                className="w-fit mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Building2 className="h-6 w-6 text-purple-600" />
                Create Your Organization
              </CardTitle>
              <CardDescription>
                Fill in your organization details to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOrganization} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="animate-slide-up">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name *</Label>
                  <Input
                    id="orgName"
                    placeholder="e.g., Springfield High School"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgAddress">Address</Label>
                  <Input
                    id="orgAddress"
                    placeholder="Street address"
                    value={orgAddress}
                    onChange={(e) => setOrgAddress(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgCity">City</Label>
                    <Input
                      id="orgCity"
                      placeholder="City"
                      value={orgCity}
                      onChange={(e) => setOrgCity(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgState">State</Label>
                    <Input
                      id="orgState"
                      placeholder="State"
                      value={orgState}
                      onChange={(e) => setOrgState(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgCountry">Country</Label>
                  <Input
                    id="orgCountry"
                    placeholder="Country"
                    value={orgCountry}
                    onChange={(e) => setOrgCountry(e.target.value)}
                    className="h-11"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-base font-semibold mt-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                      Creating Organization...
                    </div>
                  ) : (
                    <>
                      Create Organization
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Join Organization Step */}
        {step === 'join' && (
          <Card className="max-w-xl mx-auto animate-slide-in-right shadow-2xl dark:bg-slate-800/90 backdrop-blur-sm border-0">
            <CardHeader>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('choice')}
                className="w-fit mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="h-6 w-6 text-teal-600" />
                Join Organization
              </CardTitle>
              <CardDescription>
                Enter the invite code provided by your organization admin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinOrganization} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="animate-slide-up">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    placeholder="e.g., ABC12345"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="h-14 text-center text-2xl font-mono tracking-widest uppercase"
                    maxLength={8}
                    required
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    Ask your admin for the 8-character invite code
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-teal-600 to-green-600 hover:opacity-90 text-base font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                      Joining Organization...
                    </div>
                  ) : (
                    <>
                      Join Organization
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Success Step */}
        {step === 'success' && successOrg && (
          <Card className="max-w-xl mx-auto animate-fade-in shadow-2xl dark:bg-slate-800/90 backdrop-blur-sm border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10"></div>
            <CardHeader className="text-center relative">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg animate-bounce-slow">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl">Welcome to {successOrg.name}!</CardTitle>
              <CardDescription className="text-base">
                You're all set up and ready to go
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center relative">
              {successOrg.inviteCode && (
                <div className="bg-slate-100 dark:bg-slate-700/50 rounded-xl p-6 mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Your organization invite code</p>
                  <p className="text-3xl font-mono font-bold tracking-widest text-purple-600 dark:text-purple-400">
                    {successOrg.inviteCode}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Share this code with teachers to invite them
                  </p>
                </div>
              )}

              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-base font-semibold"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add custom animation styles */}
      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
