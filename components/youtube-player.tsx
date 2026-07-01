"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"

interface YouTubePlayerProps {
  videoId: string
  courseId: string
  levelId: string
  title: string
}

export function YouTubePlayer({ videoId, courseId, levelId, title }: YouTubePlayerProps) {
  const { user, isAuthenticated } = useAuth()
  const [viewCount, setViewCount] = useState(0)
  const [remainingViews, setRemainingViews] = useState(5)
  const [maxViews, setMaxViews] = useState(5)
  const [isLimitReached, setIsLimitReached] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [hasFullAccess, setHasFullAccess] = useState(false)

  // Get the user ID (authenticated or device-based)
  const getUserId = () => {
    if (isAuthenticated && user) {
      return user.id
    }
    // For non-authenticated users, use device ID from localStorage
    return localStorage.getItem("device_id") || "anonymous"
  }

  // Load current view status on mount
  useEffect(() => {
    const loadViewStatus = async () => {
      try {
        const userId = getUserId()
        const token = localStorage.getItem("auth_token")
        const headers: HeadersInit = {}
        if (token) headers["Authorization"] = `Bearer ${token}`
        const response = await fetch(`/api/videos/view-status?userId=${userId}&videoId=${videoId}&courseId=${courseId}`, { headers })
        const data = await response.json()

        if (data.success) {
          setViewCount(data.viewCount)
          setRemainingViews(data.remainingViews)
          setMaxViews(data.maxViews)
          setIsLimitReached(data.viewCount >= data.maxViews && !data.hasFullAccess)
          setHasFullAccess(data.hasFullAccess)
        }
      } catch (error) {
        console.error("Error loading view status:", error)
      } finally {
        setInitialLoading(false)
      }
    }

    loadViewStatus()
  }, [videoId, courseId, isAuthenticated, user])

  // Prevent scrolling when in fullscreen
  useEffect(() => {
    if (isMobileFullscreen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileFullscreen])

  const handlePlayClick = async () => {
    if (isLimitReached && !hasFullAccess) {
      alert("You have reached the maximum view limit for this video. Purchase the course for unlimited access.")
      return
    }

    setLoading(true)
    try {
      const userId = getUserId()
      const response = await fetch("/api/videos/track-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          videoId,
          courseId,
          levelId,
        }),
      })

      const data = await response.json()

      if (data.allowed || data.success) {
        setViewCount(data.viewCount)
        setRemainingViews(data.remainingViews)
        setIsPlaying(true)
        if (typeof window !== "undefined" && window.innerWidth < 768) {
          setIsMobileFullscreen(true)
        }
      } else {
        setIsLimitReached(true)
        setRemainingViews(0)
      }
    } catch (error) {
      console.error("Error tracking view:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className={isMobileFullscreen ? "fixed inset-0 z-[100] bg-black flex items-center justify-center" : "relative w-full h-[220px] sm:h-[300px] md:h-[400px] lg:h-[450px] rounded-lg overflow-hidden bg-foreground"}>
        {isPlaying ? (
          <>
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://drive.google.com/file/d/${videoId}/preview`}
              title={title}
              style={{ border: 0 }}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            ></iframe>

            {/* Block pop-out button (top-right) - Active on all devices to prevent bypassing limits */}
            <div
              className="absolute top-0 right-0 w-[50px] h-[50px] md:w-[60px] md:h-[60px] z-10 cursor-default"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onTouchStart={(e) => { e.stopPropagation(); }}
            ></div>

            {/* Close Fullscreen Button (mobile) */}
            {isMobileFullscreen && (
              <button
                onClick={() => setIsMobileFullscreen(false)}
                className="absolute top-4 left-4 w-10 h-10 z-20 bg-black/60 text-white rounded-full flex items-center justify-center"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </>
        ) : (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-muted">
            <div className="text-center">
              <div className="text-3xl mb-4">▶</div>
              <p className="text-foreground font-semibold mb-4 px-4">{title}</p>
              <Button
                onClick={handlePlayClick}
                disabled={loading || (isLimitReached && !hasFullAccess)}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {loading || initialLoading ? "Loading..." : isLimitReached && !hasFullAccess ? "View Limit Reached" : "Play Video"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {!hasFullAccess && (
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-foreground">Views Remaining</span>
            <span className="text-sm font-mono text-accent">{remainingViews} / {maxViews}</span>
          </div>
          <div className="bg-background rounded-full h-2 overflow-hidden">
            <div
              className="bg-accent h-full transition-all"
              style={{ width: `${(viewCount / maxViews) * 100}%` }}
            ></div>
          </div>
          {isLimitReached && (
            <p className="text-xs text-destructive font-medium">
              View limit reached. Purchase the course for unlimited access.
            </p>
          )}
        </div>
      )}

      {hasFullAccess && (
        <div className="bg-accent/10 p-3 rounded-lg">
          <p className="text-sm text-accent font-medium">✓ You have full access to this video</p>
        </div>
      )}

      {isLimitReached && !hasFullAccess && (
        <div className="border-l-4 border-accent bg-accent/10 p-4 rounded">
          <p className="text-sm font-semibold text-foreground mb-2">Unlock Unlimited Access</p>
          <p className="text-sm text-muted-foreground mb-3">
            You have reached your free viewing limit. Purchase the course for unlimited access to all videos.
          </p>
          <Button
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-sm"
            onClick={() => window.location.href = `/checkout?courseId=${courseId}`}
          >
            Purchase Course
          </Button>
        </div>
      )}
    </div>
  )
}
