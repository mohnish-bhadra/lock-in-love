'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase';

interface TimerProps {
  roomId: string;
  userId: string;
  displayName: string;
  isRunning: boolean;
  startTimestamp: number | null;
  accumulatedSeconds: number;
}

export default function Timer({
  roomId,
  userId,
  displayName,
  isRunning,
  startTimestamp,
  accumulatedSeconds,
}: TimerProps) {
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
  
  const handleStart = async () => {
    try {
      const db = getDbInstance();
      if (!db) return;
      
      const userRef = doc(db, 'rooms', roomId, 'users', userId);
      await updateDoc(userRef, {
        isRunning: true,
        startTimestamp: Date.now(),
        lastActiveDate: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  };
  
  const handlePause = async () => {
    try {
      if (!startTimestamp) return;
      
      const db = getDbInstance();
      if (!db) return;
      
      const now = Date.now();
      const elapsed = Math.floor((now - startTimestamp) / 1000);
      const newAccumulated = accumulatedSeconds + elapsed;
      
      const userRef = doc(db, 'rooms', roomId, 'users', userId);
      await updateDoc(userRef, {
        isRunning: false,
        accumulatedSeconds: newAccumulated,
        startTimestamp: null,
      });
    } catch (error) {
      console.error('Error pausing timer:', error);
    }
  };
  
  const handleReset = async () => {
    try {
      const db = getDbInstance();
      if (!db) return;
      
      const userRef = doc(db, 'rooms', roomId, 'users', userId);
      await updateDoc(userRef, {
        isRunning: false,
        accumulatedSeconds: 0,
        startTimestamp: null,
      });
    } catch (error) {
      console.error('Error resetting timer:', error);
    }
  };
  
  return (
    <div className="bg-[#1C1C24] rounded-2xl p-8 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-[#FF4D6D]" />
        <h3 className="text-xl font-semibold text-white">Your Timer</h3>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-400 text-sm mb-2">{displayName}</p>
      </div>
      
      {/* Timer Display */}
      <div className="bg-[#0F0F14] rounded-xl p-8 mb-6">
        <div className="text-6xl font-bold text-[#FF4D6D] font-mono text-center">
          {formatTime(currentSeconds)}
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex gap-3 justify-center">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 bg-[#FF4D6D] hover:bg-[#FF2D50] text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Play className="w-5 h-5" fill="currentColor" />
            Start
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 bg-[#FF758F] hover:bg-[#FF4D6D] text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Pause className="w-5 h-5" fill="currentColor" />
            Pause
          </button>
        )}
        
        <button
          onClick={handleReset}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      </div>
      
      {/* Today's Study Time */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <p className="text-sm text-gray-400 text-center">
          Session Time: <span className="text-[#FF758F] font-semibold">{Math.floor(currentSeconds / 60)} minutes</span>
        </p>
      </div>
    </div>
  );
}