"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GraduationCap, Mail, Lock, User, BookOpen, Users, AlertCircle, ArrowLeft } from "lucide-react"
import { getTracks, getCohorts, checkWhitelistStatus } from "../../lib/data"
import { signUp } from "../../lib/auth"
import type { Track, Cohort } from "../../lib/supabase"
import { logger } from "@/lib/logger"

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [validationError, setValidationError] = useState("")
  const [emailStatus, setEmailStatus] = useState<'unchecked' | 'checking' | 'valid' | 'invalid'>('unchecked')
  const [tracks, setTracks] = useState<Track[]>([])
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    track: "",
    cohort: "",
  })
  const [loading, setLoading] = useState(false)

  // Load tracks and cohorts on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tracksData, cohortsData] = await Promise.all([
          getTracks(),
          getCohorts()
        ])
        setTracks(tracksData)
        setCohorts(cohortsData)
      } catch (error) {
        logger.error('Error loading data:', error)
      }
    }
    loadData()
  }, [])

  // Check email whitelist status when email, track, or cohort changes
  useEffect(() => {
    const checkEmailStatus = async () => {
      if (formData.email && formData.track && formData.cohort) {
        setEmailStatus('checking')
        try {
          const isWhitelisted = await checkWhitelistStatus(formData.email, formData.track, formData.cohort)
          setEmailStatus(isWhitelisted ? 'valid' : 'invalid')
          
          if (!isWhitelisted) {
            setValidationError("Your email is not registered for this track and cohort combination.")
          } else {
            setValidationError("")
          }
        } catch (error) {
          setEmailStatus('invalid')
          setValidationError("Unable to verify email status. Please try again.")
        }
      } else {
        setEmailStatus('unchecked')
        setValidationError("")
      }
    }

    // Debounce the check
    const timeoutId = setTimeout(checkEmailStatus, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.email, formData.track, formData.cohort])

  const handleNext = () => {
    setValidationError("")
    
    // Validate step 1
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.password) {
        setValidationError("Please fill in all fields")
        return
      }
    }
    
    // Validate step 2
    if (step === 2) {
      if (!formData.track || !formData.cohort) {
        setValidationError("Please select both track and cohort")
        return
      }
      if (emailStatus === 'invalid') {
        setValidationError("Your email is not registered for this track and cohort combination.")
        return
      }
      if (emailStatus === 'checking') {
        setValidationError("Please wait while we verify your email...")
        return
      }
    }
    
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

    try {
      // Final check - this should pass since we validated in step 2
      if (emailStatus !== 'valid') {
        setValidationError("Email validation failed. Please go back and verify your information.")
        setLoading(false)
        return
      }

      // Create user account - the signUp function will handle whitelist check again
      await signUp(formData.email, formData.password, formData.fullName, formData.track, formData.cohort)
      
      router.push("/student/dashboard")
    } catch (error: any) {
      setValidationError(error.message || "An error occurred during signup. Please try again.")
      setLoading(false)
    }
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
          <h1 className="text-2xl font-bold">Join ENG-Basecamp</h1>
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
                  className={`w-full pl-10 pr-4 py-3 rounded-lg bg-card border text-foreground placeholder:text-foreground/40 focus:outline-none transition-colors ${
                    emailStatus === 'valid' ? 'border-green-500 focus:border-green-500' :
                    emailStatus === 'invalid' ? 'border-red-500 focus:border-red-500' :
                    'border-border focus:border-primary'
                  }`}
                  required
                />
                {emailStatus === 'checking' && (
                  <div className="absolute right-3 top-3.5">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {emailStatus === 'valid' && (
                  <div className="absolute right-3 top-3.5">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
                {emailStatus === 'invalid' && (
                  <div className="absolute right-3 top-3.5">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
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
                  {tracks.map((track) => (
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
                  {cohorts.map((cohort) => (
                    <option key={cohort.id} value={cohort.id}>
                      {cohort.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/30 text-left">
                <p className="text-sm text-foreground/70">
                  {emailStatus === 'unchecked' && "Please select your track and cohort to verify your enrollment."}
                  {emailStatus === 'checking' && "Verifying your enrollment..."}
                  {emailStatus === 'valid' && "✓ Your email is registered for this track and cohort!"}
                  {emailStatus === 'invalid' && "⚠️ Your email is not registered for this track and cohort combination."}
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
                  <p className="font-semibold">{tracks.find((t) => t.id === formData.track)?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60">Cohort</p>
                  <p className="font-semibold">{cohorts.find((c) => c.id === formData.cohort)?.name}</p>
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
