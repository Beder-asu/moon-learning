"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface Course {
  id: string
  title: string
  description: string
  price: number
  currency: string
  image?: string
}

export function CourseShowcase() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses")
        const data = await response.json()
        if (data.success) {
          // Take only first 3 courses for the showcase
          setCourses(data.courses.slice(0, 3))
        }
      } catch (error) {
        console.error("Error fetching courses:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  return (
    <section id="courses" className="py-20 px-4 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">Available Courses</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Explore our carefully curated selection of courses across multiple subjects
          </p>
          <Link href="/courses" className="inline-block">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full">
              View All Courses
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
                <div className="bg-muted rounded-lg h-40 mb-4"></div>
                <div className="h-6 bg-muted rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-muted rounded mb-6 w-full"></div>
                <div className="h-10 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No courses available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <div className="bg-card rounded-lg border border-border p-6 hover:border-accent transition-colors cursor-pointer h-full">
                  <div className="bg-muted rounded-lg h-40 mb-4 flex items-center justify-center overflow-hidden">
                    {course.image && course.image !== "/images/course-placeholder.jpg" ? (
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-muted-foreground">📚</span>
                    )}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-foreground mb-2">{course.title}</h3>
                  <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
                    {course.description || "Discover comprehensive learning content"}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-serif text-lg font-bold text-accent">
                      {course.currency} {course.price}
                    </span>
                    <Button variant="outline" className="bg-transparent rounded-full">
                      View Course
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
