import { getCurrentUser } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
    try {
        const { user, payload } = await getCurrentUser(request);

        if (!user || !payload) {
            return Response.json({ error: "Not authenticated" }, { status: 401 });
        }

        return Response.json({
            success: true,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                vodafoneNumber: user.vodafoneNumber,
                enrolledCourses: user.enrolledCourses || [],
            },
        });
    } catch (error) {
        console.error("[v0] Get user error:", error);
        return Response.json({ error: "Failed to get user" }, { status: 500 });
    }
}
