"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Lock, CheckCircle } from "lucide-react"

interface Level {
  id: string
  title: string
  description: string
  orderNumber: number
  videoCount: number
  hasQuiz: boolean
}

interface Course {
  id: string
  title: string
  description: string
  price: number
  currency: string
  instructor: string
  instructorBio: string
  levels: Level[]
  levelCount: number
  paymentMethods: string[]
  image?: string
}

export default function CourseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, token } = useAuth()
  const courseId = params.id as string
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses?id=${courseId}`)
        const data = await response.json()
        if (data.success) {
          setCourse(data.course)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error("Error fetching course:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [courseId])

  // Check if user is enrolled
  useEffect(() => {
    if (user?.enrolledCourses) {
      const enrolled = user.enrolledCourses.some(
        (enrollment) => enrollment.courseId === courseId
      )
      setIsEnrolled(enrolled)
    } else {
      setIsEnrolled(false)
    }
  }, [user, courseId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <div className="bg-muted rounded-lg h-96 mb-8"></div>
                <div className="h-10 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
              <div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="h-12 bg-muted rounded mb-6"></div>
                  <div className="h-10 bg-muted rounded mb-3"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Course Not Found</h1>
          <Button asChild>
            <Link href="/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleBuyNow = () => {
    router.push(`/checkout?courseId=${courseId}`)
  }

  const firstLevelId = (course.levels?.length || 0) > 0 ? course.levels[0].id : null

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link href="/courses" className="text-accent hover:underline text-sm mb-8 inline-block">
          ← Back to Courses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="bg-muted rounded-lg h-96 mb-8 flex items-center justify-center overflow-hidden">
              {course.image ? (
                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-muted-foreground text-lg">Course Image</span>
              )}
            </div>

            <h1 className="font-serif text-4xl font-bold text-foreground mb-4">{course.title}</h1>
            <p className="text-lg text-muted-foreground mb-8">{course.description}</p>

            <div className="border-t border-b border-border py-8 mb-8">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Instructor</h2>
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Photo</span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-foreground mb-1">{course.instructor}</h3>
                  <p className="text-muted-foreground text-sm">{course.instructorBio}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold text-foreground">Course Levels</h2>
                {isEnrolled && (
                  <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" /> Enrolled
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {(course.levels?.length || 0) > 0 ? (
                  course.levels.map((level, index) => {
                    // First level always accessible (preview), others locked if not enrolled
                    const isAccessible = isEnrolled || index === 0

                    return (
                      <div
                        key={level.id}
                        onClick={() => isAccessible && router.push(`/courses/${courseId}/level/${level.id}`)}
                        className={`border rounded-lg p-4 flex items-center justify-between transition-colors ${isAccessible
                            ? "border-border hover:border-accent cursor-pointer"
                            : "border-border/50 opacity-70 cursor-not-allowed"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          {!isAccessible && <Lock className="h-5 w-5 text-muted-foreground" />}
                          <div>
                            <p className="font-semibold text-foreground">{level.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {level.videoCount} Videos {level.hasQuiz && "• Quiz"} • Completion Certificate
                            </p>
                          </div>
                        </div>
                        {isAccessible ? (
                          <span className="text-sm text-accent">
                            {index === 0 && !isEnrolled ? "Preview →" : "View →"}
                          </span>
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    )
                  })
                ) : (
                  <p className="text-muted-foreground">No levels available yet.</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
              {isEnrolled ? (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">You have access to this course</span>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Price</p>
                  <p className="font-serif text-4xl font-bold text-foreground">
                    {course.currency === "EGP" ? "EGP " : "$"}{course.price}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">One-time payment • Lifetime access</p>
                </div>
              )}

              {!isEnrolled && (
                <div className="space-y-2 mb-6">
                  <p className="font-semibold text-foreground text-sm mb-3">Payment Methods</p>
                  {(course.paymentMethods?.length || 0) > 0 ? course.paymentMethods.map((method) => (
                    <div
                      key={method}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedPaymentMethod === method
                        ? "border-accent bg-accent/10"
                        : "border-border hover:bg-muted"
                        }`}
                      onClick={() => setSelectedPaymentMethod(method)}
                    >
                      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs">{method[0]}</div>
                      <span className="text-sm text-foreground">{method}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">No payment methods configured</p>
                  )}
                </div>
              )}

              {!isEnrolled && (
                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full mb-3"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              )}

              <Button
                variant={isEnrolled ? "default" : "outline"}
                className={`w-full rounded-full ${isEnrolled
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : "border-foreground text-foreground hover:bg-foreground hover:text-background bg-transparent"
                  }`}
                onClick={() => firstLevelId && router.push(`/courses/${courseId}/level/${firstLevelId}`)}
                disabled={!firstLevelId}
              >
                {isEnrolled ? "Continue Learning" : "Preview Course"}
              </Button>

              <div className="border-t border-border mt-6 pt-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Levels</span>
                  <span className="font-semibold text-foreground">{course.levelCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Access Type</span>
                  <span className="font-semibold text-foreground">Lifetime</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Certificate</span>
                  <span className="font-semibold text-foreground">Yes</span>
                </div>
                {isEnrolled && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Status</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">Enrolled</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
