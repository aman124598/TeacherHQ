import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { writeFile } from "fs/promises"
import path from "path"
import { mkdir } from "fs/promises"

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

// Define the document schema
const documentSchema = new mongoose.Schema(
    {
        teacherId: Number,
        title: String,
        fileName: String,
        fileType: String,
        filePath: String,
        fileSize: Number,
        uploadDate: {
            type: Date,
            default: Date.now,
        },
        description: String,
    },
    { collection: "teacher_documents" }
)

// Get the model (or create it if it doesn't exist)
const Document = mongoose.models.Document || mongoose.model("Document", documentSchema)

// POST endpoint for uploading documents
export async function POST(request: Request) {
    try {
        await connectToDatabase()

        const formData = await request.formData()
        const file = formData.get("file") as File
        const teacherId = Number(formData.get("teacherId"))
        const title = formData.get("title") as string
        const description = formData.get("description") as string

        if (!file || !teacherId) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            )
        }

        // Create upload directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), "public", "uploads", `teacher_${teacherId}`)
        await mkdir(uploadDir, { recursive: true })

        // Generate unique filename
        const timestamp = Date.now()
        const fileName = `${timestamp}_${file.name.replace(/\s+/g, "_")}`
        const filePath = path.join(uploadDir, fileName)

        // Convert File to Buffer and save
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // Save file metadata to the database
        const document = new Document({
            teacherId,
            title: title || file.name,
            fileName: file.name,
            fileType: file.type,
            filePath: `/uploads/teacher_${teacherId}/${fileName}`,
            fileSize: file.size,
            description,
        })

        await document.save()

        return NextResponse.json({
            success: true,
            message: "Document uploaded successfully",
            document: {
                id: document._id,
                title: document.title,
                filePath: document.filePath,
                uploadDate: document.uploadDate,
            },
        })
    } catch (error) {
        console.error("Error uploading document:", error)
        return NextResponse.json(
            { success: false, message: "Error uploading document" },
            { status: 500 }
        )
    }
}

// GET endpoint for retrieving documents
export async function GET(request: Request) {
    try {
        await connectToDatabase()

        const { searchParams } = new URL(request.url)
        const teacherId = Number(searchParams.get("teacherId"))

        if (!teacherId) {
            return NextResponse.json(
                { success: false, message: "Teacher ID is required" },
                { status: 400 }
            )
        }

        const documents = await Document.find({ teacherId }).sort({ uploadDate: -1 })

        return NextResponse.json({
            success: true,
            documents,
        })
    } catch (error) {
        console.error("Error retrieving documents:", error)
        return NextResponse.json(
            { success: false, message: "Error retrieving documents" },
            { status: 500 }
        )
    }
} 