import { NextResponse } from "next/server"

// A tiny local summarizer to use when GEMINI_API_KEY is not present.
function localSummarize(text: string): string {
  // Naive summarization: take first N sentences and convert to bullet-style notes
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean)
  const top = sentences.slice(0, 6)
  const bullets = top.map((s) => `• ${s.trim()}`)
  return bullets.join("\n")
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text || !text.trim()) {
      return NextResponse.json({
        success: false,
        message: 'No text provided for processing',
      }, { status: 400 })
    }

    // If GEMINI API key is set, use the external API. Otherwise, fall back to a local summarizer for dev.
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "") {
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
          message: 'No notes generated from the text',
        }, { status: 400 })
      }

      return NextResponse.json({ success: true, generatedNotes })
    }

    // Development fallback: local summarization
    console.warn('GEMINI_API_KEY not set — using local summarizer fallback')
    const generatedNotes = localSummarize(text)
    return NextResponse.json({ success: true, generatedNotes })

  } catch (error) {
    console.error('Gemini processing error:', error)
    return NextResponse.json({
      success: false,
      message: 'Error generating notes with AI',
    }, { status: 500 })
  }
}
