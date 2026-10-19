import { requirePageRole } from "@/lib/auth/guards";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { User } from "lucide-react";

export const instant = false;

export default async function StudentProfilePage() {
  await requirePageRole(["student"]);

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="My Profile"
        subtitle="Personal Information"
        description="Manage your student profile and account details."
        icon={<User className="w-6 h-6 text-teal-400" />}
      />

      <GlassCard variant="default" className="text-center py-16">
        <p className={glassTheme.text.secondary}>
          Profile management coming in later phases
        </p>
      </GlassCard>
    </div>
  );
}
