import { requirePagePermission } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db";
import { Book } from "@/app/models/Book";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { Library } from "lucide-react";
import { AddEntryForm } from "@/components/admin/add-entry-form";
import { DeleteEntryButton } from "@/components/admin/delete-entry-button";
import { createBook, deleteBook } from "@/app/actions/catalog";
import { Course } from "@/app/models/course";

export const instant = false;

export default async function AdminBooksPage() {
  await requirePagePermission("course:manage", { fresh: true });

  await connectToDatabase();
  const [books, courses] = await Promise.all([
    Book.find({})
      .populate("courseId", "medium")
      .populate("boardId", "name")
      .populate("levelId", "name")
      .populate("subjectId", "name")
      .sort({ title: 1 })
      .lean(),
    Course.find({})
      .populate("boardId", "name")
      .populate("levelId", "name")
      .populate("subjectId", "name")
      .lean(),
  ]);

  const courseOptions = courses.map((c: any) => ({
    id: String(c._id),
    label: `${c.boardId?.name ?? "?"} · ${c.levelId?.name ?? "?"} · ${c.subjectId?.name ?? "?"}${
      c.medium ? ` (${c.medium})` : ""
    }`,
  }));

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="Recommended Books"
        subtitle="Catalog"
        description="Courseware students buy themselves. No prices or payments are stored here."
        icon={<Library className="w-6 h-6 text-teal-400" />}
      />

      <AddEntryForm
        label="New Book"
        fields={[
          { name: "title", placeholder: "Book title" },
          { name: "author", placeholder: "Author (optional)" },
          { name: "publisher", placeholder: "Publisher (optional)" },
          { name: "courseLabel", placeholder: "Course id (see table below)" },
        ]}
        onSubmit={async (values) =>
          createBook({
            title: values.title,
            author: values.author,
            publisher: values.publisher,
            courseId: values.courseLabel?.trim() || undefined,
          })
        }
      />

      {courseOptions.length > 0 && (
        <GlassCard variant="default">
          <p
            className={cn(
              "mb-3 text-xs font-semibold uppercase tracking-wider",
              glassTheme.text.secondary,
            )}
          >
            Course ids
          </p>
          <ul className="grid gap-1 text-xs md:grid-cols-2">
            {courseOptions.map((c) => (
              <li key={c.id} className={glassTheme.text.secondary}>
                <code className="rounded bg-black/30 px-1.5 py-0.5 text-teal-300">
                  {c.id}
                </code>{" "}
                {c.label}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {books.length === 0 ? (
        <GlassCard variant="default" className="py-16 text-center">
          <p className={glassTheme.text.secondary}>No recommended books yet.</p>
        </GlassCard>
      ) : (
        <GlassCard variant="default">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {[
                  "Title",
                  "Author",
                  "Publisher",
                  "Board / Level / Subject",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className={cn(
                      "px-4 py-3 text-left font-semibold",
                      glassTheme.text.secondary,
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {books.map((book: any) => (
                <tr
                  key={String(book._id)}
                  className="border-b border-white/10 hover:bg-white/5"
                >
                  <td
                    className={cn(
                      "px-4 py-4 font-medium",
                      glassTheme.text.primary,
                    )}
                  >
                    {book.title}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-4 text-xs",
                      glassTheme.text.secondary,
                    )}
                  >
                    {book.author || "—"}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-4 text-xs",
                      glassTheme.text.secondary,
                    )}
                  >
                    {book.publisher || "—"}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-4 text-xs",
                      glassTheme.text.secondary,
                    )}
                  >
                    {[
                      book.boardId?.name,
                      book.levelId?.name,
                      book.subjectId?.name,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-4">
                    <DeleteEntryButton
                      id={String(book._id)}
                      label={`book "${book.title}"`}
                      action={deleteBook}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}
    </div>
  );
}
