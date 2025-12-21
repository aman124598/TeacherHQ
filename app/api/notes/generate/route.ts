import { NextResponse } from "next/server"

// An improved local summarizer for when GEMINI_API_KEY is not present
function localSummarize(text: string): string {
  // Clean up the text
  const cleanText = text.replace(/\s+/g, ' ').trim()
  
  // Split into sentences (simplified approach that works across environments)
  const sentences = cleanText.split(/[.!?]+/).filter((s) => s.trim().length > 10)
  
  // Take key sentences and create notes
  const keyPoints = sentences.slice(0, 10)
  
  // Format as structured notes
  const notes: string[] = []
  notes.push("**Summary Notes**")
  notes.push("")
  notes.push("**Key Points:**")
  
  keyPoints.forEach((sentence, index) => {
    const trimmed = sentence.trim()
    if (trimmed) {
      notes.push(`• ${trimmed}.`)
    }
  })
  
  if (sentences.length > 10) {
    notes.push("")
    notes.push(`*Note: This is a local summary of the first ${Math.min(10, keyPoints.length)} key points. For more detailed AI-generated notes, configure the GEMINI_API_KEY.*`)
  }
  
  return notes.join("\n")
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

    const apiKey = process.env.GEMINI_API_KEY

    // If GEMINI API key is set, try the external API
    if (apiKey && apiKey.trim() !== "") {
      try {
        // Try the newer gemini-1.5-flash model first
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

        const body = {
          contents: [
            {
              parts: [
                {
                  text: `Create detailed, well-structured notes from the following text. Use bullet points and organize by topic:\n\n${text.slice(0, 30000)}`, // Limit text to avoid token limits
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

        if (response.ok) {
          const data = await response.json()
          const generatedNotes = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

          if (generatedNotes.trim()) {
            return NextResponse.json({ success: true, generatedNotes })
          }
        }
        
        // If Gemini fails, fall through to local summarizer
        console.warn('Gemini API call failed, falling back to local summarizer')
      } catch (apiError) {
        console.warn('Gemini API error:', apiError)
        // Fall through to local summarizer
      }
    }

    // Development/fallback: local summarization
    console.log('Using local summarizer')
    const generatedNotes = localSummarize(text)
    return NextResponse.json({ success: true, generatedNotes })

  } catch (error) {
    console.error('Notes processing error:', error)
    
    // Even on error, try to return something useful
    try {
      const { text } = await request.clone().json()
      if (text) {
        const generatedNotes = localSummarize(text)
        return NextResponse.json({ success: true, generatedNotes })
      }
    } catch {
      // Ignore parse errors
    }
    
    return NextResponse.json({
      success: false,
      message: 'Error generating notes. Please try again.',
    }, { status: 500 })
  }
}
