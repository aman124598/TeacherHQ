import { NextResponse } from "next/server"
import { extractTextFromPDF } from "../../../../lib/pdf-extractor"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
    }

    // If OCR API key is configured, use OCR.Space. Otherwise use local PDF extractor as a safe dev fallback.
    if (process.env.OCR_API_KEY && process.env.OCR_API_KEY.trim() !== "") {
      // Create form data for OCR.Space API
      const ocrFormData = new FormData()
      ocrFormData.append('file', file)
      ocrFormData.append('language', 'eng')
      ocrFormData.append('isOverlayRequired', 'false')

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: {
          'apikey': process.env.OCR_API_KEY || '',
        },
        body: ocrFormData,
      })

      const result = await response.json()
      const extractedText = result?.ParsedResults?.[0]?.ParsedText || ''

      if (!extractedText.trim()) {
        return NextResponse.json({
          success: false,
          message: 'No text found in the document',
        }, { status: 400 })
      }

      return NextResponse.json({ success: true, extractedText })
    }

    // Development/local fallback: use the project's PDF extractor (placeholder) to return usable text
    console.warn('OCR_API_KEY not set — using local PDF extractor fallback')
    try {
      const extractedText = await extractTextFromPDF(file)
      return NextResponse.json({ success: true, extractedText })
    } catch (err) {
      console.error('Local PDF extraction failed:', err)
      return NextResponse.json({ success: false, message: 'Failed to extract text locally' }, { status: 500 })
    }

  } catch (error) {
    console.error('OCR processing error:', error)
    return NextResponse.json({
      success: false,
      message: 'Error processing document',
    }, { status: 500 })
  }
}
