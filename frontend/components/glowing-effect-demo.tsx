"use client"

import type React from "react"

import { FileText, TrendingUp, AlertTriangle, MessageSquare, Target } from "lucide-react"
import { GlowingEffect } from "@/components/ui/glowing-effect"

export default function GlowingEffectDemo() {
  return (
    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
      <GridItem
        area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
        icon={<FileText className="h-4 w-4 text-white" />}
        title="Document Processing"
        description="Pitch decks, financial models, call transcripts, and founder updates automatically processed and structured."
      />

      <GridItem
        area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
        icon={<TrendingUp className="h-4 w-4 text-white" />}
        title="Market Benchmarking"
        description="Compare startups against sector peers using financial multiples, hiring data, and traction signals."
      />

      <GridItem
        area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
        icon={<AlertTriangle className="h-4 w-4 text-white" />}
        title="Risk Detection"
        description="Identify potential red flags including inconsistent metrics, inflated market size, and unusual churn patterns."
      />

      <GridItem
        area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
        icon={<MessageSquare className="h-4 w-4 text-white" />}
        title="Interactive Intelligence"
        description="Ask questions about any startup and get instant AI-powered insights based on comprehensive data analysis."
      />

      <GridItem
        area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
        icon={<Target className="h-4 w-4 text-white" />}
        title="4-Vector Curation Framework"
        description="Systematic evaluation across Founders/Team, Market & Problem, Differentiation, and Business Traction/KPIs."
      />
    </ul>
  )
}

interface GridItemProps {
  area: string
  icon: React.ReactNode
  title: string
  description: React.ReactNode
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3">
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
        <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-gray-600 bg-gray-800/50 p-2">{icon}</div>
            <div className="space-y-3">
              <h3 className="-tracking-4 pt-0.5 font-space-grotesk text-xl/[1.375rem] font-semibold text-balance text-white md:text-2xl/[1.875rem]">
                {title}
              </h3>
              <h2 className="font-sans text-sm/[1.125rem] text-gray-300 md:text-base/[1.375rem] [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                {description}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}
