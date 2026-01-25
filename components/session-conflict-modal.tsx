"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

interface SessionConflictModalProps {
  isOpen: boolean
  activeDevice: string
  onClose: () => void
  onTakeOver: () => void
}

export function SessionConflictModal({ isOpen, activeDevice, onClose, onTakeOver }: SessionConflictModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleTakeOver = async () => {
    setIsLoading(true)
    await onTakeOver()
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full">
        <div className="text-3xl mb-4">⚠</div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Another Device Is Active</h2>
        <p className="text-muted-foreground mb-6">
          Your account is currently being accessed on {activeDevice}. For security, you can only use one device at a
          time.
        </p>

        <div className="bg-muted p-4 rounded-lg mb-6">
          <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Active Device</p>
          <p className="text-sm text-foreground font-medium">{activeDevice}</p>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full rounded-full border-foreground text-foreground bg-transparent"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full"
            onClick={handleTakeOver}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Log In Here Instead"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Continuing will log you out on the other device.
        </p>
      </div>
    </div>
  )
}
