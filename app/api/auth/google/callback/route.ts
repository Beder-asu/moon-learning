import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { signToken, createSession } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get("code");
        
        if (!code) {
            return NextResponse.json({ error: "No code provided" }, { status: 400 });
        }

        const host = request.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";
        const REDIRECT_URI = `${protocol}://${host}/api/auth/google/callback`;

        const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
        const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
            return NextResponse.json({ error: "Missing Google Client credentials" }, { status: 500 });
        }

        // 1. Exchange code for access token
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: "authorization_code",
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            return NextResponse.json({ error: "Failed to exchange code", details: tokenData }, { status: 400 });
        }

        // 2. Fetch user profile
        const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        const googleUser = await userResponse.json();

        if (!googleUser.email) {
            return NextResponse.json({ error: "Failed to get user email from Google" }, { status: 400 });
        }

        const db = await getDatabase();
        const email = googleUser.email.toLowerCase();

        // 3. Find or Create User
        let user = await db.collection("users").findOne({ email });

        if (!user) {
            user = {
                _id: new ObjectId(),
                email,
                name: googleUser.name || "Google User",
                password: "", // No password for OAuth users
                role: "student",
                enrolledCourses: [],
                status: "Active",
                provider: "google",
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await db.collection("users").insertOne(user);
            console.log("[v0] Created new user via Google Login:", email);
        } else if (!user.provider) {
            // Optional: link the account if it was an email user
            await db.collection("users").updateOne(
                { _id: user._id },
                { $set: { provider: "google" } }
            );
        }

        // 4. Create Session
        const actualDeviceId = new ObjectId().toString();
        const sessionResult = await createSession(user._id.toString(), actualDeviceId, { browser: "Google OAuth Login" });

        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            sessionId: sessionResult.sessionId,
            deviceId: actualDeviceId,
        });

        // 5. Redirect to frontend success page
        const redirectUrl = new URL("/auth/success", request.url);
        redirectUrl.searchParams.set("token", token);
        redirectUrl.searchParams.set("sessionId", sessionResult.sessionId);
        redirectUrl.searchParams.set("deviceId", actualDeviceId);

        return NextResponse.redirect(redirectUrl);

    } catch (error) {
        console.error("[v0] Google callback error:", error);
        return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
    }
}
