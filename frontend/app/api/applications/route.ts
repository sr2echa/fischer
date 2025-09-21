import { type NextRequest, NextResponse } from "next/server"

interface ApplicationData {
  company_name: string
  primary_business_model: string
  business_model_other?: string
  current_stage: string
  funding_amount_seeking: number
  funding_currency: string
  primary_use_of_funds: string[]
  use_of_funds_other?: string
  timeline_for_closing: string
  monthly_revenue_gmv: number
  monthly_burn_rate: number
  team_size: number
  key_revenue_driver: string
  revenue_driver_other?: string
  founder_linkedin_urls: string[]
  documents: Array<{
    filename: string
    content: string
    content_type: string
  }>
}

// Mock database - in production, this would be a real database
const applications: Array<ApplicationData & { id: string; submitted_at: string }> = []

export async function POST(request: NextRequest) {
  try {
    const data: ApplicationData = await request.json()

    // Validate required fields
    if (!data.company_name || !data.primary_business_model || !data.current_stage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create new application
    const newApplication = {
      ...data,
      id: Date.now().toString(),
      submitted_at: new Date().toISOString(),
    }

    // Store in mock database
    applications.push(newApplication)

    // In a real implementation, you would:
    // 1. Store in database
    // 2. Process documents with AI
    // 3. Generate AI analysis and scoring
    // 4. Send notifications to investors

    console.log("New application received:", {
      id: newApplication.id,
      company: data.company_name,
      stage: data.current_stage,
      funding: `${data.funding_currency} ${data.funding_amount_seeking.toLocaleString()}`,
    })

    return NextResponse.json(
      {
        success: true,
        id: newApplication.id,
        message: "Application submitted successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error processing application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // In production, this would fetch from database with proper authentication
    // and filtering based on user permissions

    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")

    // Mock AI-enhanced applications with scores and analysis
    const enhancedApplications = applications.slice(offset, offset + limit).map((app) => ({
      ...app,
      ai_score: Math.random() * 3 + 7, // Mock score between 7-10
      risk_level: ["LOW", "MEDIUM", "HIGH"][Math.floor(Math.random() * 3)] as "LOW" | "MEDIUM" | "HIGH",
      status: ["PENDING", "REVIEWED", "APPROVED", "REJECTED"][Math.floor(Math.random() * 4)] as
        | "PENDING"
        | "REVIEWED"
        | "APPROVED"
        | "REJECTED",
      key_insights: ["Strong product-market fit indicators", "Experienced founding team", "Healthy unit economics"],
      red_flags: Math.random() > 0.5 ? [] : ["High customer acquisition costs", "Competitive market landscape"],
    }))

    return NextResponse.json({
      applications: enhancedApplications,
      total: applications.length,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
