/**
 * Drops the catalog/transaction collections and re-seeds a single-school
 * catalog: boards, levels, subjects, courses and a few recommended books.
 *
 *   npx tsx scripts/reset-catalog.ts            # wipe + seed
 *   npx tsx scripts/reset-catalog.ts --seed-only
 *
 * Safe to re-run. Never touches the User/AuditLog collections.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";
import dns from "node:dns";
import mongoose from "mongoose";

// Load .env.local — these scripts run outside Next.js.
try {
  for (const line of readFileSync(resolve(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
    }
  }
} catch {
  // .env.local is optional; variables may come from the shell.
}

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("MONGODB_URI is not set.");
  process.exit(1);
}

function srvHostsViaNslookup(host: string): string[] {
  const output = execSync(`nslookup -type=SRV _mongodb._tcp.${host}`, {
    encoding: "utf8",
    windowsHide: true,
  });
  return [...output.matchAll(/svr hostname\s*=\s*(\S+)/g)].map((m) => m[1]);
}

/**
 * Node's DNS resolver sometimes cannot reach the router's resolver, which
 * breaks mongodb+srv lookups. Fall back to the OS resolver via nslookup and
 * connect to the shard hosts directly.
 */
async function mongoUriWithFallback(uri: string): Promise<string> {
  if (!uri.startsWith("mongodb+srv://")) return uri;

  try {
    await dns.promises.resolveSrv(`_mongodb._tcp.${new URL(uri).hostname}`);
    return uri;
  } catch {
    const host = new URL(uri).hostname;
    const hosts = srvHostsViaNslookup(host);
    if (hosts.length === 0) throw new Error(`Could not resolve SRV records for ${host}`);

    const base = uri.replace(`mongodb+srv://${host}`, "");
    const queryIndex = base.indexOf("?");
    const authority = queryIndex >= 0 ? base.slice(0, queryIndex) : base;
    const params = queryIndex >= 0 ? base.slice(queryIndex + 1) : "retryWrites=true&w=majority";
    const [credentials, dbName = ""] = authority.replace(/\/$/, "").split("/");

    // mongodb://user:pass@host1:27017,host2:27017/db?params
    const hostList = hosts.map((h) => `${h}:27017`).join(",");
    const direct = `mongodb://${credentials}${credentials ? "@" : ""}${hostList}/${dbName}?tls=true&${params}`;
    console.log(`[db] SRV fallback in use -> ${hostList}`);
    return direct;
  }
}

async function main() {
await mongoose.connect(await mongoUriWithFallback(MONGO_URI!));

const db = mongoose.connection.db;
if (!db) {
  console.error("No database connection.");
  process.exit(1);
}

const seedOnly = process.argv.includes("--seed-only");
const WIPE = [
  "courses",
  "enrollments",
  "assignments",
  "submissions",
  "mockpapers",
  "materials",
  "books",
  "boards",
  "levels",
  "subjects",
];

if (!seedOnly) {
  for (const name of WIPE) {
    const exists = await db.listCollections({ name }).toArray();
    if (exists.length > 0) {
      await db.collection(name).deleteMany({});
      console.log(`emptied ${name}`);
    }
  }
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function seedCollection(
  database: NonNullable<typeof db>,
  name: string,
  docs: Record<string, unknown>[],
  key: string,
) {
  const collection = database.collection(name);
  const ids = new Map<string, mongoose.Types.ObjectId>();

  for (const doc of docs) {
    const result = await collection.updateOne(
      { [key]: doc[key] },
      { $set: { ...doc, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );

    const filter =
      result.upsertedId ?? (await collection.findOne({ [key]: doc[key] }, { projection: { _id: 1 } }))?._id;
    if (filter) ids.set(String(doc[key]), filter as mongoose.Types.ObjectId);

    if (result.upsertedCount) console.log(`  + ${name}: ${doc[key]}`);
  }
  return ids;
}

const boardIds = await seedCollection(
  db,
  "boards",
  [
    { name: "Sindh Board", slug: slugify("Sindh Board"), isActive: true },
    { name: "Aga Khan Board", slug: slugify("Aga Khan Board"), isActive: true },
    { name: "Federal Board", slug: slugify("Federal Board"), isActive: true },
  ],
  "slug",
);

const levelIds = await seedCollection(
  db,
  "levels",
  [
    { name: "Grade 8", slug: "grade-8", order: 8, isActive: true },
    { name: "Grade 9", slug: "grade-9", order: 9, isActive: true },
    { name: "Grade 10", slug: "grade-10", order: 10, isActive: true },
    { name: "1st Year", slug: "1st-year", order: 11, isActive: true },
    { name: "2nd Year", slug: "2nd-year", order: 12, isActive: true },
  ],
  "slug",
);

const subjectIds = await seedCollection(
  db,
  "subjects",
  [
    { name: "Mathematics", slug: "mathematics", isActive: true },
    { name: "Physics", slug: "physics", isActive: true },
    { name: "Chemistry", slug: "chemistry", isActive: true },
    { name: "Biology", slug: "biology", isActive: true },
    { name: "English", slug: "english", isActive: true },
    { name: "Computer Science", slug: "computer-science", isActive: true },
    { name: "Accounting", slug: "accounting", isActive: true },
    { name: "Economics", slug: "economics", isActive: true },
  ],
  "slug",
);

/** board + level + subject combinations with no teacher yet. */
const COMBOS: [board: string, level: string, subjects: string[]][] = [
  [
    "sindh-board",
    "grade-9",
    ["mathematics", "physics", "chemistry", "english"],
  ],
  ["sindh-board", "grade-10", ["mathematics", "biology", "computer-science"]],
  ["aga-khan-board", "grade-9", ["mathematics", "english", "biology"]],
  ["federal-board", "1st-year", ["physics", "chemistry", "mathematics"]],
  ["federal-board", "2nd-year", ["accounting", "economics"]],
];

const system = "seed-script";
const createdAt = new Date();
for (const [board, level, subjects] of COMBOS) {
  for (const subject of subjects) {
    await db.collection("courses").updateOne(
      {
        boardId: boardIds.get(board),
        levelId: levelIds.get(level),
        subjectId: subjectIds.get(subject),
        medium: "English",
      },
      {
        $setOnInsert: {
          boardId: boardIds.get(board),
          levelId: levelIds.get(level),
          subjectId: subjectIds.get(subject),
          medium: "English",
          isActive: true,
          createdBy: system,
          createdAt,
          updatedAt: createdAt,
        },
      },
      { upsert: true },
    );
  }
}
console.log(
  `  + courses: ${COMBOS.reduce((n, c) => n + c[2].length, 0)} combinations`,
);

const firstCourse = await db.collection("courses").findOne({});

if (firstCourse) {
  await db.collection("books").updateOne(
    { title: "Mathematics 9 — Punjab Textbook" },
    {
      $set: {
        title: "Mathematics 9 — Punjab Textbook",
        author: "Punjab Textbook Board",
        publisher: "PTB",
        courseId: firstCourse._id,
        boardId: firstCourse.boardId,
        levelId: firstCourse.levelId,
        subjectId: firstCourse.subjectId,
        isRecommended: true,
        createdBy: system,
        createdAt,
        updatedAt: createdAt,
      },
    },
    { upsert: true },
  );

  await db.collection("books").updateOne(
    { title: "Oxford Secondary Science" },
    {
      $set: {
        title: "Oxford Secondary Science",
        author: "N. Ahmed",
        publisher: "Oxford University Press",
        isRecommended: true,
        createdBy: system,
        createdAt,
        updatedAt: createdAt,
      },
    },
    { upsert: true },
  );
  console.log("  + books: 2");
}

console.log("\nCatalog reset complete.");
await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
