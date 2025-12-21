import { NextResponse } from "next/server"
import mongoose from "mongoose"
import fs from "fs"
import path from "path"
import { unlink } from "fs/promises"

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

// DELETE endpoint to remove a document
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase()

        const { id } = params

        // Find the document to get the file path
        const document = await Document.findById(id)

        if (!document) {
            return NextResponse.json(
                { success: false, message: "Document not found" },
                { status: 404 }
            )
        }

        // Delete the file from the filesystem
        try {
            const absoluteFilePath = path.join(process.cwd(), "public", document.filePath)
            if (fs.existsSync(absoluteFilePath)) {
                await unlink(absoluteFilePath)
            }
        } catch (error) {
            console.error("Error deleting file:", error)
            // Continue with DB deletion even if file deletion fails
        }

        // Delete the document from the database
        await Document.findByIdAndDelete(id)

        return NextResponse.json({
            success: true,
            message: "Document deleted successfully",
        })
    } catch (error) {
        console.error("Error deleting document:", error)
        return NextResponse.json(
            { success: false, message: "Error deleting document" },
            { status: 500 }
        )
    }
} 