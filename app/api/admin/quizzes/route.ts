import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET all quizzes (optionally filtered by levelId or courseId)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const levelId = searchParams.get("levelId");
        const courseId = searchParams.get("courseId");

        const db = await getDatabase();
        const query: any = {};
        if (levelId) query.levelId = levelId;
        if (courseId) query.courseId = courseId;

        const quizzes = await db.collection("quizzes").find(query).toArray();

        // Enrich with level and course info
        const enrichedQuizzes = await Promise.all(
            quizzes.map(async (quiz) => {
                let levelTitle = "Unknown Level";
                let courseTitle = "Unknown Course";

                try {
                    const level = await db.collection("levels").findOne({ _id: new ObjectId(quiz.levelId) });
                    if (level) {
                        levelTitle = level.title;
                        const course = await db.collection("courses").findOne({ _id: new ObjectId(level.courseId) });
                        if (course) courseTitle = course.title;
                    }
                } catch { }

                return {
                    id: quiz._id.toString(),
                    levelId: quiz.levelId,
                    courseId: quiz.courseId,
                    levelTitle,
                    courseTitle,
                    title: quiz.title,
                    passingScore: quiz.passingScore || 51,
                    questions: quiz.questions || [],
                    questionCount: (quiz.questions || []).length,
                    status: quiz.status || "Draft",
                    createdAt: quiz.createdAt,
                };
            })
        );

        return Response.json({ success: true, quizzes: enrichedQuizzes });
    } catch (error) {
        console.error("[v0] Error fetching quizzes:", error);
        return Response.json({ error: "Failed to fetch quizzes" }, { status: 500 });
    }
}

// POST create new quiz
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { levelId, courseId, title, passingScore, questions } = body;

        if (!levelId || !title) {
            return Response.json({ error: "Level ID and title are required" }, { status: 400 });
        }

        const db = await getDatabase();

        // Get courseId from level if not provided
        let finalCourseId = courseId;
        if (!finalCourseId) {
            const level = await db.collection("levels").findOne({ _id: new ObjectId(levelId) });
            if (level) finalCourseId = level.courseId;
        }

        // Process questions to add IDs
        const processedQuestions = (questions || []).map((q: any) => ({
            _id: new ObjectId(),
            text: q.text,
            type: q.type || "multiple_choice",
            options: (q.options || []).map((opt: any) => ({
                _id: new ObjectId(),
                text: typeof opt === 'string' ? opt : opt.text,
            })),
            correctAnswers: q.correctAnswers || [],
        }));

        const quiz = {
            _id: new ObjectId(),
            levelId,
            courseId: finalCourseId,
            title,
            passingScore: passingScore || 51,
            questions: processedQuestions,
            status: "Active",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.collection("quizzes").insertOne(quiz);

        // Update level to indicate it has a quiz
        await db.collection("levels").updateOne(
            { _id: new ObjectId(levelId) },
            { $set: { hasQuiz: true } }
        );

        return Response.json({
            success: true,
            quiz: { ...quiz, id: quiz._id.toString() }
        });
    } catch (error) {
        console.error("[v0] Error creating quiz:", error);
        return Response.json({ error: "Failed to create quiz" }, { status: 500 });
    }
}

// PUT update quiz
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, title, passingScore, questions, status } = body;

        if (!id) {
            return Response.json({ error: "Quiz ID is required" }, { status: 400 });
        }

        const db = await getDatabase();
        const updateData: any = { updatedAt: new Date() };

        if (title !== undefined) updateData.title = title;
        if (passingScore !== undefined) updateData.passingScore = passingScore;
        if (status !== undefined) updateData.status = status;

        if (questions !== undefined) {
            updateData.questions = questions.map((q: any) => ({
                _id: q._id ? new ObjectId(q._id) : new ObjectId(),
                text: q.text,
                type: q.type || "multiple_choice",
                options: (q.options || []).map((opt: any) => ({
                    _id: opt._id ? new ObjectId(opt._id) : new ObjectId(),
                    text: typeof opt === 'string' ? opt : opt.text,
                })),
                correctAnswers: q.correctAnswers || [],
            }));
        }

        const result = await db.collection("quizzes").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return Response.json({ error: "Quiz not found" }, { status: 404 });
        }

        return Response.json({ success: true, message: "Quiz updated" });
    } catch (error) {
        console.error("[v0] Error updating quiz:", error);
        return Response.json({ error: "Failed to update quiz" }, { status: 500 });
    }
}

// DELETE quiz
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return Response.json({ error: "Quiz ID is required" }, { status: 400 });
        }

        const db = await getDatabase();

        // Get quiz to find its level
        const quiz = await db.collection("quizzes").findOne({ _id: new ObjectId(id) });

        const result = await db.collection("quizzes").deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return Response.json({ error: "Quiz not found" }, { status: 404 });
        }

        // Check if level still has quizzes
        if (quiz) {
            const remainingQuizzes = await db.collection("quizzes").countDocuments({ levelId: quiz.levelId });
            if (remainingQuizzes === 0) {
                await db.collection("levels").updateOne(
                    { _id: new ObjectId(quiz.levelId) },
                    { $set: { hasQuiz: false } }
                );
            }
        }

        return Response.json({ success: true, message: "Quiz deleted" });
    } catch (error) {
        console.error("[v0] Error deleting quiz:", error);
        return Response.json({ error: "Failed to delete quiz" }, { status: 500 });
    }
}
