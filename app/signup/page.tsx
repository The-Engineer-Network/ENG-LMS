"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GraduationCap, Mail, Lock, User, BookOpen, Users, AlertCircle, ArrowLeft } from "lucide-react"

// Mock data for tracks and cohorts
const TRACKS = [
  { id: "frontend", name: "Frontend Development" },
  { id: "backend", name: "Backend Development" },
  { id: "devops", name: "DevOps / Cloud" },
  { id: "data", name: "Data / AI / ML" },
  { id: "web3", name: "Web3" },
]

const COHORTS = [
  { id: "cohort-1", name: "Cohort 1" },
  { id: "cohort-2", name: "Cohort 2" },
  { id: "cohort-3", name: "Cohort 3" },
]

// Mock paid learner whitelist
const PAID_LEARNERS = [
  { email: "alex@example.com", track: "frontend", cohort: "cohort-1" },
  { email: "sam@example.com", track: "backend", cohort: "cohort-2" },
  { email: "jordan@example.com", track: "devops", cohort: "cohort-1" },
]

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [validationError, setValidationError] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    track: "",
    cohort: "",
  })
  const [loading, setLoading] = useState(false)

  const handleNext = () => {
    setValidationError("")
    if (step < 3) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
    setValidationError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setValidationError("")

    // Check if email exists in paid learner whitelist
    const paidLearner = PAID_LEARNERS.find(
      (learner) =>
        learner.email === formData.email && learner.track === formData.track && learner.cohort === formData.cohort,
    )

    // Simulate API call
    await new Promise((r) => setTimeout(r, 800))

    if (!paidLearner) {
      setValidationError(
        "Your email is not registered for this program. If you believe this is an error, please contact us at info@engineernetwork.com",
      )
      setLoading(false)
      return
    }

    router.push("/student/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="absolute top-6 left-6 p-2 rounded-lg hover:bg-card border border-transparent hover:border-border transition-all group flex items-center gap-2 text-foreground/70 hover:text-foreground"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium hidden sm:inline">Back</span>
      </Link>

      <div className="w-full max-w-md animate-slideInUp">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
              <GraduationCap className="w-9 h-9 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold">Join EngBasecamp</h1>
          <p className="text-foreground/60 mt-1">Create your account in 3 easy steps</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-all ${s <= step ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="mb-4 p-4 rounded-lg bg-accent/10 border border-accent/20 flex gap-3 animate-fadeInScale">
            <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-sm text-accent">{validationError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeInScale">
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-foreground/40" />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-foreground/40" />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Track & Cohort */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeInScale">
              <div className="relative">
                <BookOpen className="absolute left-3 top-3.5 w-5 h-5 text-foreground/40" />
                <select
                  value={formData.track}
                  onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-primary transition-colors appearance-none"
                  required
                >
                  <option value="">Select your track</option>
                  {TRACKS.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Users className="absolute left-3 top-3.5 w-5 h-5 text-foreground/40" />
                <select
                  value={formData.cohort}
                  onChange={(e) => setFormData({ ...formData, cohort: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-primary transition-colors appearance-none"
                  required
                >
                  <option value="">Select your cohort</option>
                  {COHORTS.map((cohort) => (
                    <option key={cohort.id} value={cohort.id}>
                      {cohort.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/30 text-left">
                <p className="text-sm text-foreground/70">
                  Please ensure your track and cohort match your enrollment details for validation.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeInScale">
              <div className="p-4 rounded-lg bg-card border border-border space-y-3">
                <div>
                  <p className="text-xs text-foreground/60">Full Name</p>
                  <p className="font-semibold">{formData.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60">Email</p>
                  <p className="font-semibold">{formData.email}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60">Track</p>
                  <p className="font-semibold">{TRACKS.find((t) => t.id === formData.track)?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60">Cohort</p>
                  <p className="font-semibold">{COHORTS.find((c) => c.id === formData.cohort)?.name}</p>
                </div>
              </div>
              <p className="text-xs text-foreground/60 text-center">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex-1 py-3 rounded-lg border border-border text-foreground hover:bg-card transition-colors font-semibold"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50"
              >
                {loading ? "Validating..." : "Create Account"}
              </button>
            )}
          </div>
        </form>

        {/* Link */}
        <p className="text-center text-foreground/60 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-secondary transition-colors font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
