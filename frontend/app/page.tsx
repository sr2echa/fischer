"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import { Target, Shield, Users, FileText, BarChart3, Zap, TrendingUp, Github, ExternalLink } from "lucide-react"
import GlowingEffectDemo from "@/components/glowing-effect-demo"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border-b border-border/30 relative z-10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/images/fischer-logo.png" alt="Fischer AI" width={32} height={32} className="rounded-sm" />
              <span className="text-xl font-space-grotesk font-medium text-foreground">Fischer AI</span>
            </div>
            <nav className="flex items-center gap-8">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Investor View
              </Link>
              <Button variant="outline" size="sm" asChild>
                <Link href="/apply">Submit Application</Link>
              </Button>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="py-20 text-center"
        >
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-block px-4 py-2 bg-accent/20 border border-border/30 rounded-full mb-8"
              >
                <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                  AI-Powered Investment Intelligence
                </span>
              </motion.div>
            </div>

            <h1 className="text-6xl md:text-7xl font-space-grotesk font-bold text-foreground mb-6 text-balance leading-none">
              Everything you need to evaluate faster
            </h1>
            <h2 className="text-xl md:text-2xl font-space-grotesk font-light text-muted-foreground mb-12 text-balance max-w-4xl mx-auto">
              AI-powered startup analyst platform that transforms how investors evaluate opportunities with
              comprehensive data synthesis and intelligent insights
            </h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center justify-center gap-4 mb-20"
            >
              <Button size="lg" asChild className="px-8 py-3">
                <Link href="/apply">Submit Your Startup</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="px-8 py-3 bg-transparent">
                <Link href="/dashboard">View Applications</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="py-20 border-t border-border/30"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-space-grotesk font-medium text-foreground mb-4">Built for Flow</h2>
            <p className="text-lg text-muted-foreground">Everything you need to cut faster</p>
          </div>

          <GlowingEffectDemo />
        </motion.div>

        {/* Analysis Engine Section */}
        

        {/* Stats Section */}
        

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="py-20 border-t border-border/30"
        >
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl font-space-grotesk font-medium text-foreground mb-6 text-balance">
              Ready to Transform Your Investment Process?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 text-balance leading-relaxed">
              Join leading investors who use Fischer AI to make data-driven investment decisions with confidence and
              speed.
            </p>
            <div className="flex items-center justify-center gap-6">
              <Button size="lg" asChild className="px-10 py-4 text-lg">
                <Link href="/apply">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="px-10 py-4 text-lg bg-transparent">
                <Link href="/dashboard">View Demo</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-border/30 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image src="/images/fischer-logo.png" alt="Fischer AI" width={24} height={24} className="rounded-sm" />
              <span className="text-lg font-space-grotesk font-medium text-foreground">Fischer AI</span>
            </div>

            <div className="flex items-center gap-6">
              <Link
                href="https://github.com/sr2echa/fischer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
                <span className="text-sm">View on GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              <div className="text-sm text-muted-foreground">© 2024 Fischer AI. All rights reserved.</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
