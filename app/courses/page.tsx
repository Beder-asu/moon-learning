"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useMemo, useEffect } from "react"

interface Course {
  id: string
  title: string
  description: string
  levels: number
  price: number
  currency: string
  instructor: string
  image?: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses")
        const data = await response.json()
        if (data.success) {
          setCourses(data.courses)
        }
      } catch (error) {
        console.error("Error fetching courses:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  const filteredCourses = useMemo(() => {
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery, courses])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="font-serif text-5xl font-bold text-foreground mb-4">All Courses</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
                <div className="bg-muted rounded-lg h-40 mb-4"></div>
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded mb-4"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="font-serif text-5xl font-bold text-foreground mb-4">All Courses</h1>
          <p className="text-lg text-muted-foreground mb-8">Browse our complete course catalog</p>

          <div className="flex gap-2">
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 max-w-md"
            />
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {courses.length === 0
                ? "No courses available yet. Check back soon!"
                : "No courses found matching your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <div className="bg-card rounded-lg border border-border p-6 hover:border-accent hover:shadow-lg transition-all cursor-pointer h-full">
                  <div className="bg-muted rounded-lg h-40 mb-4 flex items-center justify-center overflow-hidden">
                    {course.image ? (
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-muted-foreground">Course Image</span>
                    )}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-foreground mb-2">{course.title}</h3>
                  <p className="text-muted-foreground mb-4 text-sm line-clamp-2">{course.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-muted-foreground">{course.levels} Levels</span>
                    <span className="font-serif font-bold text-foreground">
                      {course.currency === "EGP" ? "EGP " : "$"}{course.price}
                    </span>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    View Course
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
