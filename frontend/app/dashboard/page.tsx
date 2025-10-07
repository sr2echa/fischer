"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Application {
  id: string;
  company_name: string;
  company_website?: string;
  primary_business_model: string;
  current_stage: string;
  funding_amount_seeking: number;
  funding_currency: string;
  monthly_revenue_gmv: number;
  monthly_burn_rate: number;
  team_size: number;
  timeline_for_closing: string;
  submitted_at: string;
  ai_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "REVIEWED" | "APPROVED" | "REJECTED" | "ON_HOLD";
  key_insights: string[];
  red_flags: string[];
  founder_linkedin_urls: string[];
  founders: { name: string; linkedin: string }[];
  curation_framework?: {
    founders_team: {
      score: number;
      founder_market_fit: string;
      experience_credibility: string;
      team_background: string;
    };
    market_problem: {
      score: number;
      problem_size: string;
      tam_growth: string;
      competition: string;
    };
    differentiation: {
      score: number;
      tech_ip: string;
      business_model: string;
      competitive_moat: string;
    };
    business_traction: {
      score: number;
      revenue_metrics: string;
      unit_economics: string;
      growth_funding: string;
    };
  };
}

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

export default function InvestorDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [isTyping, setIsTyping] = useState(false);
  const [isPendingOpen, setIsPendingOpen] = useState(true);
  const [isReviewedOpen, setIsReviewedOpen] = useState(true);

  // Fetch applications data on component mount
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch("/api/applications");
        if (response.ok) {
          const data = await response.json();
          setApplications(data.applications || []);
        } else {
          console.error("Failed to fetch applications data");
          setError("Failed to load applications");
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        setError("Error loading applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "PENDING").length,
    reviewed: applications.filter((app) => app.status === "REVIEWED").length,
    approved: applications.filter((app) => app.status === "APPROVED").length,
    avgScore:
      applications.length > 0
        ? applications.reduce((sum, app) => sum + app.ai_score, 0) /
          applications.length
        : 0,
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "text-green-400";
      case "MEDIUM":
        return "text-yellow-400";
      case "HIGH":
        return "text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400";
      case "REVIEWED":
        return "bg-blue-500/20 text-blue-400";
      case "APPROVED":
        return "bg-green-500/20 text-green-400";
      case "REJECTED":
        return "bg-red-500/20 text-red-400";
      case "ON_HOLD":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const safeCurrency = (currency && typeof currency === "string" && currency.trim()) || "USD";
    const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: safeCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeAmount);
  };

  const pendingApplications = applications.filter(
    (app) => app.status === "PENDING"
  );
  const reviewedApplications = applications.filter(
    (app) => app.status !== "PENDING"
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Applications</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/fischer-logo.png"
                alt="Fischer AI"
                width={24}
                height={24}
                className="rounded-sm"
              />
              {/* Made hero title clickable to redirect home */}
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <span className="text-lg font-space-grotesk font-medium text-foreground">
                  Fischer AI Dashboard
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Using Space Grotesk font for main title */}
            <h1 className="text-3xl font-space-grotesk font-medium text-foreground mb-2">
              Investment Pipeline
            </h1>
            <p className="text-muted-foreground">
              AI-powered startup evaluation dashboard
            </p>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
            <Card className="bg-transparent border-border/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">
                      TOTAL
                    </p>
                    <p className="text-2xl font-mono font-bold text-foreground">
                      {stats.total}
                    </p>
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
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">
                      PENDING
                    </p>
                    <p className="text-2xl font-mono font-bold text-foreground">
                      {stats.pending}
                    </p>
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
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">
                      REVIEWED
                    </p>
                    <p className="text-2xl font-mono font-bold text-foreground">
                      {stats.reviewed}
                    </p>
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
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">
                      APPROVED
                    </p>
                    <p className="text-2xl font-mono font-bold text-foreground">
                      {stats.approved}
                    </p>
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
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">
                      AVG SCORE
                    </p>
                    <p className="text-2xl font-mono font-bold text-foreground">
                      {stats.avgScore.toFixed(1)}
                    </p>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              {/* Made pending section collapsible */}
              <Collapsible open={isPendingOpen} onOpenChange={setIsPendingOpen}>
                <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
                  <h2 className="text-xl font-space-grotesk font-medium text-foreground flex items-center gap-2">
                    {isPendingOpen ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                    Pending Review ({pendingApplications.length})
                  </h2>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-6">
                  <div className="space-y-4">
                    {pendingApplications.map((application) => (
                      <ApplicationCard
                        key={application.id}
                        application={application}
                        onClick={() => {
                          router.push(`/dashboard/${application.id}`);
                        }}
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          )}

          {/* Reviewed Applications Section - Collapsible */}
          {reviewedApplications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Made reviewed section collapsible */}
              <Collapsible
                open={isReviewedOpen}
                onOpenChange={setIsReviewedOpen}
              >
                <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
                  <h2 className="text-xl font-space-grotesk font-medium text-foreground flex items-center gap-2">
                    {isReviewedOpen ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                    Reviewed ({reviewedApplications.length})
                  </h2>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-6">
                  <div className="space-y-4">
                    {reviewedApplications.map((application) => (
                      <ApplicationCard
                        key={application.id}
                        application={application}
                        onClick={() => {
                          router.push(`/dashboard/${application.id}`);
                        }}
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          )}
        </>
      </main>
    </div>
  );
}

// ApplicationCard component for cleaner code organization
function ApplicationCard({
  application,
  onClick,
}: {
  application: Application;
  onClick: () => void;
}) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "text-green-400";
      case "MEDIUM":
        return "text-yellow-400";
      case "HIGH":
        return "text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400";
      case "REVIEWED":
        return "bg-blue-500/20 text-blue-400";
      case "APPROVED":
        return "bg-green-500/20 text-green-400";
      case "REJECTED":
        return "bg-red-500/20 text-red-400";
      case "ON_HOLD":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const safeCurrency = (currency && typeof currency === "string" && currency.trim()) || "USD";
    const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: safeCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeAmount);
  };

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
                <h3 className="text-lg font-space-grotesk font-semibold text-foreground">
                  {application.company_name}
                </h3>
                <div className="flex items-center gap-4">
                  {/* Right-aligned status badge */}
                  <Badge
                    variant="outline"
                    className={getStatusColor(application.status || "PENDING")}
                  >
                    {(application.status ?? "PENDING").replace("_", " ")}
                  </Badge>
                  <span
                    className={`text-sm font-mono ${getRiskColor(
                      application.risk_level
                    )}`}
                  >
                    {application.risk_level} RISK
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Business Model</span>
                  <p className="text-foreground">
                    {application.primary_business_model}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Stage</span>
                  <p className="text-foreground">{application.current_stage}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Seeking</span>
                  <p className="text-foreground">
                    {formatCurrency(
                      application.funding_amount_seeking,
                      application.funding_currency
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Team Size</span>
                  <p className="text-foreground">
                    {application.team_size} people
                  </p>
                </div>
                {/* Added application date */}
                <div>
                  <span className="text-muted-foreground">Applied</span>
                  <p className="text-foreground">
                    {new Date(application.submitted_at || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right ml-6">
              <div className="text-2xl font-mono font-bold text-foreground mb-1">
                {Number(application.ai_score ?? 0).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">AI Score</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
