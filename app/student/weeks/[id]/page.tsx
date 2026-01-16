"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, FileText, MessageCircle, Send, BookOpen } from "lucide-react"

export default function WeekDetailPage({ params }: { params: { id: string } }) {
  const [notes, setNotes] = useState("")
  const [notesList, setNotesList] = useState([
    { id: 1, type: "question", text: "How do I handle async operations in React?", author: "You", time: "2 hours ago" },
    {
      id: 2,
      type: "confusion",
      text: "The difference between useCallback and useMemo is unclear",
      author: "You",
      time: "1 day ago",
    },
  ])

  const mockLesson = {
    week: Number.parseInt(params.id),
    title: "React Fundamentals",
    description: "Deep dive into React concepts including components, JSX, and hooks",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    content: `
      React is a JavaScript library for building user interfaces with reusable components.
      
      Key Concepts:
      1. Components - Building blocks of React applications
      2. JSX - Syntax extension to write HTML-like code in JavaScript
      3. Props - Pass data between components
      4. State - Manage component data that can change
      5. Hooks - Reuse logic and state in functional components
    `,
    deadline: "Friday, 11:59 PM",
    assignmentTitle: "Build a Todo List App",
  }

  const handleAddNote = () => {
    if (notes.trim()) {
      setNotesList([
        ...notesList,
        { id: notesList.length + 1, type: "note", text: notes, author: "You", time: "just now" },
      ])
      setNotes("")
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Header */}
      <Link
        href="/student/dashboard"
        className="flex items-center gap-2 text-primary hover:underline mb-6 animate-slideInUp"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Week {mockLesson.week}: {mockLesson.title}
        </h1>
        <p className="text-foreground/60">{mockLesson.description}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Video Lesson */}
          <div className="rounded-xl bg-card border border-border overflow-hidden animate-fadeInScale">
            <div className="aspect-video bg-background">
              <iframe
                width="100%"
                height="100%"
                src={mockLesson.videoUrl}
                title="Lesson Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Text Content */}
          <div className="p-6 rounded-xl bg-card border border-border animate-fadeInScale">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Lesson Content</h2>
            </div>
            <p className="whitespace-pre-wrap text-foreground/80 leading-relaxed">{mockLesson.content}</p>
          </div>

          {/* Lesson Notes */}
          <div className="p-6 rounded-xl bg-card border border-border animate-fadeInScale">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-secondary" />
              <h2 className="text-xl font-bold">Notes & Questions</h2>
            </div>

            {/* Notes List */}
            <div className="space-y-3 mb-6">
              {notesList.map((note) => (
                <div key={note.id} className="p-3 rounded-lg bg-background border border-border/50">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-sm">{note.author}</p>
                    <span className="text-xs text-foreground/40">{note.time}</span>
                  </div>
                  <p className="text-sm text-foreground/80">{note.text}</p>
                </div>
              ))}
            </div>

            {/* Add Note */}
            <div className="flex gap-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ask questions or share areas of confusion..."
                className="flex-1 h-20 px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none"
              />
              <button
                onClick={handleAddNote}
                className="px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-lg hover:shadow-primary/50 transition-all flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Card */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 animate-slideInRight">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-bold">This Week's Assignment</h3>
            </div>
            <h4 className="font-semibold mb-2">{mockLesson.assignmentTitle}</h4>
            <p className="text-sm text-foreground/70 mb-4">Submit your work by {mockLesson.deadline}</p>
            <Link
              href={`/student/weeks/${mockLesson.week}/submit`}
              className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-center text-sm font-semibold"
            >
              Submit Assignment
            </Link>
          </div>

          {/* Progression Info */}
          <div
            className="p-6 rounded-xl bg-card border border-border animate-slideInRight"
            style={{ animationDelay: "100ms" }}
          >
            <h3 className="font-bold mb-3">Week Status</h3>
            <div className="space-y-2 text-sm text-foreground/70">
              <p>Unlock next week by submitting and getting approved!</p>
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-foreground/50">Week 5 will unlock after approval</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
