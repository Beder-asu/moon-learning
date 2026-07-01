"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { SessionConflictModal } from "@/components/session-conflict-modal"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showConflict, setShowConflict] = useState(false)
  const [conflictDevice, setConflictDevice] = useState("")

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const result = await login(email, password)

      if (result.success) {
        router.push("/courses")
      } else if (result.conflict) {
        setConflictDevice(result.activeDevice || "Another device")
        setShowConflict(true)
      } else {
        setError(result.error || "Login failed")
      }
    } catch (err) {
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  const handleForceLogin = async () => {
    setLoading(true)
    setShowConflict(false)
    try {
      const result = await login(email, password, true)
      if (result.success) {
        router.push("/courses")
      } else {
        setError(result.error || "Login failed")
      }
    } catch (err) {
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-3xl font-bold text-foreground inline-block mb-6">
            Moon Learning
          </Link>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              disabled={loading}
            />
          </div>

          <Link href="#" className="text-sm text-accent hover:underline block text-right">
            Forgot password?
          </Link>

          <Button
            type="submit"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full h-10"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">Or</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full rounded-full border-foreground text-foreground hover:bg-foreground hover:text-background mb-4 bg-transparent"
          disabled={loading}
          onClick={() => window.location.href = '/api/auth/google'}
          type="button"
        >
          Continue with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="text-accent hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>

      <SessionConflictModal
        isOpen={showConflict}
        onClose={() => setShowConflict(false)}
        onTakeOver={handleForceLogin}
        activeDevice={conflictDevice}
      />
    </div>
  )
}
