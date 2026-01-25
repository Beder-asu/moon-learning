import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET all courses (public endpoint)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        const db = await getDatabase();

        if (id) {
            // Get single course with levels
            let course;
            try {
                course = await db.collection("courses").findOne({ _id: new ObjectId(id) });
            } catch {
                return Response.json({ error: "Invalid course ID" }, { status: 400 });
            }

            if (!course) {
                return Response.json({ error: "Course not found" }, { status: 404 });
            }

            // Get levels for this course
            const levels = await db.collection("levels")
                .find({ courseId: id })
                .sort({ orderNumber: 1 })
                .toArray();

            const enrichedLevels = await Promise.all(
                levels.map(async (level) => {
                    const videoCount = await db.collection("videos").countDocuments({ levelId: level._id.toString() });
                    const hasQuiz = await db.collection("quizzes").countDocuments({ levelId: level._id.toString() }) > 0;

                    return {
                        id: level._id.toString(),
                        title: level.title,
                        description: level.description,
                        orderNumber: level.orderNumber,
                        videoCount,
                        hasQuiz,
                    };
                })
            );

            return Response.json({
                success: true,
                course: {
                    id: course._id.toString(),
                    title: course.title,
                    description: course.description,
                    instructor: course.instructor,
                    instructorBio: course.instructorBio || "Expert instructor with years of experience.",
                    price: course.price,
                    currency: course.currency || "EGP",
                    image: course.image,
                    level: course.level,
                    duration: course.duration,
                    levels: enrichedLevels,
                    levelCount: enrichedLevels.length,
                    paymentMethods: ["Visa", "InstaPay", "Vodafone Cash"],
                },
            });
        }

        // Get all courses
        const courses = await db.collection("courses")
            .find({ status: { $ne: "Draft" } })
            .sort({ createdAt: -1 })
            .toArray();

        const enrichedCourses = await Promise.all(
            courses.map(async (course) => {
                const levelCount = await db.collection("levels").countDocuments({ courseId: course._id.toString() });

                return {
                    id: course._id.toString(),
                    title: course.title,
                    description: course.description,
                    instructor: course.instructor,
                    price: course.price,
                    currency: course.currency || "EGP",
                    image: course.image,
                    level: course.level,
                    levels: levelCount,
                };
            })
        );

        return Response.json({ success: true, courses: enrichedCourses });
    } catch (error) {
        console.error("[v0] Error fetching courses:", error);
        return Response.json({ error: "Failed to fetch courses" }, { status: 500 });
    }
}
