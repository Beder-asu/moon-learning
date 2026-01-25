import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const MAX_VIEWS = 5;

export async function POST(request: Request) {
  try {
    const { userId, videoId, courseId, levelId } = await request.json();

    if (!userId || !videoId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDatabase();

    // Check if user has full access to the course (purchased)
    let hasFullAccess = false;

    if (userId !== "anonymous") {
      // Check for verified payment
      const payment = await db.collection("payments").findOne({
        userId,
        courseId,
        status: "verified",
      });

      if (payment) {
        hasFullAccess = true;
      }

      // Also check enrolled courses if userId is a valid ObjectId
      if (!hasFullAccess) {
        try {
          const user = await db.collection("users").findOne({
            _id: new ObjectId(userId),
            "enrolledCourses.courseId": courseId,
          });
          if (user) {
            hasFullAccess = true;
          }
        } catch {
          // userId is not a valid ObjectId, that's ok
        }
      }
    }

    // Fetch or create user progress record for this video
    const progress = await db.collection("userProgress").findOne({
      userId,
      videoId,
    });

    const currentViews = progress?.viewCount || 0;

    // If user has full access, don't limit views
    if (!hasFullAccess && currentViews >= MAX_VIEWS) {
      return Response.json({
        allowed: false,
        message: `You have reached the maximum view limit (${MAX_VIEWS}) for this video. Purchase course access for unlimited views.`,
        viewCount: MAX_VIEWS,
        remainingViews: 0,
        maxViews: MAX_VIEWS,
        hasFullAccess: false,
      });
    }

    // Increment view count (still track for analytics even with full access)
    const newViewCount = currentViews + 1;
    await db.collection("userProgress").updateOne(
      { userId, videoId },
      {
        $set: {
          userId,
          videoId,
          courseId,
          levelId,
          viewCount: newViewCount,
          lastViewedAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log("[v0] Video view tracked:", userId, videoId, newViewCount, hasFullAccess ? "(full access)" : "");

    const maxViews = hasFullAccess ? 9999 : MAX_VIEWS;

    return Response.json({
      success: true,
      allowed: true,
      viewCount: newViewCount,
      remainingViews: Math.max(0, maxViews - newViewCount),
      maxViews,
      hasFullAccess,
    });
  } catch (error) {
    console.error("[v0] View tracking error:", error);
    return Response.json({ error: "Failed to track view" }, { status: 500 });
  }
}
