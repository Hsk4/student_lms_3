import React from 'react';
import { cn } from '@/lib/utils';

export interface RobotAssistantProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isThinking?: boolean;
}

export function RobotAssistant({
  className,
  size = 'md',
  isThinking = false,
}: RobotAssistantProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-44 h-44',
    xl: 'w-60 h-60',
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center select-none animate-float',
        sizeClasses[size],
        className
      )}
    >
      {/* Outer ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/25 via-indigo-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse-glow" />

      {/* SVG Robot Assistant */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-[0_10px_25px_rgba(6,182,212,0.3)] transition-transform duration-300 hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="visorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#082f49" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id="cyanNeon" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>

          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Antenna Stem */}
        <line
          x1="100"
          y1="40"
          x2="100"
          y2="15"
          stroke="#475569"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Antenna Bulb (Pulsing glowing node) */}
        <circle
          cx="100"
          cy="15"
          r="8"
          fill="url(#cyanNeon)"
          filter="url(#glowEffect)"
          className="animate-pulse"
        />
        <circle
          cx="100"
          cy="15"
          r="14"
          stroke="#22d3ee"
          strokeWidth="1.5"
          strokeDasharray="2 3"
          className="animate-spin origin-[100px_15px]"
          opacity="0.6"
        />

        {/* Robot Ears / Side Sensors */}
        <rect
          x="34"
          y="70"
          width="12"
          height="28"
          rx="6"
          fill="#334155"
          stroke="#475569"
          strokeWidth="2"
        />
        <circle cx="40" cy="84" r="2.5" fill="#22d3ee" filter="url(#glowEffect)" />

        <rect
          x="154"
          y="70"
          width="12"
          height="28"
          rx="6"
          fill="#334155"
          stroke="#475569"
          strokeWidth="2"
        />
        <circle cx="160" cy="84" r="2.5" fill="#22d3ee" filter="url(#glowEffect)" />

        {/* Main Robot Head Chassis */}
        <rect
          x="42"
          y="38"
          width="116"
          height="92"
          rx="28"
          fill="url(#headGrad)"
          stroke="#6366f1"
          strokeWidth="2.5"
          className="shadow-inner"
        />

        {/* Dark High-Tech Visor Screen */}
        <rect
          x="54"
          y="52"
          width="92"
          height="52"
          rx="18"
          fill="url(#visorGrad)"
          stroke="#1e293b"
          strokeWidth="2"
        />

        {/* Subtle Visor Reflection Highlight */}
        <path
          d="M 60 58 Q 100 54 140 58"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Eyes / Expressive Visor Lights */}
        {isThinking ? (
          // Thinking animation wave
          <g filter="url(#glowEffect)">
            <circle cx="80" cy="78" r="7" fill="#22d3ee" className="animate-ping" />
            <circle cx="100" cy="78" r="7" fill="#818cf8" className="animate-pulse" />
            <circle cx="120" cy="78" r="7" fill="#c084fc" className="animate-ping" />
          </g>
        ) : (
          // Expressive curved digital eyes
          <g filter="url(#glowEffect)">
            {/* Left Eye */}
            <rect
              x="72"
              y="70"
              width="18"
              height="16"
              rx="8"
              fill="url(#cyanNeon)"
            />
            {/* Right Eye */}
            <rect
              x="110"
              y="70"
              width="18"
              height="16"
              rx="8"
              fill="url(#cyanNeon)"
            />
            {/* Digital eye sparkles */}
            <circle cx="78" cy="75" r="2.5" fill="#ffffff" />
            <circle cx="116" cy="75" r="2.5" fill="#ffffff" />
          </g>
        )}

        {/* Cute Smile / Status Arc */}
        <path
          d="M 88 92 Q 100 98 112 92"
          stroke="#22d3ee"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#glowEffect)"
        />

        {/* Neck Junction */}
        <rect
          x="86"
          y="130"
          width="28"
          height="12"
          rx="3"
          fill="#1e293b"
          stroke="#334155"
          strokeWidth="2"
        />

        {/* Torso / Hover Collar */}
        <path
          d="M 60 142 C 60 142 80 140 100 140 C 120 140 140 142 140 142 C 150 146 155 160 155 170 C 155 175 145 180 100 180 C 55 180 45 175 45 170 C 45 160 50 146 60 142 Z"
          fill="url(#headGrad)"
          stroke="#4f46e5"
          strokeWidth="2"
        />

        {/* Chest Energy Core (Arc Reactor) */}
        <circle
          cx="100"
          cy="158"
          r="9"
          fill="url(#cyanNeon)"
          filter="url(#glowEffect)"
          className="animate-pulse"
        />
        <circle
          cx="100"
          cy="158"
          r="14"
          stroke="#6366f1"
          strokeWidth="1.5"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}
