import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/hero"
import { CourseShowcase } from "@/components/course-showcase"
import { Support } from "@/components/support-section"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <CourseShowcase />
      <Support />
      <Footer />
    </div>
  )
}
