import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { writeFile } from "fs/promises"
import path from "path"
import { mkdir } from "fs/promises"

// Connect to MongoDB
let isConnected = false

const connectToDatabase = async () => {
    if (isConnected) return true

    try {
        const uri = process.env.MONGODB_URI
        if (!uri) {
            console.warn("MONGODB_URI not set - document storage disabled")
            return false
        }
        await mongoose.connect(uri)
        isConnected = true
        console.log("Connected to MongoDB")
        return true
    } catch (error) {
        console.error("Error connecting to MongoDB:", error)
        return false
    }
}

// Define the document schema
const documentSchema = new mongoose.Schema(
    {
        teacherId: String, // Changed to String to support Firebase UIDs
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
        const connected = await connectToDatabase()
        
        if (!connected) {
            return NextResponse.json(
                { success: false, message: "Database not configured" },
                { status: 503 }
            )
        }

        const formData = await request.formData()
        const file = formData.get("file") as File
        const teacherId = formData.get("teacherId") as string
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
        const connected = await connectToDatabase()
        
        if (!connected) {
            // Return empty array if database not configured
            return NextResponse.json({
                success: true,
                documents: [],
            })
        }

        const { searchParams } = new URL(request.url)
        const teacherId = searchParams.get("teacherId")

        if (!teacherId) {
            return NextResponse.json({
                success: true,
                documents: [],
            })
        }

        const documents = await Document.find({ teacherId }).sort({ uploadDate: -1 })

        return NextResponse.json({
            success: true,
            documents: documents || [],
        })
    } catch (error) {
        console.error("Error retrieving documents:", error)
        // Return empty array on error instead of 500
        return NextResponse.json({
            success: true,
            documents: [],
        })
    }
}