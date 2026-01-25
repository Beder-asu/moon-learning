import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET all courses
export async function GET() {
    try {
        const db = await getDatabase();
        const courses = await db.collection("courses").find({}).sort({ createdAt: -1 }).toArray();

        // Get level counts for each course
        const enrichedCourses = await Promise.all(
            courses.map(async (course) => {
                const levelCount = await db.collection("levels").countDocuments({
                    courseId: course._id.toString()
                });
                const studentCount = await db.collection("users").countDocuments({
                    "enrolledCourses.courseId": course._id.toString()
                });

                return {
                    id: course._id.toString(),
                    title: course.title,
                    description: course.description,
                    instructor: course.instructor,
                    price: course.price,
                    currency: course.currency || "EGP",
                    image: course.image,
                    level: course.level,
                    duration: course.duration,
                    levels: levelCount,
                    students: studentCount,
                    status: course.status || "Draft",
                    createdAt: course.createdAt,
                };
            })
        );

        return Response.json({ success: true, courses: enrichedCourses });
    } catch (error) {
        console.error("[v0] Error fetching courses:", error);
        return Response.json({ error: "Failed to fetch courses" }, { status: 500 });
    }
}

// POST create new course
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, instructor, price, currency, image, level, duration } = body;

        if (!title || !price) {
            return Response.json({ error: "Title and price are required" }, { status: 400 });
        }

        const db = await getDatabase();
        const course = {
            _id: new ObjectId(),
            title,
            description: description || "",
            instructor: instructor || "",
            price: parseFloat(price),
            currency: currency || "EGP",
            image: image || "/images/course-placeholder.jpg",
            level: level || "Beginner",
            duration: duration || "",
            status: "Draft",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.collection("courses").insertOne(course);

        return Response.json({
            success: true,
            course: { ...course, id: course._id.toString() }
        });
    } catch (error) {
        console.error("[v0] Error creating course:", error);
        return Response.json({ error: "Failed to create course" }, { status: 500 });
    }
}

// PUT update course
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, title, description, instructor, price, currency, image, level, duration, status } = body;

        if (!id) {
            return Response.json({ error: "Course ID is required" }, { status: 400 });
        }

        const db = await getDatabase();
        const updateData: any = { updatedAt: new Date() };

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (instructor !== undefined) updateData.instructor = instructor;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (currency !== undefined) updateData.currency = currency;
        if (image !== undefined) updateData.image = image;
        if (level !== undefined) updateData.level = level;
        if (duration !== undefined) updateData.duration = duration;
        if (status !== undefined) updateData.status = status;

        const result = await db.collection("courses").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return Response.json({ error: "Course not found" }, { status: 404 });
        }

        return Response.json({ success: true, message: "Course updated" });
    } catch (error) {
        console.error("[v0] Error updating course:", error);
        return Response.json({ error: "Failed to update course" }, { status: 500 });
    }
}

// DELETE course
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return Response.json({ error: "Course ID is required" }, { status: 400 });
        }

        const db = await getDatabase();

        // Delete course
        const result = await db.collection("courses").deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return Response.json({ error: "Course not found" }, { status: 404 });
        }

        // Also delete related levels, videos, and quizzes
        const levels = await db.collection("levels").find({ courseId: id }).toArray();
        const levelIds = levels.map(l => l._id.toString());

        await db.collection("levels").deleteMany({ courseId: id });
        await db.collection("videos").deleteMany({ courseId: id });
        await db.collection("quizzes").deleteMany({ courseId: id });

        return Response.json({ success: true, message: "Course and related content deleted" });
    } catch (error) {
        console.error("[v0] Error deleting course:", error);
        return Response.json({ error: "Failed to delete course" }, { status: 500 });
    }
}
