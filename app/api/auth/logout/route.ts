import { endSession, verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const { token, sessionId } = await request.json();

        if (sessionId) {
            await endSession(sessionId);
        } else if (token) {
            const payload = verifyToken(token);
            if (payload?.sessionId) {
                await endSession(payload.sessionId);
            }
        }

        console.log("[v0] User logged out");

        return Response.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("[v0] Logout error:", error);
        return Response.json({ error: "Logout failed" }, { status: 500 });
    }
}
