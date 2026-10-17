'use client';

import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ChatInterface } from '@/components/assistant/ChatInterface';
import { RobotAssistant } from '@/components/assistant/RobotAssistant';
import { Card } from '@/components/ui/Card';
import {
  Sparkles,
  Cpu,
  Brain,
  Terminal,
  BookOpen,
  Zap,
} from 'lucide-react';

export default function AssistantPage() {
  const capabilities = [
    {
      icon: Terminal,
      title: 'Algorithm Debugging',
      desc: 'Step-through Raft elections, vector clocks, and concurrent locks in Go/C++.',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
    },
    {
      icon: Brain,
      title: 'Neural Networks & ML',
      desc: 'Verify multi-head attention shapes, backprop gradients, and RoPE embeddings.',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
    },
    {
      icon: Cpu,
      title: 'Math & Proof Synthesis',
      desc: 'Step-by-step KKT multiplier calculations, convex duality, and SDE Ito lemmas.',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
    },
    {
      icon: BookOpen,
      title: 'Exam Flashcards & Notes',
      desc: 'Generate comprehensive mid-term summaries and self-testing problem sets.',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="AIDA — AI Academic Co-Pilot"
        description="Your intelligent, context-aware university research tutor and algorithmic study assistant."
        badge="Autonomous Model Online"
      />

      {/* Main Layout: Chat Interface & Assistant Mascot Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left 3 Columns: Active Interactive Chat Area */}
        <div className="lg:col-span-3">
          <ChatInterface />
        </div>

        {/* Right 1 Column: Robot Mascot & Quick Capability Showcase */}
        <div className="space-y-6">
          {/* Animated Mascot Card */}
          <Card glow className="p-6 text-center flex flex-col items-center border-cyan-500/30 bg-gradient-to-b from-slate-900/90 to-cyan-950/30">
            <div className="py-2">
              <RobotAssistant size="lg" />
            </div>

            <div className="space-y-1 mt-2">
              <h3 className="text-base font-bold text-white flex items-center justify-center gap-1.5">
                <span>Unit AIDA-3000</span>
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </h3>
              <p className="text-xs text-cyan-300 font-medium">Active Campus Assistant</p>
            </div>

            <div className="w-full mt-4 pt-4 border-t border-slate-800 text-left text-xs space-y-2 text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Context Window</span>
                <span className="font-mono text-cyan-300 font-semibold">Fall 2026 Indexed</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Response Latency</span>
                <span className="font-mono text-emerald-400 font-semibold">&lt; 150ms simulated</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Verified Courses</span>
                <span className="font-mono text-white font-semibold">6 / 6 Connected</span>
              </div>
            </div>
          </Card>

          {/* Quick Capability Highlights */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Core Capabilities
            </h4>

            {capabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 transition-all flex items-start gap-3"
                >
                  <div className={`p-2 rounded-xl border shrink-0 ${cap.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">{cap.title}</p>
                    <p className="text-[11px] text-slate-400 leading-snug">{cap.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
