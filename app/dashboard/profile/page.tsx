'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  Calendar,
  Save,
  CheckCircle2,
  ShieldCheck,
  Award,
  Sparkles,
} from 'lucide-react';
import { mockStudentProfile } from '@/data/mock-data';
import { StudentProfile } from '@/types/dashboard';

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile>(mockStudentProfile);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    field: keyof StudentProfile,
    value: string | number
  ) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsSaved(false);
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!profile.name.trim()) newErrors.name = 'Name cannot be empty';
    if (!profile.phone.trim()) newErrors.phone = 'Phone number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Student Profile & Identification"
        description="Manage your institutional personal details, emergency contact information, and academic registry."
        badge={profile.rollNumber}
      />

      {/* Success Banner */}
      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3 text-emerald-300 text-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Profile changes saved successfully! Local record updated.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student ID Card & Key Credentials */}
        <div className="space-y-6">
          <Card glow className="p-6 border-indigo-500/25 bg-gradient-to-b from-slate-900/90 to-indigo-950/40 text-center flex flex-col items-center">
            {/* High-tech Avatar */}
            <div className="relative mb-4">
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[2px] shadow-2xl shadow-indigo-600/40">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center font-extrabold text-2xl text-white">
                  {profile.avatar}
                </div>
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-slate-950" />
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight">{profile.name}</h2>
            <p className="text-xs font-mono text-cyan-300 mt-1">{profile.rollNumber}</p>
            <p className="text-xs text-slate-400 mt-1">{profile.degree}</p>

            <div className="flex items-center gap-2 mt-4">
              <Badge variant="cyan">Semester {profile.semester}</Badge>
              <Badge variant="success">CGPA {profile.cgpa}</Badge>
            </div>

            <div className="w-full mt-6 pt-5 border-t border-slate-800 space-y-3 text-left text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Department</span>
                <span className="font-semibold text-slate-200 text-right">
                  {profile.department}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Faculty Advisor</span>
                <span className="font-semibold text-slate-200">{profile.advisorName}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Enrolled Year</span>
                <span className="font-semibold text-slate-200">{profile.enrolledYear}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Academic Status</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active Regular
                </span>
              </div>
            </div>
          </Card>

          {/* Academic Honors Card */}
          <Card className="p-5 border-indigo-500/15">
            <div className="flex items-center gap-2 mb-3 text-indigo-300 font-bold text-sm">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Honors & Recognitions</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                Dean&apos;s Honor Roll — Terms 1, 2, 3, 4
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                Undergraduate Systems Fellowship Recipient
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                University Hackathon 1st Place (Autonomous Agents)
              </li>
            </ul>
          </Card>
        </div>

        {/* Right 2 Columns: Editable Form */}
        <div className="lg:col-span-2">
          <Card className="p-6 border-indigo-500/15">
            <CardHeader className="p-0 pb-5 border-b border-slate-800">
              <CardTitle className="text-lg text-white">Edit Student Information</CardTitle>
              <p className="text-xs text-slate-400">
                Keep your correspondence address and contact details up to date.
              </p>
            </CardHeader>

            <form onSubmit={handleSave} className="space-y-5 pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                  icon={<User className="w-4 h-4" />}
                />

                <Input
                  label="Institutional Email (Immutable)"
                  value={profile.email}
                  disabled
                  icon={<Mail className="w-4 h-4" />}
                />

                <Input
                  label="Primary Phone"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={errors.phone}
                  icon={<Phone className="w-4 h-4" />}
                />

                <Input
                  label="Roll / Registration Number"
                  value={profile.rollNumber}
                  disabled
                  icon={<GraduationCap className="w-4 h-4" />}
                />
              </div>

              <Input
                label="Campus Residential Address"
                value={profile.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                icon={<MapPin className="w-4 h-4" />}
              />

              <Textarea
                label="Academic Bio & Research Focus"
                rows={3}
                value={profile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
              />

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">
                    Faculty Advisor Endorsement
                  </span>
                  <Badge variant="cyan">Verified</Badge>
                </div>
                <p className="text-xs text-slate-400">
                  Your academic records are overseen by <strong>{profile.advisorName}</strong>.
                  For course drops, add-forms, or major specializations, consult your advisor during office hours.
                </p>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-800">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  className="px-6"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
