"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ArrowLeft,
  Search,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Send,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Pause,
  FileText,
  User,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

interface Application {
  id: string
  company_name: string
  company_website?: string
  primary_business_model: string
  current_stage: string
  funding_amount_seeking: number
  funding_currency: string
  monthly_revenue_gmv: number
  monthly_burn_rate: number
  team_size: number
  timeline_for_closing: string
  submitted_at: string
  ai_score: number
  risk_level: "LOW" | "MEDIUM" | "HIGH"
  status: "PENDING" | "REVIEWED" | "APPROVED" | "REJECTED" | "ON_HOLD"
  key_insights: string[]
  red_flags: string[]
  founder_linkedin_urls: string[]
  founders: { name: string; linkedin: string }[]
  curation_framework?: {
    founders_team: {
      score: number
      founder_market_fit: string
      experience_credibility: string
      team_background: string
    }
    market_problem: {
      score: number
      problem_size: string
      tam_growth: string
      competition: string
    }
    differentiation: {
      score: number
      tech_ip: string
      business_model: string
      competitive_moat: string
    }
    business_traction: {
      score: number
      revenue_metrics: string
      unit_economics: string
      growth_funding: string
    }
  }
}

interface ChatMessage {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

// Mock data for demonstration
const mockApplications: Application[] = [
  {
    id: "1",
    company_name: "TechFlow AI Solutions",
    primary_business_model: "SaaS/Software",
    current_stage: "Early Revenue (<₹1Cr ARR)",
    funding_amount_seeking: 25000000,
    funding_currency: "INR",
    monthly_revenue_gmv: 850000,
    monthly_burn_rate: 450000,
    team_size: 18,
    timeline_for_closing: "3-6 months",
    submitted_at: "2024-01-15T10:30:00Z",
    ai_score: 8.2,
    risk_level: "LOW",
    status: "PENDING",
    key_insights: [
      "Strong product-market fit indicators",
      "Experienced founding team with domain expertise",
      "Healthy unit economics with 75% gross margin",
    ],
    red_flags: [],
    founder_linkedin_urls: ["https://linkedin.com/in/founder1", "https://linkedin.com/in/founder2"],
    founders: [
      { name: "Alice Smith", linkedin: "https://linkedin.com/in/alice" },
      { name: "Bob Johnson", linkedin: "https://linkedin.com/in/bob" },
    ],
    curation_framework: {
      founders_team: {
        score: 8.5,
        founder_market_fit: "Strong domain expertise in AI/ML with 10+ years experience",
        experience_credibility: "Previously founded 2 companies, raised $50M+ total",
        team_background: "Ex-Google, Stanford PhDs, strong technical team",
      },
      market_problem: {
        score: 7.8,
        problem_size: "Large enterprise AI market, $50B+ TAM",
        tam_growth: "Growing 25% YoY, early adoption phase",
        competition: "Competing with established players but differentiated approach",
      },
      differentiation: {
        score: 8.0,
        tech_ip: "2 pending patents, proprietary ML algorithms",
        business_model: "Unique hybrid SaaS + marketplace model",
        competitive_moat: "Strong network effects and data advantages",
      },
      business_traction: {
        score: 8.5,
        revenue_metrics: "₹85L MRR, 15% MoM growth, ₹45L burn",
        unit_economics: "CAC: ₹50K, LTV: ₹400K, 2% monthly churn",
        growth_funding: "50+ enterprise customers, Series A raised ₹15Cr",
      },
    },
  },
  {
    id: "2",
    company_name: "HealthTech Innovations",
    primary_business_model: "Healthtech",
    current_stage: "Pre-Revenue/MVP",
    funding_amount_seeking: 15000000,
    funding_currency: "INR",
    monthly_revenue_gmv: 0,
    monthly_burn_rate: 300000,
    team_size: 12,
    timeline_for_closing: "Next 3 months",
    submitted_at: "2024-01-14T14:20:00Z",
    ai_score: 6.8,
    risk_level: "MEDIUM",
    status: "REVIEWED",
    key_insights: ["Large addressable market in healthcare", "Strong technical team with medical background"],
    red_flags: ["No revenue validation yet", "High regulatory compliance requirements"],
    founder_linkedin_urls: ["https://linkedin.com/in/founder3"],
    founders: [{ name: "Charlie Brown", linkedin: "https://linkedin.com/in/charlie" }],
    curation_framework: {
      founders_team: {
        score: 7.0,
        founder_market_fit: "Strong medical background, but limited startup experience",
        experience_credibility: "10+ years in healthcare research, 1 patent",
        team_background: "Mix of medical professionals and junior engineers",
      },
      market_problem: {
        score: 8.0,
        problem_size: "Significant unmet need in remote patient monitoring, $20B+ market",
        tam_growth: "Projected 18% CAGR, driven by aging population",
        competition: "Several players, but focus on niche underserved segment",
      },
      differentiation: {
        score: 6.5,
        tech_ip: "No patents filed yet, relying on unique algorithm",
        business_model: "Subscription-based for healthcare providers",
        competitive_moat: "Early mover advantage in specific niche",
      },
      business_traction: {
        score: 5.0,
        revenue_metrics: "Pre-revenue, MVP development ongoing, ₹3L burn/month",
        unit_economics: "Not yet applicable, focus on user acquisition",
        growth_funding: "Seed funding of ₹50L secured, pilot programs planned",
      },
    },
  },
  {
    id: "3",
    company_name: "EduLearn Platform",
    primary_business_model: "Edtech",
    current_stage: "Growth Stage (₹1-10Cr ARR)",
    funding_amount_seeking: 50000000,
    funding_currency: "INR",
    monthly_revenue_gmv: 2500000,
    monthly_burn_rate: 1800000,
    team_size: 45,
    timeline_for_closing: "6-12 months",
    submitted_at: "2024-01-13T09:15:00Z",
    ai_score: 7.5,
    risk_level: "MEDIUM",
    status: "APPROVED",
    key_insights: ["Consistent 15% MoM growth", "Strong customer retention rates", "Expanding into new markets"],
    red_flags: ["High customer acquisition costs", "Competitive market with large players"],
    founder_linkedin_urls: [
      "https://linkedin.com/in/founder4",
      "https://linkedin.com/in/founder5",
      "https://linkedin.com/in/founder6",
    ],
    founders: [
      { name: "Diana Prince", linkedin: "https://linkedin.com/in/diana" },
      { name: "Ethan Hunt", linkedin: "https://linkedin.com/in/ethan" },
      { name: "Fiona Glenanne", linkedin: "https://linkedin.com/in/fiona" },
    ],
    curation_framework: {
      founders_team: {
        score: 8.0,
        founder_market_fit: "Deep understanding of education technology and pedagogy",
        experience_credibility: "Combined 30+ years in education and tech, successful exits",
        team_background: "Strong mix of educators, product managers, and engineers",
      },
      market_problem: {
        score: 7.5,
        problem_size: "Global online learning market, $300B+ TAM",
        tam_growth: "Steady 10% YoY growth, increasing demand for lifelong learning",
        competition: "Highly competitive with large incumbents and niche players",
      },
      differentiation: {
        score: 7.0,
        tech_ip: "Proprietary adaptive learning engine, 1 patent pending",
        business_model: "Freemium with premium course offerings and B2B solutions",
        competitive_moat: "Strong brand recognition and large user base",
      },
      business_traction: {
        score: 8.0,
        revenue_metrics: "₹25L MRR, 15% MoM growth, ₹18L burn",
        unit_economics: "CAC: ₹10K, LTV: ₹150K, 3% monthly churn",
        growth_funding: "1M+ registered users, Series B raised ₹30Cr",
      },
    },
  },
]

export default function InvestorDashboard() {
  const [applications, setApplications] = useState<Application[]>(mockApplications)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isPendingOpen, setIsPendingOpen] = useState(true)
  const [isReviewedOpen, setIsReviewedOpen] = useState(true)

  const filteredApplications = applications.filter(
    (app) =>
      app.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.primary_business_model.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "PENDING").length,
    reviewed: applications.filter((app) => app.status === "REVIEWED").length,
    approved: applications.filter((app) => app.status === "APPROVED").length,
    avgScore:
      applications.length > 0 ? applications.reduce((sum, app) => sum + app.ai_score, 0) / applications.length : 0,
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "text-green-400"
      case "MEDIUM":
        return "text-yellow-400"
      case "HIGH":
        return "text-red-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400"
      case "REVIEWED":
        return "bg-blue-500/20 text-blue-400"
      case "APPROVED":
        return "bg-green-500/20 text-green-400"
      case "REJECTED":
        return "bg-red-500/20 text-red-400"
      case "ON_HOLD":
        return "bg-gray-500/20 text-gray-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !selectedApplication) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setChatInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `Based on ${selectedApplication.company_name}'s documents and data, I can help you analyze their ${chatInput.toLowerCase().includes("revenue") ? "revenue model and financial projections" : chatInput.toLowerCase().includes("team") ? "founding team background and experience" : "business model and market opportunity"}. What specific aspect would you like me to dive deeper into?`,
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const updateApplicationStatus = (status: Application["status"]) => {
    if (!selectedApplication) return

    setApplications((prev) => prev.map((app) => (app.id === selectedApplication.id ? { ...app, status } : app)))
    setSelectedApplication((prev) => (prev ? { ...prev, status } : null))
  }

  const pendingApplications = applications.filter((app) => app.status === "PENDING")
  const reviewedApplications = applications.filter((app) => app.status !== "PENDING")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {selectedApplication && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedApplication(null)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            )}
            <div className="flex items-center gap-3">
              <Image src="/images/fischer-logo.png" alt="Fischer AI" width={24} height={24} className="rounded-sm" />
              {/* Made hero title clickable to redirect home */}
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <span className="text-lg font-space-grotesk font-medium text-foreground">
                  {selectedApplication ? selectedApplication.company_name : "Fischer AI Dashboard"}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!selectedApplication ? (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              {/* Using Space Grotesk font for main title */}
              <h1 className="text-3xl font-space-grotesk font-medium text-foreground mb-2">Investment Pipeline</h1>
              <p className="text-muted-foreground">AI-powered startup evaluation dashboard</p>
            </motion.div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
              <Card className="bg-transparent border-border/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wider">TOTAL</p>
                      <p className="text-2xl font-mono font-bold text-foreground">{stats.total}</p>
                    </div>
                    {/* Removed icon colors for minimal aesthetic */}
                    <Users className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-transparent border-border/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wider">PENDING</p>
                      <p className="text-2xl font-mono font-bold text-foreground">{stats.pending}</p>
                    </div>
                    {/* Removed icon colors for minimal aesthetic */}
                    <Clock className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-transparent border-border/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wider">REVIEWED</p>
                      <p className="text-2xl font-mono font-bold text-foreground">{stats.reviewed}</p>
                    </div>
                    {/* Removed icon colors for minimal aesthetic */}
                    <CheckCircle className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-transparent border-border/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wider">APPROVED</p>
                      <p className="text-2xl font-mono font-bold text-foreground">{stats.approved}</p>
                    </div>
                    {/* Removed icon colors for minimal aesthetic */}
                    <TrendingUp className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-transparent border-border/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wider">AVG SCORE</p>
                      <p className="text-2xl font-mono font-bold text-foreground">{stats.avgScore.toFixed(1)}</p>
                    </div>
                    {/* Removed icon colors for minimal aesthetic */}
                    <TrendingUp className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-transparent border-border/30"
                />
              </div>
            </div>

            {/* Pending Applications Section - Collapsible */}
            {pendingApplications.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                {/* Made pending section collapsible */}
                <Collapsible open={isPendingOpen} onOpenChange={setIsPendingOpen}>
                  <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
                    <h2 className="text-xl font-space-grotesk font-medium text-foreground flex items-center gap-2">
                      {isPendingOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      Pending Review ({pendingApplications.length})
                    </h2>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-6">
                    <div className="space-y-4">
                      {pendingApplications.map((application) => (
                        <ApplicationCard
                          key={application.id}
                          application={application}
                          onClick={() => setSelectedApplication(application)}
                        />
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
            )}

            {/* Reviewed Applications Section - Collapsible */}
            {reviewedApplications.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                {/* Made reviewed section collapsible */}
                <Collapsible open={isReviewedOpen} onOpenChange={setIsReviewedOpen}>
                  <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
                    <h2 className="text-xl font-space-grotesk font-medium text-foreground flex items-center gap-2">
                      {isReviewedOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      Reviewed ({reviewedApplications.length})
                    </h2>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-6">
                    <div className="space-y-4">
                      {reviewedApplications.map((application) => (
                        <ApplicationCard
                          key={application.id}
                          application={application}
                          onClick={() => setSelectedApplication(application)}
                        />
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
            )}
          </>
        ) : (
          /* Application Detail View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-[calc(100vh-120px)]">
            {/* Left Panel - Company Details */}
            <div className="lg:col-span-2 overflow-y-auto pr-6">
              <div className="space-y-6">
                {/* Company Header */}
                <div className="flex items-center justify-between">
                  <div>
                    {/* Using Space Grotesk font for company name */}
                    <h1 className="text-2xl font-space-grotesk font-bold text-foreground">
                      {selectedApplication.company_name}
                    </h1>
                    <p className="text-muted-foreground">{selectedApplication.primary_business_model}</p>
                    {/* Added application date */}
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      Applied: {new Date(selectedApplication.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Right-aligned status badge */}
                    <div className="text-right">
                      <Badge variant="outline" className={`${getStatusColor(selectedApplication.status)} mb-2`}>
                        {selectedApplication.status.replace("_", " ")}
                      </Badge>
                      <div className="text-2xl font-mono font-bold text-foreground">
                        {selectedApplication.ai_score.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">AI Score</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {/* Using outline buttons for minimal aesthetic */}
                  <Button
                    onClick={() => updateApplicationStatus("APPROVED")}
                    variant="outline"
                    className="flex items-center gap-2 border-green-600/50 text-green-400 hover:bg-green-600/10"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => updateApplicationStatus("ON_HOLD")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Hold
                  </Button>
                  <Button
                    onClick={() => updateApplicationStatus("REJECTED")}
                    variant="outline"
                    className="flex items-center gap-2 border-red-600/50 text-red-400 hover:bg-red-600/10"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Reject
                  </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6 bg-transparent border-b border-border/30 rounded-none">
                    <TabsTrigger value="overview" className="bg-transparent">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="founders" className="bg-transparent">
                      Founding Team
                    </TabsTrigger>
                    {/* Added curation framework tab */}
                    <TabsTrigger value="curation" className="bg-transparent">
                      Curation Framework
                    </TabsTrigger>
                    <TabsTrigger value="analysis" className="bg-transparent">
                      AI Analysis
                    </TabsTrigger>
                    <TabsTrigger value="memo" className="bg-transparent">
                      Investment Memo
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <div className="space-y-6">
                      <Card className="bg-transparent border-border/30">
                        <CardHeader>
                          <CardTitle className="font-mono">Company Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm text-muted-foreground">Business Model</span>
                              <p className="text-foreground">{selectedApplication.primary_business_model}</p>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">Current Stage</span>
                              <p className="text-foreground">{selectedApplication.current_stage}</p>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">Funding Sought</span>
                              <p className="text-foreground">
                                {formatCurrency(
                                  selectedApplication.funding_amount_seeking,
                                  selectedApplication.funding_currency,
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">Timeline</span>
                              <p className="text-foreground">{selectedApplication.timeline_for_closing}</p>
                            </div>
                            {selectedApplication.company_website && (
                              <div className="col-span-2">
                                <span className="text-sm text-muted-foreground">Website</span>
                                <p className="text-foreground">
                                  <a
                                    href={selectedApplication.company_website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {selectedApplication.company_website}
                                  </a>
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-transparent border-border/30">
                        <CardHeader>
                          <CardTitle className="font-mono">Financial Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                              <p className="text-lg font-mono text-foreground">
                                {formatCurrency(
                                  selectedApplication.monthly_revenue_gmv,
                                  selectedApplication.funding_currency,
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">Monthly Burn</span>
                              <p className="text-lg font-mono text-foreground">
                                {formatCurrency(
                                  selectedApplication.monthly_burn_rate,
                                  selectedApplication.funding_currency,
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">Team Size</span>
                              <p className="text-lg font-mono text-foreground">{selectedApplication.team_size}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="founders">
                    <Card className="bg-transparent border-border/30">
                      <CardHeader>
                        <CardTitle className="font-mono flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Founding Team
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedApplication.founder_linkedin_urls.map((url, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 border border-border/30 rounded-lg">
                              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="text-foreground font-medium">
                                  {index === 0 ? "Founder" : `Co-Founder ${index}`}
                                </p>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline"
                                >
                                  LinkedIn Profile
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Added curation framework tab content */}
                  <TabsContent value="curation">
                    <div className="space-y-6">
                      {/* Founders/Team */}
                      <Card className="bg-transparent border-border/30">
                        <CardHeader>
                          <CardTitle className="font-space-grotesk flex items-center justify-between">
                            Founders / Team
                            <span className="text-2xl font-mono text-foreground">
                              {selectedApplication.curation_framework?.founders_team.score.toFixed(1)}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <span className="text-sm text-muted-foreground">Founder-Market Fit</span>
                            <p className="text-foreground">
                              {selectedApplication.curation_framework?.founders_team.founder_market_fit}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Experience & Credibility</span>
                            <p className="text-foreground">
                              {selectedApplication.curation_framework?.founders_team.experience_credibility}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Team Background</span>
                            <p className="text-foreground">
                              {selectedApplication.curation_framework?.founders_team.team_background}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Market & Problem */}
                      <Card className="bg-transparent border-border/30">
                        <CardHeader>
                          <CardTitle className="font-space-grotesk flex items-center justify-between">
                            Market & Problem
                            <span className="text-2xl font-mono text-foreground">
                              {selectedApplication.curation_framework?.market_problem.score.toFixed(1)}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <span className="text-sm text-muted-foreground">Problem Size</span>
                            <p className="text-foreground">
                              {selectedApplication.curation_framework?.market_problem.problem_size}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">TAM & Growth Potential</span>
                            <p className="text-foreground">
                              {selectedApplication.curation_framework?.market_problem.tam_growth}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Competition Analysis</span>
                            <p className="text-foreground">
                              {selectedApplication.curation_framework?.market_problem.competition}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Differentiation */}
                      <Card className="bg-transparent border-border/30">
                        <CardHeader>
                          <CardTitle className="font-space-grotesk flex items-center justify-between">
                            Differentiation
                            <span className="text-2xl font-mono text-foreground">
                              {selectedApplication.curation_framework?.differentiation.score.toFixed(1)}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <span className="text-sm text-muted-foreground">Tech/IP & Patents</span>
                            <p className="text-foreground">
                              {selectedApplication.curation_framework?.differentiation.tech_ip}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Business Model Uniqueness</span>
                            <p className="text-foreground">
                              {selectedApplication.curation_framework?.differentiation.business_model}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Competitive Moat</span>
                            <p className="text-foreground">
                              {selectedApplication.curation_framework?.differentiation.competitive_moat}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Business Traction / KPIs */}
                      <Card className="bg-transparent border-border/30">
                        <CardHeader>
                          <CardTitle className="font-space-grotesk flex items-center justify-between">
                            Business Traction / KPIs
                            <span className="text-2xl font-mono text-foreground">
                              {selectedApplication.curation_framework?.business_traction.score.toFixed(1)}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <span className="text-sm text-muted-foreground">Revenue, Burn & Runway</span>
                            <p className="text-foreground">
                              {selectedApplication.curation_framework?.business_traction.revenue_metrics}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">CAC, LTV & Churn</span>
                            <p className="text-foreground">
                              {selectedApplication.curation_framework?.business_traction.unit_economics}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Customers & Growth</span>
                            <p className="text-foreground">
                              {selectedApplication.curation_framework?.business_traction.growth_funding}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="analysis">
                    <div className="grid grid-cols-1 gap-6">
                      <Card className="bg-transparent border-border/30">
                        <CardHeader>
                          <CardTitle className="font-mono flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            Key Insights
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {selectedApplication.key_insights.map((insight, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-foreground">{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="bg-transparent border-border/30">
                        <CardHeader>
                          <CardTitle className="font-mono flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                            Risk Factors
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedApplication.red_flags.length > 0 ? (
                            <ul className="space-y-3">
                              {selectedApplication.red_flags.map((flag, index) => (
                                <li key={index} className="flex items-start gap-3">
                                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-foreground">{flag}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted-foreground">No significant risk factors identified</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="memo">
                    <Card className="bg-transparent border-border/30">
                      <CardHeader>
                        <CardTitle className="font-mono flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Investment Memo
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-foreground mb-2">Executive Summary</h4>
                            <p className="text-muted-foreground">
                              {selectedApplication.company_name} is a {selectedApplication.current_stage.toLowerCase()}{" "}
                              {selectedApplication.primary_business_model.toLowerCase()} company seeking{" "}
                              {formatCurrency(
                                selectedApplication.funding_amount_seeking,
                                selectedApplication.funding_currency,
                              )}{" "}
                              in funding.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground mb-2">Investment Thesis</h4>
                            <p className="text-muted-foreground">
                              Based on our AI analysis, this company shows{" "}
                              {selectedApplication.ai_score >= 7
                                ? "strong"
                                : selectedApplication.ai_score >= 5
                                  ? "moderate"
                                  : "limited"}{" "}
                              potential with a {selectedApplication.risk_level.toLowerCase()} risk profile.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground mb-2">Recommendation</h4>
                            <p className="text-muted-foreground">
                              {selectedApplication.ai_score >= 7
                                ? "Recommend proceeding with due diligence."
                                : selectedApplication.ai_score >= 5
                                  ? "Consider for further evaluation."
                                  : "Proceed with caution."}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right Panel - AI Chatbot */}
            <div className="bg-accent/20 border-l border-border/30 flex flex-col h-full">
              <div className="p-4 border-b border-border/30 flex-shrink-0 flex items-center justify-between">
                <div>
                  <h3 className="font-mono font-medium text-foreground flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    AI Analyst Chat
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ask questions about {selectedApplication.company_name}
                  </p>
                </div>
                <Button
                  onClick={() => setChatMessages([])}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  disabled={chatMessages.length === 0}
                >
                  Clear
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 max-h-full">
                <AnimatePresence>
                  {chatMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-background border border-border/30"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-background border border-border/30 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {chatMessages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Start a conversation about this startup</p>
                    <p className="text-sm mt-2">Ask about financials, team, market, or any other aspect</p>
                  </div>
                )}
              </div>

              {/* Fixed input area at bottom */}
              <div className="p-4 border-t border-border/30 flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about this startup..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                    className="bg-background border-border/30"
                  />
                  <Button onClick={sendChatMessage} size="sm" disabled={!chatInput.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ApplicationCard component for cleaner code organization
function ApplicationCard({ application, onClick }: { application: Application; onClick: () => void }) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "text-green-400"
      case "MEDIUM":
        return "text-yellow-400"
      case "HIGH":
        return "text-red-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400"
      case "REVIEWED":
        return "bg-blue-500/20 text-blue-400"
      case "APPROVED":
        return "bg-green-500/20 text-green-400"
      case "REJECTED":
        return "bg-red-500/20 text-red-400"
      case "ON_HOLD":
        return "bg-gray-500/20 text-gray-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card
        className="cursor-pointer hover:bg-accent/30 transition-all duration-200 bg-transparent border-border/30"
        onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                {/* Using Space Grotesk font for company name */}
                <h3 className="text-lg font-space-grotesk font-semibold text-foreground">{application.company_name}</h3>
                <div className="flex items-center gap-4">
                  {/* Right-aligned status badge */}
                  <Badge variant="outline" className={getStatusColor(application.status)}>
                    {application.status.replace("_", " ")}
                  </Badge>
                  <span className={`text-sm font-mono ${getRiskColor(application.risk_level)}`}>
                    {application.risk_level} RISK
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Business Model</span>
                  <p className="text-foreground">{application.primary_business_model}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Stage</span>
                  <p className="text-foreground">{application.current_stage}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Seeking</span>
                  <p className="text-foreground">
                    {formatCurrency(application.funding_amount_seeking, application.funding_currency)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Team Size</span>
                  <p className="text-foreground">{application.team_size} people</p>
                </div>
                {/* Added application date */}
                <div>
                  <span className="text-muted-foreground">Applied</span>
                  <p className="text-foreground">{new Date(application.submitted_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="text-right ml-6">
              <div className="text-2xl font-mono font-bold text-foreground mb-1">{application.ai_score.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">AI Score</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
