import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const levelId = searchParams.get("levelId")

        const db = await getDatabase()

        if (levelId) {
            // Try to find by ObjectId first, then by string
            let quiz = null

            if (ObjectId.isValid(levelId)) {
                quiz = await db.collection("quizzes").findOne({ levelId: levelId })
                if (!quiz) {
                    quiz = await db.collection("quizzes").findOne({ levelId: new ObjectId(levelId) })
                }
            } else {
                quiz = await db.collection("quizzes").findOne({ levelId: levelId })
            }

            if (!quiz) {
                return NextResponse.json({ success: false, error: "Quiz not found for this level" }, { status: 404 })
            }

            // Transform questions to the format expected by the test component
            const formattedQuestions = quiz.questions?.map((q: any, index: number) => ({
                id: `q${index + 1}`,
                text: q.question,
                type: "single", // All questions are single-choice
                options: (q.options || []).map((opt: string, i: number) => ({
                    id: String.fromCharCode(97 + i), // 'a', 'b', 'c', 'd'
                    text: opt
                })),
                correctAnswer: q.correctAnswer
            })) || []

            return NextResponse.json({
                success: true,
                quiz: {
                    id: quiz._id.toString(),
                    title: quiz.title,
                    levelId: quiz.levelId,
                    passingScore: quiz.passingScore || 51,
                    questions: formattedQuestions
                }
            })
        }

        // Get all quizzes
        const quizzes = await db.collection("quizzes").find({}).toArray()

        return NextResponse.json({
            success: true,
            quizzes: quizzes.map((quiz: any) => ({
                id: quiz._id.toString(),
                title: quiz.title,
                levelId: quiz.levelId,
                passingScore: quiz.passingScore,
                questionCount: quiz.questions?.length || 0
            }))
        })

    } catch (error) {
        console.error("Error fetching quiz:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch quiz" }, { status: 500 })
    }
}
