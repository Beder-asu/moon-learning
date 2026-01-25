import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET all levels (optionally filtered by courseId)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get("courseId");

        const db = await getDatabase();
        const query = courseId ? { courseId } : {};
        const levels = await db.collection("levels").find(query).sort({ orderNumber: 1 }).toArray();

        // Enrich with video and quiz counts
        const enrichedLevels = await Promise.all(
            levels.map(async (level) => {
                const videoCount = await db.collection("videos").countDocuments({ levelId: level._id.toString() });
                const quizCount = await db.collection("quizzes").countDocuments({ levelId: level._id.toString() });

                // Get course title
                let courseTitle = "Unknown Course";
                try {
                    const course = await db.collection("courses").findOne({ _id: new ObjectId(level.courseId) });
                    if (course) courseTitle = course.title;
                } catch { }

                return {
                    id: level._id.toString(),
                    courseId: level.courseId,
                    courseTitle,
                    title: level.title,
                    description: level.description || "",
                    orderNumber: level.orderNumber || 1,
                    videoCount,
                    quizCount,
                    hasQuiz: level.hasQuiz || false,
                    status: level.status || "Draft",
                    createdAt: level.createdAt,
                };
            })
        );

        return Response.json({ success: true, levels: enrichedLevels });
    } catch (error) {
        console.error("[v0] Error fetching levels:", error);
        return Response.json({ error: "Failed to fetch levels" }, { status: 500 });
    }
}

// POST create new level
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { courseId, title, description, orderNumber } = body;

        if (!courseId || !title) {
            return Response.json({ error: "Course ID and title are required" }, { status: 400 });
        }

        const db = await getDatabase();

        // Get next order number if not provided
        let order = orderNumber;
        if (!order) {
            const lastLevel = await db.collection("levels").findOne(
                { courseId },
                { sort: { orderNumber: -1 } }
            );
            order = (lastLevel?.orderNumber || 0) + 1;
        }

        const level = {
            _id: new ObjectId(),
            courseId,
            title,
            description: description || "",
            orderNumber: order,
            hasQuiz: false,
            status: "Draft",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.collection("levels").insertOne(level);

        return Response.json({
            success: true,
            level: { ...level, id: level._id.toString() }
        });
    } catch (error) {
        console.error("[v0] Error creating level:", error);
        return Response.json({ error: "Failed to create level" }, { status: 500 });
    }
}

// PUT update level
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, title, description, orderNumber, hasQuiz, status } = body;

        if (!id) {
            return Response.json({ error: "Level ID is required" }, { status: 400 });
        }

        const db = await getDatabase();
        const updateData: any = { updatedAt: new Date() };

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (orderNumber !== undefined) updateData.orderNumber = orderNumber;
        if (hasQuiz !== undefined) updateData.hasQuiz = hasQuiz;
        if (status !== undefined) updateData.status = status;

        const result = await db.collection("levels").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return Response.json({ error: "Level not found" }, { status: 404 });
        }

        return Response.json({ success: true, message: "Level updated" });
    } catch (error) {
        console.error("[v0] Error updating level:", error);
        return Response.json({ error: "Failed to update level" }, { status: 500 });
    }
}

// DELETE level
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return Response.json({ error: "Level ID is required" }, { status: 400 });
        }

        const db = await getDatabase();

        const result = await db.collection("levels").deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return Response.json({ error: "Level not found" }, { status: 404 });
        }

        // Also delete related videos and quizzes
        await db.collection("videos").deleteMany({ levelId: id });
        await db.collection("quizzes").deleteMany({ levelId: id });

        return Response.json({ success: true, message: "Level and related content deleted" });
    } catch (error) {
        console.error("[v0] Error deleting level:", error);
        return Response.json({ error: "Failed to delete level" }, { status: 500 });
    }
}
