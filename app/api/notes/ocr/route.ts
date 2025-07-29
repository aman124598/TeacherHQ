import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
    }

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
        message: 'No text found in the document' 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      extractedText: extractedText
    })

  } catch (error) {
    console.error('OCR processing error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error processing document' 
    }, { status: 500 })
  }
}
