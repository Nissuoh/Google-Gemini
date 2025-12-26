import React from 'react';

interface MasteryRingProps {
  progress: number; // 0-100
  level: number;
  size?: number;
  strokeWidth?: number;
  children: React.ReactNode;
}

const MasteryRing: React.FC<MasteryRingProps> = ({
  progress,
  level,
  size = 32,
  strokeWidth = 3,
  children
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative flex-shrink-0 flex items-center justify-center border border-gray-600 rounded-full bg-gray-700"
      style={{ width: size, height: size }}
    >
      <svg
        className="absolute top-0 left-0"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="text-gray-900/50"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-emerald-500"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.5s ease-in-out',
          }}
        />
      </svg>
      {children}
      <div
        className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-gray-800"
        title={`Stufe ${level}`}
      >
        {level}
      </div>
    </div>
  );
};

export default MasteryRing;
