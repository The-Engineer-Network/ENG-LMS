"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  CheckSquare,
  Briefcase as Certificate,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Calendar,
  UserCheck,
  Phone,
} from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/tracks", label: "Tracks & Tasks", icon: CheckSquare },
    { href: "/admin/weeks", label: "Weeks & Lessons", icon: Calendar },
    { href: "/admin/submissions", label: "Submissions", icon: BarChart3 },
    { href: "/admin/clarity-calls", label: "Clarity Calls", icon: Phone },
    { href: "/admin/certificates", label: "Certificates", icon: Certificate },
    { href: "/admin/whitelist", label: "Paid Learners", icon: UserCheck },
    { href: "/admin/partners", label: "Accountability Partners", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  // Main navigation items for bottom tabs (mobile)
  const mainNavItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/submissions", label: "Submissions", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-2">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">ENG-Basecamp</span>
          </Link>
          
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">ENG-Basecamp</span>
          </Link>
          <p className="text-xs text-foreground/60 mt-2">Admin Panel</p>
        </div>

        <nav className="p-4 space-y-2 pb-20 overflow-y-auto max-h-[calc(100vh-200px)]">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-6 left-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 pt-16 pb-20 md:pt-0 md:pb-0 min-h-screen">
        <div className="h-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30">
        <div className="flex items-center justify-around px-2 py-2">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-0 flex-1 ${
                pathname === item.href
                  ? "text-primary"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${pathname === item.href ? "text-primary" : ""}`} />
              <span className={`text-xs font-medium truncate ${pathname === item.href ? "text-primary" : ""}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}