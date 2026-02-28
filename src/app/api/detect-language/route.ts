import { NextRequest, NextResponse } from 'next/server'
import { detectLanguageWithKimi } from '@/features/transcription/services/kimi/detectLanguage'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()
    
    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      )
    }

    const language = await detectLanguageWithKimi(text)
    
    return NextResponse.json({ language })
  } catch (error) {
    console.error('Error detecting language:', error)
    return NextResponse.json(
      { error: 'Failed to detect language' },
      { status: 500 }
    )
  }
}