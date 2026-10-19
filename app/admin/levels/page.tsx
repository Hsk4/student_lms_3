import { requirePagePermission } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db";
import { Level } from "@/app/models/Level";
import { Course } from "@/app/models/course";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";
import { AddEntryForm } from "@/components/admin/add-entry-form";
import { DeleteEntryButton } from "@/components/admin/delete-entry-button";
import { createLevel, deleteLevel } from "@/app/actions/catalog";

export const instant = false;

export default async function AdminLevelsPage() {
  await requirePagePermission("course:manage", { fresh: true });

  await connectToDatabase();
  const [levels, counts] = await Promise.all([
    Level.find({}).sort({ order: 1, name: 1 }).lean(),
    Course.aggregate<{ _id: unknown; n: number }>([
      { $group: { _id: "$levelId", n: { $sum: 1 } } },
    ]),
  ]);
  const courseCount = new Map(counts.map((c) => [String(c._id), c.n]));

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="Levels"
        subtitle="Catalog"
        description="Grades and years a student can be in (Grade 9, 1st Year, O Level, …)."
        icon={<Layers className="w-6 h-6 text-teal-400" />}
      />

      <AddEntryForm
        label="New Level"
        fields={[
          { name: "name", placeholder: "Level name" },
          { name: "order", placeholder: "Display order", type: "number" },
        ]}
        onSubmit={async (values) =>
          createLevel({
            name: values.name,
            order: values.order ? Number(values.order) : 0,
          })
        }
      />

      {levels.length === 0 ? (
        <GlassCard variant="default" className="py-16 text-center">
          <p className={glassTheme.text.secondary}>
            No levels yet — add your first one above.
          </p>
        </GlassCard>
      ) : (
        <GlassCard variant="default">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["Order", "Level", "Slug", "Courses", ""].map((h) => (
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
              {levels.map((level) => (
                <tr
                  key={String(level._id)}
                  className="border-b border-white/10 hover:bg-white/5"
                >
                  <td
                    className={cn("px-4 py-4 text-xs", glassTheme.text.muted)}
                  >
                    {level.order}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-4 font-medium",
                      glassTheme.text.primary,
                    )}
                  >
                    {level.name}
                  </td>
                  <td
                    className={cn("px-4 py-4 text-xs", glassTheme.text.muted)}
                  >
                    {level.slug}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-4 text-xs",
                      glassTheme.text.secondary,
                    )}
                  >
                    {courseCount.get(String(level._id)) ?? 0}
                  </td>
                  <td className="px-4 py-4">
                    <DeleteEntryButton
                      id={String(level._id)}
                      label={`level "${level.name}"`}
                      action={deleteLevel}
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
