"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Star } from "lucide-react"
import ImportantDatesCalendar from "@/components/important-dates-calendar"
import { useAuth } from "@/lib/firebase/AuthContext"
import { getUserEvents } from "@/lib/firebase/firestore"

export default function ImportantDatesPage() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center mb-8">
        <div className="p-3 bg-gradient-warm rounded-xl mr-4 shadow-lg">
          <Calendar className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Important Dates
          </h1>
          <p className="text-muted-foreground">Track your important events and deadlines</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ImportantDatesCalendar />

        <Card className="hover-card dark:bg-slate-800/50 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center dark:text-white">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Upcoming Important Dates
            </CardTitle>
            <CardDescription>Your next important events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <UpcomingEvents />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Component to display upcoming events
function UpcomingEvents() {
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEvents() {
      if (!user) return

      try {
        const events = await getUserEvents(user.uid)
        
        const parsedEvents = events.map((event: any) => ({
          ...event,
          date: event.date.seconds ? new Date(event.date.seconds * 1000) : new Date(event.date),
        }))

        // Filter for upcoming events (today and future)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const upcoming = parsedEvents
          .filter((event: any) => {
            const eventDate = new Date(event.date)
            eventDate.setHours(0, 0, 0, 0)
            return eventDate >= today
          })
          .sort((a: any, b: any) => a.date.getTime() - b.date.getTime())
          .slice(0, 5) // Get only the next 5 events

        setUpcomingEvents(upcoming)
      } catch (error) {
        console.error("Failed to load upcoming events", error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [user])

  // Get badge color based on event type
  const getBadgeColor = (type: string) => {
    switch (type) {
      case "exam":
        return "bg-red-100 text-red-800 border-red-200"
      case "meeting":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "holiday":
        return "bg-green-100 text-green-800 border-green-200"
      case "other":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>
  }

  if (upcomingEvents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No upcoming events</p>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {upcomingEvents.map((event) => (
        <div key={event.id} className="py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-3 ${
                event.type === "exam"
                  ? "bg-red-500"
                  : event.type === "meeting"
                    ? "bg-blue-500"
                    : event.type === "holiday"
                      ? "bg-green-500"
                      : "bg-purple-500"
              }`}
            ></div>
            <div>
              <p className="font-medium">{event.title}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-xs ${getBadgeColor(event.type)}`}>
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </div>
        </div>
      ))}
    </div>
  )
}
