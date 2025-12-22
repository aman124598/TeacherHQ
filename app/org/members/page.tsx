"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Header from "@/components/header"
import { 
  Users, 
  Search, 
  MoreVertical, 
  Shield, 
  ShieldCheck,
  UserMinus,
  Mail,
  Calendar,
  ArrowLeft,
  CheckCircle,
  Copy
} from "lucide-react"
import { useAuth } from "@/lib/firebase/AuthContext"
import { 
  getOrganizationMembers, 
  removeMemberFromOrganization, 
  promoteMemberToAdmin 
} from "@/lib/firebase/organizations"

interface Member {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  organizationRole: 'admin' | 'teacher';
  createdAt?: any;
  lastLoginAt?: any;
}

export default function OrgMembersPage() {
  const router = useRouter()
  const { user, userData, organization, loading, refreshUserData } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [copied, setCopied] = useState(false)
  
  // Dialog states
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null)
  const [memberToPromote, setMemberToPromote] = useState<Member | null>(null)

  useEffect(() => {
    loadMembers()
  }, [organization])

  useEffect(() => {
    // Filter members based on search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      setFilteredMembers(
        members.filter(
          m => 
            m.displayName?.toLowerCase().includes(query) ||
            m.email?.toLowerCase().includes(query)
        )
      )
    } else {
      setFilteredMembers(members)
    }
  }, [searchQuery, members])

  const loadMembers = async () => {
    if (!organization?.id) return
    
    setIsLoading(true)
    try {
      const membersList = await getOrganizationMembers(organization.id)
      setMembers(membersList as Member[])
      setFilteredMembers(membersList as Member[])
    } catch (err) {
      setError("Failed to load members")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async () => {
    if (!memberToRemove || !organization?.id) return
    
    try {
      await removeMemberFromOrganization(organization.id, memberToRemove.id)
      setSuccess(`${memberToRemove.displayName || memberToRemove.email} has been removed`)
      await loadMembers()
      await refreshUserData()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Failed to remove member")
    } finally {
      setMemberToRemove(null)
    }
  }

  const handlePromoteMember = async () => {
    if (!memberToPromote || !organization?.id) return
    
    try {
      await promoteMemberToAdmin(organization.id, memberToPromote.id)
      setSuccess(`${memberToPromote.displayName || memberToPromote.email} is now an admin`)
      await loadMembers()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Failed to promote member")
    } finally {
      setMemberToPromote(null)
    }
  }

  const handleCopyInviteCode = async () => {
    if (organization?.inviteCode) {
      await navigator.clipboard.writeText(organization.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    const date = timestamp.seconds 
      ? new Date(timestamp.seconds * 1000) 
      : new Date(timestamp)
    return date.toLocaleDateString()
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
                Only organization admins can manage members.
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-teal-600 to-green-600 rounded-xl mr-4 shadow-lg">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
                Team Members
              </h1>
              <p className="text-muted-foreground">
                Manage your organization's teachers and admins
              </p>
            </div>
          </div>

          {/* Invite Code Quick Copy */}
          <Card className="flex items-center gap-3 p-3 dark:bg-slate-800/50">
            <div>
              <p className="text-xs text-muted-foreground">Invite Code</p>
              <p className="font-mono font-bold text-lg">{organization?.inviteCode}</p>
            </div>
            <Button size="sm" variant="outline" onClick={handleCopyInviteCode}>
              {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </Card>
        </div>

        {/* Alerts */}
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

        {/* Search */}
        <Card className="mb-6 dark:bg-slate-800/50">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Members Table */}
        <Card className="dark:bg-slate-800/50">
          <CardHeader>
            <CardTitle>Members ({filteredMembers.length})</CardTitle>
            <CardDescription>
              {members.length} total members in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading members...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No members match your search" : "No members found"}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border dark:border-slate-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800">
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden md:table-cell">Joined</TableHead>
                      <TableHead className="hidden md:table-cell">Last Active</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold">
                              {member.displayName?.charAt(0) || member.email?.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="font-medium">{member.displayName || "No name"}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={member.organizationRole === 'admin' ? 'default' : 'secondary'}
                            className={member.organizationRole === 'admin' 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                              : ''
                            }
                          >
                            {member.organizationRole === 'admin' ? (
                              <><ShieldCheck className="h-3 w-3 mr-1" /> Admin</>
                            ) : (
                              'Teacher'
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(member.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {formatDate(member.lastLoginAt)}
                        </TableCell>
                        <TableCell>
                          {member.id !== user?.uid && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {member.organizationRole !== 'admin' && (
                                  <DropdownMenuItem onClick={() => setMemberToPromote(member)}>
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    Make Admin
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => setMemberToRemove(member)}
                                  className="text-red-600 dark:text-red-400"
                                >
                                  <UserMinus className="h-4 w-4 mr-2" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Remove Member Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.displayName || memberToRemove?.email} from the organization? 
              They will lose access to all organization data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Promote Member Dialog */}
      <AlertDialog open={!!memberToPromote} onOpenChange={() => setMemberToPromote(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Promote to Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to make {memberToPromote?.displayName || memberToPromote?.email} an admin? 
              They will be able to manage organization settings and members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePromoteMember}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Promote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
