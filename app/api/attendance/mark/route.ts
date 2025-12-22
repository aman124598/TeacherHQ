import { NextResponse } from "next/server"
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore'
import { initializeApp, getApps, getApp } from 'firebase/app'
import firebaseConfig from '@/lib/firebase/config'

// Initialize Firebase for server-side
const getFirebaseApp = () => {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
}

const getDb = () => getFirestore(getFirebaseApp())

export async function POST(request: Request) {
  try {
    const { userId, timestamp, location, organizationId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    const db = getDb()
    const currentDate = new Date(timestamp)
    const dateStr = currentDate.toISOString().split("T")[0]
    const timeStr = currentDate.toLocaleTimeString('en-US', { hour12: true })
    
    // Attendance entry
    const attendanceEntry = {
      date: dateStr,
      timeIn: timeStr,
      timestamp: Timestamp.fromDate(currentDate),
      status: "present",
      location: location ? {
        latitude: location.latitude,
        longitude: location.longitude,
        distance: location.distance,
      } : null,
      organizationId: organizationId || null,
    }

    // Get or create user attendance document
    const attendanceRef = doc(db, 'attendance', userId)
    const attendanceDoc = await getDoc(attendanceRef)

    if (attendanceDoc.exists()) {
      const data = attendanceDoc.data()
      
      // Check if already marked today
      const todayEntry = data.records?.find((r: any) => r.date === dateStr)
      if (todayEntry) {
        return NextResponse.json({ 
          success: false, 
          message: "Attendance already marked for today" 
        }, { status: 400 })
      }

      // Update existing document
      await updateDoc(attendanceRef, {
        records: arrayUnion(attendanceEntry),
        lastMarked: Timestamp.fromDate(currentDate),
        presentDays: (data.presentDays || 0) + 1,
        totalDays: (data.totalDays || 0) + 1,
        updatedAt: Timestamp.now(),
      })
    } else {
      // Create new document
      await setDoc(attendanceRef, {
        userId,
        organizationId: organizationId || null,
        records: [attendanceEntry],
        presentDays: 1,
        absentDays: 0,
        totalDays: 1,
        lastMarked: Timestamp.fromDate(currentDate),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
    }

    // Log activity
    await logActivity(db, userId, organizationId, 'attendance_marked', {
      date: dateStr,
      time: timeStr,
      location: location,
    })

    return NextResponse.json({
      success: true,
      message: "Attendance marked successfully",
      data: {
        date: dateStr,
        time: timeStr,
      }
    })
  } catch (error) {
    console.error("Error marking attendance:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Error marking attendance" 
    }, { status: 500 })
  }
}

// Helper function to log user activity
async function logActivity(
  db: any, 
  userId: string, 
  organizationId: string | null,
  action: string, 
  details: any
) {
  try {
    const activityRef = doc(db, 'activity_logs', `${userId}_${Date.now()}`)
    await setDoc(activityRef, {
      userId,
      organizationId,
      action,
      details,
      timestamp: Timestamp.now(),
      date: new Date().toISOString().split('T')[0],
    })
  } catch (error) {
    console.error('Error logging activity:', error)
    // Don't throw - activity logging is not critical
  }
}
