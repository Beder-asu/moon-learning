# Moon Learning - MongoDB Setup Guide

## Database Connection

Your MongoDB cluster is now connected to Moon Learning. The platform uses MongoDB to manage all data including users, courses, videos, payments, and sessions.

### Environment Variables

Add your MongoDB URI to `.env.local`:

```
MONGODB_URI=mongodb+srv://mobeder888:MObeder88#@cluster0.uxdvs3j.mongodb.net/?appName=Cluster0
NEXT_PUBLIC_VODAFONE_NUMBER=+20100000000
NEXT_PUBLIC_SITE_NAME=Moon Learning
```

## Database Collections

The following collections are automatically created when the application initializes:

### 1. Users
Stores user account information, authentication, and course enrollments.
```javascript
{
  _id: ObjectId,
  email: String (unique),
  passwordHash: String,
  name: String,
  vodafoneNumber: String,
  enrolledCourses: [
    {
      courseId: String,
      enrolledAt: Date,
      accessLevel: String
    }
  ],
  role: String (user/admin),
  createdAt: Date
}
```

### 2. Courses
Stores course information and metadata.
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  instructor: String,
  price: Number,
  level: String,
  createdAt: Date
}
```

### 3. Levels
Stores course levels/chapters with progression order.
```javascript
{
  _id: ObjectId,
  courseId: String,
  title: String,
  order: Number,
  videoId: String,
  quizId: String,
  createdAt: Date
}
```

### 4. Videos
Stores video metadata and YouTube links.
```javascript
{
  _id: ObjectId,
  levelId: String,
  title: String,
  youtubeUrl: String,
  duration: Number,
  createdAt: Date
}
```

### 5. Quizzes
Stores quiz/test questions and answers.
```javascript
{
  _id: ObjectId,
  levelId: String,
  title: String,
  passingScore: Number (default: 51),
  questions: [
    {
      _id: ObjectId,
      question: String,
      options: [String],
      correctAnswers: [String]
    }
  ],
  createdAt: Date
}
```

### 6. Payments
Stores payment records for course purchases.
```javascript
{
  _id: ObjectId,
  paymentId: String,
  transactionId: String,
  userId: String,
  courseId: String,
  amount: Number,
  paymentMethod: String (vodafone),
  userPhoneNumber: String,
  status: String (pending/verified/rejected),
  createdAt: Date,
  verifiedAt: Date,
  verifiedBy: String
}
```

### 7. Sessions
Stores user session data for device restriction.
```javascript
{
  _id: ObjectId,
  userId: String,
  deviceInfo: {
    deviceId: String,
    screenResolution: String,
    timezone: String,
    platform: String
  },
  status: String (active/ended),
  startedAt: Date,
  endedAt: Date,
  lastActivity: Date
}
```

### 8. User Progress
Tracks user progress through videos and lessons.
```javascript
{
  _id: ObjectId,
  userId: String,
  videoId: String,
  courseId: String,
  levelId: String,
  viewCount: Number,
  maxViews: Number (default: 5),
  completed: Boolean,
  completedAt: Date,
  lastViewedAt: Date
}
```

### 9. Test Results
Stores quiz/test submission results.
```javascript
{
  _id: ObjectId,
  userId: String,
  courseId: String,
  levelId: String,
  score: Number,
  passed: Boolean,
  correctCount: Number,
  totalQuestions: Number,
  submittedAt: Date
}
```

### 10. Admin Logs
Tracks admin actions for audit purposes.
```javascript
{
  _id: ObjectId,
  action: String,
  userId: String,
  adminId: String,
  details: Object,
  timestamp: Date
}
```

## API Routes with MongoDB

All API routes have been updated to use MongoDB:

- **POST /api/payments** - Create payment record
- **POST /api/payments/verify** - Admin verifies and approves/rejects payment
- **POST /api/videos/track-view** - Track video views and enforce 5-view limit
- **POST /api/videos/increase-limit** - Admin increases view limit for user
- **POST /api/tests/submit** - Submit and auto-grade tests
- **POST /api/sessions/start** - Create user session with device detection
- **POST /api/sessions/check** - Check if session is active
- **POST /api/sessions/end** - End user session
- **POST /api/admin/courses** - Admin creates/edits courses
- **POST /api/admin/levels** - Admin creates/edits levels
- **POST /api/admin/videos** - Admin uploads video metadata
- **POST /api/admin/quizzes** - Admin creates quizzes

## Key Features

### Payment Verification
- Vodafone Cash payments are stored as "pending" initially
- Admin reviews pending payments in the dashboard
- Admin can approve (grants course access) or reject payments
- User receives status updates in real-time

### Video View Limiting
- Each user gets 5 free views per video
- Views are tracked in the `userProgress` collection
- Admin can increase limits for specific users
- All increases are logged in `adminLogs`

### Device Restriction
- Only one active session per user at a time
- Device info (screen resolution, timezone, platform) is captured
- Conflicts are detected and user is notified
- Previous sessions on the same device are ended

### Test Auto-Grading
- Quiz answers are stored in the Quizzes collection
- Tests are auto-graded with correct answers
- Passing score is 51% by default
- Passed levels unlock the next level automatically

### Admin Dashboard
- Admins can create courses, levels, videos, and quizzes directly
- All content is stored in MongoDB collections
- Admin actions are logged for audit trails

## Initialization

The MongoDB collections are automatically initialized on first connection via the `initializeCollections()` function in `/lib/mongodb.ts`. This function creates necessary indexes for optimal performance:

- `users.email` - Unique index for login
- `courses.title` - Index for course search
- `levels.courseId` - Index for fetching levels by course
- `videos.levelId` - Index for fetching videos by level
- `quizzes.levelId` - Index for fetching quizzes by level
- `payments.userId` and `payments.status` - For admin dashboard queries
- `sessions.userId` and `sessions.deviceId` - For device restriction
- `userProgress.userId, courseId` - For progress tracking

## Next Steps

1. Set your MongoDB URI in `.env.local`
2. Set your Vodafone number in `.env.local`
3. Deploy the application
4. The collections will be created and indexed automatically
5. Start adding courses through the admin dashboard
6. Users can begin enrolling and learning!
