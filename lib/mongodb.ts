import { MongoClient, ServerApiVersion, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // TLS options for better compatibility
  tls: true,
  tlsAllowInvalidCertificates: false,
  // Connection options
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set. Please add it to .env.local");
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(uri, options);
    await client.connect();
    const db = client.db("moonlearning");

    cachedClient = client;
    cachedDb = db;

    console.log("[v0] Connected to MongoDB");
    return { client, db };
  } catch (error) {
    console.error("[v0] MongoDB connection failed:", error);
    throw error;
  }
}

export async function getDatabase() {
  const { db } = await connectToDatabase();
  return db;
}

// Collection initializers with schema setup
export async function initializeCollections() {
  const db = await getDatabase();

  try {
    // Users collection
    await db.createCollection("users").catch(() => {
      /* collection already exists */
    });
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("users").createIndex({ vodafoneNumber: 1 });

    // Courses collection
    await db.createCollection("courses").catch(() => {
      /* collection already exists */
    });
    await db.collection("courses").createIndex({ title: 1 });

    // Levels collection
    await db.createCollection("levels").catch(() => {
      /* collection already exists */
    });
    await db.collection("levels").createIndex({ courseId: 1 });

    // Videos collection
    await db.createCollection("videos").catch(() => {
      /* collection already exists */
    });
    await db.collection("videos").createIndex({ levelId: 1 });

    // Quizzes collection
    await db.createCollection("quizzes").catch(() => {
      /* collection already exists */
    });
    await db.collection("quizzes").createIndex({ levelId: 1 });

    // Payments collection
    await db.createCollection("payments").catch(() => {
      /* collection already exists */
    });
    await db.collection("payments").createIndex({ userId: 1 });
    await db.collection("payments").createIndex({ status: 1 });

    // Sessions collection
    await db.createCollection("sessions").catch(() => {
      /* collection already exists */
    });
    await db.collection("sessions").createIndex({ userId: 1 });
    await db.collection("sessions").createIndex({ deviceId: 1 });

    // User progress collection
    await db.createCollection("userProgress").catch(() => {
      /* collection already exists */
    });
    await db.collection("userProgress").createIndex({ userId: 1, courseId: 1 });

    console.log("[v0] Collections initialized successfully");
  } catch (error) {
    console.error("[v0] Error initializing collections:", error);
  }
}
