"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GraduationCap, Mail, Lock, LogIn, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"student" | "admin">("student")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Mock delay for login
    await new Promise((r) => setTimeout(r, 1000))

    if (role === "admin") {
      router.push("/admin/dashboard")
    } else {
      router.push("/student/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center px-4 py-8">
      <Link
        href="/"
        className="absolute top-4 md:top-6 left-4 md:left-6 p-2 rounded-lg hover:bg-card border border-transparent hover:border-border transition-all group flex items-center gap-2 text-foreground/70 hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium hidden sm:inline">Back</span>
      </Link>

      <div className="w-full max-w-md animate-slideInUp">
        <div className="text-center mb-6 md:mb-8">
          <Link href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
              <GraduationCap className="w-7 h-7 md:w-9 md:h-9 text-background" />
            </div>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">ENG-Basecamp</h1>
          <p className="text-foreground/60 mt-1 text-sm md:text-base">Sign in to your account</p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { value: "student", label: "Student" },
            { value: "admin", label: "Instructor" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setRole(value as "student" | "admin")}
              className={`py-3 rounded-lg font-semibold transition-all ${
                role === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground/70 hover:border-primary/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-foreground/40" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-foreground/40" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Link */}
        <p className="text-center text-foreground/60 mt-6">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:text-secondary transition-colors font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
