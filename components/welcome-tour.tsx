"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  MapPin, 
  BarChart4, 
  Calendar, 
  FileText, 
  CheckCircle, 
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Star,
  BookOpen
} from "lucide-react"

interface TourStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  highlight: string
}

const tourSteps: TourStep[] = [
  {
    id: 1,
    title: "Mark Attendance",
    description: "Use GPS to verify your location and mark attendance when you're within college premises. The system automatically detects if you're within range.",
    icon: <MapPin className="h-8 w-8 text-blue-500" />,
    highlight: "Location Verification"
  },
  {
    id: 2,
    title: "View Statistics",
    description: "Track your attendance history with detailed statistics. See your present days, percentage, and attendance trends over time.",
    icon: <BarChart4 className="h-8 w-8 text-green-500" />,
    highlight: "Attendance Stats"
  },
  {
    id: 3,
    title: "Manage Schedule",
    description: "View and manage your daily class schedule. Keep track of your lectures, labs, and breaks throughout the day.",
    icon: <Calendar className="h-8 w-8 text-purple-500" />,
    highlight: "Today's Schedule"
  },
  {
    id: 4,
    title: "Important Dates",
    description: "Mark important dates like exams, meetings, holidays, and events. Never miss an important deadline again!",
    icon: <Star className="h-8 w-8 text-yellow-500" />,
    highlight: "Upcoming Events"
  },
  {
    id: 5,
    title: "Generate Notes",
    description: "Upload PDF documents and generate concise notes using AI. Perfect for creating study materials quickly.",
    icon: <FileText className="h-8 w-8 text-indigo-500" />,
    highlight: "Short Notes"
  },
  {
    id: 6,
    title: "Task Management",
    description: "Create and manage your daily tasks. Stay organized with a simple todo list to track your progress.",
    icon: <CheckCircle className="h-8 w-8 text-teal-500" />,
    highlight: "My Tasks"
  },
]

interface WelcomeTourProps {
  userName: string
  onComplete: () => void
  onSkip: () => void
}

export default function WelcomeTour({ userName, onComplete, onSkip }: WelcomeTourProps) {
  const [showTour, setShowTour] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [tourStarted, setTourStarted] = useState(false)

  const handleStartTour = () => {
    setTourStarted(true)
  }

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setShowTour(false)
    onComplete()
  }

  const handleSkip = () => {
    setShowTour(false)
    onSkip()
  }

  if (!showTour) return null

  // Welcome Screen
  if (!tourStarted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-lg shadow-2xl border-0 bg-white dark:bg-slate-800 animate-slide-up">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-lg">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Welcome, {userName}! 🎉
            </CardTitle>
            <CardDescription className="text-base mt-2 dark:text-slate-400">
              You're all set up! Would you like a quick tour of the Teacher Attendance System?
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-3 gap-3 my-4">
              {[
                { icon: <MapPin className="h-5 w-5" />, label: "Attendance", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
                { icon: <BarChart4 className="h-5 w-5" />, label: "Statistics", color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
                { icon: <BookOpen className="h-5 w-5" />, label: "Notes", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
              ].map((item, i) => (
                <div key={i} className={`flex flex-col items-center p-3 rounded-xl ${item.color}`}>
                  {item.icon}
                  <span className="text-xs font-medium mt-1">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Take a 2-minute tour to explore all features
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pb-6">
            <Button 
              onClick={handleStartTour}
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Take the Tour
            </Button>
            <Button 
              variant="ghost"
              onClick={handleSkip}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Tour Steps
  const step = tourSteps[currentStep]
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white dark:bg-slate-800">
        {/* Close button */}
        <button 
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Progress indicator */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {tourSteps.length}
            </span>
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {step.highlight}
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>
        </div>

        <CardHeader className="text-center pt-4 pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl shadow-md animate-float-animation">
              {step.icon}
            </div>
          </div>
          <CardTitle className="text-xl font-bold dark:text-white">
            {step.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <p className="text-center text-muted-foreground leading-relaxed">
            {step.description}
          </p>
        </CardContent>

        <CardFooter className="flex justify-between gap-3 pb-6">
          <Button 
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button 
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {currentStep === tourSteps.length - 1 ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Finish
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </CardFooter>

        {/* Step dots */}
        <div className="flex justify-center gap-2 pb-4">
          {tourSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentStep 
                  ? 'w-6 bg-purple-600' 
                  : 'bg-gray-300 dark:bg-slate-600 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}
