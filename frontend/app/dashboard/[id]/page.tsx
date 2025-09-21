"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CompanyDetails } from "@/components/dashboard/company-details";
import { ChatInterface } from "@/components/dashboard/chat-interface";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

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

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch("/mock-applications.json");
        if (response.ok) {
          const data = await response.json();
          const app = data.find((app: Application) => app.id === params.id);
          if (app) {
            setApplication(app);
          } else {
            // If application not found, redirect back to dashboard
            router.push("/dashboard");
          }
        } else {
          console.error("Failed to fetch applications data");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching application:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchApplication();
    }
  }, [params.id, router]);

  const updateApplicationStatus = (status: Application["status"]) => {
    if (!application) return;
    setApplication((prev) => (prev ? { ...prev, status } : null));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <Image
                  src="/images/fischer-logo.png"
                  alt="Fischer AI"
                  width={24}
                  height={24}
                  className="rounded-sm"
                />
                <span className="text-lg font-space-grotesk font-medium text-foreground">
                  Fischer AI Dashboard
                </span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading application...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <Image
                  src="/images/fischer-logo.png"
                  alt="Fischer AI"
                  width={24}
                  height={24}
                  className="rounded-sm"
                />
                <span className="text-lg font-space-grotesk font-medium text-foreground">
                  Fischer AI Dashboard
                </span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-space-grotesk font-bold text-foreground mb-2">
              Application Not Found
            </h1>
            <p className="text-muted-foreground mb-4">
              The application you're looking for doesn't exist or has been
              removed.
            </p>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-44">
      {/* Header */}
      <header className="border-b border-border/20">
        <div className="mx-auto py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-73px)]">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={65} minSize={40}>
            <CompanyDetails
              application={application}
              onStatusUpdate={updateApplicationStatus}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={35} minSize={30} maxSize={45}>
            <ChatInterface application={application} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}
