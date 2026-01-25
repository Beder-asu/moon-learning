import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const { userId, courseId, levelId, answers } = await request.json();

    if (!userId || !courseId || !levelId || !answers) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDatabase();

    // Fetch quiz for this level
    const quiz = await db.collection("quizzes").findOne({ levelId });

    if (!quiz) {
      return Response.json({ error: "Quiz not found for this level" }, { status: 404 });
    }

    let correctCount = 0;
    const totalQuestions = quiz.questions?.length || 0;

    // Check if there are questions
    if (totalQuestions === 0) {
      return Response.json({ error: "No questions found in this quiz" }, { status: 400 });
    }

    // Grade test
    for (const [questionId, userAnswer] of Object.entries(answers)) {
      const question = quiz.questions?.find((q: any) => q._id.toString() === questionId);

      if (question && Array.isArray(userAnswer) && Array.isArray(question.correctAnswers)) {
        if (JSON.stringify((userAnswer as string[]).sort()) === JSON.stringify(question.correctAnswers.sort())) {
          correctCount++;
        }
      }
    }

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score > 50;

    // Save test result
    const result = {
      _id: new ObjectId(),
      userId,
      courseId,
      levelId,
      score,
      passed,
      correctCount,
      totalQuestions,
      submittedAt: new Date(),
    };

    await db.collection("testResults").insertOne(result);

    // If passed, update user progress to unlock next level
    if (passed) {
      await db.collection("userProgress").updateOne(
        { userId, levelId },
        { $set: { completed: true, completedAt: new Date() } },
        { upsert: true }
      );
      console.log(`[v0] Level ${levelId} unlocked for user ${userId}`);
    }

    return Response.json({
      success: true,
      score,
      passed,
      message: passed
        ? `Congratulations! You scored ${score}%. The next level is now unlocked.`
        : `You scored ${score}%. You need at least 51% to pass. Try again!`,
    });
  } catch (error) {
    console.error("[v0] Test submission error:", error);
    return Response.json({ error: "Failed to submit test" }, { status: 500 });
  }
}
