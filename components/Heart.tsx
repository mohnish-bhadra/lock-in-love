'use client';

import { motion } from 'framer-motion';
import { Heart as HeartIcon, Sparkles, Flame } from 'lucide-react';
import { calculateHeartState } from '@/lib/heartLogic';
import { useEffect, useState } from 'react';

interface HeartProps {
  totalMinutes: number;
  lastStudyDate: Date | null;
  currentStreak: number;
}

export default function Heart({ totalMinutes, lastStudyDate, currentStreak }: HeartProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return (
      <div className="flex items-center justify-center">
        <HeartIcon className="w-32 h-32 text-[#FF4D6D]" fill="currentColor" />
      </div>
    );
  }
  
  const heartState = calculateHeartState(totalMinutes, lastStudyDate, currentStreak);
  const { level, visualState, scale } = heartState;
  
  // Color variations based on state
  const getHeartColor = () => {
    switch (visualState) {
      case 'broken':
        return '#4A4A4A'; // Dark gray
      case 'cracked':
        return '#8B4A4A'; // Muted red
      case 'sad':
        return '#D97B7B'; // Pale red
      case 'neutral':
        return '#FF758F'; // Accent pink
      case 'happy':
        return '#FF4D6D'; // Primary red
      case 'glowing':
        return '#FF2D50'; // Bright red
      default:
        return '#FF4D6D';
    }
  };
  
  // Animation variants based on state
  const getAnimationVariant = () => {
    if (visualState === 'broken' || visualState === 'cracked') {
      return {
        scale: [scale * 0.9, scale * 0.85, scale * 0.9],
        rotate: [0, -2, 2, -2, 0],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };
    }
    
    if (visualState === 'sad') {
      return {
        scale: [scale * 0.95, scale * 0.92, scale * 0.95],
        y: [0, 5, 0],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };
    }
    
    if (visualState === 'glowing') {
      return {
        scale: [scale, scale * 1.05, scale],
        rotate: [0, 2, -2, 0],
        y: [0, -10, 0],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };
    }
    
    if (visualState === 'happy') {
      return {
        scale: [scale, scale * 1.02, scale],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };
    }
    
    // Neutral
    return {
      scale: [scale, scale * 1.01, scale],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    };
  };
  
  // Glow effect for glowing state
  const glowStyle = visualState === 'glowing' ? {
    filter: 'drop-shadow(0 0 20px rgba(255, 77, 109, 0.8)) drop-shadow(0 0 40px rgba(255, 77, 109, 0.6))',
  } : {};
  
  return (
    <div className="relative flex items-center justify-center">
      {/* Sparkles for glowing state */}
      {visualState === 'glowing' && (
        <>
          <motion.div
            className="absolute"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Sparkles className="w-12 h-12 text-[#FFD700]" style={{ position: 'absolute', top: '-40px', left: '-40px' }} />
          </motion.div>
          <motion.div
            className="absolute"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          >
            <Sparkles className="w-12 h-12 text-[#FFD700]" style={{ position: 'absolute', top: '-40px', right: '-40px' }} />
          </motion.div>
        </>
      )}
      
      {/* Main heart */}
      <motion.div
        animate={getAnimationVariant()}
        style={glowStyle}
        className="relative"
      >
        <HeartIcon
          className="w-48 h-48"
          style={{ color: getHeartColor() }}
          fill="currentColor"
          strokeWidth={1.5}
        />
        
        {/* Crack overlay for cracked/broken states */}
        {(visualState === 'cracked' || visualState === 'broken') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full"
              style={{ position: 'absolute' }}
            >
              <path
                d="M100 40 L95 80 L105 100 L100 140 L95 180"
                stroke="#1C1C24"
                strokeWidth="3"
                fill="none"
              />
              {visualState === 'broken' && (
                <>
                  <path
                    d="M80 60 L70 90 L75 120"
                    stroke="#1C1C24"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M120 60 L130 90 L125 120"
                    stroke="#1C1C24"
                    strokeWidth="2"
                    fill="none"
                  />
                </>
              )}
            </svg>
          </motion.div>
        )}
        
        {/* Emoji face for different states */}
        <div className="absolute inset-0 flex items-center justify-center">
          {visualState === 'sad' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-4xl"
            >
              😢
            </motion.div>
          )}
          {visualState === 'happy' && level >= 2 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-3xl"
            >
              😊
            </motion.div>
          )}
          {visualState === 'glowing' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-4xl"
            >
              ✨
            </motion.div>
          )}
          {visualState === 'broken' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-5xl"
            >
              💔
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {/* Level indicator */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12">
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: i <= level ? 1 : 0.5 }}
              className={`w-3 h-3 rounded-full ${
                i <= level ? 'bg-[#FF4D6D]' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}