import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set. Please add it to .env.local or set it in your environment.");
}
const DB_NAME = "moonlearning";

async function seedTestData() {
  const client = new MongoClient(MONGODB_URI as string);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    console.log("[v0] Starting test data seeding...");

    // Clear existing collections
    await db.collection("users").deleteMany({});
    await db.collection("courses").deleteMany({});
    await db.collection("levels").deleteMany({});
    await db.collection("videos").deleteMany({});
    await db.collection("quizzes").deleteMany({});
    await db.collection("payments").deleteMany({});
    await db.collection("sessions").deleteMany({});
    console.log("[v0] Cleared existing collections");

    // Hash passwords properly
    const studentPassword = await bcrypt.hash("password123", 12);
    const adminPassword = await bcrypt.hash("admin123", 12);

    // Create test users
    const testUser = {
      _id: new ObjectId(),
      email: "student@moonlearning.com",
      password: studentPassword,
      name: "Test Student",
      role: "student",
      vodafoneNumber: "201001234567",
      enrolledCourses: [] as string[],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const testAdmin = {
      _id: new ObjectId(),
      email: "admin@moonlearning.com",
      password: adminPassword,
      name: "Admin User",
      role: "admin",
      permissions: ["manage_courses", "manage_payments", "manage_users"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("users").insertMany([testUser, testAdmin]);
    console.log("[v0] Created test users");

    // Create test courses
    const course1Id = new ObjectId();
    const course2Id = new ObjectId();
    const course3Id = new ObjectId();
    const course4Id = new ObjectId();
    const course5Id = new ObjectId();
    const course6Id = new ObjectId();

    const testCourses = [
      {
        _id: course1Id,
        title: "Beginner Chess Fundamentals",
        description: "Learn the basics of chess including piece movement, opening principles, and basic tactics.",
        instructor: "Grandmaster Alex",
        price: 500,
        currency: "EGP",
        image: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=800",
        level: "Beginner",
        duration: "4 weeks",
        totalLevels: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: course2Id,
        title: "Intermediate Chess Strategy",
        description: "Master advanced tactical patterns, positional understanding, and endgame techniques.",
        instructor: "International Master Sarah",
        price: 750,
        currency: "EGP",
        image: "https://images.unsplash.com/photo-1586165368502-1bad197a6461?auto=format&fit=crop&q=80&w=800",
        level: "Intermediate",
        duration: "6 weeks",
        totalLevels: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: course3Id,
        title: "Advanced Chess Endgames",
        description: "Deep dive into complex endgame scenarios, pawn structures, and theoretical draws.",
        instructor: "Grandmaster Magnus",
        price: 1200,
        currency: "EGP",
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800",
        level: "Advanced",
        duration: "8 weeks",
        totalLevels: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: course4Id,
        title: "Chess Openings Masterclass",
        description: "Build a solid opening repertoire for both White and Black. Covers Ruy Lopez, Sicilian, and more.",
        instructor: "Grandmaster Hikaru",
        price: 900,
        currency: "EGP",
        image: "https://images.unsplash.com/photo-1452827073306-6e6e661baf57?auto=format&fit=crop&q=80&w=800",
        level: "Intermediate",
        duration: "5 weeks",
        totalLevels: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: course5Id,
        title: "Tactics and Calculation",
        description: "Improve your visualization skills and learn to calculate deep variations with precision.",
        instructor: "Grandmaster Fabiano",
        price: 800,
        currency: "EGP",
        image: "https://images.unsplash.com/photo-1580541832626-2a7131ee809f?auto=format&fit=crop&q=80&w=800",
        level: "Intermediate",
        duration: "6 weeks",
        totalLevels: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: course6Id,
        title: "Psychology of Competitive Chess",
        description: "Learn how to manage time pressure, handle losses, and stay focused during long tournaments.",
        instructor: "Dr. Chess Mind",
        price: 600,
        currency: "EGP",
        image: "https://images.unsplash.com/photo-1560174038-da43ac74f01b?auto=format&fit=crop&q=80&w=800",
        level: "All Levels",
        duration: "3 weeks",
        totalLevels: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await db.collection("courses").insertMany(testCourses);
    console.log("[v0] Created test courses");

    // Create test levels
    const level1_1 = new ObjectId();
    const level1_2 = new ObjectId();
    const level1_3 = new ObjectId();

    const testLevels = [
      {
        _id: level1_1,
        courseId: course1Id.toString(),
        title: "Understanding Chess Pieces",
        description: "Learn how each chess piece moves and captures.",
        orderNumber: 1,
        videoCount: 2,
        hasQuiz: true,
        createdAt: new Date(),
      },
      {
        _id: level1_2,
        courseId: course1Id.toString(),
        title: "Opening Principles",
        description: "Master the key principles of chess openings.",
        orderNumber: 2,
        videoCount: 3,
        hasQuiz: true,
        createdAt: new Date(),
      },
      {
        _id: level1_3,
        courseId: course1Id.toString(),
        title: "Basic Tactics",
        description: "Learn fundamental tactical patterns and techniques.",
        orderNumber: 3,
        videoCount: 2,
        hasQuiz: true,
        createdAt: new Date(),
      },
    ];

    await db.collection("levels").insertMany(testLevels);
    console.log("[v0] Created test levels");

    // Create test videos
    const testVideos = [
      {
        _id: new ObjectId(),
        levelId: level1_1.toString(),
        courseId: course1Id.toString(),
        title: "How Pawns Move",
        youtubeId: "dQw4w9WgXcQ",
        duration: "12:34",
        orderNumber: 1,
        description: "Understanding pawn movement and special rules.",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        levelId: level1_1.toString(),
        courseId: course1Id.toString(),
        title: "Knight and Bishop Basics",
        youtubeId: "dQw4w9WgXcQ",
        duration: "15:22",
        orderNumber: 2,
        description: "Learn how knights and bishops move across the board.",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        levelId: level1_2.toString(),
        courseId: course1Id.toString(),
        title: "Control the Center",
        youtubeId: "dQw4w9WgXcQ",
        duration: "18:45",
        orderNumber: 1,
        description: "Why controlling the center is crucial in chess openings.",
        createdAt: new Date(),
      },
    ];

    await db.collection("videos").insertMany(testVideos);
    console.log("[v0] Created test videos");

    // Create test quizzes
    const quiz1 = {
      _id: new ObjectId(),
      levelId: level1_1.toString(),
      courseId: course1Id.toString(),
      title: "Understanding Chess Pieces Quiz",
      passingScore: 51,
      questions: [
        {
          _id: new ObjectId(),
          text: "Which piece moves in an L-shape?",
          type: "multiple_choice",
          options: [
            { _id: new ObjectId(), text: "Pawn" },
            { _id: new ObjectId(), text: "Knight" },
            { _id: new ObjectId(), text: "Bishop" },
            { _id: new ObjectId(), text: "Rook" },
          ],
          correctAnswers: ["Knight"],
        },
        {
          _id: new ObjectId(),
          text: "Which pieces move diagonally? (Select all that apply)",
          type: "multiple_select",
          options: [
            { _id: new ObjectId(), text: "Bishop" },
            { _id: new ObjectId(), text: "Queen" },
            { _id: new ObjectId(), text: "King" },
            { _id: new ObjectId(), text: "Rook" },
          ],
          correctAnswers: ["Bishop", "Queen", "King"],
        },
      ],
      createdAt: new Date(),
    };

    await db.collection("quizzes").insertOne(quiz1);
    console.log("[v0] Created test quizzes");

    // Create a sample pending payment
    const pendingPayment = {
      _id: new ObjectId(),
      paymentId: "PAY_TEST_001",
      transactionId: "TXN_TEST_001",
      courseId: course1Id.toString(),
      amount: 500,
      paymentMethod: "vodafone",
      userId: "user_test_001",
      userPhoneNumber: "201001234567",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("payments").insertOne(pendingPayment);
    console.log("[v0] Created sample pending payment");

    console.log("\n========================================");
    console.log("TEST DATA SEEDING COMPLETE");
    console.log("========================================\n");

    console.log("STUDENT CREDENTIALS:");
    console.log("Email: student@moonlearning.com");
    console.log("Password: password123");
    console.log("Vodafone Number: 201001234567\n");

    console.log("ADMIN CREDENTIALS:");
    console.log("Email: admin@moonlearning.com");
    console.log("Password: admin123\n");

    console.log("TEST DATA CREATED:");
    console.log(`- ${testCourses.length} Test Courses`);
    console.log(`- ${testLevels.length} Test Levels`);
    console.log(`- ${testVideos.length} Test Videos`);
    console.log("- 1 Test Quiz");
    console.log("- 1 Sample Pending Payment (for testing Vodafone verification)\n");

    console.log("========================================\n");
  } catch (error) {
    console.error("[v0] Seeding error:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedTestData();
