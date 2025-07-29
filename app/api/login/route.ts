import { NextResponse } from "next/server"
import mongoose from "mongoose"

// Connect to MongoDB
let isConnected = false

const connectToDatabase = async () => {
  if (isConnected) return

  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/teacher_databse")
    isConnected = true
    console.log("Connected to MongoDB")
  } catch (error) {
    console.error("Error connecting to MongoDB:", error)
  }
}

// Define the teacher schema
const teacherSchema = new mongoose.Schema(
  {
    Id: Number,
    Name: String,
    Password: Number,
  },
  { collection: "teacher_data" },
)

// Get the model (or create it if it doesn't exist)
const Teacher = mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema)

export async function POST(request: Request) {
  try {
    await connectToDatabase()

    const { teacherId, password } = await request.json()

    // Convert to numbers if needed
    const numericId = Number(teacherId)
    const numericPassword = Number(password)

    // Find teacher by ID and password
    const teacher = await Teacher.findOne({
      Id: numericId,
      Password: numericPassword,
    })

    if (teacher) {
      return NextResponse.json({
        success: true,
        teacher: {
          Id: teacher.Id,
          Name: teacher.Name,
        },
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "Invalid credentials",
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
