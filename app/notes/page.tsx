"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Upload,
  File,
  Trash2,
  Download,
  Plus,
  X,
  Calendar
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/firebase/AuthContext"

interface NoteItem {
  type: string
  key?: string
  value: string | TextSegment[]
  isBold?: boolean
  bullet?: boolean
}

interface TextSegment {
  type: string
  text: string
}

interface DocumentItem {
  _id: string
  title: string
  fileName: string
  fileType: string
  filePath: string
  fileSize: number
  uploadDate: string
  description: string
}

export default function Notes() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [notesData, setNotesData] = useState<NoteItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [documentTitle, setDocumentTitle] = useState("")
  const [documentDescription, setDocumentDescription] = useState("")
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [isDocumentUploading, setIsDocumentUploading] = useState(false)
  const [documentError, setDocumentError] = useState("")
  const [activeTab, setActiveTab] = useState("short-notes")

  // Function to parse Gemini response
  function parseGeminiResponse(text: string): NoteItem[] {
    const lines = text.split("\n").filter((line) => line.trim() !== "")
    const parsed: NoteItem[] = []

    lines.forEach((line) => {
      // Case 1: Bullet + Bold Key-Value pair: • **Key:** Value
      const bulletBoldMatch = line.match(/^•\s+\*\*(.+?)\*\*:\s*(.*)/)
      if (bulletBoldMatch) {
        parsed.push({
          type: "section",
          key: bulletBoldMatch[1].trim(),
          value: processBoldText(bulletBoldMatch[2].trim()),
          isBold: true,
          bullet: true,
        })
        return
      }

      // Case 2: Bold Key-Value pair: **Key:** Value
      const boldMatch = line.match(/^\*\*(.+?)\*\*:\s*(.*)/)
      if (boldMatch) {
        parsed.push({
          type: "section",
          key: boldMatch[1].trim(),
          value: processBoldText(boldMatch[2].trim()),
          isBold: true,
          bullet: false,
        })
        return
      }

      // Case 3: Bullet list with plain text: • value
      const bulletOnlyMatch = line.match(/^•\s+(.*)/)
      if (bulletOnlyMatch) {
        parsed.push({
          type: "bullet-point",
          value: processBoldText(bulletOnlyMatch[1].trim()),
        })
        return
      }

      // Case 4: Fallback: Plain text (may contain inline bold)
      parsed.push({
        type: "text",
        value: processBoldText(line.trim()),
      })
    })

    return parsed
  }

  // Helper function to process inline bold text
  function processBoldText(text: string): string | TextSegment[] {
    // If text contains no bold markers, return it as is
    if (!text.includes("**")) return text

    // Extract parts marked as bold and create an array of segments
    const segments: TextSegment[] = []
    let currentIndex = 0

    // Find all **text** patterns
    const boldPattern = /\*\*(.+?)\*\*/g
    let match

    while ((match = boldPattern.exec(text)) !== null) {
      // Add any text before this bold section
      if (match.index > currentIndex) {
        segments.push({
          type: "regular",
          text: text.substring(currentIndex, match.index),
        })
      }

      // Add the bold text (without the ** markers)
      segments.push({
        type: "bold",
        text: match[1], // The captured group inside **
      })

      // Update current position
      currentIndex = match.index + match[0].length
    }

    // Add any remaining text after the last bold section
    if (currentIndex < text.length) {
      segments.push({
        type: "regular",
        text: text.substring(currentIndex),
      })
    }

    return segments
  }

  // Handler for file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError("")
      setSuccess("")
      setNotesData([])
    }
  }

  // Function to extract text from PDF using OCR.Space via API route
  const extractTextFromPDF = async (pdfFile: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', pdfFile)

    const response = await fetch('/api/notes/ocr', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to extract text from PDF')
    }
    
    return result.extractedText
  }

  // Function to generate short notes using Gemini API via API route
  const generateWithGemini = async (text: string): Promise<string> => {
    const response = await fetch('/api/notes/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to generate notes')
    }
    
    return data.generatedNotes
  }

  // Main handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError("Please select a PDF file first.")
      return
    }
    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF file.")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")
    setNotesData([])

    try {
      // Step 1: Extract text from the PDF file
      const text = await extractTextFromPDF(file)
      if (!text.trim()) {
        setError("No text found in the PDF.")
        setIsLoading(false)
        return
      }

      // Step 2: Generate notes via API
      const summary = await generateWithGemini(text)
      if (!summary.trim()) {
        setError("No notes were generated. Please try again.")
        setIsLoading(false)
        return
      }

      // Step 3: Parse the response into structured data
      const parsedNotes = parseGeminiResponse(summary)
      setNotesData(parsedNotes)
      setSuccess("Short notes generated successfully!")
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.message || "An error occurred during processing.")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to render content with inline bold formatting
  const renderFormattedContent = (content: string | TextSegment[]) => {
    if (typeof content === "string") return content

    return content.map((segment, i) =>
      segment.type === "bold" ? <strong key={i}>{segment.text}</strong> : <span key={i}>{segment.text}</span>,
    )
  }

  // Load teacher documents on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        if (!user?.uid) return

        const response = await fetch(`/api/notes/document?teacherId=${user.uid}`)
        const data = await response.json()

        if (data.success) {
          setDocuments(data.documents || [])
        }
      } catch (error) {
        console.error("Error fetching documents:", error)
      }
    }

    if (user) {
      fetchDocuments()
    }
  }, [user])

  // Handle document file change
  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0])
      setDocumentError("")
    }
  }

  // Upload a new document
  const handleDocumentUpload = async () => {
    if (!documentFile) {
      setDocumentError("Please select a file to upload.")
      return
    }

    if (!user?.uid) {
      setDocumentError("Please log in to upload documents.")
      return
    }

    try {
      setIsDocumentUploading(true)
      setDocumentError("")

      const formData = new FormData()
      formData.append("file", documentFile)
      formData.append("teacherId", user.uid)
      formData.append("title", documentTitle || documentFile.name)
      formData.append("description", documentDescription)

      const response = await fetch("/api/notes/document", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        // Refresh document list
        const docsResponse = await fetch(`/api/notes/document?teacherId=${user.uid}`)
        const docsData = await docsResponse.json()

        if (docsData.success) {
          setDocuments(docsData.documents || [])
        }

        // Close dialog and reset form
        setUploadDialogOpen(false)
        setDocumentTitle("")
        setDocumentDescription("")
        setDocumentFile(null)
      } else {
        setDocumentError(data.message || "Failed to upload document")
      }
    } catch (error) {
      console.error("Error uploading document:", error)
      setDocumentError("An error occurred during upload")
    } finally {
      setIsDocumentUploading(false)
    }
  }

  // Delete a document
  const handleDocumentDelete = async (documentId: string) => {
    try {
      const response = await fetch(`/api/notes/document/${documentId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        // Update document list
        setDocuments(documents.filter(doc => doc._id !== documentId))
      }
    } catch (error) {
      console.error("Error deleting document:", error)
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="p-3 bg-gradient-blue rounded-xl mr-4 shadow-lg">
            <FileText className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Teacher Notes
            </h1>
            <p className="text-muted-foreground">Generate notes from your documents</p>
          </div>
        </div>

        <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="short-notes" className="rounded-lg data-[state=active]:shadow-md">Short Notes Generator</TabsTrigger>
            <TabsTrigger value="documents" className="rounded-lg data-[state=active]:shadow-md">Document Repository</TabsTrigger>
          </TabsList>

          <TabsContent value="short-notes">
            <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
              Upload a PDF document to extract text and generate concise, organized notes automatically.
            </p>

            <Card className="mb-8 hover-card dark:bg-slate-800/50 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Upload Document</CardTitle>
                <CardDescription>Select a PDF file to generate notes</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Input
                      id="pdf-upload"
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-muted-foreground">{file ? `Selected: ${file.name}` : "No file selected"}</p>
                  </div>

                  <Button type="submit" disabled={isLoading || !file} className="bg-gradient-blue hover:opacity-90">
                    {isLoading ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                        Generating Notes...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Generate Short Notes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Render the generated notes */}
            {notesData.length > 0 && (
              <Card className="mb-8 animate-slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Generated Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Separator className="mb-4" />
                  <div className="space-y-4">
                    {notesData.map((item, index) => {
                      if (item.type === "section") {
                        return (
                          <div key={index} className="mt-3 mb-2">
                            {item.bullet && <span className="mr-1">•</span>}
                            <strong>{item.key}:</strong> <span>{renderFormattedContent(item.value)}</span>
                          </div>
                        )
                      }
                      if (item.type === "bullet-point") {
                        return (
                          <div key={index} className="pl-4 flex">
                            <span className="mr-2">•</span>
                            <span>{renderFormattedContent(item.value)}</span>
                          </div>
                        )
                      }
                      return (
                        <p key={index} className="text-muted-foreground">
                          {renderFormattedContent(item.value)}
                        </p>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents">
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                Upload and manage documents for your notes and teaching materials.
              </p>

              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload New Document</DialogTitle>
                    <DialogDescription>
                      Add a new document to your repository. Files can be any format.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Document Title</Label>
                      <Input
                        id="title"
                        value={documentTitle}
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        placeholder="Enter document title"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Textarea
                        id="description"
                        value={documentDescription}
                        onChange={(e) => setDocumentDescription(e.target.value)}
                        placeholder="Enter document description"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="document-file">File</Label>
                      <Input
                        id="document-file"
                        type="file"
                        onChange={handleDocumentFileChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        {documentFile ? `Selected: ${documentFile.name}` : "No file selected"}
                      </p>
                    </div>

                    {documentError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{documentError}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setUploadDialogOpen(false)}
                      disabled={isDocumentUploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDocumentUpload}
                      disabled={isDocumentUploading}
                    >
                      {isDocumentUploading ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                          Uploading...
                        </>
                      ) : "Upload Document"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {documents.length === 0 ? (
              <Card className="mb-6">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <File className="h-16 w-16 text-muted-foreground opacity-30 mb-4" />
                  <p className="text-lg font-medium text-center">No documents yet</p>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Upload your first document to start building your repository.
                  </p>
                  <Button
                    className="mt-6"
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {documents.map((doc) => (
                  <Card key={doc._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <div className="flex flex-col overflow-hidden">
                          <p className="font-medium truncate">{doc.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{doc.fileName}</p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-3">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(doc.uploadDate).toLocaleDateString()}
                            </span>
                            <span>{formatFileSize(doc.fileSize)}</span>
                          </div>
                          {doc.description && (
                            <p className="text-sm mt-2">{doc.description}</p>
                          )}
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDocumentDelete(doc._id)}
                            title="Delete document"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => window.open(doc.filePath, '_blank')}
                            title="Download document"
                          >
                            <Download className="h-4 w-4 text-primary" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
