const mongoose = require('mongoose');

// Replace with your connection string or set MONGODB_URI in the environment
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://amanraj89969:password@cluster0.5khmm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function main() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB Atlas');

  // Schemas (matching the project's schemas)
  const teacherSchema = new mongoose.Schema({ Id: Number, Name: String, Password: Number }, { collection: 'teacher_data' });
  const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);

  const scheduleSchema = new mongoose.Schema(
    {
      Id: Number,
      Periods: [String],
      Timings: [String],
      Schedule: [{ Day: String, Periods: [String] }],
    },
    { collection: 'teacher_schedule' },
  );
  const TeacherSchedule = mongoose.models.TeacherSchedule || mongoose.model('TeacherSchedule', scheduleSchema);

  const documentSchema = new mongoose.Schema(
    {
      teacherId: Number,
      title: String,
      fileName: String,
      fileType: String,
      filePath: String,
      fileSize: Number,
      uploadDate: { type: Date, default: Date.now },
      description: String,
    },
    { collection: 'teacher_documents' },
  );
  const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);

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
    { collection: 'teacher_id' },
  );
  const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

  // Dummy data
  const teachers = [
  { Id: 1, Name: 'Dev User', Password: 1234 },
  { Id: 1001, Name: 'Aman Raj', Password: 1234 },
    { Id: 1002, Name: 'Priya Sharma', Password: 2345 },
    { Id: 1003, Name: 'Ravi Kumar', Password: 3456 },
  ];

  const schedules = [
    {
      Id: 1,
      Periods: ['P1', 'P2', 'P3', 'P4', 'P5'],
      Timings: ['08:00', '09:00', '10:00', '11:00', '12:00'],
      Schedule: [
        { Day: 'Monday', Periods: ['Math', 'English', 'Science', 'History', 'PE'] },
        { Day: 'Tuesday', Periods: ['English', 'Math', 'Art', 'Computer Science', 'Music'] },
        { Day: 'Wednesday', Periods: ['Science', 'Math', 'English', 'Geography', 'Sports'] },
      ],
    },
    {
      Id: 1001,
      Periods: ['P1', 'P2', 'P3', 'P4', 'P5'],
      Timings: ['09:00', '10:00', '11:00', '12:00', '13:00'],
      Schedule: [
        { Day: 'Monday', Periods: ['Math', 'Science', 'English', 'History', 'PE'] },
        { Day: 'Tuesday', Periods: ['English', 'Math', 'Art', 'Science', 'Music'] },
      ],
    },
    {
      Id: 1002,
      Periods: ['P1', 'P2', 'P3', 'P4'],
      Timings: ['08:30', '09:30', '10:30', '11:30'],
      Schedule: [
        { Day: 'Monday', Periods: ['Biology', 'Chemistry', 'Physics', 'Math'] },
      ],
    },
  ];

  const documents = [
    {
      teacherId: 1001,
      title: 'Module 1 Textbook',
      fileName: 'BCS601-module-1-textbook.pdf',
      fileType: 'application/pdf',
      filePath: '/uploads/teacher_1001/1744268494058_BCS601-module-1-textbook.pdf',
      fileSize: 102400,
      description: 'Course textbook for Module 1',
    },
  ];

  const today = new Date();
  const isoDate = today.toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const attendance = [
    {
      Id: 1001,
      Attendance: [
        { Date: yesterday, Time_In: '08:45:00', Present_Absent: 'Present', Time_Out: '15:00:00' },
        { Date: isoDate, Time_In: '08:50:00', Present_Absent: 'Present', Time_Out: null },
      ],
    },
  ];

  try {
    // Upsert teachers
    for (const t of teachers) {
      await Teacher.updateOne({ Id: t.Id }, { $set: { Name: t.Name, Password: t.Password } }, { upsert: true });
    }

    // Upsert schedules
    for (const s of schedules) {
      await TeacherSchedule.updateOne(
        { Id: s.Id },
        { $set: { Periods: s.Periods, Timings: s.Timings, Schedule: s.Schedule } },
        { upsert: true },
      );
    }

    // Insert documents (do not upsert to allow multiple documents)
    for (const d of documents) {
      // Check if similar document exists
      const exists = await Document.findOne({ teacherId: d.teacherId, fileName: d.fileName });
      if (!exists) {
        await Document.create(d);
      }
    }

    // Upsert attendance records
    for (const a of attendance) {
      await Attendance.updateOne(
        { Id: a.Id },
        { $set: { Attendance: a.Attendance } },
        { upsert: true },
      );
    }

    console.log('Seeding complete');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
