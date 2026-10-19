'use client';

import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { Calendar, Clock, MapPin } from 'lucide-react';
import { mockTimetable } from '@/data/mock-data';

export default function StudentTimetablePage() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  // Group timetable by day (for demo, we'll repeat the mock data)
  const timetableByDay = days.reduce((acc, day) => {
    acc[day] = mockTimetable;
    return acc;
  }, {} as Record<string, typeof mockTimetable>);

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="Weekly Timetable"
        subtitle="Schedule Management"
        description="View your complete class schedule for the week."
        icon={<Calendar className="w-6 h-6 text-teal-400" />}
      />

      {/* Days Tabs */}
      <div className="space-y-6">
        {days.map((day) => (
          <div key={day} className="space-y-4">
            <h2 className={cn("text-xl font-bold", glassTheme.text.primary)}>{day}</h2>

            <div className="space-y-3">
              {timetableByDay[day].map((item) => (
                <GlassCard key={item.id} variant="default" className={glassTheme.hover.tealCard}>
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "px-4 py-3 rounded-lg font-bold text-center min-w-max",
                      "bg-teal-500/20 border border-teal-400/30 text-teal-300"
                    )}>
                      <div className="text-sm">{item.time.split(' - ')[0]}</div>
                      <div className="text-xs text-teal-200">{item.time.split(' - ')[1]}</div>
                    </div>

                    <div className="flex-1">
                      <h3 className={cn("font-bold text-lg", glassTheme.text.primary)}>
                        {item.course}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-4 h-4 text-teal-400" />
                          <span className={glassTheme.text.secondary}>{item.room}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="w-4 h-4 text-teal-400" />
                          <span className={glassTheme.text.secondary}>{item.instructor}</span>
                        </div>
                      </div>
                    </div>

                    <div className={cn(
                      "px-3 py-1 rounded-lg text-xs font-semibold",
                      item.status === 'ongoing'
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                    )}>
                      {item.status === 'ongoing' ? 'Now' : 'Upcoming'}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
