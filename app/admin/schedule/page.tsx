"use client"

import { useEffect, useState } from "react"
import { getAllUsers } from "@/lib/firebase/firestore"
import { UserData } from "@/lib/firebase/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Search, ArrowRight, User } from "lucide-react"
import Link from "next/link"

export default function ScheduleManagementPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function loadUsers() {
      const allUsers = await getAllUsers()
      setUsers(allUsers)
      setLoading(false)
    }
    loadUsers()
  }, [])

  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Schedule Management
          </h1>
          <p className="text-muted-foreground mt-1">Select a teacher to edit their schedule</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search teachers..." 
            className="pl-8 bg-white dark:bg-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No teachers found
          </div>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.uid} className="hover-card group dark:bg-slate-800/50 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {user.displayName?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h3 className="font-medium dark:text-white">{user.displayName || "Unknown"}</h3>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white group-hover:from-purple-600 group-hover:to-indigo-700">
                  <Link href={`/admin/schedule/${user.uid}`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Edit Schedule
                    <ArrowRight className="h-4 w-4 ml-auto transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
