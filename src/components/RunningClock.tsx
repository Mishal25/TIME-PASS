import React, { useEffect, useState } from 'react';

interface RunningClockProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'title';
}

/**
 * An analog clock component that runs non-stop with ultra-smooth 60fps sweep.
 * Features a glowing cyber-aesthetic with live real-world time synchronization.
 */
export function RunningClock({ className = '', size = 'title' }: RunningClockProps) {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    let animId: number;
    const updateTime = () => {
      setTime(new Date());
      animId = requestAnimationFrame(updateTime);
    };
    animId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animId);
  }, []);

  const ms = time.getMilliseconds();
  const seconds = time.getSeconds() + ms / 1000;
  const minutes = time.getMinutes() + seconds / 60;
  const hours = (time.getHours() % 12) + minutes / 60;

  const secondDeg = seconds * 6; // 360° / 60
  const minuteDeg = minutes * 6;  // 360° / 60
  const hourDeg = hours * 30;    // 360° / 12

  // Format digital string for accessibility & tooltip
  const timeString = time.toLocaleTimeString();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    title: 'w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20',
  }[size];

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none group align-middle mx-2 sm:mx-3 ${sizeClasses} ${className}`}
      title={`Live Time: ${timeString}`}
      role="img"
      aria-label={`Running clock showing ${timeString}`}
    >
      {/* Outer ambient glow */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 opacity-60 blur-sm group-hover:opacity-90 transition-opacity animate-pulse" />
      
      {/* Rotating gradient accent ring */}
      <div 
        className="absolute -inset-[2px] rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80"
        style={{
          transform: `rotate(${secondDeg * 0.5}deg)`,
          transition: 'transform 0.1s linear',
        }}
      />

      {/* Clock body container */}
      <svg 
        viewBox="0 0 100 100" 
        className="relative w-full h-full rounded-full shadow-2xl drop-shadow-[0_0_12px_rgba(236,72,153,0.5)]"
      >
        <defs>
          <radialGradient id="clockDialGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="70%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
          <linearGradient id="clockRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Dial Face */}
        <circle 
          cx="50" 
          cy="50" 
          r="47" 
          fill="url(#clockDialGrad)" 
          stroke="url(#clockRimGrad)" 
          strokeWidth="3" 
        />

        {/* Concentric subtle decorative rings */}
        <circle cx="50" cy="50" r="38" fill="none" stroke="#312e81" strokeWidth="0.75" strokeDasharray="2,2" opacity="0.6" />
        <circle cx="50" cy="50" r="28" fill="none" stroke="#4338ca" strokeWidth="0.5" opacity="0.4" />

        {/* 12 Hour Notches */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const isCardinal = i % 3 === 0;
          const rInner = isCardinal ? 37 : 40;
          const rOuter = 44;
          const x1 = 50 + rInner * Math.sin(angle);
          const y1 = 50 - rInner * Math.cos(angle);
          const x2 = 50 + rOuter * Math.sin(angle);
          const y2 = 50 - rOuter * Math.cos(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isCardinal ? '#e0e7ff' : '#64748b'}
              strokeWidth={isCardinal ? 2.5 : 1.25}
              strokeLinecap="round"
            />
          );
        })}

        {/* 60 Minute Tick Dots (subtle) */}
        {[...Array(60)].map((_, i) => {
          if (i % 5 === 0) return null; // already covered by hour notches
          const angle = (i * 6 * Math.PI) / 180;
          const r = 42;
          const cx = 50 + r * Math.sin(angle);
          const cy = 50 - r * Math.cos(angle);
          return (
            <circle
              key={`dot-${i}`}
              cx={cx}
              cy={cy}
              r="0.75"
              fill="#475569"
              opacity="0.7"
            />
          );
        })}

        {/* Hour Hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="28"
          stroke="#f8fafc"
          strokeWidth="3.5"
          strokeLinecap="round"
          transform={`rotate(${hourDeg} 50 50)`}
          filter="url(#neonGlow)"
        />

        {/* Minute Hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="19"
          stroke="#a5b4fc"
          strokeWidth="2.5"
          strokeLinecap="round"
          transform={`rotate(${minuteDeg} 50 50)`}
          filter="url(#neonGlow)"
        />

        {/* Second Hand (Continuous smooth sweep non-stop) */}
        <g transform={`rotate(${secondDeg} 50 50)`}>
          {/* Back tail / counterweight */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="61"
            stroke="#f43f5e"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Main sweeping pointer */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="13"
            stroke="#f43f5e"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          {/* Decorative pointer pip */}
          <circle cx="50" cy="22" r="2.2" fill="#f43f5e" />
        </g>

        {/* Center Pivot Stud */}
        <circle cx="50" cy="50" r="3.5" fill="#f43f5e" />
        <circle cx="50" cy="50" r="1.5" fill="#ffffff" />
      </svg>
    </div>
  );
}
