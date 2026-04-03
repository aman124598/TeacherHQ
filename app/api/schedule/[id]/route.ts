import { NextRequest, NextResponse } from 'next/server';
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

// Define the schedule schema
const teacherScheduleSchema = new mongoose.Schema(
  {
    Id: Number,
    Periods: [String],
    Timings: [String],
    Schedule: [
      {
        Day: String,
        Periods: [String],
      },
    ],
  },
  { collection: "teacher_schedule" },
)

// Get the model (or create it if it doesn't exist)
const TeacherSchedule = mongoose.models.TeacherSchedule || mongoose.model("TeacherSchedule", teacherScheduleSchema)

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Await params before accessing its properties so we can use teacherId for early fallbacks
    const { id } = await params;
    const teacherId = Number(id);

    await connectToDatabase();

    // If mongoose is not connected, avoid calling findOne (which will buffer and timeout).
    // In development return the synthetic fallback for teacher 1 to allow UI testing.
    const ready = mongoose.connection && mongoose.connection.readyState === 1
    if (!ready) {
      console.warn('MongoDB not connected; connection readyState:', mongoose.connection?.readyState)
      if (process.env.NODE_ENV !== 'production' && teacherId === 1) {
        const fallback = {
          Id: 1,
          Periods: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'],
          Timings: ['08:30', '09:30', '10:30', '10:50', '11:50', '12:50', '13:45', '14:40', '15:35'],
          Schedule: [
            { Day: 'Monday', Periods: ['Math', 'English', '', 'Science', 'History', '', 'PE', 'Art', 'Music'] },
            { Day: 'Tuesday', Periods: ['English', 'Math', '', 'Art', 'Computer Science', '', 'Music', 'Geography', 'Sports'] },
            { Day: 'Wednesday', Periods: ['Science', 'Math', '', 'English', 'Geography', '', 'Sports', 'History', 'Free'] },
            { Day: 'Thursday', Periods: ['Math', 'Physics', '', 'Chemistry', 'Biology', '', 'Lab', 'Study', 'Free'] },
            { Day: 'Friday', Periods: ['Review', 'Exam Prep', '', 'Project', 'Counseling', '', 'Club', 'Cleanup', 'Free'] },
          ],
        };

        return NextResponse.json(fallback);
      }

      // If not in dev or not teacher 1, return a clear 503 indicating DB problem
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 })
    }

  // Find schedule by teacher ID
  const schedule = await TeacherSchedule.findOne({ Id: teacherId });

    if (!schedule) {
      // Development fallback: return a synthetic schedule for dev user 1 when DB is not available
      if (process.env.NODE_ENV !== 'production' && teacherId === 1) {
        const fallback = {
          Id: 1,
          Periods: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'],
          Timings: ['08:30', '09:30', '10:30', '10:50', '11:50', '12:50', '13:45', '14:40', '15:35'],
          Schedule: [
            { Day: 'Monday', Periods: ['Math', 'English', '', 'Science', 'History', '', 'PE', 'Art', 'Music'] },
            { Day: 'Tuesday', Periods: ['English', 'Math', '', 'Art', 'Computer Science', '', 'Music', 'Geography', 'Sports'] },
            { Day: 'Wednesday', Periods: ['Science', 'Math', '', 'English', 'Geography', '', 'Sports', 'History', 'Free'] },
            { Day: 'Thursday', Periods: ['Math', 'Physics', '', 'Chemistry', 'Biology', '', 'Lab', 'Study', 'Free'] },
            { Day: 'Friday', Periods: ['Review', 'Exam Prep', '', 'Project', 'Counseling', '', 'Club', 'Cleanup', 'Free'] },
          ],
        };

        return NextResponse.json(fallback);
      }

      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
