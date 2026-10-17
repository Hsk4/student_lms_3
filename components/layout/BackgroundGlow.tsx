import React from 'react';

export function BackgroundGlow() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Subtle digital grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Left Indigo Glow */}
      <div className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-indigo-600/12 blur-[140px] pointer-events-none" />

      {/* Top Right Cyan Glow */}
      <div className="absolute top-[5%] -right-[15%] w-[45vw] h-[45vw] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />

      {/* Center-Bottom Purple Glow */}
      <div className="absolute -bottom-[20%] left-[25%] w-[60vw] h-[50vw] rounded-full bg-purple-600/10 blur-[160px] pointer-events-none" />

      {/* Soft Vignette Overlay */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,_transparent_0%,_#090d16_90%] opacity-60" />
    </div>
  );
}
