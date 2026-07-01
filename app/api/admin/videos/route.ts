import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/auth";

// GET all videos (optionally filtered by levelId or courseId)
export async function GET(request: Request) {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;
    try {
        const { searchParams } = new URL(request.url);
        const levelId = searchParams.get("levelId");
        const courseId = searchParams.get("courseId");

        const db = await getDatabase();
        const query: any = {};
        if (levelId) query.levelId = levelId;
        if (courseId) query.courseId = courseId;

        const videos = await db.collection("videos").find(query).sort({ orderNumber: 1 }).toArray();

        // Enrich with level and course info
        const enrichedVideos = await Promise.all(
            videos.map(async (video) => {
                let levelTitle = "Unknown Level";
                let courseTitle = "Unknown Course";

                try {
                    const level = await db.collection("levels").findOne({ _id: new ObjectId(video.levelId) });
                    if (level) {
                        levelTitle = level.title;
                        const course = await db.collection("courses").findOne({ _id: new ObjectId(level.courseId) });
                        if (course) courseTitle = course.title;
                    }
                } catch { }

                return {
                    id: video._id.toString(),
                    levelId: video.levelId,
                    courseId: video.courseId,
                    levelTitle,
                    courseTitle,
                    title: video.title,
                    description: video.description || "",
                    youtubeId: video.youtubeId,
                    duration: video.duration || "",
                    orderNumber: video.orderNumber || 1,
                    status: video.status || "Draft",
                    createdAt: video.createdAt,
                };
            })
        );

        return Response.json({ success: true, videos: enrichedVideos });
    } catch (error) {
        console.error("[v0] Error fetching videos:", error);
        return Response.json({ error: "Failed to fetch videos" }, { status: 500 });
    }
}

// POST create new video
export async function POST(request: Request) {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;
    try {
        const body = await request.json();
        const { levelId, courseId, title, description, youtubeId, duration, orderNumber } = body;

        if (!levelId || !title || !youtubeId) {
            return Response.json({ error: "Level ID, title, and YouTube ID are required" }, { status: 400 });
        }

        const db = await getDatabase();

        // Get courseId from level if not provided
        let finalCourseId = courseId;
        if (!finalCourseId) {
            const level = await db.collection("levels").findOne({ _id: new ObjectId(levelId) });
            if (level) finalCourseId = level.courseId;
        }

        // Get next order number if not provided
        let order = orderNumber;
        if (!order) {
            const lastVideo = await db.collection("videos").findOne(
                { levelId },
                { sort: { orderNumber: -1 } }
            );
            order = (lastVideo?.orderNumber || 0) + 1;
        }

        const video = {
            _id: new ObjectId(),
            levelId,
            courseId: finalCourseId,
            title,
            description: description || "",
            youtubeId,
            duration: duration || "",
            orderNumber: order,
            status: "Active",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.collection("videos").insertOne(video);

        return Response.json({
            success: true,
            video: { ...video, id: video._id.toString() }
        });
    } catch (error) {
        console.error("[v0] Error creating video:", error);
        return Response.json({ error: "Failed to create video" }, { status: 500 });
    }
}

// PUT update video
export async function PUT(request: Request) {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;
    try {
        const body = await request.json();
        const { id, title, description, youtubeId, duration, orderNumber, status } = body;

        if (!id) {
            return Response.json({ error: "Video ID is required" }, { status: 400 });
        }

        const db = await getDatabase();
        const updateData: any = { updatedAt: new Date() };

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (youtubeId !== undefined) updateData.youtubeId = youtubeId;
        if (duration !== undefined) updateData.duration = duration;
        if (orderNumber !== undefined) updateData.orderNumber = orderNumber;
        if (status !== undefined) updateData.status = status;

        const result = await db.collection("videos").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return Response.json({ error: "Video not found" }, { status: 404 });
        }

        return Response.json({ success: true, message: "Video updated" });
    } catch (error) {
        console.error("[v0] Error updating video:", error);
        return Response.json({ error: "Failed to update video" }, { status: 500 });
    }
}

// DELETE video
export async function DELETE(request: Request) {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return Response.json({ error: "Video ID is required" }, { status: 400 });
        }

        const db = await getDatabase();

        const result = await db.collection("videos").deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return Response.json({ error: "Video not found" }, { status: 404 });
        }

        return Response.json({ success: true, message: "Video deleted" });
    } catch (error) {
        console.error("[v0] Error deleting video:", error);
        return Response.json({ error: "Failed to delete video" }, { status: 500 });
    }
}
