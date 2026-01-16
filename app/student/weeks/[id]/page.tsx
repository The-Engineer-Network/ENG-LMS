"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Play, FileText, MessageSquare, Clock, CheckCircle2, ExternalLink } from "lucide-react"

const mockWeekData = {
  1: {
    id: 1,
    title: "React Fundamentals",
    description: "Learn core React concepts including components, JSX, and hooks",
    status: "completed",
    lessons: [
      {
        id: 1,
        title: "Introduction to React",
        type: "video",
        duration: "15 min",
        videoUrl: "https://www.youtube.com/embed/dGcsHMXbSOA",
        completed: true
      },
      {
        id: 2,
        title: "JSX and Components",
        type: "video",
        duration: "20 min",
        videoUrl: "https://www.youtube.com/embed/DLX62G4lc44",
        completed: true
      },
      {
        id: 3,
        title: "Props and State",
        type: "text",
        content: `# Props and State in React

## Understanding Props

Props (short for properties) are a way to pass data from parent components to child components. They are read-only and help make components reusable.

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

function App() {
  return <Welcome name="Sara" />;
}
\`\`\`

## State Management

State allows components to create and manage their own data. Unlike props, state is mutable and can be changed over time.

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## Key Differences

- **Props**: Data passed from parent to child (read-only)
- **State**: Internal component data (mutable)
- **Props** flow down, **events** flow up`,
        completed: true
      },
      {
        id: 4,
        title: "React Hooks Basics",
        type: "video",
        duration: "25 min",
        videoUrl: "https://www.youtube.com/embed/O6P86uwfdR0",
        completed: true
      }
    ],
    assignment: {
      id: 1,
      title: "Build a Counter Component",
      description: "Create a React component that implements a counter with increment, decrement, and reset functionality.",
      requirements: [
        { field: "github", label: "GitHub Repository", required: true, type: "url" },
        { field: "demo", label: "Live Demo URL", required: true, type: "url" },
        { field: "notes", label: "Additional Notes", required: false, type: "text" }
      ],
      deadline: "2024-02-15",
      submitted: true,
      approved: true,
      submission: {
        github: "https://github.com/student/react-counter",
        demo: "https://react-counter-demo.vercel.app",
        notes: "Implemented with TypeScript and added bonus features like step increment"
      }
    },
    notes: [
      {
        id: 1,
        lessonId: 1,
        content: "Great introduction! The explanation of virtual DOM was very clear.",
        timestamp: "2024-02-10T10:30:00Z",
        studentName: "Alex Johnson"
      },
      {
        id: 2,
        lessonId: 3,
        content: "I'm still confused about when to use state vs props. Could you provide more examples?",
        timestamp: "2024-02-11T14:15:00Z",
        studentName: "Alex Johnson"
      }
    ]
  },
  2: {
    id: 2,
    title: "State Management",
    description: "Master state management with Context API and custom hooks",
    status: "completed",
    lessons: [
      {
        id: 5,
        title: "Context API Deep Dive",
        type: "video",
        duration: "30 min",
        videoUrl: "https://www.youtube.com/embed/35lXWvCuM8o",
        completed: true
      },
      {
        id: 6,
        title: "Custom Hooks",
        type: "video",
        duration: "25 min",
        videoUrl: "https://www.youtube.com/embed/6ThXsUwLWvc",
        completed: true
      }
    ],
    assignment: {
      id: 2,
      title: "Theme Context Provider",
      description: "Build a theme context provider that manages light/dark mode across the application.",
      requirements: [
        { field: "github", label: "GitHub Repository", required: true, type: "url" },
        { field: "demo", label: "Live Demo URL", required: true, type: "url" }
      ],
      deadline: "2024-02-22",
      submitted: true,
      approved: true
    },
    notes: []
  },
  3: {
    id: 3,
    title: "Component Composition",
    description: "Build reusable components and understand composition patterns",
    status: "current",
    lessons: [
      {
        id: 7,
        title: "Component Patterns",
        type: "video",
        duration: "35 min",
        videoUrl: "https://www.youtube.com/embed/3XaXKiXtNjw",
        completed: true
      },
      {
        id: 8,
        title: "Render Props Pattern",
        type: "text",
        content: `# Render Props Pattern

The render props pattern is a technique for sharing code between React components using a prop whose value is a function.

## Basic Example

\`\`\`jsx
class MouseTracker extends React.Component {
  constructor(props) {
    super(props);
    this.state = { x: 0, y: 0 };
  }

  handleMouseMove = (event) => {
    this.setState({
      x: event.clientX,
      y: event.clientY
    });
  }

  render() {
    return (
      <div style={{ height: '100vh' }} onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)}
      </div>
    );
  }
}

// Usage
<MouseTracker render={({ x, y }) => (
  <h1>The mouse position is ({x}, {y})</h1>
)}/>
\`\`\`

## With Hooks

\`\`\`jsx
function useMouse() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return position;
}
\`\`\``,
        completed: false
      }
    ],
    assignment: {
      id: 3,
      title: "Reusable Modal Component",
      description: "Create a flexible modal component using composition patterns.",
      requirements: [
        { field: "github", label: "GitHub Repository", required: true, type: "url" },
        { field: "demo", label: "Live Demo URL", required: true, type: "url" },
        { field: "notes", label: "Implementation Notes", required: false, type: "text" }
      ],
      deadline: "2024-03-01",
      submitted: false,
      approved: false
    },
    notes: []
  }
}

export default function WeekDetailPage() {
  const params = useParams()
  const router = useRouter()
  const weekId = parseInt(params.id as string)
  const [activeLesson, setActiveLesson] = useState(0)
  const [newNote, setNewNote] = useState("")
  const [showAssignment, setShowAssignment] = useState(false)

  const weekData = mockWeekData[weekId as keyof typeof mockWeekData]

  if (!weekData) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Week Not Found</h1>
        <Link href="/student/weeks" className="text-primary hover:underline">
          ← Back to Weeks
        </Link>
      </div>
    )
  }

  const currentLesson = weekData.lessons[activeLesson]

  const handleAddNote = () => {
    if (newNote.trim()) {
      // In real app, this would make an API call
      console.log("Adding note:", newNote, "for lesson:", currentLesson.id)
      setNewNote("")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Week {weekData.id}: {weekData.title}</h1>
              <p className="text-foreground/60">{weekData.description}</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowAssignment(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !showAssignment
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/60 hover:text-foreground hover:bg-muted"
              }`}
            >
              Lessons ({weekData.lessons.length})
            </button>
            <button
              onClick={() => setShowAssignment(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showAssignment
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/60 hover:text-foreground hover:bg-muted"
              }`}
            >
              Assignment
              {weekData.assignment.submitted && (
                <CheckCircle2 className="w-4 h-4 ml-2 inline text-green-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {!showAssignment && (
          <>
            {/* Lesson Sidebar */}
            <div className="w-80 border-r border-border bg-card p-4 h-[calc(100vh-140px)] overflow-y-auto">
              <h3 className="font-semibold mb-4">Lessons</h3>
              <div className="space-y-2">
                {weekData.lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeLesson === index
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {lesson.type === "video" ? (
                        <Play className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{lesson.title}</div>
                        {lesson.duration && (
                          <div className="text-xs opacity-70">{lesson.duration}</div>
                        )}
                      </div>
                      {lesson.completed && (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Lesson Content */}
              <div className="flex-1 p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">{currentLesson.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-foreground/60">
                      <span className="flex items-center gap-1">
                        {currentLesson.type === "video" ? (
                          <Play className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                        {currentLesson.type === "video" ? "Video Lesson" : "Text Lesson"}
                      </span>
                      {currentLesson.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {currentLesson.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Video or Text Content */}
                  {currentLesson.type === "video" ? (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                      <iframe
                        src={currentLesson.videoUrl}
                        title={currentLesson.title}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
                      <div dangerouslySetInnerHTML={{ __html: currentLesson.content?.replace(/\n/g, '<br>') || '' }} />
                    </div>
                  )}

                  {/* Notes Section */}
                  <div className="border-t border-border pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Lesson Notes & Questions
                    </h3>

                    {/* Add Note */}
                    <div className="mb-6">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Ask a question or leave a note about this lesson..."
                        className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={3}
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={handleAddNote}
                          disabled={!newNote.trim()}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add Note
                        </button>
                      </div>
                    </div>

                    {/* Existing Notes */}
                    <div className="space-y-4">
                      {weekData.notes
                        .filter(note => note.lessonId === currentLesson.id)
                        .map(note => (
                          <div key={note.id} className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{note.studentName}</span>
                              <span className="text-sm text-foreground/60">
                                {new Date(note.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-foreground/80">{note.content}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Assignment View */}
        {showAssignment && (
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">{weekData.assignment.title}</h2>
                <p className="text-foreground/70 mb-4">{weekData.assignment.description}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Due: {new Date(weekData.assignment.deadline).toLocaleDateString()}
                  </span>
                  {weekData.assignment.submitted && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      weekData.assignment.approved
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary/10 text-secondary"
                    }`}>
                      {weekData.assignment.approved ? "Approved" : "Under Review"}
                    </span>
                  )}
                </div>
              </div>

              {/* Assignment Requirements */}
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-4">Requirements</h3>
                <div className="space-y-4">
                  {weekData.assignment.requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${req.required ? "bg-accent" : "bg-muted-foreground"}`} />
                      <span className="font-medium">{req.label}</span>
                      {req.required && <span className="text-accent text-sm">(Required)</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submission Status */}
              {weekData.assignment.submitted ? (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                  <h3 className="font-semibold text-primary mb-4">
                    Assignment Submitted ✓
                  </h3>
                  {weekData.assignment.submission && (
                    <div className="space-y-3">
                      {weekData.assignment.submission.github && (
                        <div>
                          <span className="font-medium">GitHub Repository:</span>
                          <a
                            href={weekData.assignment.submission.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-primary hover:underline inline-flex items-center gap-1"
                          >
                            View Repository <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      {weekData.assignment.submission.demo && (
                        <div>
                          <span className="font-medium">Live Demo:</span>
                          <a
                            href={weekData.assignment.submission.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-primary hover:underline inline-flex items-center gap-1"
                          >
                            View Demo <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      {weekData.assignment.submission.notes && (
                        <div>
                          <span className="font-medium">Notes:</span>
                          <p className="mt-1 text-foreground/70">{weekData.assignment.submission.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <Link
                    href={`/student/tasks/${weekData.assignment.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Submit Assignment
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}