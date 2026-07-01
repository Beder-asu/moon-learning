import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const REDIRECT_URI = `${protocol}://${host}/api/auth/google/callback`;

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

    if (!GOOGLE_CLIENT_ID) {
        return NextResponse.json({ error: "Missing GOOGLE_CLIENT_ID in environment" }, { status: 500 });
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=email profile&prompt=select_account`;

    return NextResponse.redirect(authUrl);
}
