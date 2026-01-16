"use client"

import { Download, CheckCircle2, Award } from "lucide-react"

export default function CertificatePage() {
  const isApproved = true
  const studentName = "Shalom Alalade"
  const track = "Frontend Development"
  const cohort = "Cohort 1"
  const completionDate = "February 28, 2024"

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Certificate</h1>
        <p className="text-foreground/60">Your achievement and completion status</p>
      </div>

      {isApproved ? (
        <div className="animate-fadeInScale">
          {/* Certificate Container with Golden Border */}
          <div className="relative p-12 md:p-16 rounded-xl border-8 border-secondary bg-white shadow-2xl">
            {/* Golden decorative top ribbon */}
            <div className="absolute -top-6 left-12 w-24 h-12 bg-secondary rounded-b-lg shadow-lg flex items-end justify-center">
              <div className="w-20 h-1 bg-primary rounded-full"></div>
            </div>

            {/* Content */}
            <div className="text-center space-y-8">
              {/* Top Logo/Icon Area */}
              <div className="flex justify-between items-start px-8">
                {/* Left: Logo Placeholder */}
                <div className="w-24 h-24 rounded-full border-4 border-primary flex items-center justify-center bg-primary/5">
                  <span className="text-xl font-bold text-primary">CEN</span>
                </div>

                {/* Center: Main Title */}
                <div className="flex-1 mx-8">
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary tracking-wide">
                    CERTIFICATE OF
                  </h2>
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary tracking-wide">COMPLETION</h2>
                </div>

                {/* Right: Gold Medal/Award */}
                <div className="w-24 h-32 flex flex-col items-center justify-start">
                  <Award className="w-16 h-16 text-secondary mb-2" />
                  <div className="w-16 h-6 bg-secondary rounded-b-lg"></div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>

              {/* Main Text */}
              <div className="space-y-4 py-8">
                <p className="text-lg text-foreground/70 font-light">This certificate is proudly presented to</p>

                {/* Student Name */}
                <h3 className="text-4xl md:text-5xl font-serif font-bold text-primary border-b-2 border-primary/30 pb-4">
                  {studentName}
                </h3>

                {/* Achievement Text */}
                <div className="space-y-2 py-6">
                  <p className="text-lg font-semibold text-foreground">Awarded for the successful completion of the</p>
                  <p className="text-2xl font-bold text-primary">{track} Program</p>
                  <p className="text-sm text-foreground/60 pt-2">
                    in recognition of dedication, hard work, and active participation.
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>

              {/* Signature Area */}
              <div className="grid grid-cols-2 gap-8 pt-8">
                <div className="text-center">
                  <div className="h-16 flex items-end justify-center mb-2">
                    <span className="text-3xl font-serif text-foreground/40">Mojisola</span>
                  </div>
                  <div className="border-t-2 border-primary/50 pt-2">
                    <p className="font-semibold text-sm">Mojisola Alegbe</p>
                    <p className="text-xs text-foreground/60">Founder & Program Lead</p>
                    <p className="text-xs text-foreground/60">CohortHub</p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-lg text-secondary font-bold mb-4">✓</p>
                  <div className="border-t-2 border-primary/50 pt-2">
                    <p className="text-xs text-foreground/60">Issued on</p>
                    <p className="font-semibold text-sm">{completionDate}</p>
                    <p className="text-xs text-foreground/60">Cohort: {cohort}</p>
                  </div>
                </div>
              </div>

              {/* Certificate ID */}
              <div className="pt-4 text-center">
                <p className="text-xs text-foreground/50">
                  Certificate ID: CH-FE-2024-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="mt-8 flex justify-center">
            <button className="px-8 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download Certificate
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-6 rounded-xl bg-secondary/10 border border-secondary/30 animate-slideInLeft">
            <div className="flex gap-3">
              <CheckCircle2 className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Congratulations!</h3>
                <p className="text-foreground/60 text-sm">
                  You have successfully completed the {track} program. Your certificate is now ready for download and
                  can be shared on LinkedIn and your portfolio.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl border-2 border-primary/20 bg-primary/5 animate-pulse-glow">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Certificate Locked</h2>
            <p className="text-foreground/60">Complete all required tasks to unlock your certificate</p>
          </div>
        </div>
      )}
    </div>
  )
}
