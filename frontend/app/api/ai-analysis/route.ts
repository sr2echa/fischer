import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const { applicationId } = await request.json()

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 })
    }

    // Call backend AI analysis endpoint
    const response = await fetch(`${BACKEND_URL}/applications/${applicationId}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error || "AI analysis failed" },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result.analysis)
  } catch (error) {
    console.error("Error processing AI analysis:", error)
    return NextResponse.json({ error: "AI analysis failed" }, { status: 500 })
  }
}
