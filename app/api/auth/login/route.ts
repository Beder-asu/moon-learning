import { getDatabase } from "@/lib/mongodb";
import { verifyPassword, signToken, createSession, forceEndOtherSessions } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
    try {
        const { email, password, deviceId, deviceInfo, forceLogin } = await request.json();

        if (!email || !password) {
            return Response.json({ error: "Email and password are required" }, { status: 400 });
        }

        const db = await getDatabase();

        // Find user by email
        const user = await db.collection("users").findOne({ email: email.toLowerCase() });
        if (!user) {
            return Response.json({ error: "Invalid email or password" }, { status: 401 });
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            return Response.json({ error: "Invalid email or password" }, { status: 401 });
        }

        const actualDeviceId = deviceId || new ObjectId().toString();

        // Create session (check for conflicts)
        const sessionResult = await createSession(user._id.toString(), actualDeviceId, deviceInfo || {});

        // If there's a conflict and forceLogin is not set, return conflict
        if (sessionResult.conflict && !forceLogin) {
            return Response.json({
                success: false,
                conflict: true,
                message: "Another device is currently using your account",
                activeDevice: sessionResult.activeDevice,
            });
        }

        // If forceLogin, end other sessions and create new one
        if (sessionResult.conflict && forceLogin) {
            await forceEndOtherSessions(user._id.toString(), actualDeviceId);
            // Create new session after forcing others to end
            const newSessionResult = await createSession(user._id.toString(), actualDeviceId, deviceInfo || {});

            // Generate JWT token
            const token = signToken({
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
                sessionId: newSessionResult.sessionId,
                deviceId: actualDeviceId,
            });

            console.log("[v0] User force-logged in:", email);

            return Response.json({
                success: true,
                token,
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    vodafoneNumber: user.vodafoneNumber,
                    enrolledCourses: user.enrolledCourses || [],
                },
                sessionId: newSessionResult.sessionId,
                deviceId: actualDeviceId,
                forcedLogout: true,
            });
        }

        // Generate JWT token
        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            sessionId: sessionResult.sessionId,
            deviceId: actualDeviceId,
        });

        console.log("[v0] User logged in:", email);

        return Response.json({
            success: true,
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                vodafoneNumber: user.vodafoneNumber,
                enrolledCourses: user.enrolledCourses || [],
            },
            sessionId: sessionResult.sessionId,
            deviceId: actualDeviceId,
        });
    } catch (error) {
        console.error("[v0] Login error:", error);
        return Response.json({ error: "Login failed" }, { status: 500 });
    }
}
