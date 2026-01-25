"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { YouTubePlayer } from "@/components/youtube-player"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Lock } from "lucide-react"

interface Video {
  id: string
  title: string
  youtubeId?: string
  duration: string
  orderNumber: number
}

interface Level {
  id: string
  title: string
  description: string
  courseId: string
  courseTitle: string
  orderNumber: number
  videos: Video[]
  lockedVideos: Video[]
  totalVideos: number
  hasQuiz: boolean
  prevLevel: { id: string; title: string } | null
  nextLevel: { id: string; title: string } | null
}

export default function LevelPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuth()
  const courseId = params.id as string
  const levelId = params.levelId as string
  const [level, setLevel] = useState<Level | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [completedVideos, setCompletedVideos] = useState<string[]>([])

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const headers: HeadersInit = {}
        if (token) {
          headers["Authorization"] = `Bearer ${token}`
        }
        const response = await fetch(`/api/levels?levelId=${levelId}`, { headers })
        const data = await response.json()
        if (data.success) {
          setLevel(data.level)
          setHasAccess(data.hasAccess)
          setIsPreview(data.isPreview)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error("Error fetching level:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchLevel()
  }, [levelId, token])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-10 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-full mb-8"></div>
                <div className="bg-muted rounded-lg h-96 mb-8"></div>
              </div>
              <div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="h-6 bg-muted rounded mb-4"></div>
                  <div className="h-24 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !level) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Level Not Found</h1>
          <Button asChild>
            <Link href={`/courses/${courseId}`}>Back to Course</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link href={`/courses/${courseId}`} className="text-accent hover:underline text-sm mb-8 inline-block">
          ← Back to Course
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="font-serif text-4xl font-bold text-foreground mb-2">{level.title}</h1>
              <p className="text-lg text-muted-foreground">{level.description}</p>
            </div>

            <div className="space-y-8">
              {/* Upgrade prompt for non-enrolled users */}
              {!hasAccess && (
                <div className="bg-accent/10 border border-accent rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Lock className="h-6 w-6 text-accent" />
                    <h3 className="font-serif text-xl font-bold text-foreground">
                      {isPreview ? "Preview Mode" : "Content Locked"}
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {isPreview
                      ? `You're viewing a preview of this level. Purchase the course to unlock all ${level.totalVideos} videos and quizzes.`
                      : "Purchase this course to access all videos and content."}
                  </p>
                  <Button
                    className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full"
                    onClick={() => router.push(`/checkout?courseId=${courseId}`)}
                  >
                    Purchase Course
                  </Button>
                </div>
              )}

              {/* Accessible videos */}
              {(level.videos?.length || 0) > 0 ? (
                level.videos.map((video, index) => (
                  <div key={video.id} className="bg-card border border-border rounded-lg p-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                          Video {index + 1}: {video.title}
                        </h2>
                        {isPreview && index === 0 && (
                          <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">Free Preview</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Duration: {video.duration}</p>
                    </div>

                    <YouTubePlayer
                      videoId={video.youtubeId!}
                      courseId={courseId}
                      levelId={levelId}
                      title={video.title}
                    />
                  </div>
                ))
              ) : !hasAccess && !isPreview ? (
                <div className="bg-card border border-border rounded-lg p-6 text-center">
                  <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Purchase the course to access this level's content.</p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg p-6 text-center">
                  <p className="text-muted-foreground">No videos available for this level yet.</p>
                </div>
              )}

              {/* Locked videos */}
              {(level.lockedVideos?.length || 0) > 0 && (
                <div className="border-t border-border pt-6">
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Locked Content ({level.lockedVideos.length} more videos)
                  </h3>
                  <div className="space-y-3">
                    {level.lockedVideos.map((video, index) => (
                      <div
                        key={video.id}
                        className="bg-muted/50 border border-border rounded-lg p-4 flex items-center justify-between opacity-70"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Video {(level.videos?.length || 0) + index + 1}: {video.title}</p>
                            <p className="text-sm text-muted-foreground">{video.duration}</p>
                          </div>
                        </div>
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {level.hasQuiz && (
              <div className="mt-8 border-t border-border pt-8">
                <div className="bg-accent/10 border border-accent rounded-lg p-6 text-center">
                  <h3 className="font-serif text-xl font-bold text-foreground mb-4">Ready to Test Your Knowledge?</h3>
                  {hasAccess ? (
                    <>
                      <p className="text-muted-foreground mb-6">
                        Complete all videos and take the level test to unlock the next level
                      </p>
                      <Button
                        className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full"
                        onClick={() => router.push(`/courses/${courseId}/level/${levelId}/test`)}
                      >
                        Take Level Test
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                        <Lock className="h-5 w-5" />
                        <p>Purchase the course to access quizzes</p>
                      </div>
                      <Button
                        className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full"
                        onClick={() => router.push(`/checkout?courseId=${courseId}`)}
                      >
                        Purchase to Unlock
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Navigation between levels */}
            <div className="mt-8 flex justify-between">
              {level.prevLevel ? (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/courses/${courseId}/level/${level.prevLevel!.id}`)}
                >
                  ← {level.prevLevel.title}
                </Button>
              ) : (
                <div></div>
              )}
              {level.nextLevel && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/courses/${courseId}/level/${level.nextLevel!.id}`)}
                >
                  {level.nextLevel.title} →
                </Button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
              <h3 className="font-serif text-xl font-bold text-foreground mb-4">Level Progress</h3>

              {!hasAccess && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    <Lock className="h-4 w-4 inline mr-1" />
                    {isPreview ? "Preview Mode - 1 video available" : "Purchase to unlock content"}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Videos</span>
                    <span className="text-sm text-muted-foreground">
                      {completedVideos.length} / {level.totalVideos || level.videos?.length || 0}
                    </span>
                  </div>
                  <div className="bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-full rounded-full transition-all"
                      style={{
                        width: (level.totalVideos || level.videos?.length || 0) > 0
                          ? `${(completedVideos.length / (level.totalVideos || level.videos?.length || 1)) * 100}%`
                          : '0%',
                      }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wide">
                    Lessons in this Level
                  </p>
                  <div className="space-y-2">
                    {level.videos?.map((video, index) => (
                      <div
                        key={video.id}
                        className="text-sm text-muted-foreground p-2 rounded hover:bg-muted transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${completedVideos.includes(video.id) ? "bg-accent border-accent" : "border-border"
                              }`}
                          ></div>
                          <span className="line-clamp-2">{video.title}</span>
                          {isPreview && index === 0 && (
                            <span className="text-xs text-accent ml-auto">Free</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {level.lockedVideos?.map((video) => (
                      <div
                        key={video.id}
                        className="text-sm text-muted-foreground p-2 rounded opacity-50"
                      >
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                          <span className="line-clamp-2">{video.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
