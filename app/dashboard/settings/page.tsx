'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Moon,
  Sun,
  Bell,
  Lock,
  CheckCircle2,
  Sparkles,
  Timer,
  RotateCcw,
} from 'lucide-react';
import { mockUserSettings } from '@/data/mock-data';
import { UserSettings } from '@/types/dashboard';

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(mockUserSettings);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  // Apply theme to <html> element whenever settings.theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [settings.theme]);

  // On first load, restore saved theme from localStorage (optional persistence)
  useEffect(() => {
    const savedTheme = localStorage.getItem('portal-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setSettings((prev) => ({ ...prev, theme: savedTheme }));
    }
  }, []);

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setSettings((prev) => ({ ...prev, theme }));
    localStorage.setItem('portal-theme', theme);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  const toggleSetting = (key: keyof UserSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert('Passwords do not match or cannot be empty');
      return;
    }
    setPasswordSuccess(true);
    setTimeout(() => {
      setPasswordSuccess(false);
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Settings & System Preferences"
        description="Customize portal visual themes, notification thresholds, academic privacy, and security."
      />

      {savedBanner && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-500/40 flex items-center gap-2 text-indigo-300 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Preference updated automatically and saved to local state.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance & Themes */}
        <Card className="border-indigo-500/15">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Interface Theme & Mode
            </CardTitle>
            <p className="text-xs text-slate-400">
              Select your preferred visual atmosphere for reading and working.
            </p>
          </CardHeader>
          <CardContent className="p-5 pt-2 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  settings.theme === 'dark'
                    ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-950/30'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Moon className="w-5 h-5 text-indigo-400" />
                  {settings.theme === 'dark' && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Midnight Cyber</p>
                  <p className="text-[11px] text-slate-400">Deep Navy & Neon Glow (Default)</p>
                </div>
              </button>

              <button
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  settings.theme === 'light'
                    ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-950/30'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Sun className="w-5 h-5 text-amber-400" />
                  {settings.theme === 'light' && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Daylight Paper</p>
                  <p className="text-[11px] text-slate-400">Soft High Contrast</p>
                </div>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Compact Navigation Mode</p>
                <p className="text-[11px] text-slate-400">Reduce padding for higher data density</p>
              </div>
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={() => toggleSetting('compactMode')}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-800"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications & Sound */}
        <Card className="border-indigo-500/15">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              Academic Notifications & Alerts
            </CardTitle>
            <p className="text-xs text-slate-400">
              Configure reminder notifications and audial triggers.
            </p>
          </CardHeader>
          <CardContent className="p-5 pt-2 divide-y divide-slate-800 space-y-3">
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs font-semibold text-slate-200">Email Digest & Alerts</p>
                <p className="text-[11px] text-slate-400">Receive morning summary of lectures and tasks</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => toggleSetting('emailNotifications')}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-800"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-semibold text-slate-200">Urgent Assignment Radar</p>
                <p className="text-[11px] text-slate-400">Flash alerts 48h and 12h before due timestamps</p>
              </div>
              <input
                type="checkbox"
                checked={settings.assignmentAlerts}
                onChange={() => toggleSetting('assignmentAlerts')}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-800"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-semibold text-slate-200">Interactive Sound Chimes</p>
                <p className="text-[11px] text-slate-400">Play subtle sound on assignment submission</p>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={() => toggleSetting('soundEffects')}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-800"
              />
            </div>
          </CardContent>
        </Card>

        {/* Study & Privacy Tools */}
        <Card className="border-indigo-500/15">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Timer className="w-4 h-4 text-purple-400" />
              Productivity & Academic Privacy
            </CardTitle>
            <p className="text-xs text-slate-400">
              Customize dashboard privacy and automated study assists.
            </p>
          </CardHeader>
          <CardContent className="p-5 pt-2 divide-y divide-slate-800 space-y-3">
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs font-semibold text-slate-200">Auto Pomodoro Study Timer</p>
                <p className="text-[11px] text-slate-400">Suggest 5-minute eye breaks after 50m of active work</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoStudyTimer}
                onChange={() => toggleSetting('autoStudyTimer')}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-800"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-semibold text-slate-200">Show CGPA In Header & Badges</p>
                <p className="text-[11px] text-slate-400">Hide GPA when presenting screen in study groups</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacyShowGPA}
                onChange={() => toggleSetting('privacyShowGPA')}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-800"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Authentication simulation */}
        <Card className="border-indigo-500/15">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Account Security & Password
            </CardTitle>
            <p className="text-xs text-slate-400">
              Manage your university login password and multi-factor authorization.
            </p>
          </CardHeader>
          <CardContent className="p-5 pt-2 space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span>Two-Factor Authentication (2FA)</span>
                <span className="text-emerald-400 font-bold">Enabled (Campus SSO)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Portal Password
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSettings(mockUserSettings);
                  localStorage.removeItem('portal-theme');
                }}
                className="text-xs text-slate-400"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset Defaults
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Update Portal Password"
        description="Set a strong cryptographic password for your student identity account."
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-2">
          {passwordSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Password updated successfully!</span>
            </div>
          ) : (
            <>
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Password
                </Button>
              </div>
            </>
          )}
        </form>
      </Modal>
    </div>
  );
}