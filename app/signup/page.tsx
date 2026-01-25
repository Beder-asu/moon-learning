"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    vodafoneNumber: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { signup } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    try {
      const result = await signup(formData.name, formData.email, formData.password, formData.vodafoneNumber)

      if (result.success) {
        router.push("/courses")
      } else {
        setError(result.error || "Registration failed")
      }
    } catch (err) {
      setError("An error occurred during registration")
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
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join our learning community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
            <Input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className="w-full"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <Input
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Vodafone Number (for payments)</label>
            <Input
              type="tel"
              name="vodafoneNumber"
              placeholder="01001234567"
              value={formData.vodafoneNumber}
              onChange={handleChange}
              className="w-full"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full"
              disabled={loading}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>

          <Button
            type="submit"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full h-10"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
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
        >
          Sign up with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
