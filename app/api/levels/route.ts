import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/auth";

// GET level with videos
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const levelId = searchParams.get("levelId");
        const courseId = searchParams.get("courseId");

        if (!levelId) {
            return Response.json({ error: "Level ID is required" }, { status: 400 });
        }

        const db = await getDatabase();

        // Check user authentication and enrollment
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");
        let userId: string | null = null;
        let hasAccess = false;
        let isAdmin = false;

        if (token) {
            const payload = verifyToken(token);
            if (payload) {
                userId = payload.userId;
                isAdmin = payload.role === "admin";

                // Admin has access to everything
                if (isAdmin) {
                    hasAccess = true;
                }
            }
        }

        let level;
        try {
            level = await db.collection("levels").findOne({ _id: new ObjectId(levelId) });
        } catch {
            return Response.json({ error: "Invalid level ID" }, { status: 400 });
        }

        if (!level) {
            return Response.json({ error: "Level not found" }, { status: 404 });
        }

        // Get videos for this level
        const videos = await db.collection("videos")
            .find({ levelId })
            .sort({ orderNumber: 1 })
            .toArray();

        // Get quiz for this level
        const quiz = await db.collection("quizzes").findOne({ levelId });

        // Get course info
        let course = null;
        try {
            course = await db.collection("courses").findOne({ _id: new ObjectId(level.courseId) });
        } catch { }

        // Check if user is enrolled in this course
        if (userId && !isAdmin) {
            const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
            if (user?.enrolledCourses) {
                hasAccess = user.enrolledCourses.some(
                    (enrollment: { courseId: string }) => enrollment.courseId === level.courseId
                );
            }
        }

        // For first level, allow preview access (show first video only)
        const isFirstLevel = level.orderNumber === 1;
        const allowPreview = isFirstLevel && !hasAccess;

        // Get all levels for navigation
        const allLevels = await db.collection("levels")
            .find({ courseId: level.courseId })
            .sort({ orderNumber: 1 })
            .toArray();

        // Find prev/next levels
        const currentIndex = allLevels.findIndex(l => l._id.toString() === levelId);
        const prevLevel = currentIndex > 0 ? allLevels[currentIndex - 1] : null;
        const nextLevel = currentIndex < allLevels.length - 1 ? allLevels[currentIndex + 1] : null;

        // Filter videos based on access
        const accessibleVideos = hasAccess
            ? videos
            : allowPreview
                ? videos.slice(0, 1) // First video only for preview
                : [];

        return Response.json({
            success: true,
            hasAccess,
            isPreview: allowPreview && !hasAccess,
            level: {
                id: level._id.toString(),
                courseId: level.courseId,
                courseTitle: course?.title || "Unknown Course",
                title: level.title,
                description: level.description,
                orderNumber: level.orderNumber,
                totalVideos: videos.length,
                videos: accessibleVideos.map((v) => ({
                    id: v._id.toString(),
                    title: v.title,
                    description: v.description,
                    youtubeId: v.youtubeId,
                    duration: v.duration,
                    orderNumber: v.orderNumber,
                })),
                lockedVideos: !hasAccess ? videos.slice(allowPreview ? 1 : 0).map((v) => ({
                    id: v._id.toString(),
                    title: v.title,
                    duration: v.duration,
                    orderNumber: v.orderNumber,
                })) : [],
                hasQuiz: !!quiz,
                prevLevel: prevLevel ? { id: prevLevel._id.toString(), title: prevLevel.title } : null,
                nextLevel: nextLevel ? { id: nextLevel._id.toString(), title: nextLevel.title } : null,
            },
            course: course ? {
                id: course._id.toString(),
                title: course.title,
            } : null,
            videos: videos.map((v) => ({
                id: v._id.toString(),
                title: v.title,
                description: v.description,
                youtubeId: v.youtubeId,
                duration: v.duration,
                orderNumber: v.orderNumber,
            })),
            quiz: quiz ? {
                id: quiz._id.toString(),
                title: quiz.title,
                questionCount: (quiz.questions || []).length,
                passingScore: quiz.passingScore,
            } : null,
            allLevels: allLevels.map((l) => ({
                id: l._id.toString(),
                title: l.title,
                orderNumber: l.orderNumber,
            })),
        });
    } catch (error) {
        console.error("[v0] Error fetching level:", error);
        return Response.json({ error: "Failed to fetch level" }, { status: 500 });
    }
}
