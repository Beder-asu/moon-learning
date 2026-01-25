"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TestComponent } from "@/components/test-component"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Lock } from "lucide-react"

interface QuizQuestion {
  id: string
  text: string
  type: string
  options: { id: string; text: string }[]
  correctAnswer: number
}

interface Quiz {
  id: string
  title: string
  levelId: string
  passingScore: number
  questions: QuizQuestion[]
}

export default function TestPage() {
  const params = useParams()
  const router = useRouter()
  const { user, token } = useAuth()
  const courseId = params.id as string
  const levelId = params.levelId as string
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)

  // Check access first
  useEffect(() => {
    if (user?.role === "admin") {
      setHasAccess(true)
    } else if (user?.enrolledCourses) {
      const enrolled = user.enrolledCourses.some(
        (enrollment) => enrollment.courseId === courseId
      )
      setHasAccess(enrolled)
    } else {
      setHasAccess(false)
    }
  }, [user, courseId])

  useEffect(() => {
    const fetchQuiz = async () => {
      // Don't fetch quiz if user doesn't have access
      if (!hasAccess && user !== null) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/quizzes?levelId=${levelId}`)
        const data = await response.json()
        if (data.success) {
          setQuiz(data.quiz)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error("Error fetching quiz:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    // Wait for auth to be resolved
    if (user !== undefined) {
      fetchQuiz()
    }
  }, [levelId, hasAccess, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-32 mb-8"></div>
            <div className="h-10 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-full mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-6">
                  <div className="h-6 bg-muted rounded w-full mb-4"></div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-10 bg-muted rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Test Not Found</h1>
          <p className="text-muted-foreground mb-6">No quiz is available for this level yet.</p>
          <Button asChild>
            <Link href={`/courses/${courseId}/level/${levelId}`}>Back to Level</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Access denied screen
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Test Locked</h1>
            <p className="text-muted-foreground mb-6">
              You need to purchase this course to access quizzes and tests. Enroll now to test your knowledge and earn certificates.
            </p>
          </div>
          <div className="space-y-3">
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full"
              onClick={() => router.push(`/checkout?courseId=${courseId}`)}
            >
              Purchase Course
            </Button>
            <Button variant="outline" asChild className="w-full rounded-full">
              <Link href={`/courses/${courseId}/level/${levelId}`}>Back to Level</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href={`/courses/${courseId}/level/${levelId}`}
          className="text-accent hover:underline text-sm mb-8 inline-block"
        >
          ← Back to Level
        </Link>

        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">{quiz.title}</h1>
          <p className="text-lg text-muted-foreground">
            Answer all questions correctly. You need at least {quiz.passingScore}% to pass and unlock the next level.
          </p>
        </div>

        <TestComponent
          courseId={Number.parseInt(courseId)}
          levelId={Number.parseInt(levelId)}
          questions={quiz.questions}
          onComplete={(score, passed) => {
            console.log(`[v0] Test completed: score=${score}, passed=${passed}`)
          }}
        />
      </div>
    </div>
  )
}
