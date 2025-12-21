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
    let teacher = null
    if (isConnected) {
      teacher = await Teacher.findOne({
        Id: numericId,
        Password: numericPassword,
      })
    }

    // Development fallback: allow a hard-coded dev user when DB isn't available.
    // This is only active when not in production to avoid leaking credentials.
    if (!teacher && process.env.NODE_ENV !== 'production') {
      if (numericId === 1 && numericPassword === 1234) {
        // Return a synthetic teacher object for local/dev use
        return NextResponse.json({
          success: true,
          teacher: { Id: 1, Name: 'Dev User' },
        })
      }
    }

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
