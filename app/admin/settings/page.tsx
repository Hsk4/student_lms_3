import { requirePagePermission } from "@/lib/auth/guards";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { Settings, Bell, Lock, Users, FileText, Database } from "lucide-react";

export default async function AdminSettingsPage() {
  await requirePagePermission("user:manage", { fresh: true });

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="Settings"
        subtitle="Organization"
        description="Manage your organization settings, preferences, and configurations."
        icon={<Settings className="w-6 h-6 text-emerald-300" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Settings */}
        <GlassCard variant="default" className="lg:col-span-2">
          <h3 className={cn(glassTheme.typography.h4, glassTheme.text.primary, "mb-6")}>General Settings</h3>
          
          <div className="space-y-6">
            {/* Organization Name */}
            <div>
              <label className={cn("block text-sm font-medium mb-2", glassTheme.text.primary)}>
                Organization Name
              </label>
              <input
                type="text"
                placeholder="Your organization name"
                defaultValue="Fastly School"
                className={cn(
                  "w-full px-4 py-2.5 rounded-lg backdrop-blur-md",
                  "bg-white/10 border border-white/20 text-white placeholder:text-white/50",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
                )}
              />
            </div>

            {/* Organization Email */}
            <div>
              <label className={cn("block text-sm font-medium mb-2", glassTheme.text.primary)}>
                Organization Email
              </label>
              <input
                type="email"
                placeholder="admin@school.edu"
                defaultValue="admin@fastly.edu"
                className={cn(
                  "w-full px-4 py-2.5 rounded-lg backdrop-blur-md",
                  "bg-white/10 border border-white/20 text-white placeholder:text-white/50",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
                )}
              />
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-4">
              <button className={cn(
                glassTheme.button.primary,
                "px-6 py-2 rounded-lg font-semibold text-sm"
              )}>
                Save Changes
              </button>
              <button className={cn(
                glassTheme.button.glass,
                "px-6 py-2 rounded-lg font-semibold text-sm"
              )}>
                Cancel
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Settings Menu */}
        <div className="space-y-4">
          {[
            { icon: Bell, label: "Notifications", desc: "Email & alerts" },
            { icon: Lock, label: "Security", desc: "Password & 2FA" },
            { icon: Users, label: "Members", desc: "Invites & roles" },
            { icon: Database, label: "Data", desc: "Backups & exports" },
          ].map((item, i) => (
            <GlassCard key={i} variant="default">
              <div className="flex items-start gap-3 cursor-pointer">
                <item.icon className="w-5 h-5 text-emerald-300 mt-1" />
                <div className="flex-1">
                  <h4 className={cn("font-semibold text-sm", glassTheme.text.primary)}>{item.label}</h4>
                  <p className={cn("text-xs mt-1", glassTheme.text.muted)}>{item.desc}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <GlassCard variant="default" className={cn(
        "border-red-400/30 bg-red-500/10"
      )}>
        <h3 className={cn(glassTheme.typography.h4, "text-red-300", "mb-4")}>Danger Zone</h3>
        <p className={cn("text-sm mb-4", "text-red-200/70")}>
          These actions cannot be undone. Please be careful.
        </p>
        <div className="flex gap-3">
          <button className={cn(
            "px-6 py-2 rounded-lg font-semibold text-sm",
            "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-400/30 transition-all"
          )}>
            Delete Organization
          </button>
          <button className={cn(
            "px-6 py-2 rounded-lg font-semibold text-sm",
            "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-400/30 transition-all"
          )}>
            Export Data
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
