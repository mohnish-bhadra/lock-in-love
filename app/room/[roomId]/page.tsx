'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { getDbInstance, getAuthInstance } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Copy, Flame, Heart as HeartIcon, ArrowLeft, Check } from 'lucide-react';
import Heart from '@/components/Heart';
import Timer from '@/components/Timer';
import PartnerTimer from '@/components/PartnerTimer';
import { updateStreak } from '@/lib/heartLogic';

interface RoomData {
  totalStudyMinutes: number;
  lastStudyDate: any;
  currentStreak: number;
  heartState: string;
  heartHealthScore: number;
  users: string[];
}

interface UserData {
  displayName: string;
  isRunning: boolean;
  startTimestamp: number | null;
  accumulatedSeconds: number;
  todayStudySeconds: number;
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId as string;
  
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [partnerUser, setPartnerUser] = useState<UserData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Monitor auth state
  useEffect(() => {
    const auth = getAuthInstance();
    if (!auth) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        router.push('/');
      }
    });
    
    return () => unsubscribe();
  }, [router]);
  
  // Subscribe to room data
  useEffect(() => {
    if (!roomId || !userId) return;
    
    const db = getDbInstance();
    if (!db) return;
    
    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribe = onSnapshot(roomRef, async (snapshot) => {
      if (!snapshot.exists()) {
        router.push('/');
        return;
      }
      
      const data = snapshot.data() as RoomData;
      setRoomData(data);
      
      // Find partner ID
      const partner = data?.users?.find((id) => id !== userId);
      setPartnerId(partner || null);
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [roomId, userId, router]);
  
  // Subscribe to current user data
  useEffect(() => {
    if (!roomId || !userId) return;
    
    const db = getDbInstance();
    if (!db) return;
    
    const userRef = doc(db, 'rooms', roomId, 'users', userId);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setCurrentUser(snapshot.data() as UserData);
      }
    });
    
    return () => unsubscribe();
  }, [roomId, userId]);
  
  // Subscribe to partner user data
  useEffect(() => {
    if (!roomId || !partnerId) return;
    
    const db = getDbInstance();
    if (!db) return;
    
    const partnerRef = doc(db, 'rooms', roomId, 'users', partnerId);
    const unsubscribe = onSnapshot(partnerRef, (snapshot) => {
      if (snapshot.exists()) {
        setPartnerUser(snapshot.data() as UserData);
      }
    });
    
    return () => unsubscribe();
  }, [roomId, partnerId]);
  
  // Update room data when user stops timer
  useEffect(() => {
    if (!roomId || !userId || !currentUser || !roomData) return;
    
    // If user just stopped and has significant time, update room stats
    const checkAndUpdateRoomStats = async () => {
      if (!currentUser.isRunning && currentUser.accumulatedSeconds >= 1800) { // 30 minutes
        try {
          const db = getDbInstance();
          if (!db) return;
          
          const newMinutes = Math.floor(currentUser.accumulatedSeconds / 60);
          const roomRef = doc(db, 'rooms', roomId);
          
          // Calculate new streak
          const lastStudyDate = roomData.lastStudyDate?.toDate?.() || null;
          const newStreak = updateStreak(lastStudyDate, roomData.currentStreak);
          
          await updateDoc(roomRef, {
            totalStudyMinutes: roomData.totalStudyMinutes + newMinutes,
            lastStudyDate: new Date(),
            currentStreak: newStreak,
          });
          
          // Reset user's accumulated seconds
          const userRef = doc(db, 'rooms', roomId, 'users', userId);
          await updateDoc(userRef, {
            accumulatedSeconds: 0,
            todayStudySeconds: 0,
          });
        } catch (error) {
          console.error('Error updating room stats:', error);
        }
      }
    };
    
    checkAndUpdateRoomStats();
  }, [currentUser?.isRunning, currentUser?.accumulatedSeconds, roomId, userId, roomData]);
  
  const copyRoomId = async () => {
    try {
      await navigator?.clipboard?.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  
  if (!mounted || loading || !roomData || !currentUser) {
    return (
      <div className="min-h-screen bg-[#0F0F14] flex items-center justify-center">
        <div className="animate-pulse">
          <HeartIcon className="w-16 h-16 text-[#FF4D6D]" fill="currentColor" />
        </div>
      </div>
    );
  }
  
  const lastStudyDate = roomData?.lastStudyDate?.toDate?.() || null;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F14] via-[#1C1C24] to-[#0F0F14] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Leave Room</span>
            </button>
            
            <div className="flex items-center gap-2 bg-[#1C1C24] px-4 py-2 rounded-lg">
              <span className="text-gray-400 text-sm">Room ID:</span>
              <span className="text-white font-mono font-bold">{roomId}</span>
              <button
                onClick={copyRoomId}
                className="text-[#FF4D6D] hover:text-[#FF2D50] transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
            Lock In Love
          </h1>
        </motion.div>
        
        {/* Heart Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-[#1C1C24] rounded-2xl p-8 md:p-12 shadow-2xl">
            <div className="flex flex-col items-center">
              <Heart
                totalMinutes={roomData.totalStudyMinutes}
                lastStudyDate={lastStudyDate}
                currentStreak={roomData.currentStreak}
              />
              
              {/* Stats */}
              <div className="flex gap-8 mt-12">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 bg-[#0F0F14] px-6 py-3 rounded-xl"
                >
                  <Flame className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-400">Current Streak</p>
                    <p className="text-2xl font-bold text-white">{roomData.currentStreak} days</p>
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 bg-[#0F0F14] px-6 py-3 rounded-xl"
                >
                  <HeartIcon className="w-6 h-6 text-[#FF4D6D]" fill="currentColor" />
                  <div>
                    <p className="text-sm text-gray-400">Total Minutes</p>
                    <p className="text-2xl font-bold text-white">{roomData.totalStudyMinutes}</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Timers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Your Timer */}
          {userId && (
            <Timer
              roomId={roomId}
              userId={userId}
              displayName={currentUser.displayName}
              isRunning={currentUser.isRunning}
              startTimestamp={currentUser.startTimestamp}
              accumulatedSeconds={currentUser.accumulatedSeconds}
            />
          )}
          
          {/* Partner Timer */}
          {partnerUser ? (
            <PartnerTimer
              displayName={partnerUser.displayName}
              isRunning={partnerUser.isRunning}
              startTimestamp={partnerUser.startTimestamp}
              accumulatedSeconds={partnerUser.accumulatedSeconds}
            />
          ) : (
            <div className="bg-[#1C1C24] rounded-2xl p-8 shadow-lg flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="inline-block mb-4"
                >
                  <HeartIcon className="w-16 h-16 text-[#FF758F]" />
                </motion.div>
                <p className="text-gray-400 mb-2">Waiting for partner...</p>
                <p className="text-sm text-gray-500">Share the room ID to invite someone</p>
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-[#1C1C24] rounded-xl p-4 text-center"
        >
          <p className="text-gray-400 text-sm">
            💡 Study for 30+ minutes to contribute to your shared heart. Keep your streak alive by studying daily!
          </p>
        </motion.div>
      </div>
    </div>
  );
}