"use client"

import { useState, useEffect } from "react"
import { Calendar as ReactCalendar } from "react-calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Plus, Star, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Define the type for important dates
interface ImportantDate {
  id: string
  date: Date
  title: string
  description?: string
  type: "exam" | "meeting" | "holiday" | "other"
}

// CSS for react-calendar
const calendarStyles = `
  .react-calendar {
    width: 100%;
    max-width: 100%;
    background: var(--calendar-bg, #ffffff);
    border-radius: 0.75rem;
    font-family: inherit;
    padding: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    color: var(--calendar-text, #000000);
    border: 1px solid var(--calendar-border, #e5e7eb);
  }
  .dark .react-calendar {
    --calendar-bg: rgb(30 41 59 / 0.8);
    --calendar-text: #e2e8f0;
    --calendar-border: rgb(51 65 85);
  }
  .react-calendar__navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 44px;
    margin-bottom: 1em;
  }
  .react-calendar__navigation button {
    color: var(--calendar-text, #000);
  }
  .dark .react-calendar__navigation button {
    color: #e2e8f0;
  }
  .react-calendar__tile {
    text-align: center;
    padding: 0.5rem;
    border-radius: 0.25rem;
    color: var(--calendar-text, #000000);
  }
  .dark .react-calendar__tile {
    color: #e2e8f0;
  }
  .react-calendar__navigation {
    display: flex;
    justify-content: space-between; /* Spread navigation buttons */
    align-items: center;
    height: 44px;
    margin-bottom: 1em;
  }
  .react-calendar__tile {
    text-align: center;
    padding: 0.5rem; /* Adjust padding for better spacing */
    border-radius: 0.25rem;
    color: #000000; /* Ensure text is visible */
  }
  .react-calendar__tile--active {
    background: #3b82f6;
    color: white;
  }
  .react-calendar__tile--active:hover {
    background: #2563eb;
  }
  .react-calendar__tile:enabled:hover {
    background-color: #e6e6e6;
  }
  .react-calendar__month-view__weekdays {
    text-align: center;
    font-weight: bold;
    font-size: 0.875rem;
    color: #000000; /* Ensure weekday labels are visible */
  }
  .react-calendar__month-view__days__day--weekend {
    color: #d10000; /* Highlight weekends in red */
  }
  .react-calendar__tile--now {
    background: #fef3c7;
    border-radius: 0.25rem;
  }
  .dark .react-calendar__tile--now {
    background: rgb(120 53 15 / 0.5);
  }
  .react-calendar__tile--now:enabled:hover,
  .react-calendar__tile--now:enabled:focus {
    background: #fde68a;
  }
  .dark .react-calendar__tile--now:enabled:hover,
  .dark .react-calendar__tile--now:enabled:focus {
    background: rgb(120 53 15 / 0.7);
  }
  .react-calendar--doubleView {
    width: 700px;
  }
  .react-calendar--doubleView .react-calendar__viewContainer {
    display: flex;
    margin: -0.5em;
  }
  .react-calendar--doubleView .react-calendar__viewContainer > * {
    width: 50%;
    margin: 0.5em;
  }
  .react-calendar,
  .react-calendar *,
  .react-calendar *:before,
  .react-calendar *:after {
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  .react-calendar button {
    margin: 0;
    border: 0;
    outline: none;
  }
  .react-calendar button:enabled:hover {
    cursor: pointer;
  }
  .react-calendar__navigation button {
    min-width: 44px;
    background: none;
    font-size: 1rem;
    font-weight: 500;
  }
  .react-calendar__navigation button:disabled {
    opacity: 0.5;
  }
  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: #e6e6e6;
    border-radius: 0.25rem;
  }
  .react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.75em;
  }
  .react-calendar__month-view__weekdays__weekday {
    padding: 0.5em;
  }
  .react-calendar__month-view__weekNumbers .react-calendar__tile {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75em;
    font-weight: bold;
  }
  .react-calendar__month-view__days__day--weekend {
    color: #d10000;
  }
  .react-calendar__month-view__days__day--neighboringMonth {
    color: #757575;
  }
  .react-calendar__year-view .react-calendar__tile,
  .react-calendar__decade-view .react-calendar__tile,
  .react-calendar__century-view .react-calendar__tile {
    padding: 2em 0.5em;
  }
  .react-calendar__tile {
    max-width: 100%;
    padding: 10px 6.6667px;
    background: none;
    text-align: center;
    line-height: 16px;
    position: relative;
  }
  .react-calendar__tile:disabled {
    background-color: #f0f0f0;
    color: #ababab;
  }
  .react-calendar__tile--hasActive {
    background: #76baff;
  }
  .react-calendar__tile--hasActive:enabled:hover,
  .react-calendar__tile--hasActive:enabled:focus {
    background: #a9d4ff;
  }
  .react-calendar--selectRange .react-calendar__tile--hover {
    background-color: #e6e6e6;
  }
  .important-date-marker {
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 2px;
  }
  .important-date-marker span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  .important-date-marker .exam {
    background-color: #ef4444;
  }
  .important-date-marker .meeting {
    background-color: #3b82f6;
  }
  .important-date-marker .holiday {
    background-color: #10b981;
  }
  .important-date-marker .other {
    background-color: #a855f7;
  }
`

import { useAuth } from "@/lib/firebase/AuthContext"
import { getUserEvents, addUserEvent, deleteUserEvent, EventData } from "@/lib/firebase/firestore"

export default function ImportantDatesCalendar() {
  const { user } = useAuth()
  const [value, setValue] = useState<Date>(new Date())
  const [importantDates, setImportantDates] = useState<any[]>([])
  const [newEvent, setNewEvent] = useState<any>({
    date: new Date(),
    title: "",
    description: "",
    type: "other",
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Load important dates from Firestore on component mount
  useEffect(() => {
    async function loadEvents() {
      if (!user) return
      
      try {
        setLoading(true)
        const events = await getUserEvents(user.uid)
        // Convert timestamps/strings to Date objects
        const parsedEvents = events.map((event: any) => ({
          ...event,
          date: event.date.seconds ? new Date(event.date.seconds * 1000) : new Date(event.date),
        }))
        setImportantDates(parsedEvents)
      } catch (error) {
        console.error("Failed to load events", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadEvents()
  }, [user])

  // Update events for selected date when date or important dates change
  useEffect(() => {
    if (selectedDate) {
      const events = importantDates.filter(
        (date) =>
          date.date.getDate() === selectedDate.getDate() &&
          date.date.getMonth() === selectedDate.getMonth() &&
          date.date.getFullYear() === selectedDate.getFullYear(),
      )
      setEventsForSelectedDate(events)
    }
  }, [selectedDate, importantDates])

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const handleAddEvent = async () => {
    if (!newEvent.title.trim() || !user) return

    try {
      const eventToAdd = {
        userId: user.uid,
        title: newEvent.title,
        description: newEvent.description,
        type: newEvent.type,
        date: newEvent.date.toISOString() // Store as ISO string for simplicity or Timestamp
      }
      
      const result = await addUserEvent(eventToAdd)
      
      if (result.success) {
        const newEventWithId = {
           ...eventToAdd,
           id: result.id,
           date: newEvent.date
        }
        setImportantDates([...importantDates, newEventWithId])
        setNewEvent({
          date: selectedDate || new Date(),
          title: "",
          description: "",
          type: "other",
        })
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error("Error adding event:", error)
      alert("Failed to save event")
    }
  }

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteUserEvent(id)
      setImportantDates(importantDates.filter((date) => date.id !== id))
    } catch (error) {
      console.error("Error deleting event:", error)
      alert("Failed to delete event")
    }
  }

  // Function to check if a date has important events
  const hasImportantDate = (date: Date) => {
    return importantDates.some(
      (d) =>
        d.date.getDate() === date.getDate() &&
        d.date.getMonth() === date.getMonth() &&
        d.date.getFullYear() === date.getFullYear(),
    )
  }

  // Function to get event types for a specific date
  const getEventTypesForDate = (date: Date) => {
    return importantDates
      .filter(
        (d) =>
          d.date.getDate() === date.getDate() &&
          d.date.getMonth() === date.getMonth() &&
          d.date.getFullYear() === date.getFullYear(),
      )
      .map((d) => d.type)
  }

  // Custom tile content to show markers for important dates
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null

    const eventTypes = getEventTypesForDate(date)
    if (eventTypes.length === 0) return null

    // Create a set of unique event types
    const uniqueTypes = [...new Set(eventTypes)]

    return (
      <div className="important-date-marker">
        {uniqueTypes.map((type, index) => (
          <span key={index} className={type}></span>
        ))}
      </div>
    )
  }

  // Get badge color based on event type
  const getBadgeColor = (type: ImportantDate["type"]) => {
    switch (type) {
      case "exam":
        return "bg-red-500 hover:bg-red-600"
      case "meeting":
        return "bg-blue-500 hover:bg-blue-600"
      case "holiday":
        return "bg-green-500 hover:bg-green-600"
      case "other":
        return "bg-purple-500 hover:bg-purple-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <Card className="hover-card dark:bg-slate-800/50 dark:border-slate-700">
      <style>{calendarStyles}</style>
      <CardHeader>
        <CardTitle className="flex items-center justify-between dark:text-white">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Important Dates
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-blue">
                <Plus className="h-4 w-4 mr-1" /> Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Important Date</DialogTitle>
                <DialogDescription>Create a new important date or event.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="event-date"
                    type="date"
                    className="col-span-3"
                    value={newEvent.date.toISOString().split("T")[0]}
                    onChange={(e) => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="event-title"
                    className="col-span-3"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="event-description"
                    className="col-span-3"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-type" className="text-right">
                    Type
                  </Label>
                  <select
                    id="event-type"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as ImportantDate["type"] })}
                  >
                    <option value="exam">Exam</option>
                    <option value="meeting">Meeting</option>
                    <option value="holiday">Holiday</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddEvent}>
                  Add Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>Mark and track important dates and events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 p-4 rounded-md shadow-md dark:shadow-slate-900/50"> {/* Add background and padding */}
            <ReactCalendar
              onChange={(value) => setValue(value as Date)}
              value={value}
              onClickDay={handleDateClick}
              tileContent={tileContent}
              className="border-none"
            />
            <div className="flex justify-center mt-4 gap-4">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full inline-block mr-1"></span>
                <span className="text-xs">Exam</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full inline-block mr-1"></span>
                <span className="text-xs">Meeting</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full inline-block mr-1"></span>
                <span className="text-xs">Holiday</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-purple-500 rounded-full inline-block mr-1"></span>
                <span className="text-xs">Other</span>
              </div>
            </div>
          </div>
          <div>
            <div className="border dark:border-slate-700 rounded-md p-4 h-full dark:bg-slate-800/30">
              <h3 className="font-medium mb-4 flex items-center dark:text-slate-200">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                {selectedDate ? (
                  <span>Events for {selectedDate.toLocaleDateString()}</span>
                ) : (
                  <span>Select a date to view events</span>
                )}
              </h3>
              {selectedDate && eventsForSelectedDate.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No events for this date</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setNewEvent({
                        date: selectedDate,
                        title: "",
                        description: "",
                        type: "other",
                      })
                      setIsDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Event
                  </Button>
                </div>
              )}
              <div className="space-y-3">
                {eventsForSelectedDate.map((event) => (
                  <div key={event.id} className="border dark:border-slate-700 rounded-md p-3 bg-gray-50 dark:bg-slate-700/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium dark:text-white">{event.title}</h4>
                        <Badge className={cn("mt-1", getBadgeColor(event.type))}>
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {event.description && <p className="text-sm text-muted-foreground mt-2">{event.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
