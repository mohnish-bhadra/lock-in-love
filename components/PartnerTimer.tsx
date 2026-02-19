'use client';

import { useState, useEffect } from 'react';
import { Users, Clock } from 'lucide-react';

interface PartnerTimerProps {
  displayName: string;
  isRunning: boolean;
  startTimestamp: number | null;
  accumulatedSeconds: number;
}

export default function PartnerTimer({
  displayName,
  isRunning,
  startTimestamp,
  accumulatedSeconds,
}: PartnerTimerProps) {
  const [currentSeconds, setCurrentSeconds] = useState(accumulatedSeconds);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && startTimestamp) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimestamp) / 1000);
        setCurrentSeconds(accumulatedSeconds + elapsed);
      }, 100);
    } else {
      setCurrentSeconds(accumulatedSeconds);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTimestamp, accumulatedSeconds]);
  
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="bg-[#1C1C24] rounded-2xl p-8 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-[#FF758F]" />
        <h3 className="text-xl font-semibold text-white">Partner Timer</h3>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-400 text-sm mb-2">{displayName || 'Waiting for partner...'}</p>
      </div>
      
      {/* Timer Display */}
      <div className="bg-[#0F0F14] rounded-xl p-8 mb-6">
        <div className="text-6xl font-bold text-[#FF758F] font-mono text-center">
          {formatTime(currentSeconds)}
        </div>
      </div>
      
      {/* Status indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className={`w-3 h-3 rounded-full ${
          isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
        }`} />
        <span className="text-sm text-gray-400">
          {isRunning ? 'Studying...' : 'Paused'}
        </span>
      </div>
      
      {/* Session Time */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <p className="text-sm text-gray-400 text-center">
          Session Time: <span className="text-[#FF758F] font-semibold">{Math.floor(currentSeconds / 60)} minutes</span>
        </p>
      </div>
    </div>
  );
}