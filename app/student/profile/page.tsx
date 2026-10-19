'use client';

import { useState } from 'react';
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { User, Mail, Phone, MapPin, Award, Shield, Save } from 'lucide-react';
import { mockProfile } from '@/data/mock-data';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(mockProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="My Profile"
        subtitle="Personal Information"
        description="Manage your student profile and account details."
        icon={<User className="w-6 h-6 text-teal-400" />}
      />

      {saved && (
        <GlassCard variant="default" className="border-emerald-400/30 bg-emerald-500/10">
          <p className="text-emerald-300 text-sm">✓ Profile updated successfully!</p>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Card */}
        <div className="space-y-6">
          <GlassCard variant="default" className="text-center p-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{profile.firstName.charAt(0)}</span>
            </div>
            <h2 className={cn("text-xl font-bold", glassTheme.text.primary)}>
              {profile.firstName} {profile.lastName}
            </h2>
            <p className={cn("text-sm", glassTheme.text.secondary, "mt-1")}>
              {profile.rollNumber}
            </p>
            <p className={cn("text-xs", glassTheme.text.muted, "mt-1")}>
              {profile.class} - {profile.section}
            </p>

            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className={glassTheme.text.secondary}>Batch</span>
                  <span className={cn("font-bold", glassTheme.text.primary)}>{profile.batch}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={glassTheme.text.secondary}>Joined</span>
                  <span className={cn("font-bold", glassTheme.text.primary)}>
                    {new Date(profile.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Academic Info */}
          <GlassCard variant="default">
            <h3 className={cn("font-bold mb-4 flex items-center gap-2", glassTheme.text.primary)}>
              <Shield className="w-4 h-4 text-teal-400" />
              Academic Status
            </h3>
            <div className="space-y-3">
              <div className={cn("p-3 rounded-lg", "bg-teal-500/20 border border-teal-400/30")}>
                <p className={cn("text-xs", glassTheme.text.secondary)}>Status</p>
                <p className={cn("font-bold", "text-emerald-300")}>Regular</p>
              </div>
              <div className={cn("p-3 rounded-lg", "bg-teal-500/20 border border-teal-400/30")}>
                <p className={cn("text-xs", glassTheme.text.secondary)}>Batch Year</p>
                <p className={cn("font-bold", glassTheme.text.primary)}>{profile.batch}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-2">
          <GlassCard variant="default" className="p-6">
            <h3 className={cn("text-lg font-bold mb-6", glassTheme.text.primary)}>
              Edit Profile Information
            </h3>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Personal Info */}
              <div>
                <h4 className={cn("text-sm font-bold mb-4 text-white")}>Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={cn("text-xs font-semibold mb-2 block", glassTheme.text.secondary)}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg backdrop-blur-md text-white",
                        glassTheme.bg.glass
                      )}
                    />
                  </div>
                  <div>
                    <label className={cn("text-xs font-semibold mb-2 block", glassTheme.text.secondary)}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg backdrop-blur-md text-white",
                        glassTheme.bg.glass
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className={cn("text-sm font-bold mb-4 text-white")}>Contact Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className={cn("text-xs font-semibold mb-2 block", glassTheme.text.secondary)}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className={cn(
                        "w-full px-3 py-2 rounded-lg backdrop-blur-md text-white/50",
                        glassTheme.bg.glass
                      )}
                    />
                  </div>
                  <div>
                    <label className={cn("text-xs font-semibold mb-2 block", glassTheme.text.secondary)}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg backdrop-blur-md text-white",
                        glassTheme.bg.glass
                      )}
                    />
                  </div>
                  <div>
                    <label className={cn("text-xs font-semibold mb-2 block", glassTheme.text.secondary)}>
                      Address
                    </label>
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg backdrop-blur-md text-white",
                        glassTheme.bg.glass
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Family Info */}
              <div>
                <h4 className={cn("text-sm font-bold mb-4 text-white")}>Family Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={cn("text-xs font-semibold mb-2 block", glassTheme.text.secondary)}>
                      Father&apos;s Name
                    </label>
                    <input
                      type="text"
                      value={profile.fatherName}
                      onChange={(e) => setProfile({ ...profile, fatherName: e.target.value })}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg backdrop-blur-md text-white",
                        glassTheme.bg.glass
                      )}
                    />
                  </div>
                  <div>
                    <label className={cn("text-xs font-semibold mb-2 block", glassTheme.text.secondary)}>
                      Mother&apos;s Name
                    </label>
                    <input
                      type="text"
                      value={profile.motherName}
                      onChange={(e) => setProfile({ ...profile, motherName: e.target.value })}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg backdrop-blur-md text-white",
                        glassTheme.bg.glass
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t border-white/10">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={cn(
                    glassTheme.button.primary,
                    "px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                  )}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
