import { requirePagePermission } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db";
import { Board } from "@/app/models/Board";
import { Course } from "@/app/models/course";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";
import { AddEntryForm } from "@/components/admin/add-entry-form";
import { DeleteEntryButton } from "@/components/admin/delete-entry-button";
import { createBoard, deleteBoard } from "@/app/actions/catalog";

export const instant = false;

export default async function AdminBoardsPage() {
  await requirePagePermission("course:manage", { fresh: true });

  await connectToDatabase();
  const [boards, counts] = await Promise.all([
    Board.find({}).sort({ name: 1 }).lean(),
    Course.aggregate<{ _id: unknown; n: number }>([
      { $group: { _id: "$boardId", n: { $sum: 1 } } },
    ]),
  ]);
  const courseCount = new Map(counts.map((c) => [String(c._id), c.n]));

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="Exam Boards"
        subtitle="Catalog"
        description="Boards students sit exams for. Courses are built from a board, a level and a subject."
        icon={<Building2 className="w-6 h-6 text-teal-400" />}
      />

      <AddEntryForm
        label="New Board"
        fields={[
          { name: "name", placeholder: "Board name" },
          { name: "description", placeholder: "Description (optional)" },
        ]}
        onSubmit={async (values) =>
          createBoard({ name: values.name, description: values.description })
        }
      />

      {boards.length === 0 ? (
        <GlassCard variant="default" className="py-16 text-center">
          <p className={glassTheme.text.secondary}>
            No boards yet — add your first one above.
          </p>
        </GlassCard>
      ) : (
        <GlassCard variant="default">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["Board", "Slug", "Description", "Courses", ""].map((h) => (
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
              {boards.map((board) => (
                <tr
                  key={String(board._id)}
                  className="border-b border-white/10 hover:bg-white/5"
                >
                  <td
                    className={cn(
                      "px-4 py-4 font-medium",
                      glassTheme.text.primary,
                    )}
                  >
                    {board.name}
                  </td>
                  <td
                    className={cn("px-4 py-4 text-xs", glassTheme.text.muted)}
                  >
                    {board.slug}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-4 text-xs",
                      glassTheme.text.secondary,
                    )}
                  >
                    {board.description || "—"}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-4 text-xs",
                      glassTheme.text.secondary,
                    )}
                  >
                    {courseCount.get(String(board._id)) ?? 0}
                  </td>
                  <td className="px-4 py-4">
                    <DeleteEntryButton
                      id={String(board._id)}
                      label={`board "${board.name}"`}
                      action={deleteBoard}
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
