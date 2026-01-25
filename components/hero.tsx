"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="py-20 md:py-32 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-6 text-balance">
          Learn Under the Stars
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
          Illuminate your path to mastery with expertly-crafted courses, structured lessons, and a community of lifelong learners.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full">
            <Link href="/signup">Get Started Free</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="rounded-full border-foreground text-foreground hover:bg-foreground hover:text-background bg-transparent"
          >
            <Link href="/courses">Explore Courses</Link>
          </Button>
        </div>

        <div className="mt-16 pt-16 border-t border-border">
          <p className="text-sm text-muted-foreground mb-8">Trusted by learners worldwide</p>
          <div className="flex justify-center items-center gap-8 text-muted-foreground text-sm flex-wrap">
            <div>Placeholder count Courses</div>
            <div>Placeholder count Students</div>
            <div>Expert Instructors</div>
          </div>
        </div>
      </div>
    </section>
  )
}
