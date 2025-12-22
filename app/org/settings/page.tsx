"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import Header from "@/components/header"
import { 
  Building2, 
  Settings, 
  Copy, 
  RefreshCw, 
  MapPin, 
  Clock, 
  Save,
  CheckCircle,
  Shield,
  Users,
  ArrowLeft
} from "lucide-react"
import { useAuth } from "@/lib/firebase/AuthContext"
import { updateOrganization, regenerateInviteCode, getOrganizationMembers } from "@/lib/firebase/organizations"

export default function OrgSettingsPage() {
  const router = useRouter()
  const { user, userData, organization, loading, refreshUserData } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [copied, setCopied] = useState(false)
  const [memberCount, setMemberCount] = useState(0)

  // Form states
  const [orgName, setOrgName] = useState("")
  const [orgAddress, setOrgAddress] = useState("")
  const [orgCity, setOrgCity] = useState("")
  const [orgState, setOrgState] = useState("")
  const [orgCountry, setOrgCountry] = useState("")
  const [locationRadius, setLocationRadius] = useState(700)
  const [attendanceEnabled, setAttendanceEnabled] = useState(true)
  const [locationVerification, setLocationVerification] = useState(true)
  const [workingHoursStart, setWorkingHoursStart] = useState("09:00")
  const [workingHoursEnd, setWorkingHoursEnd] = useState("17:00")

  useEffect(() => {
    if (organization) {
      setOrgName(organization.name || "")
      setOrgAddress(organization.address || "")
      setOrgCity(organization.city || "")
      setOrgState(organization.state || "")
      setOrgCountry(organization.country || "")
      setLocationRadius(organization.locationRadius || 700)
      setAttendanceEnabled(organization.settings?.attendanceEnabled ?? true)
      setLocationVerification(organization.settings?.locationVerification ?? true)
      setWorkingHoursStart(organization.settings?.workingHours?.start || "09:00")
      setWorkingHoursEnd(organization.settings?.workingHours?.end || "17:00")
      setMemberCount(organization.memberCount || 1)
    }
  }, [organization])

  const handleCopyInviteCode = async () => {
    if (organization?.inviteCode) {
      await navigator.clipboard.writeText(organization.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRegenerateCode = async () => {
    if (!organization?.id) return
    
    setIsSubmitting(true)
    try {
      const newCode = await regenerateInviteCode(organization.id)
      if (newCode) {
        await refreshUserData()
        setSuccess("Invite code regenerated successfully!")
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (err) {
      setError("Failed to regenerate invite code")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization?.id) return
    
    setError("")
    setSuccess("")
    setIsSubmitting(true)

    try {
      const updated = await updateOrganization(organization.id, {
        name: orgName,
        address: orgAddress,
        city: orgCity,
        state: orgState,
        country: orgCountry,
        locationRadius,
        settings: {
          attendanceEnabled,
          locationVerification,
          workingHours: {
            start: workingHoursStart,
            end: workingHoursEnd,
          },
        },
      })

      if (updated) {
        await refreshUserData()
        setSuccess("Settings saved successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError("Failed to save settings")
      }
    } catch (err) {
      setError("An error occurred while saving")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Check if user is admin
  if (userData?.organizationRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                Only organization admins can access these settings.
              </p>
              <Button onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header />
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl mr-4 shadow-lg">
            <Settings className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Organization Settings
            </h1>
            <p className="text-muted-foreground">Manage your organization configuration</p>
          </div>
        </div>

        {/* Success/Error Alerts */}
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 animate-slide-up">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="mb-6 animate-slide-up">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Invite Code Card */}
          <Card className="lg:col-span-1 hover-card dark:bg-slate-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Invite Teachers
              </CardTitle>
              <CardDescription>
                Share this code with teachers to join your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4 text-center mb-4">
                <p className="text-3xl font-mono font-bold tracking-widest text-purple-600 dark:text-purple-400">
                  {organization?.inviteCode || "--------"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopyInviteCode}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRegenerateCode}
                  disabled={isSubmitting}
                >
                  <RefreshCw className={`h-4 w-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <div className="mt-4 pt-4 border-t dark:border-slate-700">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Members</span>
                  <Badge variant="secondary">{memberCount}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings Tabs */}
          <Card className="lg:col-span-2 dark:bg-slate-800/50">
            <Tabs defaultValue="general">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general">
                    <Building2 className="h-4 w-4 mr-2" />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="attendance">
                    <Clock className="h-4 w-4 mr-2" />
                    Attendance
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSaveSettings}>
                  <TabsContent value="general" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">Organization Name</Label>
                      <Input
                        id="orgName"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="Enter organization name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgAddress">Address</Label>
                      <Input
                        id="orgAddress"
                        value={orgAddress}
                        onChange={(e) => setOrgAddress(e.target.value)}
                        placeholder="Street address"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="orgCity">City</Label>
                        <Input
                          id="orgCity"
                          value={orgCity}
                          onChange={(e) => setOrgCity(e.target.value)}
                          placeholder="City"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="orgState">State</Label>
                        <Input
                          id="orgState"
                          value={orgState}
                          onChange={(e) => setOrgState(e.target.value)}
                          placeholder="State"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgCountry">Country</Label>
                      <Input
                        id="orgCountry"
                        value={orgCountry}
                        onChange={(e) => setOrgCountry(e.target.value)}
                        placeholder="Country"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="attendance" className="space-y-6 mt-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="attendanceEnabled" className="text-base">
                          Enable Attendance
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow teachers to mark attendance
                        </p>
                      </div>
                      <Switch
                        id="attendanceEnabled"
                        checked={attendanceEnabled}
                        onCheckedChange={setAttendanceEnabled}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="locationVerification" className="text-base">
                          Location Verification
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Require GPS verification for attendance
                        </p>
                      </div>
                      <Switch
                        id="locationVerification"
                        checked={locationVerification}
                        onCheckedChange={setLocationVerification}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="locationRadius">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Location Radius (meters)
                      </Label>
                      <Input
                        id="locationRadius"
                        type="number"
                        value={locationRadius}
                        onChange={(e) => setLocationRadius(Number(e.target.value))}
                        min={100}
                        max={5000}
                        step={100}
                      />
                      <p className="text-sm text-muted-foreground">
                        Teachers must be within this distance to mark attendance
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="workingHoursStart">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Start Time
                        </Label>
                        <Input
                          id="workingHoursStart"
                          type="time"
                          value={workingHoursStart}
                          onChange={(e) => setWorkingHoursStart(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="workingHoursEnd">
                          <Clock className="h-4 w-4 inline mr-1" />
                          End Time
                        </Label>
                        <Input
                          id="workingHoursEnd"
                          type="time"
                          value={workingHoursEnd}
                          onChange={(e) => setWorkingHoursEnd(e.target.value)}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <div className="mt-6 pt-6 border-t dark:border-slate-700">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                          Saving...
                        </div>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}
