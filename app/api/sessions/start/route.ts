import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const { userId, deviceInfo } = await request.json();

    if (!userId || !deviceInfo) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDatabase();

    // Check for active sessions on different devices
    const activeSession = await db.collection("sessions").findOne({
      userId,
      status: "active",
      deviceId: { $ne: deviceInfo.deviceId },
    });

    if (activeSession) {
      return Response.json({
        success: false,
        conflict: true,
        message: "Another device is currently using your account",
        activeDevice: activeSession.deviceInfo,
        conflictingSessionId: activeSession._id.toString(),
      });
    }

    // End any previous sessions on this device
    await db.collection("sessions").updateMany(
      { userId, "deviceInfo.deviceId": deviceInfo.deviceId, status: "active" },
      { $set: { status: "ended", endedAt: new Date() } }
    );

    // Create new session
    const sessionId = new ObjectId();
    const session = {
      _id: sessionId,
      userId,
      deviceInfo,
      status: "active",
      startedAt: new Date(),
      lastActivity: new Date(),
    };

    await db.collection("sessions").insertOne(session);

    console.log("[v0] New session created:", sessionId);

    return Response.json({
      success: true,
      sessionId: sessionId.toString(),
      session,
    });
  } catch (error) {
    console.error("[v0] Session start error:", error);
    return Response.json({ error: "Failed to start session" }, { status: 500 });
  }
}
