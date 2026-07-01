"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

function AuthSuccessContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { finishOAuthLogin } = useAuth()

    useEffect(() => {
        const token = searchParams.get("token")
        const sessionId = searchParams.get("sessionId")
        const deviceId = searchParams.get("deviceId")

        if (token && sessionId && deviceId) {
            finishOAuthLogin(token, sessionId, deviceId).then(() => {
                router.push("/courses")
            })
        } else {
            // Invalid callback, go back to login
            router.push("/login")
        }
    }, [searchParams, finishOAuthLogin, router])

    return null
}

export default function AuthSuccessPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-foreground font-medium">Completing login...</p>
            <Suspense fallback={null}>
                <AuthSuccessContent />
            </Suspense>
        </div>
    )
}
