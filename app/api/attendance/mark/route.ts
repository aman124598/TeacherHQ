import { NextResponse } from "next/server"
import mongoose from "mongoose"

// Connect to MongoDB
let isConnected = false

const connectToDatabase = async () => {
  if (isConnected) return

  try {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://amanraj89969:password@cluster0.5khmm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    isConnected = true
    console.log("Connected to MongoDB")
  } catch (error) {
    console.error("Error connecting to MongoDB:", error)
  }
}

// Define the attendance schema
const attendanceSchema = new mongoose.Schema(
  {
    Id: Number,
    Attendance: [
      {
        Date: String,
        Time_In: String,
        Present_Absent: String,
        Time_Out: String,
      },
    ],
  },
  { collection: "teacher_id" },
)

// Get the model (or create it if it doesn't exist)
const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema)

export async function POST(request: Request) {
  try {
    await connectToDatabase()

    const { userId, timestamp, location } = await request.json()
    const currentDate = new Date(timestamp).toISOString().split("T")[0]

    // Find attendance record for this teacher
    let attendanceRecord = await Attendance.findOne({ Id: Number(userId) })

    const attendanceEntry = {
      Date: currentDate,
      Time_In: new Date(timestamp).toLocaleTimeString(),
      Present_Absent: "Present",
      Time_Out: null,
    }

    if (!attendanceRecord) {
      // Create new record if none exists
      attendanceRecord = new Attendance({
        Id: Number(userId),
        Attendance: [attendanceEntry],
      })
    } else {
      // Check if attendance already marked for today
      const todayAttendance = attendanceRecord.Attendance.find((entry: any) => entry.Date === currentDate)

      if (todayAttendance) {
        return NextResponse.json({ success: false, message: "Attendance already marked for today" }, { status: 400 })
      }

      // Add today's attendance
      attendanceRecord.Attendance.push(attendanceEntry)
    }

    await attendanceRecord.save()

    return NextResponse.json({
      success: true,
      message: "Attendance marked successfully",
    })
  } catch (error) {
    console.error("Error marking attendance:", error)
    return NextResponse.json({ success: false, message: "Error marking attendance" }, { status: 500 })
  }
}
