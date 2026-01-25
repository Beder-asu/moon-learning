"use client"

import { Button } from "@/components/ui/button"

export function Support() {
  return (
    <section id="support" className="py-16 px-4 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="bg-card rounded-lg border border-border p-8 md:p-12">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">🌟 24/7 Support</h2>
          <p className="text-muted-foreground mb-8">Have questions? Our Moon Learning support team is here to help you on your learning journey.</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">Support Phone</p>
              <a href="tel:+1234567890" className="text-lg font-semibold text-accent hover:underline">
                +1 (234) 567-890
              </a>
            </div>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto rounded-full">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
