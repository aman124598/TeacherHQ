/**
 * Extract text from a PDF file
 * Uses pdf-parse library with proper CommonJS handling
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log("PDF processing requested for file:", file.name, "Size:", file.size)
    
    // Validate file
    if (!file || file.size === 0) {
      throw new Error("Empty or invalid PDF file")
    }
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Check for minimum PDF size
    if (buffer.length < 100) {
      throw new Error("File too small to be a valid PDF")
    }
    
    // Dynamic require for pdf-parse (CommonJS module)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfParse = require('pdf-parse')
    
    // Parse PDF
    const data = await pdfParse(buffer)
    
    // Return extracted text
    if (data.text && data.text.trim()) {
      console.log("Successfully extracted", data.text.length, "characters from PDF")
      return data.text.trim()
    }
    
    // Check if PDF has pages but no text (likely scanned/image PDF)
    if (data.numpages > 0) {
      throw new Error("This PDF appears to contain images rather than text. Please use a text-based PDF.")
    }
    
    throw new Error("No text found in the document")
  } catch (error: any) {
    console.error("Error processing PDF:", error)
    
    // Provide helpful error messages
    if (error.message?.includes('Invalid PDF')) {
      throw new Error("The file appears to be corrupted or is not a valid PDF")
    }
    if (error.message?.includes('password')) {
      throw new Error("This PDF is password protected. Please provide an unprotected PDF.")
    }
    if (error.message?.includes('is not a function')) {
      throw new Error("PDF processing is temporarily unavailable. Please try again.")
    }
    
    throw error
  }
}

/**
 * Get the number of pages in a PDF file
 */
export async function getPDFPageCount(file: File): Promise<number> {
  try {
    console.log("PDF page count requested for file:", file.name)
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Dynamic require for pdf-parse
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfParse = require('pdf-parse')
    
    // Parse PDF
    const data = await pdfParse(buffer)
    
    return data.numpages || 1
  } catch (error) {
    console.error("Error getting PDF page count:", error)
    return 0
  }
}
