"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"

interface User {
    id: string
    name: string
    email: string
    role: "student" | "admin"
    vodafoneNumber?: string
    enrolledCourses?: Array<{
        courseId: string
        enrolledAt: string
        accessLevel: string
    }>
}

interface AuthContextType {
    user: User | null
    token: string | null
    deviceId: string
    sessionId: string | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (email: string, password: string, forceLogin?: boolean) => Promise<{ success: boolean; conflict?: boolean; activeDevice?: string; error?: string }>
    signup: (name: string, email: string, password: string, vodafoneNumber?: string) => Promise<{ success: boolean; error?: string }>
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
    finishOAuthLogin: (token: string, sessionId: string, deviceId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = "auth_token"
const DEVICE_ID_KEY = "device_id"
const SESSION_ID_KEY = "session_id"
const USER_KEY = "user"

function getDeviceInfo(): Record<string, string> {
    if (typeof window === "undefined") return {}

    const ua = navigator.userAgent
    const browser = ua.includes("Chrome") ? "Chrome" :
        ua.includes("Firefox") ? "Firefox" :
            ua.includes("Safari") ? "Safari" :
                ua.includes("Edge") ? "Edge" : "Unknown"

    const os = ua.includes("Windows") ? "Windows" :
        ua.includes("Mac") ? "macOS" :
            ua.includes("Linux") ? "Linux" :
                ua.includes("Android") ? "Android" :
                    ua.includes("iOS") ? "iOS" : "Unknown"

    return {
        browser,
        os,
        userAgent: ua,
        screenWidth: window.screen.width.toString(),
        screenHeight: window.screen.height.toString(),
        deviceType: window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop",
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [deviceId, setDeviceId] = useState<string>("")
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Get or create device ID
                let storedDeviceId = localStorage.getItem(DEVICE_ID_KEY)
                if (!storedDeviceId) {
                    storedDeviceId = uuidv4()
                    localStorage.setItem(DEVICE_ID_KEY, storedDeviceId)
                }
                setDeviceId(storedDeviceId)

                // Get stored token
                const storedToken = localStorage.getItem(TOKEN_KEY)
                const storedSessionId = localStorage.getItem(SESSION_ID_KEY)
                const storedUser = localStorage.getItem(USER_KEY)

                if (storedToken) {
                    // Verify token is still valid
                    const response = await fetch("/api/auth/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token: storedToken, deviceId: storedDeviceId }),
                    })

                    const data = await response.json()

                    if (data.valid) {
                        setToken(storedToken)
                        setSessionId(storedSessionId)
                        if (storedUser) {
                            setUser(JSON.parse(storedUser))
                        }
                        
                        // Silently fetch latest user data from DB to ensure it isn't stale 
                        // (e.g. if an admin just approved a payment)
                        fetch("/api/auth/me", {
                            headers: { Authorization: `Bearer ${storedToken}` },
                        })
                        .then(res => res.json())
                        .then(meData => {
                            if (meData.success) {
                                setUser(meData.user)
                                localStorage.setItem(USER_KEY, JSON.stringify(meData.user))
                            }
                        })
                        .catch(e => console.error("Background refresh error:", e))
                    } else {
                        // Token invalid or session ended - clear storage
                        console.log("[v0] Session invalid:", data.reason)
                        localStorage.removeItem(TOKEN_KEY)
                        localStorage.removeItem(SESSION_ID_KEY)
                        localStorage.removeItem(USER_KEY)
                    }
                }
            } catch (error) {
                console.error("[v0] Auth init error:", error)
            } finally {
                setIsLoading(false)
            }
        }

        initAuth()
    }, [])

    const login = useCallback(async (email: string, password: string, forceLogin: boolean = false): Promise<{ success: boolean; conflict?: boolean; activeDevice?: string; error?: string }> => {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    deviceId,
                    deviceInfo: getDeviceInfo(),
                    forceLogin,
                }),
            })

            const data = await response.json()

            if (data.conflict && !forceLogin) {
                return { success: false, conflict: true, activeDevice: data.activeDevice }
            }

            if (data.success) {
                setToken(data.token)
                setUser(data.user)
                setSessionId(data.sessionId)

                localStorage.setItem(TOKEN_KEY, data.token)
                localStorage.setItem(SESSION_ID_KEY, data.sessionId)
                localStorage.setItem(USER_KEY, JSON.stringify(data.user))

                return { success: true }
            }

            return { success: false, error: data.error || "Login failed" }
        } catch (error) {
            console.error("[v0] Login error:", error)
            return { success: false, error: "An error occurred during login" }
        }
    }, [deviceId])

    const signup = useCallback(async (name: string, email: string, password: string, vodafoneNumber?: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    vodafoneNumber,
                    deviceId,
                    deviceInfo: getDeviceInfo(),
                }),
            })

            const data = await response.json()

            if (data.success) {
                setToken(data.token)
                setUser(data.user)
                setSessionId(data.sessionId)

                localStorage.setItem(TOKEN_KEY, data.token)
                localStorage.setItem(SESSION_ID_KEY, data.sessionId)
                localStorage.setItem(USER_KEY, JSON.stringify(data.user))

                return { success: true }
            }

            return { success: false, error: data.error || "Registration failed" }
        } catch (error) {
            console.error("[v0] Signup error:", error)
            return { success: false, error: "An error occurred during registration" }
        }
    }, [deviceId])

    const logout = useCallback(async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, sessionId }),
            })
        } catch (error) {
            console.error("[v0] Logout error:", error)
        }

        setToken(null)
        setUser(null)
        setSessionId(null)

        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(SESSION_ID_KEY)
        localStorage.removeItem(USER_KEY)

        router.push("/login")
    }, [token, sessionId, router])

    const refreshUser = useCallback(async () => {
        if (!token) return

        try {
            const response = await fetch("/api/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
            })

            const data = await response.json()
            if (data.success) {
                setUser(data.user)
                localStorage.setItem(USER_KEY, JSON.stringify(data.user))
            }
        } catch (error) {
            console.error("[v0] Refresh user error:", error)
        }
    }, [token])

    const finishOAuthLogin = useCallback(async (newToken: string, newSessionId: string, newDeviceId: string) => {
        localStorage.setItem(TOKEN_KEY, newToken)
        localStorage.setItem(SESSION_ID_KEY, newSessionId)
        localStorage.setItem(DEVICE_ID_KEY, newDeviceId)
        
        setToken(newToken)
        setSessionId(newSessionId)
        setDeviceId(newDeviceId)

        // Fetch latest user data from DB
        try {
            const meResponse = await fetch("/api/auth/me", {
                headers: { Authorization: `Bearer ${newToken}` },
            })
            const meData = await meResponse.json()
            if (meData.success) {
                setUser(meData.user)
                localStorage.setItem(USER_KEY, JSON.stringify(meData.user))
            }
        } catch (e) {
            console.error("[v0] OAuth user fetch error:", e)
        }
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                deviceId,
                sessionId,
                isLoading,
                isAuthenticated: !!user && !!token,
                login,
                signup,
                logout,
                refreshUser,
                finishOAuthLogin,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
