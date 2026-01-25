"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAuth } from "@/components/auth-provider"

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  return (
    <nav className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
            <span className="text-accent text-3xl">🌙</span> Moon Learning
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/courses" className="text-foreground hover:text-accent transition-colors">
              Courses
            </Link>
            <Link href="#support" className="text-foreground hover:text-accent transition-colors">
              Support
            </Link>
            {!isLoading && (
              isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Hi, {user?.name?.split(' ')[0]}
                  </span>
                  {user?.role === "admin" && (
                    <Button asChild variant="outline" size="sm">
                      <Link href="/admin">Admin</Link>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => logout()}
                  >
                    Log Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button asChild variant="outline">
                    <Link href="/login">Log In</Link>
                  </Button>
                  <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              )
            )}
          </div>

          <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link href="/courses" className="block text-foreground hover:text-accent">
              Courses
            </Link>
            <Link href="#support" className="block text-foreground hover:text-accent">
              Support
            </Link>
            {!isLoading && (
              isAuthenticated ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Logged in as {user?.name}
                  </p>
                  {user?.role === "admin" && (
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/admin">Admin Dashboard</Link>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => logout()}
                  >
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login">Log In</Link>
                  </Button>
                  <Button asChild className="w-full bg-accent text-accent-foreground">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
