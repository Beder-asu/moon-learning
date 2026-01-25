import { getDatabase } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { paymentId, courseId, userId, action } = await request.json();

    if (!paymentId || !action || !["approve", "reject"].includes(action)) {
      return Response.json({ error: "Missing required fields or invalid action" }, { status: 400 });
    }

    const db = await getDatabase();

    // Update payment status
    const result = await db.collection("payments").updateOne(
      { paymentId },
      {
        $set: {
          status: action === "approve" ? "verified" : "rejected",
          verifiedAt: new Date(),
          verifiedBy: "admin",
        },
      }
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "Payment not found" }, { status: 404 });
    }

    // If approved, add course access to user
    if (action === "approve") {
      await db.collection("users").updateOne(
        { _id: userId },
        {
          $addToSet: {
            enrolledCourses: {
              courseId,
              enrolledAt: new Date(),
              accessLevel: "full",
            },
          },
        }
      );
    }

    console.log("[v0] Payment verified:", paymentId, action);

    return Response.json({
      success: true,
      verified: action === "approve",
      message: action === "approve" ? "Payment approved. User access granted." : "Payment rejected.",
    });
  } catch (error) {
    console.error("[v0] Verification error:", error);
    return Response.json({ error: "Verification failed" }, { status: 500 });
  }
}
