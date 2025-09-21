"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import {
  ThumbsUp,
  ThumbsDown,
  Pause,
  FileText,
  User,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

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

interface CompanyDetailsProps {
  application: Application;
  onStatusUpdate: (status: Application["status"]) => void;
}

export function CompanyDetails({
  application,
  onStatusUpdate,
}: CompanyDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");

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
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="h-full p-6 flex flex-col">
      <div className="space-y-6 flex-shrink-0">
        {/* Company Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-space-grotesk font-bold text-foreground">
              {application.company_name}
            </h1>
            <p className="text-muted-foreground">
              {application.primary_business_model}
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Applied: {new Date(application.submitted_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <Badge
                variant="outline"
                className={`${getStatusColor(application.status)} mb-2`}
              >
                {application.status.replace("_", " ")}
              </Badge>
              <div className="text-2xl font-mono font-bold text-foreground">
                {application.ai_score.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">AI Score</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => onStatusUpdate("APPROVED")}
            variant="outline"
            className="flex items-center gap-2 border-green-600/50 text-green-400 hover:bg-green-600/10"
          >
            <ThumbsUp className="w-4 h-4" />
            Approve
          </Button>
          <Button
            onClick={() => onStatusUpdate("ON_HOLD")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Pause className="w-4 h-4" />
            Hold
          </Button>
          <Button
            onClick={() => onStatusUpdate("REJECTED")}
            variant="outline"
            className="flex items-center gap-2 border-red-600/50 text-red-400 hover:bg-red-600/10"
          >
            <ThumbsDown className="w-4 h-4" />
            Reject
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 mt-4">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <TabsList className="w-full justify-start overflow-x-auto flex-shrink-0">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="founders">Founding Team</TabsTrigger>
            <TabsTrigger value="curation">Curation Framework</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
            <TabsTrigger value="memo">Investment Memo</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex-1 overflow-y-auto">
            <div className="space-y-6 pr-4">
              <Card className="bg-transparent border-border/30">
                <CardHeader>
                  <CardTitle className="font-mono">
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Business Model
                      </span>
                      <p className="text-foreground">
                        {application.primary_business_model}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Current Stage
                      </span>
                      <p className="text-foreground">
                        {application.current_stage}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Funding Sought
                      </span>
                      <p className="text-foreground">
                        {formatCurrency(
                          application.funding_amount_seeking,
                          application.funding_currency
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Timeline
                      </span>
                      <p className="text-foreground">
                        {application.timeline_for_closing}
                      </p>
                    </div>
                    {application.company_website && (
                      <div className="col-span-full">
                        <span className="text-sm text-muted-foreground">
                          Website
                        </span>
                        <p className="text-foreground">
                          <a
                            href={application.company_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {application.company_website}
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Monthly Revenue
                      </span>
                      <p className="text-lg font-mono text-foreground">
                        {formatCurrency(
                          application.monthly_revenue_gmv,
                          application.funding_currency
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Monthly Burn
                      </span>
                      <p className="text-lg font-mono text-foreground">
                        {formatCurrency(
                          application.monthly_burn_rate,
                          application.funding_currency
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Team Size
                      </span>
                      <p className="text-lg font-mono text-foreground">
                        {application.team_size}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="founders" className="flex-1 overflow-y-auto">
            <div className="pr-4">
              <Card className="bg-transparent border-border/30">
                <CardHeader>
                  <CardTitle className="font-mono flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Founding Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {application.founder_linkedin_urls.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 border border-border/30 rounded-lg"
                      >
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
            </div>
          </TabsContent>

          <TabsContent value="curation" className="flex-1 overflow-y-auto">
            <div className="space-y-6 pr-4">
              {/* Founders/Team */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-space-grotesk flex items-center justify-between">
                    Founders / Team
                    <span className="text-2xl font-mono text-foreground">
                      {application.curation_framework?.founders_team.score.toFixed(
                        1
                      )}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Founder-Market Fit
                    </span>
                    <p className="text-foreground">
                      {
                        application.curation_framework?.founders_team
                          .founder_market_fit
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Experience & Credibility
                    </span>
                    <p className="text-foreground">
                      {
                        application.curation_framework?.founders_team
                          .experience_credibility
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Team Background
                    </span>
                    <p className="text-foreground">
                      {
                        application.curation_framework?.founders_team
                          .team_background
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Market & Problem */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-space-grotesk flex items-center justify-between">
                    Market & Problem
                    <span className="text-2xl font-mono text-foreground">
                      {application.curation_framework?.market_problem.score.toFixed(
                        1
                      )}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Problem Size
                    </span>
                    <p className="text-foreground">
                      {
                        application.curation_framework?.market_problem
                          .problem_size
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      TAM & Growth Potential
                    </span>
                    <p className="text-foreground">
                      {
                        application.curation_framework?.market_problem
                          .tam_growth
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Competition Analysis
                    </span>
                    <p className="text-foreground">
                      {
                        application.curation_framework?.market_problem
                          .competition
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Differentiation */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-space-grotesk flex items-center justify-between">
                    Differentiation
                    <span className="text-2xl font-mono text-foreground">
                      {application.curation_framework?.differentiation.score.toFixed(
                        1
                      )}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Tech/IP & Patents
                    </span>
                    <p className="text-foreground">
                      {application.curation_framework?.differentiation.tech_ip}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Business Model Uniqueness
                    </span>
                    <p className="text-foreground">
                      {
                        application.curation_framework?.differentiation
                          .business_model
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Competitive Moat
                    </span>
                    <p className="text-foreground">
                      {
                        application.curation_framework?.differentiation
                          .competitive_moat
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Business Traction / KPIs */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-space-grotesk flex items-center justify-between">
                    Business Traction / KPIs
                    <span className="text-2xl font-mono text-foreground">
                      {application.curation_framework?.business_traction.score.toFixed(
                        1
                      )}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Revenue, Burn & Runway
                    </span>
                    <p className="text-foreground">
                      {
                        application.curation_framework?.business_traction
                          .revenue_metrics
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      CAC, LTV & Churn
                    </span>
                    <p className="text-foreground">
                      {
                        application.curation_framework?.business_traction
                          .unit_economics
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Customers & Growth
                    </span>
                    <p className="text-foreground">
                      {
                        application.curation_framework?.business_traction
                          .growth_funding
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 gap-6 pr-4">
              <Card className="bg-transparent border-border/30">
                <CardHeader>
                  <CardTitle className="font-mono flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {application.key_insights.map((insight, index) => (
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
                  {application.red_flags.length > 0 ? (
                    <ul className="space-y-3">
                      {application.red_flags.map((flag, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-foreground">{flag}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">
                      No significant risk factors identified
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="memo" className="flex-1 overflow-y-auto">
            <div className="pr-4">
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
                      <h4 className="font-medium text-foreground mb-2">
                        Executive Summary
                      </h4>
                      <p className="text-muted-foreground">
                        {application.company_name} is a{" "}
                        {application.current_stage.toLowerCase()}{" "}
                        {application.primary_business_model.toLowerCase()}{" "}
                        company seeking{" "}
                        {formatCurrency(
                          application.funding_amount_seeking,
                          application.funding_currency
                        )}{" "}
                        in funding.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">
                        Investment Thesis
                      </h4>
                      <p className="text-muted-foreground">
                        Based on our AI analysis, this company shows{" "}
                        {application.ai_score >= 7
                          ? "strong"
                          : application.ai_score >= 5
                          ? "moderate"
                          : "limited"}{" "}
                        potential with a {application.risk_level.toLowerCase()}{" "}
                        risk profile.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">
                        Recommendation
                      </h4>
                      <p className="text-muted-foreground">
                        {application.ai_score >= 7
                          ? "Recommend proceeding with due diligence."
                          : application.ai_score >= 5
                          ? "Consider for further evaluation."
                          : "Proceed with caution."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
