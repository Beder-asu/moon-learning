"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PaymentGatewayProps {
  courseId: string
  amount: number
  currency: string
  courseName: string
  onSuccess: (paymentId: string, status: string) => void
  onCancel: () => void
}

const PLATFORM_VODAFONE_NUMBER = process.env.NEXT_PUBLIC_VODAFONE_NUMBER || "+20 100 123 4567"

export function PaymentGateway({ courseId, amount, currency, courseName, onSuccess, onCancel }: PaymentGatewayProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber) {
      alert("Please enter your Vodafone number")
      return
    }

    setIsProcessing(true)
    try {
      // Get user from localStorage (simple auth)
      const userStr = localStorage.getItem("user")
      const user = userStr ? JSON.parse(userStr) : null
      const userId = user?.id || user?._id || "guest"
      const userName = user?.name || "Guest User"
      const userEmail = user?.email || ""

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          amount,
          currency,
          paymentMethod: "vodafone",
          userId,
          userName,
          userEmail,
          userPhoneNumber: phoneNumber,
          status: "pending",
        }),
      })

      const data = await response.json()

      if (data.success) {
        onSuccess(data.payment.id, "pending")
      } else {
        alert("Payment failed: " + data.error)
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("An error occurred during payment processing")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="text-muted-foreground">Course</span>
          <span className="font-semibold text-foreground">{courseName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-serif text-lg font-bold text-foreground">{currency} {amount}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="font-semibold text-foreground mb-4">Payment Method: Vodafone Cash</p>

          <div className="space-y-4">
            <div className="bg-accent/10 border border-accent rounded-lg p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Transfer Instructions</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Transfer to this number:</p>
                  <p className="font-mono text-lg font-bold text-foreground">{PLATFORM_VODAFONE_NUMBER}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Amount to transfer:</p>
                  <p className="font-serif text-lg font-bold text-accent">{currency} {amount}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Your Vodafone Number</label>
              <Input
                placeholder="Your Vodafone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                After transferring the money, click "Payment Done" to notify the admin. Your account will be unlocked
                once the payment is verified.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 rounded-full border-foreground text-foreground bg-transparent"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!phoneNumber || isProcessing}
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full"
          >
            {isProcessing ? "Processing..." : "Payment Done"}
          </Button>
        </div>
      </form>
    </div>
  )
}
