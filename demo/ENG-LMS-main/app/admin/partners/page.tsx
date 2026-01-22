"use client"
import { Users, RotateCw } from "lucide-react"

const mockPartners = [
  { id: 1, student1: "Alex Johnson", student2: "Jordan Smith", track: "Frontend", createdDate: "2024-01-15" },
  { id: 2, student1: "Sarah Chen", student2: "Mike Williams", track: "Backend", createdDate: "2024-01-18" },
  { id: 3, student1: "Mike Johnson", student2: "Lisa Park", track: "DevOps", createdDate: "2024-01-20" },
  { id: 4, student1: "Emily Davis", student2: "Tom Brown", track: "Web3", createdDate: "2024-01-25" },
]

export default function PartnersPage() {
  return (
    <div className="p-4 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Accountability Partners</h1>
        <p className="text-foreground/60">Manage student pairings and partnerships</p>
      </div>

      {/* Partners Grid */}
      <div className="space-y-4">
        {mockPartners.map((pair, i) => (
          <div
            key={pair.id}
            className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 animate-fadeInScale"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">
                    {pair.student1} & {pair.student2}
                  </h3>
                  <div className="flex gap-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary/20 text-secondary">{pair.track}</span>
                    <span className="text-xs text-foreground/60">Paired on {pair.createdDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-background hover:bg-card transition-colors flex items-center gap-2 text-sm">
                  <RotateCw className="w-4 h-4" />
                  Reassign
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Auto-Pair Section */}
      <div className="mt-8 p-6 rounded-xl bg-card border border-border animate-slideInLeft">
        <h3 className="text-xl font-bold mb-4">Auto-Pair Students</h3>
        <p className="text-foreground/60 text-sm mb-4">
          Automatically assign accountability partners based on track and progress
        </p>
        <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all">
          Run Auto-Pairing
        </button>
      </div>
    </div>
  )
}
