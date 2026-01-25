"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useDeviceSession } from "@/hooks/use-device-session"
import { SessionConflictModal } from "@/components/session-conflict-modal"

export default function ProtectedPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const userId = "user_123" // In production: get from auth provider

  const { sessionId, sessionConflict, activeDevice, loading } = useDeviceSession(isLoggedIn ? userId : undefined)

  useEffect(() => {
    // Simulate checking login status
    setIsLoggedIn(true)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-4">⏳</div>
          <p className="text-muted-foreground">Initializing your session...</p>
        </div>
      </div>
    )
  }

  if (sessionConflict) {
    return (
      <SessionConflictModal
        activeDevice={activeDevice || "another device"}
        onLogout={() => {
          setIsLoggedIn(false)
          window.location.href = "/login"
        }}
        onContinue={() => {
          // Force end previous session
          console.log("[v0] Forcing logout of conflicting session")
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Welcome to Your Dashboard</h1>
          <p className="text-muted-foreground mb-8">You are logged in with a single active device session.</p>

          <div className="bg-accent/10 border border-accent rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-foreground mb-4">Session Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Session ID</span>
                <span className="font-mono text-foreground break-all max-w-xs">{sessionId || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-mono text-foreground">{userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold text-accent">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Device Restriction</span>
                <span className="font-semibold text-accent">Enabled</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Device restriction ensures your account can only be accessed from one device at a time, providing security
              and preventing unauthorized access.
            </p>
            <Button
              onClick={() => {
                fetch("/api/sessions/end", {
                  method: "POST",
                  body: JSON.stringify({ userId, sessionId }),
                }).then(() => {
                  window.location.href = "/login"
                })
              }}
              variant="outline"
              className="rounded-full border-foreground text-foreground"
            >
              Logout
            </Button>
          </div>
        </div>

        <Button
          asChild
          variant="outline"
          className="mt-8 rounded-full border-foreground text-foreground bg-transparent"
        >
          <Link href="/courses">Back to Courses</Link>
        </Button>
      </div>
    </div>
  )
}
