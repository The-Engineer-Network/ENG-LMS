"use client"

import { useState } from "react"
import Link from "next/link"
import { GraduationCap, ArrowRight } from "lucide-react"

export default function Home() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">CohortHub</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-foreground/80 hover:text-foreground transition-colors">
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-slideInUp">
        <div className="text-center space-y-6">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/20 border border-primary/50">
            <span className="text-sm font-semibold text-secondary">🚀 The Future of Learning</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
              Manage Your Cohort
            </span>
            <br />
            <span>The Right Way</span>
          </h1>

          <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
            CohortHub empowers instructors and students with a unified platform for task management, submissions, peer
            accountability, and learning progress tracking.
          </p>

          <div className="flex gap-4 justify-center pt-8">
            <Link
              href="/signup"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all transform hover:scale-105"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className="flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 rounded-xl border-2 border-primary text-primary hover:bg-primary/10 font-semibold transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Task Management", description: "Distribute and track tasks across multiple tracks" },
            { title: "Student Reviews", description: "Comprehensive feedback system for submissions" },
            { title: "Accountability Partners", description: "Foster peer collaboration and support" },
            { title: "Progress Tracking", description: "Visual dashboards for completion metrics" },
            { title: "Certificates", description: "Automated certificate generation upon completion" },
            { title: "Real-time Chat", description: "Seamless communication between partners" },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 transform hover:scale-105 animate-fadeInScale"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-foreground/60 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
