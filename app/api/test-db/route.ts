import { getDatabase, initializeCollections } from "@/lib/mongodb";

export async function GET() {
    try {
        // Test the connection
        const db = await getDatabase();

        // Initialize collections if needed
        await initializeCollections();

        // Get list of collections
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        // Test inserting a document
        const testResult = await db.collection("connection_tests").insertOne({
            testTime: new Date(),
            status: "success"
        });

        return Response.json({
            success: true,
            message: "MongoDB connected successfully!",
            database: "moonlearning",
            collections: collectionNames,
            testInsertId: testResult.insertedId.toString()
        });
    } catch (error: any) {
        console.error("[v0] MongoDB connection test failed:", error);
        return Response.json({
            success: false,
            error: error.message || "Connection failed"
        }, { status: 500 });
    }
}
