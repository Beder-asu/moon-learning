"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface Question {
  id: string
  text: string
  type: "single" | "multiple"
  options: { id: string; text: string }[]
}

interface TestComponentProps {
  courseId: number
  levelId: number
  questions: Question[]
  onComplete: (score: number, passed: boolean) => void
}

export function TestComponent({ courseId, levelId, questions, onComplete }: TestComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  // Safety check - if no questions, show error
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No questions available for this test.</p>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswer = (optionId: string) => {
    setAnswers((prev) => {
      const current = prev[currentQuestion.id] || []

      if (currentQuestion.type === "single") {
        return { ...prev, [currentQuestion.id]: [optionId] }
      } else {
        // Multiple choice - toggle selection
        if (current.includes(optionId)) {
          return {
            ...prev,
            [currentQuestion.id]: current.filter((id) => id !== optionId),
          }
        } else {
          return {
            ...prev,
            [currentQuestion.id]: [...current, optionId],
          }
        }
      }
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user_123",
          courseId,
          levelId,
          answers,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
        setSubmitted(true)
        onComplete(data.score, data.passed)
      } else {
        alert("Failed to submit test: " + data.error)
      }
    } catch (error) {
      console.error("Error submitting test:", error)
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setCurrentQuestionIndex(0)
    setAnswers({})
    setSubmitted(false)
    setResult(null)
  }

  if (submitted && result) {
    return (
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <div className={`text-6xl mb-4 ${result.passed ? "text-accent" : "text-destructive"}`}>
            {result.passed ? "✓" : "✗"}
          </div>
          <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
            {result.passed ? "Test Passed!" : "Test Failed"}
          </h2>
          <p className="text-5xl font-serif font-bold text-accent mb-4">{result.score}%</p>
          <p className="text-muted-foreground mb-6">{result.message}</p>

          <div className="bg-muted p-4 rounded-lg mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Correct Answers</span>
              <span className="font-semibold text-foreground">
                {result.result.correctCount} / {result.result.totalQuestions}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            {!result.passed && (
              <Button
                onClick={handleRetry}
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full"
              >
                Retake Test
              </Button>
            )}
            <Button
              variant="outline"
              className="flex-1 rounded-full border-foreground text-foreground bg-transparent"
              onClick={() => window.history.back()}
            >
              Back to Level
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const questionProgress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-muted-foreground">{Math.round(questionProgress)}%</span>
          </div>
          <div className="bg-muted rounded-full h-2 overflow-hidden">
            <div className="bg-accent h-full transition-all" style={{ width: `${questionProgress}%` }}></div>
          </div>
        </div>

        <h3 className="font-serif text-2xl font-bold text-foreground mb-6">{currentQuestion.text}</h3>

        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id]?.includes(option.id)
            return (
              <label
                key={option.id}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${isSelected ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
                  }`}
              >
                <input
                  type={currentQuestion.type === "single" ? "radio" : "checkbox"}
                  name={currentQuestion.id}
                  value={option.id}
                  checked={isSelected}
                  onChange={() => handleAnswer(option.id)}
                  className="mr-3"
                />
                <span className="text-foreground">{option.text}</span>
              </label>
            )
          })}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="rounded-full border-foreground text-foreground"
          >
            Previous
          </Button>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full"
            >
              {loading ? "Submitting..." : "Submit Test"}
            </Button>
          )}
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Question Overview</p>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${answers[q.id]
                  ? "bg-accent text-accent-foreground"
                  : index === currentQuestionIndex
                    ? "bg-foreground text-background"
                    : "bg-background border border-border text-foreground"
                }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
