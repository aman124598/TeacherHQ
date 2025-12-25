"use client"

import { useEffect, useState } from "react"
import { getAllTeachers, getAllUsers, getAllTasks, TaskData } from "@/lib/firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Calendar, CheckSquare, BarChart4, ArrowRight, Clock, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    pendingTasks: 0,
    completedTasks: 0
  })
  const [recentTasks, setRecentTasks] = useState<TaskData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const [users, teachers, tasks] = await Promise.all([
        getAllUsers(),
        getAllTeachers(),
        getAllTasks()
      ])
      
      const pendingTasks = tasks.filter(t => t.status === 'pending')
      const completedTasks = tasks.filter(t => t.status === 'completed')
      
      setStats({
        totalUsers: users.length,
        totalTeachers: teachers.length,
        pendingTasks: pendingTasks.length,
        completedTasks: completedTasks.length
      })
      
      // Get 5 most recent tasks
      setRecentTasks(tasks.slice(0, 5))
      setLoading(false)
    }
    loadStats()
  }, [])

  const statCards = [
    {
      title: "Total Teachers",
      value: stats.totalTeachers,
      description: "Registered instructors",
      icon: Users,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-cyan-500",
      href: "/admin/users"
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "All system users",
      icon: BarChart4,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-pink-500",
      href: "/admin/stats"
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      description: "Awaiting completion",
      icon: Clock,
      color: "bg-orange-500",
      gradient: "from-orange-500 to-red-500",
      href: "/admin/tasks"
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks,
      description: "Successfully finished",
      icon: CheckCircle2,
      color: "bg-green-500",
      gradient: "from-green-500 to-emerald-500",
      href: "/admin/tasks"
    }
  ]

  const quickActions = [
    {
      title: "Manage Users & Schedules",
      description: "View, edit, and manage teacher accounts",
      icon: Users,
      href: "/admin/users",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      title: "Attendance Records",
      description: "View all attendance with timestamps",
      icon: Clock,
      href: "/admin/attendance",
      gradient: "from-emerald-500 to-green-600"
    },
    {
      title: "Create New Task / Notice",
      description: "Send announcements to teachers",
      icon: CheckSquare,
      href: "/admin/tasks",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      title: "Schedule Management",
      description: "Edit teacher timetables",
      icon: Calendar,
      href: "/admin/schedule",
      gradient: "from-green-500 to-teal-600"
    },
    {
      title: "View Statistics",
      description: "Attendance reports and analytics",
      icon: TrendingUp,
      href: "/admin/stats",
      gradient: "from-orange-500 to-red-600"
    }
  ]

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'task': return 'bg-blue-500'
      case 'notice': return 'bg-yellow-500'
      case 'event': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Admin Dashboard
          </h1>
          <p className="text-white/80 text-lg">
            Welcome back! Here's an overview of the attendance system.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <Card key={i} className="hover-card group border-0 shadow-lg dark:bg-slate-800/80 overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${card.gradient}`}></div>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <h3 className="text-4xl font-bold mt-2 dark:text-white bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    {loading ? "..." : card.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
              <Button asChild variant="outline" className="w-full justify-between group/btn dark:border-slate-600 dark:hover:bg-slate-700">
                <Link href={card.href}>
                  View Details
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-purple-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {quickActions.map((action, i) => (
              <Button 
                key={i}
                asChild 
                className={`w-full justify-start h-auto py-4 bg-gradient-to-r ${action.gradient} hover:opacity-90 text-white shadow-md group`}
              >
                <Link href={action.href}>
                  <action.icon className="h-5 w-5 mr-3 shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-xs text-white/80">{action.description}</div>
                  </div>
                  <ArrowRight className="ml-auto h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-orange-500" />
                  Recent Tasks
                </CardTitle>
                <CardDescription>Latest created tasks and notices</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/tasks">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : recentTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No tasks created yet</p>
                <Button asChild size="sm" className="mt-4">
                  <Link href="/admin/tasks">Create First Task</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-3 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                      <div className="min-w-0">
                        <p className="font-medium dark:text-white truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className={`text-xs ${getTypeColor(task.type)} text-white`}>
                            {task.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {task.assignedTo === 'all' ? 'All Teachers' : 'Specific User'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={task.status === 'completed' ? 'default' : 'outline'} className={task.status === 'completed' ? 'bg-green-500' : ''}>
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
        <CardContent className="py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-medium dark:text-white">System Status: Online</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Last updated: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
