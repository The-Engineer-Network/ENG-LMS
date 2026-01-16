"use client"

import Link from "next/link"
import { GraduationCap, Users, Award, Calendar, Clock, Star, ArrowRight, CheckCircle, Code, Database, Cloud, Brain, Coins, Menu, X } from "lucide-react"
import { useState } from "react"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const tracks = [
    {
      name: "Frontend Development",
      icon: Code,
      description: "React, TypeScript, and modern web development",
      color: "from-primary to-secondary"
    },
    {
      name: "Backend Development", 
      icon: Database,
      description: "APIs, databases, and server-side programming",
      color: "from-secondary to-accent"
    },
    {
      name: "DevOps / Cloud",
      icon: Cloud,
      description: "AWS, Docker, CI/CD, and infrastructure",
      color: "from-accent to-primary"
    },
    {
      name: "Data / AI / ML",
      icon: Brain,
      description: "Python, machine learning, and data science",
      color: "from-primary to-accent"
    },
    {
      name: "Web3/Blockchain",
      icon: Coins,
      description: "Smart contracts, DeFi, and blockchain development",
      color: "from-secondary to-primary"
    }
  ]

  const features = [
    {
      icon: Users,
      title: "Industry Expert Mentors",
      description: "Get guidance from professionals who've walked your path"
    },
    {
      icon: Star,
      title: "Hall of Fame Recognition",
      description: "Top performers get featured and celebrated"
    },
    {
      icon: Award,
      title: "Certificate of Completion",
      description: "Earn a certificate to showcase your commitment"
    },
    {
      icon: Calendar,
      title: "6-Week Structured Program",
      description: "Perfect pace for beginners to build momentum"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl">EngBasecamp</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className="text-foreground/70 hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Join Program
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-sm">
              <div className="px-4 py-4 space-y-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-foreground/70 hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-center font-medium"
                >
                  Join Program
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(234,190,123,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(232,117,53,0.1),transparent_50%)]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            {/* Cohort Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Second Cohort</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Engineer Basecamp
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-4xl mx-auto leading-relaxed">
              A 6-week mentorship program designed for <span className="font-semibold text-primary">absolute beginners</span> who want to break into tech. 
              Get the guidance, community, and structure you need to start your journey.
            </p>

            {/* Key Features */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-medium">Industry Expert Mentors</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
                <Calendar className="w-5 h-5 text-secondary" />
                <span className="font-medium">Weekly Live Sessions</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
                <Award className="w-5 h-5 text-accent" />
                <span className="font-medium">Certificate of Completion</span>
              </div>
            </div>

            {/* Countdown */}
            <div className="bg-card border border-border rounded-2xl p-8 mb-12 max-w-2xl mx-auto">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <Clock className="w-5 h-5 text-accent" />
                    <span className="font-semibold text-accent">Registration Ends:</span>
                  </div>
                  <p className="text-2xl font-bold">January 16th, 2026</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-primary">Program Starts:</span>
                  </div>
                  <p className="text-2xl font-bold">January 19th, 2026</p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 rounded-2xl p-8 mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Your Tech Journey?</h2>
              <p className="text-lg text-foreground/80 mb-6">
                Join our second cohort and get the support you need to break into tech. Limited spots available for this exclusive program.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all transform hover:scale-105 font-semibold text-lg"
                >
                  Apply for Engineer Basecamp
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="inline-flex items-center gap-2 px-8 py-4 border-2 border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-semibold text-lg">
                  Take Basecamp Quiz
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-4 mt-6 text-sm text-foreground/60">
                <span>6 Weeks</span>
                <span>•</span>
                <span>Certificate Included</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tracks Available</h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Choose your path and start building the skills that matter in today's tech industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tracks.map((track, index) => (
              <div
                key={track.name}
                className="group relative bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${track.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <track.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-3">{track.name}</h3>
                <p className="text-foreground/70 leading-relaxed">{track.description}</p>
                
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Makes This Special</h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              We've designed every aspect of the program to give you the best chance of success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="flex gap-6 p-8 bg-card border border-border rounded-2xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-foreground/70 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Don't Wait. Your Tech Career Starts Here.
          </h2>
          <p className="text-lg text-foreground/80 mb-8">
            Join hundreds of successful graduates who started their journey with Engineer Basecamp
          </p>
          
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 font-semibold text-lg"
          >
            Start Your Application Today
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <p className="text-sm text-foreground/60 mt-4">
            Limited spots available • Registration closes January 16th, 2026
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">EngBasecamp</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-foreground/60">
              <span>© 2026 Engineer Network</span>
              <span>•</span>
              <span>Transforming careers, one cohort at a time</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}