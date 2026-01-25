import { verifyToken, validateSession, getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const { token, deviceId } = await request.json();

        if (!token) {
            return Response.json({ valid: false, error: "No token provided" }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return Response.json({ valid: false, error: "Invalid or expired token" }, { status: 401 });
        }

        // Validate session is still active
        const isValidSession = await validateSession(payload.sessionId, payload.deviceId);
        if (!isValidSession) {
            return Response.json({
                valid: false,
                error: "Session ended",
                reason: "session_ended",
                message: "Your session was ended. You may have been logged out on another device."
            }, { status: 401 });
        }

        // Check if deviceId matches (if provided)
        if (deviceId && deviceId !== payload.deviceId) {
            return Response.json({
                valid: false,
                error: "Device mismatch",
                reason: "device_mismatch",
                message: "This session was started on a different device."
            }, { status: 401 });
        }

        return Response.json({
            valid: true,
            user: {
                userId: payload.userId,
                email: payload.email,
                role: payload.role,
            },
            sessionId: payload.sessionId,
        });
    } catch (error) {
        console.error("[v0] Token verification error:", error);
        return Response.json({ valid: false, error: "Verification failed" }, { status: 500 });
    }
}
