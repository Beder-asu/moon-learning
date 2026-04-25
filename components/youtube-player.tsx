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
        const response = await fetch(`/api/videos/view-status?userId=${userId}&videoId=${videoId}&courseId=${courseId}`)
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
      <div className="aspect-video bg-foreground rounded-lg overflow-hidden">
        {isPlaying ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <iframe
              width="100%"
              height="100%"
              src={`https://drive.google.com/file/d/${videoId}/preview`}
              title={title}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0 }}
            ></iframe>

            {/* Block pop-out button (top-right) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '60px',
                height: '60px',
                zIndex: 10,
                cursor: 'default'
              }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            ></div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <div className="text-center">
              <div className="text-3xl mb-4">▶</div>
              <p className="text-foreground font-semibold mb-4">{title}</p>
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
