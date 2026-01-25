# Moon Learning - Test Credentials

## Running the Seed Script

To populate your MongoDB with test data, run:

```bash
npx ts-node scripts/seed-test-data.ts
```

Make sure your `MONGODB_URI` environment variable is set in `.env.local` before running the script.

---

## Student Account

**Email:** `student@moonlearning.com`  
**Password:** `password123`  
**Vodafone Number:** `201001234567`

### What's Included:
- Access to test courses and levels
- Video view tracking (5-view limit)
- Ability to submit test quizzes
- Device session management

---

## Admin Account

**Email:** `admin@moonlearning.com`  
**Password:** `admin123`

### Admin Capabilities:
- View pending Vodafone Cash payments
- Approve/reject manual payments
- Create and manage courses
- Create and manage levels
- Upload videos
- Create quizzes
- Manage user accounts
- Increase video view limits for students
- View analytics and reports

---

## Test Data Created

### Courses
1. **Beginner Chess Fundamentals** (500 EGP)
   - 3 Levels with videos and quizzes
   
2. **Intermediate Chess Strategy** (750 EGP)
   - 4 Levels structure ready for content

### Sample Pending Payment
- **Payment ID:** `PAY_TEST_001`
- **Amount:** 500 EGP
- **Method:** Vodafone Cash
- **Status:** Pending (awaiting admin verification)
- **Student:** student@moonlearning.com
- **Phone:** 201001234567

### Test Levels & Content
- Level 1: Understanding Chess Pieces (2 videos + quiz)
- Level 2: Opening Principles (3 videos + quiz)
- Level 3: Basic Tactics (2 videos + quiz)

---

## Testing Workflow

### 1. Student Testing
1. Log in with student credentials
2. Browse courses on `/courses`
3. View course details on `/courses/[id]`
4. Watch videos (5-view limit enforced)
5. Complete quizzes to unlock next levels
6. Check device session management on `/protected`

### 2. Payment Testing
1. As student: Select a course and click "Enroll"
2. On checkout page: Choose Vodafone Cash
3. View platform's Vodafone number
4. Enter your phone number and click "Payment Done"
5. Payment will be marked as "pending"

### 3. Admin Testing
1. Log in with admin credentials
2. Go to `/admin` dashboard
3. Check "Pending Payments" tab
4. Verify the pending Vodafone payment
5. Click "Approve" to grant student access
6. Create new courses, levels, videos, and quizzes
7. Manage student accounts

---

## Database Collections

The seed script creates the following MongoDB collections:

- **users** - Student and admin accounts
- **courses** - Course information and pricing
- **levels** - Course levels/sections
- **videos** - Video content with YouTube integration
- **quizzes** - Quiz questions and correct answers
- **payments** - Payment records (pending, verified, rejected)
- **sessions** - User session tracking (device restriction)
- **userProgress** - Video views and level completion
- **testResults** - Quiz submission results
- **adminLogs** - Admin action audit trail

---

## Notes

- The seed script uses plain text passwords for testing only. In production, implement proper password hashing with bcrypt.
- The YouTube video IDs in test videos are placeholders. Replace with real video IDs.
- Test data can be cleared by running the seed script again (it clears all collections first).
- All timestamps use UTC time.

---

## Environment Setup

Make sure your `.env.local` file contains:

```
MONGODB_URI=mongodb+srv://mobeder888:MObeder88#@cluster0.uxdvs3j.mongodb.net/?appName=Cluster0
NEXT_PUBLIC_VODAFONE_NUMBER=+20100000000
```

Replace the Vodafone number with your actual platform's Vodafone number.
