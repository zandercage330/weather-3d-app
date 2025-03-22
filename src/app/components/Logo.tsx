'use client';

export default function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-8 w-8 text-blue-400" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" 
        />
      </svg>
      <span className="text-xl font-semibold text-white">WeatherApp</span>
    </div>
  );
} 