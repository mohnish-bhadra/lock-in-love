'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Plus, LogIn, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getDbInstance, authenticateAnonymously } from '@/lib/firebase';

export default function HomePage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 9).toUpperCase();
  };
  
  const handleCreateRoom = async () => {
    if (!displayName?.trim()) {
      setError('Please enter your display name');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const db = getDbInstance();
      if (!db) {
        setError('Firebase not initialized. Please refresh the page.');
        setLoading(false);
        return;
      }
      
      // Authenticate anonymously
      const user = await authenticateAnonymously();
      
      // Generate room ID
      const roomId = generateRoomId();
      
      // Create room document
      const roomRef = doc(db, 'rooms', roomId);
      await setDoc(roomRef, {
        createdAt: serverTimestamp(),
        totalStudyMinutes: 0,
        lastStudyDate: null,
        currentStreak: 0,
        heartState: 'neutral',
        heartHealthScore: 0,
        users: [user.uid],
      });
      
      // Create user document
      const userRef = doc(db, 'rooms', roomId, 'users', user.uid);
      await setDoc(userRef, {
        displayName: displayName.trim(),
        isRunning: false,
        startTimestamp: null,
        accumulatedSeconds: 0,
        todayStudySeconds: 0,
        lastActiveDate: serverTimestamp(),
        joinedAt: serverTimestamp(),
      });
      
      // Navigate to room
      router.push(`/room/${roomId}`);
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoinRoom = async () => {
    if (!displayName?.trim()) {
      setError('Please enter your display name');
      return;
    }
    
    if (!roomIdInput?.trim()) {
      setError('Please enter a room ID');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const db = getDbInstance();
      if (!db) {
        setError('Firebase not initialized. Please refresh the page.');
        setLoading(false);
        return;
      }
      
      // Authenticate anonymously
      const user = await authenticateAnonymously();
      
      const roomId = roomIdInput.trim().toUpperCase();
      
      // Check if room exists
      const roomRef = doc(db, 'rooms', roomId);
      const roomSnap = await getDoc(roomRef);
      
      if (!roomSnap.exists()) {
        setError('Room not found. Please check the room ID.');
        setLoading(false);
        return;
      }
      
      const roomData = roomSnap.data();
      
      // Check if room is full
      if (roomData?.users?.length >= 2 && !roomData.users.includes(user.uid)) {
        setError('Room is full. Maximum 2 users allowed.');
        setLoading(false);
        return;
      }
      
      // Add user to room if not already in
      if (!roomData?.users?.includes(user.uid)) {
        await setDoc(roomRef, {
          ...roomData,
          users: [...(roomData?.users || []), user.uid],
        }, { merge: true });
      }
      
      // Create or update user document
      const userRef = doc(db, 'rooms', roomId, 'users', user.uid);
      await setDoc(userRef, {
        displayName: displayName.trim(),
        isRunning: false,
        startTimestamp: null,
        accumulatedSeconds: 0,
        todayStudySeconds: 0,
        lastActiveDate: serverTimestamp(),
        joinedAt: serverTimestamp(),
      });
      
      // Navigate to room
      router.push(`/room/${roomId}`);
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0F0F14] flex items-center justify-center">
        <div className="animate-pulse">
          <Heart className="w-16 h-16 text-[#FF4D6D]" fill="currentColor" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F14] via-[#1C1C24] to-[#0F0F14] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="inline-flex items-center justify-center mb-4"
          >
            <Heart className="w-16 h-16 text-[#FF4D6D]" fill="currentColor" />
            <Sparkles className="w-8 h-8 text-[#FFD700] absolute translate-x-8 -translate-y-4" />
          </motion.div>
          <h1 className="text-5xl font-bold text-white mb-3">Lock In Love</h1>
          <p className="text-gray-400 text-lg">Study together, grow your shared heart</p>
        </div>
        
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-[#1C1C24] rounded-2xl p-8 shadow-2xl"
        >
          {/* Display Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Your Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-[#0F0F14] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF4D6D] transition-all"
              maxLength={20}
            />
          </div>
          
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm"
            >
              {error}
            </motion.div>
          )}
          
          {/* Create Room Button */}
          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FF4D6D] to-[#FF2D50] hover:from-[#FF2D50] hover:to-[#FF4D6D] text-white font-bold py-4 rounded-lg mb-4 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Plus className="w-5 h-5" />
            {loading ? 'Creating...' : 'Create New Room'}
          </button>
          
          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-gray-500 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>
          
          {/* Join Room Section */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Room ID
            </label>
            <input
              type="text"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
              placeholder="Enter room ID"
              className="w-full bg-[#0F0F14] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF758F] transition-all uppercase"
              maxLength={10}
            />
          </div>
          
          <button
            onClick={handleJoinRoom}
            disabled={loading}
            className="w-full bg-[#FF758F] hover:bg-[#FF4D6D] text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Joining...' : 'Join Existing Room'}
          </button>
        </motion.div>
        
        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-500 text-sm mt-6"
        >
          Create or join a room to start studying with your partner
        </motion.p>
      </motion.div>
    </div>
  );
}