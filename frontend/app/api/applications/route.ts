import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/applications`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error || "Backend error" },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error processing application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")

    // Fetch from backend
    const response = await fetch(`${BACKEND_URL}/applications?limit=${limit}&offset=${offset}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error || "Backend error" },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
