"use client";

import type React from "react";
import { useState } from "react";
import {
  Button,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Progress,
} from "@/components/ui";
import { ArrowLeft, ArrowRight, Upload, X, Plus } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface CoFounder {
  id: string;
  name: string;
  linkedin: string;
}

interface FormData {
  company_name: string;
  company_website: string;
  primary_business_model: string;
  business_model_other: string;
  current_stage: string;
  funding_amount_seeking: number;
  funding_currency: string;
  primary_use_of_funds: string[];
  use_of_funds_other: string;
  timeline_for_closing: string;
  monthly_revenue_gmv: number;
  monthly_burn_rate: number;
  team_size: number;
  key_revenue_driver: string;
  revenue_driver_other: string;
  founder_linkedin_urls: string[];
  pitch_deck: File | null;
  pitch_media: File | null;
  founders_checklist: File | null;
  other_pdfs: File[];
}

const STEPS = [
  { id: 1, title: "Company Basics", description: "Tell us about your company" },
  {
    id: 2,
    title: "Fundraising Context",
    description: "Your funding requirements",
  },
  { id: 3, title: "Key Metrics", description: "Current business metrics" },
  {
    id: 4,
    title: "Founder Information",
    description: "About the founding team",
  },
  { id: 5, title: "Documents", description: "Upload supporting materials" },
];

export default function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    company_name: "",
    company_website: "",
    primary_business_model: "",
    business_model_other: "",
    current_stage: "",
    funding_amount_seeking: 0,
    funding_currency: "INR",
    primary_use_of_funds: [],
    use_of_funds_other: "",
    timeline_for_closing: "",
    monthly_revenue_gmv: 0,
    monthly_burn_rate: 0,
    team_size: 0,
    key_revenue_driver: "",
    revenue_driver_other: "",
    founder_linkedin_urls: [""],
    pitch_deck: null,
    pitch_media: null,
    founders_checklist: null,
    other_pdfs: [],
  });

  const [coFounders, setCoFounders] = useState<CoFounder[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addCoFounder = () => {
    setCoFounders([
      ...coFounders,
      { id: Date.now().toString(), name: "", linkedin: "" },
    ]);
  };

  const removeCoFounder = (id: string) => {
    setCoFounders(coFounders.filter((cf) => cf.id !== id));
  };

  const updateCoFounder = (
    id: string,
    field: keyof CoFounder,
    value: string
  ) => {
    setCoFounders(
      coFounders.map((cf) => (cf.id === id ? { ...cf, [field]: value } : cf))
    );
  };

  const handleUseOfFundsChange = (value: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        primary_use_of_funds: [...prev.primary_use_of_funds, value],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        primary_use_of_funds: prev.primary_use_of_funds.filter(
          (item) => item !== value
        ),
      }));
    }
  };

  const handleSingleFileChange = (
    field: "pitch_deck" | "pitch_media" | "founders_checklist",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const handleOtherPdfsAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    setFormData((prev) => ({
      ...prev,
      other_pdfs: [...prev.other_pdfs, ...files],
    }));
  };

  const clearSingleFile = (
    field: "pitch_deck" | "pitch_media" | "founders_checklist"
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: null,
    }));
  };

  const removeOtherPdf = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      other_pdfs: prev.other_pdfs.filter((_, i) => i !== index),
    }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

      const payloadJson = {
        ...formData,
        founder_linkedin_urls: [
          ...formData.founder_linkedin_urls.filter((url) => url.trim()),
          ...coFounders.map((cf) => cf.linkedin).filter((url) => url.trim()),
        ],
      };

      const form = new FormData();
      form.append("data", JSON.stringify(payloadJson));
      if (formData.pitch_deck) form.append("pitch_deck", formData.pitch_deck);
      if (formData.pitch_media) form.append("pitch_media", formData.pitch_media);
      if (formData.founders_checklist) form.append("founders_checklist", formData.founders_checklist);
      for (const f of formData.other_pdfs) form.append("other_pdfs", f);

      const response = await fetch(`${backendUrl}/applications`, {
        method: "POST",
        body: form,
      });

      if (response.ok) {
        const resJson = await response.json();
        const appId = resJson.id;
        // trigger enrichment asynchronously (no-block)
        try {
          fetch(`/api/enrich/${appId}`, { method: 'POST' });
        } catch (_) {}
        // redirect to dashboard detail and let it poll
        window.location.href = `/dashboard/${appId}`;
      } else {
        alert("Failed to submit application. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto space-y-12"
          >
            <div className="space-y-6">
              <Label
                htmlFor="company_name"
                className="text-2xl font-space-grotesk font-medium text-foreground block"
              >
                What's your company name?
              </Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    company_name: e.target.value,
                  }))
                }
                className="text-xl p-6 bg-transparent border-0 border-b-2 border-border/30 rounded-none focus:border-foreground transition-all duration-300 placeholder:text-muted-foreground/40"
                placeholder="Enter your company name"
                required
              />
            </div>

            <div className="space-y-6">
              <Label
                htmlFor="company_website"
                className="text-2xl font-space-grotesk font-medium text-foreground block"
              >
                Company website
                <span className="text-lg text-muted-foreground/60 ml-3 font-normal">
                  optional
                </span>
              </Label>
              <Input
                id="company_website"
                value={formData.company_website}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    company_website: e.target.value,
                  }))
                }
                className="text-xl p-6 bg-transparent border-0 border-b-2 border-border/30 rounded-none focus:border-foreground transition-all duration-300 placeholder:text-muted-foreground/40"
                placeholder="https://yourcompany.com"
              />
            </div>

            <div className="space-y-8">
              <Label className="text-2xl font-space-grotesk font-medium text-foreground block">
                What's your primary business model?
              </Label>
              <RadioGroup
                value={formData.primary_business_model}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    primary_business_model: value,
                  }))
                }
                className="space-y-3"
              >
                {[
                  "SaaS/Software",
                  "Marketplace (Two-sided)",
                  "E-commerce/D2C",
                  "Fintech",
                  "Healthtech",
                  "Edtech",
                  "Other",
                ].map((model) => (
                  <motion.div
                    key={model}
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-6 p-6 rounded-xl hover:bg-accent/10 transition-all duration-300 cursor-pointer group"
                  >
                    <RadioGroupItem
                      value={model}
                      id={model}
                      className="w-5 h-5 border-2 border-muted-foreground/50 group-hover:border-foreground transition-colors"
                    />
                    <Label
                      htmlFor={model}
                      className="text-lg font-light cursor-pointer flex-1 group-hover:text-foreground transition-colors"
                    >
                      {model}
                    </Label>
                  </motion.div>
                ))}
              </RadioGroup>
              {formData.primary_business_model === "Other" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6"
                >
                  <Input
                    placeholder="Please specify your business model"
                    value={formData.business_model_other}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        business_model_other: e.target.value,
                      }))
                    }
                    className="text-lg p-6 bg-transparent border-0 border-b-2 border-border/30 rounded-none focus:border-foreground"
                  />
                </motion.div>
              )}
            </div>

            <div className="space-y-8">
              <Label className="text-2xl font-space-grotesk font-medium text-foreground block">
                What's your current stage?
              </Label>
              <RadioGroup
                value={formData.current_stage}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, current_stage: value }))
                }
                className="space-y-3"
              >
                {[
                  {
                    value: "Pre-Revenue/MVP",
                    label: "Pre-Revenue/MVP",
                    desc: "Building or testing your product",
                  },
                  {
                    value: "Early Revenue (<₹1Cr ARR)",
                    label: "Early Revenue",
                    desc: "Less than ₹1Cr ARR",
                  },
                  {
                    value: "Growth Stage (₹1-10Cr ARR)",
                    label: "Growth Stage",
                    desc: "₹1-10Cr ARR",
                  },
                  {
                    value: "Scale Stage (>₹10Cr ARR)",
                    label: "Scale Stage",
                    desc: "More than ₹10Cr ARR",
                  },
                ].map((stage) => (
                  <motion.div
                    key={stage.value}
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-6 p-6 rounded-xl hover:bg-accent/10 transition-all duration-300 cursor-pointer group"
                  >
                    <RadioGroupItem
                      value={stage.value}
                      id={stage.value}
                      className="w-5 h-5 border-2 border-muted-foreground/50 group-hover:border-foreground transition-colors"
                    />
                    <div className="flex-1 cursor-pointer">
                      <Label
                        htmlFor={stage.value}
                        className="text-lg font-light cursor-pointer block group-hover:text-foreground transition-colors"
                      >
                        {stage.label}
                      </Label>
                      <p className="text-sm text-muted-foreground/60 mt-1">
                        {stage.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </RadioGroup>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto space-y-12"
          >
            <div className="space-y-6">
              <Label className="text-2xl font-space-grotesk font-medium text-foreground block">
                How much funding are you seeking?
              </Label>
              <div className="flex gap-8">
                <Input
                  type="number"
                  value={formData.funding_amount_seeking}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      funding_amount_seeking: Number(e.target.value),
                    }))
                  }
                  className="flex-1 text-xl p-6 bg-transparent border-0 border-b-2 border-border/30 rounded-none focus:border-foreground"
                  placeholder="Enter amount"
                />
                <Select
                  value={formData.funding_currency}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      funding_currency: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-40 text-lg p-6 bg-transparent border-0 border-b-2 border-border/30 rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-8">
              <Label className="text-2xl font-space-grotesk font-medium text-foreground block">
                Primary use of funds
                <span className="text-lg text-muted-foreground/60 ml-3 font-normal">
                  select top 3
                </span>
              </Label>
              <div className="space-y-3">
                {[
                  "Product Development",
                  "Team Expansion",
                  "Marketing/Customer Acquisition",
                  "Technology Infrastructure",
                  "Inventory/Working Capital",
                  "Geographic Expansion",
                  "Regulatory/Compliance",
                  "Other",
                ].map((use) => (
                  <motion.div
                    key={use}
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-6 p-6 rounded-xl hover:bg-accent/10 transition-all duration-300 cursor-pointer group"
                  >
                    <Checkbox
                      id={use}
                      checked={formData.primary_use_of_funds.includes(use)}
                      onCheckedChange={(checked) =>
                        handleUseOfFundsChange(use, checked as boolean)
                      }
                      className="w-5 h-5 border-2 border-muted-foreground/50 group-hover:border-foreground transition-colors"
                    />
                    <Label
                      htmlFor={use}
                      className="text-lg font-light cursor-pointer flex-1 group-hover:text-foreground transition-colors"
                    >
                      {use}
                    </Label>
                  </motion.div>
                ))}
              </div>
              {formData.primary_use_of_funds.includes("Other") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6"
                >
                  <Input
                    placeholder="Please specify other use of funds"
                    value={formData.use_of_funds_other}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        use_of_funds_other: e.target.value,
                      }))
                    }
                    className="text-lg p-6 bg-transparent border-0 border-b-2 border-border/30 rounded-none focus:border-foreground"
                  />
                </motion.div>
              )}
            </div>

            <div className="space-y-8">
              <Label className="text-2xl font-space-grotesk font-medium text-foreground block">
                Timeline for closing
              </Label>
              <RadioGroup
                value={formData.timeline_for_closing}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    timeline_for_closing: value,
                  }))
                }
                className="space-y-3"
              >
                {[
                  { value: "Next 3 months", desc: "Urgent funding need" },
                  { value: "3-6 months", desc: "Standard timeline" },
                  { value: "6-12 months", desc: "Planning ahead" },
                  { value: "Flexible", desc: "Open to discussion" },
                ].map((timeline) => (
                  <motion.div
                    key={timeline.value}
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-6 p-6 rounded-xl hover:bg-accent/10 transition-all duration-300 cursor-pointer group"
                  >
                    <RadioGroupItem
                      value={timeline.value}
                      id={timeline.value}
                      className="w-5 h-5 border-2 border-muted-foreground/50 group-hover:border-foreground transition-colors"
                    />
                    <div className="flex-1 cursor-pointer">
                      <Label
                        htmlFor={timeline.value}
                        className="text-lg font-light cursor-pointer block group-hover:text-foreground transition-colors"
                      >
                        {timeline.value}
                      </Label>
                      <p className="text-sm text-muted-foreground/60 mt-1">
                        {timeline.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </RadioGroup>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto space-y-12"
          >
            <div className="space-y-6">
              <Label
                htmlFor="monthly_revenue"
                className="text-2xl font-space-grotesk font-medium text-foreground block"
              >
                Monthly Revenue/GMV
                <span className="text-lg text-muted-foreground/60 ml-3 font-normal">
                  if zero, enter 0 - no problem!
                </span>
              </Label>
              <Input
                id="monthly_revenue"
                type="number"
                value={formData.monthly_revenue_gmv}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    monthly_revenue_gmv: Number(e.target.value),
                  }))
                }
                className="text-xl p-6 bg-transparent border-0 border-b-2 border-border/30 rounded-none focus:border-foreground transition-all duration-300 placeholder:text-muted-foreground/40"
                placeholder="Enter monthly revenue"
              />
            </div>

            <div className="space-y-6">
              <Label
                htmlFor="monthly_burn"
                className="text-2xl font-space-grotesk font-medium text-foreground block"
              >
                Monthly Burn Rate
                <span className="text-lg text-muted-foreground/60 ml-3 font-normal">
                  approximate monthly expenses
                </span>
              </Label>
              <Input
                id="monthly_burn"
                type="number"
                value={formData.monthly_burn_rate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    monthly_burn_rate: Number(e.target.value),
                  }))
                }
                className="text-xl p-6 bg-transparent border-0 border-b-2 border-border/30 rounded-none focus:border-foreground transition-all duration-300 placeholder:text-muted-foreground/40"
                placeholder="Enter monthly burn rate"
              />
            </div>

            <div className="space-y-6">
              <Label
                htmlFor="team_size"
                className="text-2xl font-space-grotesk font-medium text-foreground block"
              >
                Team Size
                <span className="text-lg text-muted-foreground/60 ml-3 font-normal">
                  full-time employees
                </span>
              </Label>
              <Input
                id="team_size"
                type="number"
                value={formData.team_size}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    team_size: Number(e.target.value),
                  }))
                }
                className="text-xl p-6 bg-transparent border-0 border-b-2 border-border/30 rounded-none focus:border-foreground transition-all duration-300 placeholder:text-muted-foreground/40"
                placeholder="Enter team size"
              />
            </div>

            <div className="space-y-8">
              <Label className="text-2xl font-space-grotesk font-medium text-foreground block">
                Key Revenue Driver
              </Label>
              <RadioGroup
                value={formData.key_revenue_driver}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    key_revenue_driver: value,
                  }))
                }
                className="space-y-3"
              >
                {[
                  "Subscription fees",
                  "Transaction fees/commissions",
                  "Product sales",
                  "Advertising revenue",
                  "Service fees",
                  "Other",
                ].map((driver) => (
                  <motion.div
                    key={driver}
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-6 p-6 rounded-xl hover:bg-accent/10 transition-all duration-300 cursor-pointer group"
                  >
                    <RadioGroupItem
                      value={driver}
                      id={driver}
                      className="w-5 h-5 border-2 border-muted-foreground/50 group-hover:border-foreground transition-colors"
                    />
                    <Label
                      htmlFor={driver}
                      className="text-lg font-light cursor-pointer flex-1 group-hover:text-foreground transition-colors"
                    >
                      {driver}
                    </Label>
                  </motion.div>
                ))}
              </RadioGroup>
              {formData.key_revenue_driver === "Other" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6"
                >
                  <Input
                    placeholder="Please specify your revenue driver"
                    value={formData.revenue_driver_other}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        revenue_driver_other: e.target.value,
                      }))
                    }
                    className="text-lg p-6 bg-transparent border-0 border-b-2 border-border/30 rounded-none focus:border-foreground"
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto space-y-12"
          >
            <div className="space-y-6">
              <Label
                htmlFor="founder_linkedin"
                className="text-2xl font-space-grotesk font-medium text-foreground block"
              >
                Your LinkedIn Profile
              </Label>
              <Input
                id="founder_linkedin"
                placeholder="https://linkedin.com/in/your-profile"
                value={formData.founder_linkedin_urls[0]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    founder_linkedin_urls: [
                      e.target.value,
                      ...prev.founder_linkedin_urls.slice(1),
                    ],
                  }))
                }
                className="text-xl p-6 bg-transparent border-0 border-b-2 border-border/30 rounded-none focus:border-foreground"
              />
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <Label className="text-2xl font-space-grotesk font-medium text-foreground block">
                  Co-Founders
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={addCoFounder}
                  className="text-foreground hover:text-foreground/80 text-lg"
                >
                  <Plus className="w-5 h-5 mr-3" />
                  Add Co-Founder
                </Button>
              </div>
              <AnimatePresence>
                {coFounders.map((coFounder) => (
                  <motion.div
                    key={coFounder.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6 p-10 border border-border/20 rounded-3xl"
                  >
                    <div className="space-y-6">
                      <Label className="text-lg font-light text-foreground">
                        Co-founder Name
                      </Label>
                      <Input
                        placeholder="Enter co-founder name"
                        value={coFounder.name}
                        onChange={(e) =>
                          updateCoFounder(coFounder.id, "name", e.target.value)
                        }
                        className="text-lg p-6 bg-transparent border-0 border-b-2 border-border/30 rounded-none focus:border-foreground"
                      />
                    </div>
                    <div className="flex gap-6 items-end">
                      <div className="flex-1 space-y-6">
                        <Label className="text-lg font-light text-foreground">
                          LinkedIn Profile
                        </Label>
                        <Input
                          placeholder="https://linkedin.com/in/profile"
                          value={coFounder.linkedin}
                          onChange={(e) =>
                            updateCoFounder(
                              coFounder.id,
                              "linkedin",
                              e.target.value
                            )
                          }
                          className="text-lg p-6 bg-transparent border-0 border-b-2 border-border/30 rounded-none focus:border-foreground"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCoFounder(coFounder.id)}
                        className="text-muted-foreground hover:text-red-400"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto space-y-12"
          >
            <div className="space-y-16">
              <div className="space-y-4">
                <Label className="text-2xl font-space-grotesk font-medium text-foreground block">
                  Pitch Deck (PDF)
                </Label>
                <div className="flex items-center gap-4">
                  <input
                    id="pitch_deck_input"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleSingleFileChange("pitch_deck", e)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("pitch_deck_input")?.click()}
                    className="flex-1 p-6 text-lg border-2 border-dashed border-border/30 hover:border-foreground bg-transparent rounded-2xl"
                  >
                    <Upload className="w-5 h-5 mr-3" />
                    {formData.pitch_deck ? formData.pitch_deck.name : "Upload pitch deck (PDF)"}
                  </Button>
                  {formData.pitch_deck && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => clearSingleFile("pitch_deck")}
                      className="text-muted-foreground hover:text-red-400"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-2xl font-space-grotesk font-medium text-foreground block">
                  Pitch Video/Audio (MP4/MP3/MOV)
                </Label>
                <div className="flex items-center gap-4">
                  <input
                    id="pitch_media_input"
                    type="file"
                    accept=".mp4,.mp3,.mov"
                    onChange={(e) => handleSingleFileChange("pitch_media", e)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("pitch_media_input")?.click()}
                    className="flex-1 p-6 text-lg border-2 border-dashed border-border/30 hover:border-foreground bg-transparent rounded-2xl"
                  >
                    <Upload className="w-5 h-5 mr-3" />
                    {formData.pitch_media ? formData.pitch_media.name : "Upload pitch video/audio (MP4/MP3/MOV)"}
                  </Button>
                  {formData.pitch_media && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => clearSingleFile("pitch_media")}
                      className="text-muted-foreground hover:text-red-400"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-2xl font-space-grotesk font-medium text-foreground block">
                  Founders Checklist (PDF or DOCX)
                </Label>
                <div className="flex items-center gap-4">
                  <input
                    id="founders_checklist_input"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => handleSingleFileChange("founders_checklist", e)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("founders_checklist_input")?.click()}
                    className="flex-1 p-6 text-lg border-2 border-dashed border-border/30 hover:border-foreground bg-transparent rounded-2xl"
                  >
                    <Upload className="w-5 h-5 mr-3" />
                    {formData.founders_checklist ? formData.founders_checklist.name : "Upload founders checklist (PDF or DOCX)"}
                  </Button>
                  {formData.founders_checklist && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => clearSingleFile("founders_checklist")}
                      className="text-muted-foreground hover:text-red-400"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-2xl font-space-grotesk font-medium text-foreground block">
                  Other Supporting Files (PDF only)
                </Label>
                <div className="text-center">
                  <input
                    id="other_pdfs_input"
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={handleOtherPdfsAdd}
                    className="hidden"
                  />
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("other_pdfs_input")?.click()}
                      className="w-full p-10 text-lg border-2 border-dashed border-border/30 hover:border-foreground transition-colors bg-transparent rounded-2xl"
                    >
                      <Upload className="w-5 h-5 mr-3" />
                      Add PDF files
                    </Button>
                  </motion.div>
                </div>
                <AnimatePresence>
                  {formData.other_pdfs.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      {formData.other_pdfs.map((file, index) => (
                        <motion.div
                          key={`${file.name}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center justify-between p-6 border border-border/20 rounded-2xl bg-accent/10"
                        >
                          <span className="text-foreground text-lg">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOtherPdf(index)}
                            className="text-muted-foreground hover:text-red-400"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border/10"
      >
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <Image
                src="/images/fischer-logo.png"
                alt="Fischer AI"
                width={28}
                height={28}
                className="rounded-sm"
              />
              <span className="text-xl font-mono font-medium text-foreground">
                Fischer AI
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                Step {currentStep} of {STEPS.length}
              </span>
              <span className="text-sm font-mono text-muted-foreground">
                {Math.round((currentStep / STEPS.length) * 100)}% Complete
              </span>
            </div>
            <Progress
              value={(currentStep / STEPS.length) * 100}
              className="h-2 bg-border/30"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-space-grotesk font-medium text-foreground mb-4">
            {STEPS[currentStep - 1].title}
          </h1>
          <p className="text-xl text-muted-foreground/70">
            {STEPS[currentStep - 1].description}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          <div key={currentStep}>{renderStep()}</div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between max-w-2xl mx-auto mt-16"
        >
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-3 text-muted-foreground hover:text-foreground disabled:opacity-30 text-lg px-6 py-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </Button>

          {currentStep === STEPS.length ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              variant="outline"
              className="flex items-center gap-3 px-8 py-3 text-lg border-foreground text-foreground hover:bg-foreground hover:text-background bg-transparent"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              variant="outline"
              className="flex items-center gap-3 px-8 py-3 text-lg border-foreground text-foreground hover:bg-foreground hover:text-background bg-transparent"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </motion.div>
      </main>
    </div>
  );
}
