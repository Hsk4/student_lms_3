"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { Board } from "@/app/models/Board";
import { Level } from "@/app/models/Level";
import { Subject } from "@/app/models/Subject";
import { Course } from "@/app/models/course";
import { Book } from "@/app/models/Book";
import { Material, type MaterialKind } from "@/app/models/Material";
import { Enrollment } from "@/app/models/Enrollment";
import { AuthError, requirePermission } from "@/lib/auth/guards";

type ActionResult<T = null> =
  | { success: true; data?: T }
  | { success: false; error: string };

function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* -------------------------------------------------------------------------- */
/*  Boards                                                                     */
/* -------------------------------------------------------------------------- */

export async function createBoard(data: {
  name: string;
  description?: string;
}): Promise<ActionResult<string>> {
  try {
    await requirePermission("course:manage", { fresh: true });
    const name = data.name?.trim();
    if (!name) throw new AuthError("Board name is required", 403);

    await connectToDatabase();
    const board = await Board.create({
      name,
      slug: slugify(name),
      description: data.description?.trim() || undefined,
    });

    revalidatePath("/admin/boards");
    revalidatePath("/admin/courses");
    return { success: true, data: board._id.toString() };
  } catch (error) {
    const message = toMessage(error, "Failed to create board");
    console.error("createBoard error:", message);
    return { success: false, error: message };
  }
}

export async function updateBoard(
  id: string,
  data: { name?: string; description?: string; isActive?: boolean },
): Promise<ActionResult> {
  try {
    await requirePermission("course:manage", { fresh: true });
    await connectToDatabase();

    const update: Record<string, unknown> = {};
    if (data.name?.trim()) {
      update.name = data.name.trim();
      update.slug = slugify(data.name);
    }
    if (data.description !== undefined)
      update.description = data.description.trim();
    if (data.isActive !== undefined) update.isActive = data.isActive;

    const board = await Board.findByIdAndUpdate(id, update, { new: true });
    if (!board) throw new AuthError("Board not found", 404);

    revalidatePath("/admin/boards");
    return { success: true };
  } catch (error) {
    const message = toMessage(error, "Failed to update board");
    return { success: false, error: message };
  }
}

export async function deleteBoard(id: string): Promise<ActionResult> {
  try {
    await requirePermission("course:manage", { fresh: true });
    await connectToDatabase();

    if (await Course.exists({ boardId: id })) {
      throw new AuthError("Delete the board's courses first", 403);
    }
    await Board.findByIdAndDelete(id);

    revalidatePath("/admin/boards");
    return { success: true };
  } catch (error) {
    const message = toMessage(error, "Failed to delete board");
    return { success: false, error: message };
  }
}

/* -------------------------------------------------------------------------- */
/*  Levels                                                                     */
/* -------------------------------------------------------------------------- */

export async function createLevel(data: {
  name: string;
  order?: number;
}): Promise<ActionResult<string>> {
  try {
    await requirePermission("course:manage", { fresh: true });
    const name = data.name?.trim();
    if (!name) throw new AuthError("Level name is required", 403);

    await connectToDatabase();
    const level = await Level.create({
      name,
      slug: slugify(name),
      order: Number.isFinite(data.order) ? Number(data.order) : 0,
    });

    revalidatePath("/admin/levels");
    revalidatePath("/admin/courses");
    return { success: true, data: level._id.toString() };
  } catch (error) {
    const message = toMessage(error, "Failed to create level");
    console.error("createLevel error:", message);
    return { success: false, error: message };
  }
}

export async function updateLevel(
  id: string,
  data: { name?: string; order?: number; isActive?: boolean },
): Promise<ActionResult> {
  try {
    await requirePermission("course:manage", { fresh: true });
    await connectToDatabase();

    const update: Record<string, unknown> = {};
    if (data.name?.trim()) {
      update.name = data.name.trim();
      update.slug = slugify(data.name);
    }
    if (data.order !== undefined) update.order = Number(data.order);
    if (data.isActive !== undefined) update.isActive = data.isActive;

    const level = await Level.findByIdAndUpdate(id, update, { new: true });
    if (!level) throw new AuthError("Level not found", 404);

    revalidatePath("/admin/levels");
    return { success: true };
  } catch (error) {
    const message = toMessage(error, "Failed to update level");
    return { success: false, error: message };
  }
}

export async function deleteLevel(id: string): Promise<ActionResult> {
  try {
    await requirePermission("course:manage", { fresh: true });
    await connectToDatabase();

    if (await Course.exists({ levelId: id })) {
      throw new AuthError("Delete the level's courses first", 403);
    }
    await Level.findByIdAndDelete(id);

    revalidatePath("/admin/levels");
    return { success: true };
  } catch (error) {
    const message = toMessage(error, "Failed to delete level");
    return { success: false, error: message };
  }
}

/* -------------------------------------------------------------------------- */
/*  Subjects                                                                   */
/* -------------------------------------------------------------------------- */

export async function createSubject(data: {
  name: string;
  description?: string;
}): Promise<ActionResult<string>> {
  try {
    await requirePermission("course:manage", { fresh: true });
    const name = data.name?.trim();
    if (!name) throw new AuthError("Subject name is required", 403);

    await connectToDatabase();
    const subject = await Subject.create({
      name,
      slug: slugify(name),
      description: data.description?.trim() || undefined,
    });

    revalidatePath("/admin/subjects");
    revalidatePath("/admin/courses");
    return { success: true, data: subject._id.toString() };
  } catch (error) {
    const message = toMessage(error, "Failed to create subject");
    console.error("createSubject error:", message);
    return { success: false, error: message };
  }
}

export async function updateSubject(
  id: string,
  data: { name?: string; description?: string; isActive?: boolean },
): Promise<ActionResult> {
  try {
    await requirePermission("course:manage", { fresh: true });
    await connectToDatabase();

    const update: Record<string, unknown> = {};
    if (data.name?.trim()) {
      update.name = data.name.trim();
      update.slug = slugify(data.name);
    }
    if (data.description !== undefined)
      update.description = data.description.trim();
    if (data.isActive !== undefined) update.isActive = data.isActive;

    const subject = await Subject.findByIdAndUpdate(id, update, { new: true });
    if (!subject) throw new AuthError("Subject not found", 404);

    revalidatePath("/admin/subjects");
    return { success: true };
  } catch (error) {
    const message = toMessage(error, "Failed to update subject");
    return { success: false, error: message };
  }
}

export async function deleteSubject(id: string): Promise<ActionResult> {
  try {
    await requirePermission("course:manage", { fresh: true });
    await connectToDatabase();

    if (await Course.exists({ subjectId: id })) {
      throw new AuthError("Delete the subject's courses first", 403);
    }
    await Subject.findByIdAndDelete(id);

    revalidatePath("/admin/subjects");
    return { success: true };
  } catch (error) {
    const message = toMessage(error, "Failed to delete subject");
    return { success: false, error: message };
  }
}

/* -------------------------------------------------------------------------- */
/*  Courses                                                                    */
/* -------------------------------------------------------------------------- */

export async function createCourse(data: {
  boardId: string;
  levelId: string;
  subjectId: string;
  medium?: string;
}): Promise<ActionResult<string>> {
  try {
    const ctx = await requirePermission("course:manage", { fresh: true });

    if (!data.boardId || !data.levelId || !data.subjectId) {
      throw new AuthError("Board, level and subject are required", 403);
    }

    await connectToDatabase();
    const [board, level, subject] = await Promise.all([
      Board.exists({ _id: data.boardId }),
      Level.exists({ _id: data.levelId }),
      Subject.exists({ _id: data.subjectId }),
    ]);
    if (!board || !level || !subject) {
      throw new AuthError("Board, level or subject not found", 404);
    }

    const course = await Course.create({
      boardId: data.boardId,
      levelId: data.levelId,
      subjectId: data.subjectId,
      medium: data.medium?.trim() || undefined,
      createdBy: ctx.userId,
    });

    revalidatePath("/admin/courses");
    return { success: true, data: course._id.toString() };
  } catch (error) {
    const message =
      (error as { code?: number })?.code === 11000
        ? "That course already exists"
        : toMessage(error, "Failed to create course");
    console.error("createCourse error:", message);
    return { success: false, error: message };
  }
}

export async function updateCourse(
  id: string,
  data: { medium?: string; isActive?: boolean },
): Promise<ActionResult> {
  try {
    await requirePermission("course:manage", { fresh: true });
    await connectToDatabase();

    const update: Record<string, unknown> = {};
    if (data.medium !== undefined) update.medium = data.medium.trim();
    if (data.isActive !== undefined) update.isActive = data.isActive;

    const course = await Course.findByIdAndUpdate(id, update, { new: true });
    if (!course) throw new AuthError("Course not found", 404);

    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    const message = toMessage(error, "Failed to update course");
    return { success: false, error: message };
  }
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  try {
    await requirePermission("course:manage", { fresh: true });
    await connectToDatabase();

    const course = await Course.findById(id);
    if (!course) throw new AuthError("Course not found", 404);

    await Enrollment.deleteMany({ courseId: id });
    await Material.deleteMany({ courseId: id });
    await Book.updateMany({ courseId: id }, { $unset: { courseId: 1 } });
    await Course.findByIdAndDelete(id);

    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    const message = toMessage(error, "Failed to delete course");
    return { success: false, error: message };
  }
}

/* -------------------------------------------------------------------------- */
/*  Books                                                                      */
/* -------------------------------------------------------------------------- */

export async function createBook(data: {
  title: string;
  author?: string;
  publisher?: string;
  courseId?: string;
  isbn?: string;
  edition?: string;
}): Promise<ActionResult<string>> {
  try {
    const ctx = await requirePermission("course:manage", { fresh: true });
    const title = data.title?.trim();
    if (!title) throw new AuthError("Book title is required", 403);

    await connectToDatabase();

    let refs: Record<string, unknown> = {};
    if (data.courseId) {
      const course = await Course.findById(data.courseId).lean();
      if (!course) throw new AuthError("Course not found", 404);
      refs = {
        courseId: course._id,
        boardId: course.boardId,
        levelId: course.levelId,
        subjectId: course.subjectId,
      };
    }

    const book = await Book.create({
      ...refs,
      title,
      author: data.author?.trim() || undefined,
      publisher: data.publisher?.trim() || undefined,
      isbn: data.isbn?.trim() || undefined,
      edition: data.edition?.trim() || undefined,
      createdBy: ctx.userId,
    });

    revalidatePath("/admin/books");
    return { success: true, data: book._id.toString() };
  } catch (error) {
    const message = toMessage(error, "Failed to create book");
    console.error("createBook error:", message);
    return { success: false, error: message };
  }
}

export async function deleteBook(id: string): Promise<ActionResult> {
  try {
    await requirePermission("course:manage", { fresh: true });
    await connectToDatabase();
    await Book.findByIdAndDelete(id);
    revalidatePath("/admin/books");
    return { success: true };
  } catch (error) {
    const message = toMessage(error, "Failed to delete book");
    return { success: false, error: message };
  }
}

/* -------------------------------------------------------------------------- */
/*  Materials (incl. past papers, replacing MockPaper)                         */
/* -------------------------------------------------------------------------- */

export async function createMaterial(data: {
  title: string;
  description?: string;
  kind: MaterialKind;
  courseId: string;
  fileUrl?: string;
  year?: number;
  solutionsUrl?: string;
}): Promise<ActionResult<string>> {
  try {
    const ctx = await requirePermission("course:manage", { fresh: true });
    if (!data.title?.trim() || !data.kind || !data.courseId) {
      throw new AuthError("Title, kind and course are required", 403);
    }

    await connectToDatabase();
    if (!(await Course.exists({ _id: data.courseId }))) {
      throw new AuthError("Course not found", 404);
    }

    const material = await Material.create({
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      kind: data.kind,
      courseId: data.courseId,
      fileUrl: data.fileUrl?.trim() || undefined,
      year: data.year,
      solutionsUrl: data.solutionsUrl?.trim() || undefined,
      createdBy: ctx.userId,
    });

    revalidatePath("/admin/materials");
    return { success: true, data: material._id.toString() };
  } catch (error) {
    const message = toMessage(error, "Failed to create material");
    console.error("createMaterial error:", message);
    return { success: false, error: message };
  }
}

export async function deleteMaterial(id: string): Promise<ActionResult> {
  try {
    await requirePermission("course:manage", { fresh: true });
    await connectToDatabase();
    await Material.findByIdAndDelete(id);
    revalidatePath("/admin/materials");
    return { success: true };
  } catch (error) {
    const message = toMessage(error, "Failed to delete material");
    return { success: false, error: message };
  }
}
