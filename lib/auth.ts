import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getDatabase } from "./mongodb";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = "7d";
const SESSION_COOKIE_NAME = "auth_token";
const DEVICE_COOKIE_NAME = "device_id";

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    sessionId: string;
    deviceId: string;
    iat?: number;
    exp?: number;
}

export interface User {
    _id: ObjectId;
    email: string;
    password: string;
    name: string;
    role: "student" | "admin";
    vodafoneNumber?: string;
    enrolledCourses?: Array<{
        courseId: string;
        enrolledAt: Date;
        accessLevel: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

// JWT functions
export function signToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

// Session management
export async function createSession(userId: string, deviceId: string, deviceInfo: any): Promise<{ sessionId: string; conflict?: boolean; activeDevice?: string }> {
    const db = await getDatabase();

    // Check for active sessions on OTHER devices
    const activeSession = await db.collection("sessions").findOne({
        userId,
        status: "active",
        deviceId: { $ne: deviceId },
    });

    if (activeSession) {
        // Return conflict info - let caller decide what to do
        return {
            sessionId: "",
            conflict: true,
            activeDevice: activeSession.deviceInfo?.browser || activeSession.deviceInfo?.deviceType || "Another device",
        };
    }

    // End any previous sessions on this device
    await db.collection("sessions").updateMany(
        { userId, deviceId, status: "active" },
        { $set: { status: "ended", endedAt: new Date() } }
    );

    // Create new session
    const session = {
        _id: new ObjectId(),
        userId,
        deviceId,
        deviceInfo,
        status: "active",
        startedAt: new Date(),
        lastActivity: new Date(),
    };

    await db.collection("sessions").insertOne(session);

    return { sessionId: session._id.toString() };
}

export async function endSession(sessionId: string): Promise<boolean> {
    const db = await getDatabase();

    const result = await db.collection("sessions").updateOne(
        { _id: new ObjectId(sessionId) },
        { $set: { status: "ended", endedAt: new Date() } }
    );

    return result.modifiedCount > 0;
}

export async function endAllUserSessions(userId: string): Promise<number> {
    const db = await getDatabase();

    const result = await db.collection("sessions").updateMany(
        { userId, status: "active" },
        { $set: { status: "ended", endedAt: new Date() } }
    );

    return result.modifiedCount;
}

export async function forceEndOtherSessions(userId: string, currentDeviceId: string): Promise<number> {
    const db = await getDatabase();

    const result = await db.collection("sessions").updateMany(
        { userId, deviceId: { $ne: currentDeviceId }, status: "active" },
        { $set: { status: "forced_end", endedAt: new Date() } }
    );

    return result.modifiedCount;
}

export async function validateSession(sessionId: string, deviceId: string): Promise<boolean> {
    const db = await getDatabase();

    const session = await db.collection("sessions").findOne({
        _id: new ObjectId(sessionId),
        deviceId,
        status: "active",
    });

    if (!session) {
        return false;
    }

    // Update last activity
    await db.collection("sessions").updateOne(
        { _id: new ObjectId(sessionId) },
        { $set: { lastActivity: new Date() } }
    );

    return true;
}

// Get current user from request
export async function getCurrentUser(request: Request): Promise<{ user: User | null; payload: JWTPayload | null }> {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") || getCookieFromRequest(request, SESSION_COOKIE_NAME);

    if (!token) {
        return { user: null, payload: null };
    }

    const payload = verifyToken(token);
    if (!payload) {
        return { user: null, payload: null };
    }

    const db = await getDatabase();
    const user = await db.collection("users").findOne({ _id: new ObjectId(payload.userId) }) as User | null;

    return { user, payload };
}

function getCookieFromRequest(request: Request, name: string): string | null {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    return cookies[name] || null;
}

// Check if user has access to a course
export async function hasCoursAccess(userId: string, courseId: string): Promise<boolean> {
    const db = await getDatabase();

    // Check if user is enrolled
    const user = await db.collection("users").findOne({
        _id: new ObjectId(userId),
        "enrolledCourses.courseId": courseId,
    });

    if (user) return true;

    // Check for approved payment
    const payment = await db.collection("payments").findOne({
        userId,
        courseId,
        status: "verified",
    });

    return !!payment;
}

// Generate device ID (called on client side)
export function generateDeviceId(): string {
    const { v4: uuidv4 } = require("uuid");
    return uuidv4();
}

// Guard helper for admin-only API routes.
// Returns { error: Response } when the caller is not an authenticated admin,
// or { payload: JWTPayload } when they are.
export async function requireAdmin(
    request: Request
): Promise<{ error: Response; payload?: never } | { payload: JWTPayload; error?: never }> {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") ?? getCookieFromRequest(request, SESSION_COOKIE_NAME);

    if (!token) {
        return {
            error: Response.json({ error: "Unauthorized" }, { status: 401 }),
        };
    }

    const payload = verifyToken(token);
    if (!payload) {
        return {
            error: Response.json({ error: "Invalid or expired token" }, { status: 401 }),
        };
    }

    if (payload.role !== "admin") {
        return {
            error: Response.json({ error: "Forbidden: admin access required" }, { status: 403 }),
        };
    }

    return { payload };
}
