# MongoDB Implementation — Fastly LMS

## Connection

Single shared connection via `lib/db.ts` using `mongoose.connect()`. Called at the start of every server action and data-fetching component.

```ts
import { connectToDatabase } from "@/lib/db";
await connectToDatabase();
```

## Models

### Course (`app/models/course.ts`)

Represents an educational board with subjects.

```ts
interface IBoardDocument {
  board: string;           // "Sindh Board", "O Levels", etc.
  levelOrGrade: string;    // "Grade 9", "1st Year", etc.
  subjects: string[];      // ["Mathematics", "Physics", ...]
  orgId: string;           // Clerk organization ID (tenant)
  createdBy: string;       // Clerk user ID of admin
  assignedTeachers?: string[];
}
```

**Indexes**: `orgId` (for tenant scoping)

### Enrollment (`app/models/Enrollment.ts`)

Links users to courses with roles.

```ts
interface IEnrollment {
  userId: string;          // Clerk user ID
  courseId: Types.ObjectId;
  orgId: string;           // Clerk organization ID
  role: "student" | "teacher";
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}
```

**Indexes**: `{ orgId, courseId, userId }` (compound, unique per course)

### Submission (`app/models/Submission.ts`)

Student assignment submissions.

```ts
interface ISubmission {
  userId: string;          // Clerk user ID
  courseId: Types.ObjectId;
  orgId: string;           // Clerk organization ID
  title: string;
  content: string;
  fileUrl?: string;
  status: "pending" | "graded";
  grade?: string;
  feedback?: string;
  createdAt: Date;
}
```

## Common Query Patterns

### Tenant-Scoped Queries

Every query includes `orgId` for multi-tenancy:

```ts
// Find all courses for an org
const courses = await Course.find({ orgId }).lean();

// Find enrollments for a user in an org
const enrollments = await Enrollment.find({ userId, orgId, role: "student", status: "approved" })
  .populate("courseId")
  .lean();
```

### Aggregations

Dashboard stats use MongoDB aggregation pipeline:

```ts
// Course count by board
const courseGrowthByBoard = await Course.aggregate([
  { $match: { orgId } },
  { $group: { _id: "$board", courses: { $sum: 1 }, subjects: { $addToSet: "$subjects" } } },
  { $sort: { courses: -1 } },
  { $limit: 6 },
]);
```

### Populated Queries

Enrollments reference courses via ObjectId:

```ts
const enrollments = await Enrollment.find(filter)
  .populate("courseId")  // expands courseId to full Course document
  .lean();
```

### Error Handling

All model operations are wrapped in try/catch at the action level:

```ts
try {
  await connectToDatabase();
  const courses = await Course.find({ orgId }).lean();
  return { success: true, data: JSON.parse(JSON.stringify(courses)) };
} catch (error) {
  return { success: false, error: "Failed to load courses" };
}
```

## Data Serialization

Mongoose documents contain non-serializable types (ObjectId, Date). Always serialize before returning from server actions:

```ts
return JSON.parse(JSON.stringify(result));
```

## Migration Notes

- No migration framework — schema changes are additive
- New fields should have defaults or be optional
- Indexes created via `Schema.index()` calls in model files