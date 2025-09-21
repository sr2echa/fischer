import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // In production, fetch specific application from database
    // This is a mock implementation

    const mockApplication = {
      id,
      company_name: "TechFlow AI Solutions",
      primary_business_model: "SaaS/Software",
      current_stage: "Early Revenue (<₹1Cr ARR)",
      funding_amount_seeking: 25000000,
      funding_currency: "INR",
      monthly_revenue_gmv: 850000,
      monthly_burn_rate: 450000,
      team_size: 18,
      timeline_for_closing: "3-6 months",
      submitted_at: new Date().toISOString(),
      ai_score: 8.2,
      risk_level: "LOW",
      status: "PENDING",
      key_insights: [
        "Strong product-market fit indicators",
        "Experienced founding team with domain expertise",
        "Healthy unit economics with 75% gross margin",
        "Growing market with clear differentiation",
      ],
      red_flags: [],
      detailed_analysis: {
        market_size: "Large addressable market with growth potential",
        competition: "Moderate competition with clear differentiation",
        team_assessment: "Strong technical and business expertise",
        financial_health: "Positive unit economics with sustainable growth",
        risk_factors: "Low overall risk profile",
      },
      documents: [
        { filename: "pitch_deck.pdf", type: "application/pdf" },
        { filename: "financial_model.xlsx", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
        {
          filename: "business_plan.docx",
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
      ],
    }

    return NextResponse.json(mockApplication)
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const updates = await request.json()

    // In production, update application status in database
    // This would also trigger notifications and workflow updates

    console.log(`Updating application ${id}:`, updates)

    return NextResponse.json({
      success: true,
      message: "Application updated successfully",
    })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
