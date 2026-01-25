"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PaymentGateway } from "@/components/payment-gateway"

interface Course {
  id: string
  title: string
  price: number
  currency: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get("courseId") || ""
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"completed" | "pending" | null>(null)

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) {
        setLoading(false)
        return
      }
      try {
        const response = await fetch(`/api/courses?id=${courseId}`)
        const data = await response.json()
        if (data.success && data.course) {
          setCourse({
            id: data.course.id,
            title: data.course.title,
            price: data.course.price,
            currency: data.course.currency || "EGP"
          })
        }
      } catch (error) {
        console.error("Error fetching course:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [courseId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Course Not Found</h1>
          <Button asChild>
            <a href="/courses">Back to Courses</a>
          </Button>
        </div>
      </div>
    )
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full text-center">
          {paymentStatus === "pending" ? (
            <>
              <div className="text-5xl mb-4">⏳</div>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Payment Submitted!</h1>
              <p className="text-muted-foreground mb-2">Waiting for admin confirmation</p>
              <p className="text-sm text-muted-foreground mb-6">
                Your payment has been submitted. An admin will verify it shortly and unlock your course access.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-amber-900 mb-2">What to expect:</p>
                <ul className="text-xs text-amber-800 space-y-1 text-left">
                  <li>• Admin reviews your payment within 1-2 hours</li>
                  <li>• You'll receive a confirmation email</li>
                  <li>• Course access unlocked automatically</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">✓</div>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Payment Successful!</h1>
              <p className="text-muted-foreground mb-2">Thank you for your purchase</p>
              <p className="text-sm text-muted-foreground mb-6">You now have access to {course.title}</p>
            </>
          )}

          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-xs text-muted-foreground mb-1">Payment ID</p>
            <p className="font-mono text-sm text-foreground break-all">{paymentId}</p>
          </div>

          {paymentStatus !== "pending" && (
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full mb-3"
              onClick={() => router.push(`/courses/${courseId}`)}
            >
              Go to Course
            </Button>
          )}

          <Button
            variant="outline"
            className="w-full rounded-full border-foreground text-foreground bg-transparent"
            onClick={() => router.push("/courses")}
          >
            Back to Courses
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <a href={`/courses/${courseId}`} className="text-accent hover:underline text-sm">
            ← Back to Course
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-card border border-border rounded-lg p-6">
              <h1 className="font-serif text-3xl font-bold text-foreground mb-6">Complete Your Purchase</h1>
              <PaymentGateway
                courseId={courseId}
                amount={course.price}
                currency={course.currency}
                courseName={course.title}
                onSuccess={(id, status) => {
                  setPaymentId(id)
                  setPaymentStatus(status as "completed" | "pending")
                  setPaymentComplete(true)
                }}
                onCancel={() => router.back()}
              />
            </div>
          </div>

          <div>
            <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
              <h2 className="font-serif text-xl font-bold text-foreground mb-4">Order Summary</h2>
              <div className="space-y-3 pb-4 border-b border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{course.title}</span>
                  <span className="font-semibold text-foreground">{course.currency} {course.price}</span>
                </div>
              </div>
              <div className="py-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{course.currency} {course.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">{course.currency} 0.00</span>
                </div>
              </div>
              <div className="border-t border-border pt-4 flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-serif text-2xl font-bold text-foreground">{course.currency} {course.price}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
