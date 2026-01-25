import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET all users
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get("role");

        const db = await getDatabase();
        const query: any = {};
        if (role) query.role = role;

        const users = await db.collection("users").find(query).sort({ createdAt: -1 }).toArray();

        const enrichedUsers = users.map((user) => ({
            id: user._id.toString(),
            email: user.email,
            name: user.name || "",
            role: user.role || "student",
            vodafoneNumber: user.vodafoneNumber || "",
            enrolledCourses: user.enrolledCourses || [],
            enrolledCount: (user.enrolledCourses || []).length,
            status: user.status || "Active",
            createdAt: user.createdAt,
        }));

        return Response.json({ success: true, users: enrichedUsers });
    } catch (error) {
        console.error("[v0] Error fetching users:", error);
        return Response.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

// POST create new user
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name, password, role, vodafoneNumber } = body;

        if (!email) {
            return Response.json({ error: "Email is required" }, { status: 400 });
        }

        const db = await getDatabase();

        // Check if user already exists
        const existingUser = await db.collection("users").findOne({ email });
        if (existingUser) {
            return Response.json({ error: "User with this email already exists" }, { status: 400 });
        }

        const user = {
            _id: new ObjectId(),
            email,
            name: name || "",
            password: password || "default_password", // In production, hash this
            role: role || "student",
            vodafoneNumber: vodafoneNumber || "",
            enrolledCourses: [],
            status: "Active",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.collection("users").insertOne(user);

        return Response.json({
            success: true,
            user: { ...user, id: user._id.toString(), password: undefined }
        });
    } catch (error) {
        console.error("[v0] Error creating user:", error);
        return Response.json({ error: "Failed to create user" }, { status: 500 });
    }
}

// PUT update user
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, email, name, role, vodafoneNumber, status, enrolledCourses } = body;

        if (!id) {
            return Response.json({ error: "User ID is required" }, { status: 400 });
        }

        const db = await getDatabase();
        const updateData: any = { updatedAt: new Date() };

        if (email !== undefined) updateData.email = email;
        if (name !== undefined) updateData.name = name;
        if (role !== undefined) updateData.role = role;
        if (vodafoneNumber !== undefined) updateData.vodafoneNumber = vodafoneNumber;
        if (status !== undefined) updateData.status = status;
        if (enrolledCourses !== undefined) updateData.enrolledCourses = enrolledCourses;

        const result = await db.collection("users").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        return Response.json({ success: true, message: "User updated" });
    } catch (error) {
        console.error("[v0] Error updating user:", error);
        return Response.json({ error: "Failed to update user" }, { status: 500 });
    }
}

// DELETE user
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return Response.json({ error: "User ID is required" }, { status: 400 });
        }

        const db = await getDatabase();

        const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        // Also delete user's sessions
        await db.collection("sessions").deleteMany({ userId: id });

        return Response.json({ success: true, message: "User deleted" });
    } catch (error) {
        console.error("[v0] Error deleting user:", error);
        return Response.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
