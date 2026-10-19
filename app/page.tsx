import Link from "next/link";
import { GraduationCap, BookOpen, Users, BarChart3, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { appRoleFromClerkRole, isClerkOrgRole } from "@/lib/auth/roles";

async function NavigationButtons() {
  const { userId, orgRole } = await auth();
  const normalizedRole = isClerkOrgRole(orgRole) ? orgRole : null;
  const role = appRoleFromClerkRole(normalizedRole);

  // If signed in, show dashboard link
  if (userId && role) {
    const dashboardLink = role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/student';
    return (
      <div className="flex gap-3">
        <Link href={dashboardLink}>
          <button className={cn(
            "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
            glassTheme.button.primary
          )}>
            Go to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  // If pending, show pending page
  if (userId && !role) {
    return (
      <div className="flex gap-3">
        <Link href="/auth/pending">
          <button className={cn(
            "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
            glassTheme.button.primary
          )}>
            Complete Setup
          </button>
        </Link>
      </div>
    );
  }

  // If not signed in, show sign-in/sign-up
  return (
    <div className="flex gap-3">
      <Link href="/sign-in">
        <button className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", glassTheme.text.secondary, "hover:text-white")}>
          Sign In
        </button>
      </Link>
      <Link href="/sign-up">
        <button className="px-6 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all">
          Get Started
        </button>
      </Link>
    </div>
  );
}

export default function Home() {
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 overflow-hidden")}>
      {/* Animated background blurs */}
      <div className="fixed inset-0 -z-40 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Navigation */}
      <nav className={cn("fixed top-0 w-full backdrop-blur-xl border-b z-50", glassTheme.bg.glass)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg group-hover:shadow-xl transition-all">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className={cn("font-bold text-lg hidden sm:inline", glassTheme.text.primary)}>Fastly LMS</span>
          </Link>

          <Suspense fallback={
            <div className="flex gap-3">
              <Link href="/sign-in">
                <button className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", glassTheme.text.secondary, "hover:text-white")}>
                  Sign In
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="px-6 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all">
                  Get Started
                </button>
              </Link>
            </div>
          }>
            <NavigationButtons />
          </Suspense>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Badge */}
              <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md", glassTheme.bg.glass, "w-fit")}>
                <Zap className="w-4 h-4 text-amber-300" />
                <span className={cn("text-xs font-semibold", glassTheme.text.secondary)}>
                  🚀 Launch Your Learning Platform
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-2">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight">
                  <span className={glassTheme.text.primary}>Streamline</span>
                  <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 text-transparent bg-clip-text">
                    Learning Across
                  </span>
                  <br />
                  <span className={glassTheme.text.primary}>All Boards</span>
                </h1>
              </div>

              {/* Subheading */}
              <p className={cn("text-lg leading-relaxed max-w-xl", glassTheme.text.secondary)}>
                A comprehensive LMS built for educational institutions. Support Sindh, Aga Khan, and O/A Level curricula with advanced analytics and role-based access.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/sign-up" className="group">
                  <button className={cn(
                    "w-full sm:w-auto px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all",
                    "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
                    "hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl"
                  )}>
                    Create Account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <button className={cn(
                  "px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all",
                  "backdrop-blur-md border",
                  glassTheme.bg.glass, glassTheme.hover.glass,
                  glassTheme.text.primary
                )}>
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 pt-8">
                {[
                  { icon: Users, text: "One School, Multiple Roles" },
                  { icon: GraduationCap, text: "50K+ Students" },
                  { icon: BarChart3, text: "Real-time Analytics" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <item.icon className="w-5 h-5 text-emerald-400" />
                    <span className={cn("text-sm font-medium", glassTheme.text.secondary)}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Feature Cards */}
            <div className="relative h-96 lg:h-full">
              <div className="absolute inset-0 space-y-4">
                {[
                  {
                    title: "Multi-Board Support",
                    desc: "Sindh, Aga Khan, O/A Levels",
                    icon: BookOpen,
                    color: "from-emerald-500/20 to-emerald-600/20",
                    border: "border-emerald-400/30",
                  },
                  {
                    title: "Role-Based Access",
                    desc: "Admin, Teacher, Student portals",
                    icon: ShieldCheck,
                    color: "from-blue-500/20 to-blue-600/20",
                    border: "border-blue-400/30",
                  },
                  {
                    title: "Live Dashboards",
                    desc: "Drag-and-drop customization",
                    icon: BarChart3,
                    color: "from-purple-500/20 to-purple-600/20",
                    border: "border-purple-400/30",
                  },
                ].map((feature, i) => (
                  <div
                    key={i}
                    className={cn(
                      "group p-4 rounded-xl backdrop-blur-xl border transition-all hover:shadow-xl cursor-pointer",
                      `bg-gradient-to-br ${feature.color}`,
                      feature.border,
                      "hover:border-opacity-100 border-opacity-50"
                    )}
                  >
                    <div className="flex gap-3 items-start">
                      <feature.icon className="w-5 h-5 mt-1 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <h3 className={cn("font-semibold text-sm", glassTheme.text.primary)}>{feature.title}</h3>
                        <p className={cn("text-xs mt-1", glassTheme.text.muted)}>{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className={cn("text-4xl sm:text-5xl font-black", glassTheme.text.primary)}>
              Why Choose Fastly LMS?
            </h2>
            <p className={cn("text-lg max-w-2xl mx-auto", glassTheme.text.secondary)}>
              Built with educators and students in mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Curriculum Focused",
                desc: "Tailored for regional boards with specific module tracking",
              },
              {
                icon: ShieldCheck,
                title: "Role-Based Access",
                desc: "Admin, Teacher, and Student portals with strict permissions",
              },
              {
                icon: BarChart3,
                title: "Smart Analytics",
                desc: "Real-time dashboards and performance insights",
              },
              {
                icon: Users,
                title: "Easy Onboarding",
                desc: "Simple sign-up with admin role assignment",
              },
              {
                icon: Zap,
                title: "Fast & Reliable",
                desc: "Built on Next.js and Clerk for performance",
              },
              {
                icon: CheckCircle2,
                title: "Enterprise Ready",
                desc: "Single organization model with admin-controlled access",
              },
            ].map((feature, i) => (
              <div key={i} className={cn("group p-6 rounded-xl backdrop-blur-xl border transition-all hover:shadow-xl", glassTheme.bg.card)}>
                <div className="mb-4 p-3 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 w-fit border border-emerald-400/30 group-hover:border-emerald-400/60 transition-colors">
                  <feature.icon className="w-6 h-6 text-emerald-300" />
                </div>
                <h3 className={cn("text-lg font-bold mb-2", glassTheme.text.primary)}>{feature.title}</h3>
                <p className={cn("text-sm", glassTheme.text.secondary)}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className={cn("p-12 rounded-2xl backdrop-blur-xl border text-center space-y-6", glassTheme.bg.card)}>
            <h2 className={cn("text-4xl sm:text-5xl font-black", glassTheme.text.primary)}>
              Ready to Transform Education?
            </h2>
            <p className={cn("text-lg", glassTheme.text.secondary)}>
              Join thousands of educational institutions using Fastly LMS
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/sign-up" className="group">
                <button className={cn(
                  "px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all",
                  "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
                  "hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl"
                )}>
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <button className={cn(
                "px-8 py-3 rounded-lg font-semibold transition-all",
                "backdrop-blur-md border",
                glassTheme.bg.glass, glassTheme.hover.glass,
                glassTheme.text.primary
              )}>
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={cn("border-t backdrop-blur-xl py-12 px-4 sm:px-6 lg:px-8", glassTheme.bg.glass)}>
        <div className="max-w-7xl mx-auto">
          <p className={cn("text-center text-sm", glassTheme.text.muted)}>
            © 2026 Fastly LMS. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </footer>
    </div>
  );
}
