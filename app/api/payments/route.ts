import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const { courseId, amount, currency, paymentMethod, userId, userName, userEmail, userPhoneNumber, status } = await request.json();

    if (!courseId || !amount || !paymentMethod) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDatabase();

    // Get course name for the payment record
    let courseName = "Unknown Course";
    try {
      const course = await db.collection("courses").findOne({ _id: new ObjectId(courseId) });
      if (course) courseName = course.title;
    } catch { }

    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const transactionId = `TXN_${Date.now()}`;

    const payment = {
      _id: new ObjectId(),
      paymentId,
      transactionId,
      courseId,
      courseName,
      amount,
      currency: currency || "EGP",
      paymentMethod,
      userId,
      userName: userName || "Guest",
      userEmail: userEmail || "",
      userPhoneNumber,
      status: status || "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store payment in MongoDB
    await db.collection("payments").insertOne(payment);

    console.log("[v0] Payment recorded:", payment);

    return Response.json({
      success: true,
      payment: {
        id: payment.paymentId,
        ...payment
      },
      message:
        paymentMethod === "vodafone" && status === "pending"
          ? "Payment submitted. Waiting for admin confirmation."
          : "Payment processed successfully",
    });
  } catch (error) {
    console.error("[v0] Payment error:", error);
    return Response.json({ error: "Payment processing failed" }, { status: 500 });
  }
}
