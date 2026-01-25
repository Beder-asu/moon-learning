import { getDatabase } from "@/lib/mongodb";
import { hashPassword, signToken, createSession, forceEndOtherSessions } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
    try {
        const { name, email, password, vodafoneNumber, deviceId, deviceInfo } = await request.json();

        if (!name || !email || !password) {
            return Response.json({ error: "Name, email and password are required" }, { status: 400 });
        }

        if (password.length < 8) {
            return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        }

        const db = await getDatabase();

        // Check if email already exists
        const existingUser = await db.collection("users").findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return Response.json({ error: "Email already registered" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const userId = new ObjectId();
        const user = {
            _id: userId,
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "student",
            vodafoneNumber: vodafoneNumber || "",
            enrolledCourses: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.collection("users").insertOne(user);

        // Create session
        const actualDeviceId = deviceId || new ObjectId().toString();
        const sessionResult = await createSession(userId.toString(), actualDeviceId, deviceInfo || {});

        // Generate JWT token
        const token = signToken({
            userId: userId.toString(),
            email: user.email,
            role: user.role,
            sessionId: sessionResult.sessionId,
            deviceId: actualDeviceId,
        });

        console.log("[v0] New user registered:", email);

        return Response.json({
            success: true,
            token,
            user: {
                id: userId.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                vodafoneNumber: user.vodafoneNumber,
            },
            sessionId: sessionResult.sessionId,
            deviceId: actualDeviceId,
        });
    } catch (error) {
        console.error("[v0] Signup error:", error);
        return Response.json({ error: "Registration failed" }, { status: 500 });
    }
}
