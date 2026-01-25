import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const { userId, sessionId } = await request.json();

    if (!userId || !sessionId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDatabase();

    const result = await db.collection("sessions").updateOne(
      { _id: new ObjectId(sessionId), userId },
      { $set: { status: "ended", endedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    console.log("[v0] Session ended:", { userId, sessionId });

    return Response.json({
      success: true,
      message: "Session ended successfully",
    });
  } catch (error) {
    console.error("[v0] Session end error:", error);
    return Response.json({ error: "Failed to end session" }, { status: 500 });
  }
}
