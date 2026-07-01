import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;
    try {
        const db = await getDatabase();

        // Fetch pending payments with course and user info
        const payments = await db.collection("payments")
            .find({ status: "pending" })
            .sort({ createdAt: -1 })
            .toArray();

        // Enrich with course names (fallback to stored or lookup)
        const enrichedPayments = await Promise.all(
            payments.map(async (payment) => {
                // Use stored course name or try to look it up
                let courseName = payment.courseName || "Unknown Course";
                if (courseName === "Unknown Course" && payment.courseId) {
                    try {
                        const course = await db.collection("courses").findOne({
                            _id: new ObjectId(payment.courseId)
                        });
                        if (course) {
                            courseName = course.title;
                        }
                    } catch {
                        // Course lookup failed
                    }
                }

                // Use stored user name or try to look it up
                let userName = payment.userName || "Unknown User";
                if (userName === "Unknown User" || userName === "Guest") {
                    try {
                        const user = await db.collection("users").findOne({
                            _id: new ObjectId(payment.userId)
                        });
                        if (user) {
                            userName = user.name || user.email;
                        }
                    } catch {
                        // User lookup failed
                    }
                }

                return {
                    id: payment.paymentId || payment._id.toString(),
                    odId: payment._id.toString(),
                    userName,
                    userPhone: payment.userPhoneNumber || "Not provided",
                    userEmail: payment.userEmail || "",
                    courseName,
                    courseId: payment.courseId,
                    userId: payment.userId,
                    amount: payment.amount,
                    currency: payment.currency || "EGP",
                    paymentMethod: payment.paymentMethod === "vodafone" ? "Vodafone Cash" : payment.paymentMethod,
                    submittedAt: payment.createdAt ? new Date(payment.createdAt).toLocaleString() : "Unknown",
                    status: payment.status,
                };
            })
        );

        return Response.json({
            success: true,
            payments: enrichedPayments,
            count: enrichedPayments.length,
        });
    } catch (error) {
        console.error("[v0] Error fetching pending payments:", error);
        return Response.json({ error: "Failed to fetch payments" }, { status: 500 });
    }
}
