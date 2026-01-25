import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const { userId, sessionId } = await request.json();

    if (!userId || !sessionId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDatabase();

    const session = await db.collection("sessions").findOne({
      _id: new ObjectId(sessionId),
      userId,
    });

    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    // Update last activity
    await db.collection("sessions").updateOne({ _id: session._id }, { $set: { lastActivity: new Date() } });

    return Response.json({
      success: true,
      active: session.status === "active",
      session,
    });
  } catch (error) {
    console.error("[v0] Session check error:", error);
    return Response.json({ error: "Failed to check session" }, { status: 500 });
  }
}
