import { getDatabase } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { userId, videoId, newLimit, adminId } = await request.json();

    if (!userId || !videoId || !newLimit || !adminId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDatabase();

    // Update view limit in user progress
    const result = await db.collection("userProgress").updateOne(
      { userId, videoId },
      {
        $set: {
          maxViews: newLimit,
          viewLimitIncreasedAt: new Date(),
          increasedBy: adminId,
        },
      },
      { upsert: true }
    );

    // Log the action
    await db.collection("adminLogs").insertOne({
      action: "increase_video_limit",
      userId,
      videoId,
      previousLimit: 5,
      newLimit,
      adminId,
      timestamp: new Date(),
    });

    console.log("[v0] View limit increased:", { userId, videoId, newLimit });

    return Response.json({
      success: true,
      message: "View limit increased successfully",
      viewLimit: newLimit,
    });
  } catch (error) {
    console.error("[v0] Limit update error:", error);
    return Response.json({ error: "Failed to update limit" }, { status: 500 });
  }
}
