import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()
    
    if (!text || !text.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: 'No text provided for processing' 
      }, { status: 400 })
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`

    const body = {
      contents: [
        {
          parts: [
            {
              text: `Create detailed notes from the given text:\n\n${text}`,
            },
          ],
        },
      ],
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const generatedNotes = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!generatedNotes.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: 'No notes generated from the text' 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      generatedNotes: generatedNotes
    })

  } catch (error) {
    console.error('Gemini processing error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error generating notes with AI' 
    }, { status: 500 })
  }
}
