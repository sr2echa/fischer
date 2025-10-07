import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const { applicationId, question } = await request.json()

    if (!applicationId || !question) {
      return NextResponse.json({ 
        error: "Application ID and question are required" 
      }, { status: 400 })
    }

    // Call backend chat endpoint
    const response = await fetch(`${BACKEND_URL}/applications/${applicationId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error || "Chat failed" },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json({
      response: result.response,
      timestamp: result.timestamp
    })
  } catch (error) {
    console.error("Error in chat:", error)
    return NextResponse.json({ error: "Chat failed" }, { status: 500 })
  }
}
