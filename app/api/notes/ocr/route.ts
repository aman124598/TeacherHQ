import { NextResponse } from "next/server"
import { extractTextFromPDF } from "../../../../lib/pdf-extractor"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
    }

    // If OCR API key is configured, try OCR.Space
    const ocrApiKey = process.env.OCR_API_KEY
    if (ocrApiKey && ocrApiKey.trim() !== "") {
      try {
        const ocrFormData = new FormData()
        ocrFormData.append('file', file)
        ocrFormData.append('language', 'eng')
        ocrFormData.append('isOverlayRequired', 'false')

        const response = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          headers: {
            'apikey': ocrApiKey,
          },
          body: ocrFormData,
        })

        const result = await response.json()
        const extractedText = result?.ParsedResults?.[0]?.ParsedText || ''

        if (extractedText.trim()) {
          return NextResponse.json({ success: true, extractedText })
        }
        
        // If OCR returned no text, fall through to PDF extractor
        console.warn('OCR returned no text, falling back to PDF extractor')
      } catch (ocrError) {
        console.warn('OCR API error:', ocrError)
        // Fall through to PDF extractor
      }
    }

    // Local fallback: use PDF extractor
    console.log('Using local PDF extractor')
    try {
      const extractedText = await extractTextFromPDF(file)
      
      if (extractedText && extractedText.trim()) {
        return NextResponse.json({ success: true, extractedText })
      }
      
      // If PDF has no extractable text, return helpful message
      return NextResponse.json({
        success: false,
        message: 'No readable text found in the PDF. This could be because the PDF contains images or scanned content. Please try a text-based PDF.',
      }, { status: 400 })
    } catch (pdfError: any) {
      console.error('PDF extraction error:', pdfError)
      return NextResponse.json({
        success: false,
        message: pdfError.message || 'Failed to extract text from PDF',
      }, { status: 400 })
    }

  } catch (error) {
    console.error('OCR processing error:', error)
    return NextResponse.json({
      success: false,
      message: 'Error processing document. Please try again.',
    }, { status: 500 })
  }
}
