"use client"

import { useEffect, useState } from "react"

export interface DeviceInfo {
  userAgent: string
  platform: string
  screenResolution: string
  timezone: string
  language: string
}

export function useDeviceSession(userId?: string) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionConflict, setSessionConflict] = useState(false)
  const [activeDevice, setActiveDevice] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const getDeviceInfo = (): DeviceInfo => {
      const screenRes = `${window.innerWidth}x${window.innerHeight}`
      return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenResolution: screenRes,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
      }
    }

    const startSession = async () => {
      try {
        const deviceInfo = getDeviceInfo()
        const response = await fetch("/api/sessions/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, deviceInfo }),
        })

        const data = await response.json()

        if (data.success) {
          setSessionId(data.sessionId)
          sessionStorage.setItem("sessionId", data.sessionId)
          console.log("[v0] Session started:", data.sessionId)
        } else if (data.conflict) {
          setSessionConflict(true)
          setActiveDevice(data.activeDevice?.platform || "another device")
          console.log("[v0] Session conflict detected")
        }
      } catch (error) {
        console.error("Failed to start session:", error)
      } finally {
        setLoading(false)
      }
    }

    startSession()

    return () => {
      const existingSessionId = sessionStorage.getItem("sessionId")
      if (existingSessionId) {
        fetch("/api/sessions/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, sessionId: existingSessionId }),
        }).catch(console.error)
      }
    }
  }, [userId])

  return { sessionId, sessionConflict, activeDevice, loading }
}
