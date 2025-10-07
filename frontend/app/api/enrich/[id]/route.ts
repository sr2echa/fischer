import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 })
    }

    const response = await fetch(`${BACKEND_URL}/applications/${id}/enrich`, {
      method: 'POST',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error || "Enrichment failed" },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in enrich route:", error)
    return NextResponse.json({ error: "Enrichment failed" }, { status: 500 })
  }
}
