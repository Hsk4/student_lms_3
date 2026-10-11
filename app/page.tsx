import Link from "next/link";
import { GraduationCap, BookOpen, Users, BarChart3, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100">
            <GraduationCap className="w-4 h-4" />
            <span>Multi-Tenant LMS for Educational Boards</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 max-w-4xl leading-tight">
            Streamline Learning Across <span className="text-emerald-600">All Educational Boards</span>
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl">
            A comprehensive platform for Sindh, Aga Khan, and O/A Level curricula. Manage courses, track attendance, and analyze student performance in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/sign-up/teacher">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                Join as Teacher
              </Button>
            </Link>
            <Link href="/sign-up/student">
              <Button size="lg" variant="outline" className="px-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                Join as Student
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400 rounded-full blur-[128px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400 rounded-full blur-[128px]" />
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-zinc-50 border-y border-zinc-100 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Curriculum Focused</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Tailored for regional boards (Sindh, Aga Khan) and international streams (O/A Levels) with specific module tracking.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 space-y-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Role-Based Access</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Strictly enforced portals for Admins, Teachers, and Students powered by Clerk B2B and Next.js Middleware.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 space-y-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Smart Analytics</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Draggable Bento-style dashboards provide real-time insights into enrollment and course completion metrics.
            </p>
          </div>
        </div>
      </section>

      {/* Footer / Call to action */}
      <footer className="py-10 border-t border-zinc-100 text-center">
        <p className="text-zinc-400 text-sm">© 2026 Student LMS. Built for Fastly Academic Excellence.</p>
      </footer>
    </div>
  );
}
