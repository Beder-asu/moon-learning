import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const MAX_VIEWS = 5;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const videoId = searchParams.get("videoId");
        const courseId = searchParams.get("courseId");

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

        // Get current view count
        const progress = await db.collection("userProgress").findOne({
            userId,
            videoId,
        });

        const viewCount = progress?.viewCount || 0;
        const maxViews = hasFullAccess ? 9999 : MAX_VIEWS;
        const remainingViews = Math.max(0, maxViews - viewCount);

        return Response.json({
            success: true,
            viewCount,
            maxViews,
            remainingViews,
            hasFullAccess,
        });
    } catch (error) {
        console.error("[v0] View status error:", error);
        return Response.json({ error: "Failed to get view status" }, { status: 500 });
    }
}
