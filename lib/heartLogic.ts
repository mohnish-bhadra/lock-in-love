/**
 * Heart Logic Module
 * Handles all calculations related to the shared heart state
 */

export interface HeartState {
  level: number; // 0-4
  visualState: 'neutral' | 'happy' | 'glowing' | 'sad' | 'cracked' | 'broken';
  scale: number;
  healthScore: number;
}

/**
 * Calculate heart evolution level based on total study minutes
 * Level 0: 0-60 min
 * Level 1: 60-300 min
 * Level 2: 300-900 min
 * Level 3: 900-2000 min
 * Level 4: 2000+ min
 */
export const calculateHeartLevel = (totalMinutes: number): number => {
  if (totalMinutes < 60) return 0;
  if (totalMinutes < 300) return 1;
  if (totalMinutes < 900) return 2;
  if (totalMinutes < 2000) return 3;
  return 4;
};

/**
 * Calculate days inactive since last study
 */
export const calculateDaysInactive = (lastStudyDate: Date | null): number => {
  if (!lastStudyDate) return 0;
  
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastStudyDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Calculate heart health score
 * Formula: (totalStudyMinutes * 1.0) - (daysInactive * 120)
 * Minimum: 0
 */
export const calculateHeartHealthScore = (
  totalMinutes: number,
  daysInactive: number
): number => {
  const score = totalMinutes * 1.0 - daysInactive * 120;
  return Math.max(0, score);
};

/**
 * Determine visual state based on days inactive and health
 * - 0 days: neutral/happy/glowing (based on level)
 * - 1 day: slight shrink (normal state)
 * - 3 days: sad face
 * - 5 days: visible crack
 * - 7+ days: broken
 */
export const calculateVisualState = (
  level: number,
  daysInactive: number
): 'neutral' | 'happy' | 'glowing' | 'sad' | 'cracked' | 'broken' => {
  // Decay states
  if (daysInactive >= 7) return 'broken';
  if (daysInactive >= 5) return 'cracked';
  if (daysInactive >= 3) return 'sad';
  
  // Healthy states based on level
  if (level >= 4) return 'glowing';
  if (level >= 2) return 'happy';
  return 'neutral';
};

/**
 * Calculate heart scale
 * Formula: 1 + (totalStudyMinutes / 2000)
 * Capped at 2.5
 */
export const calculateHeartScale = (totalMinutes: number): number => {
  const scale = 1 + totalMinutes / 2000;
  return Math.min(2.5, scale);
};

/**
 * Calculate current streak
 * Returns 0 if no previous study or if streak is broken
 */
export const calculateStreak = (
  lastStudyDate: Date | null,
  currentStreak: number
): number => {
  if (!lastStudyDate) return 0;
  
  const daysInactive = calculateDaysInactive(lastStudyDate);
  
  // Streak is broken after 1 day of inactivity
  if (daysInactive > 1) return 0;
  
  return currentStreak;
};

/**
 * Calculate complete heart state
 */
export const calculateHeartState = (
  totalMinutes: number,
  lastStudyDate: Date | null,
  currentStreak: number
): HeartState => {
  const daysInactive = calculateDaysInactive(lastStudyDate);
  const level = calculateHeartLevel(totalMinutes);
  const visualState = calculateVisualState(level, daysInactive);
  const scale = calculateHeartScale(totalMinutes);
  const healthScore = calculateHeartHealthScore(totalMinutes, daysInactive);
  
  return {
    level,
    visualState,
    scale,
    healthScore,
  };
};

/**
 * Check if today's study qualifies for revival (30+ minutes)
 */
export const checkRevivalQualified = (todayMinutes: number): boolean => {
  return todayMinutes >= 30;
};

/**
 * Update streak based on study completion
 */
export const updateStreak = (
  lastStudyDate: Date | null,
  currentStreak: number
): number => {
  if (!lastStudyDate) return 1; // First day
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const lastStudy = new Date(lastStudyDate);
  lastStudy.setHours(0, 0, 0, 0);
  
  // Check if last study was yesterday
  if (lastStudy.getTime() === yesterday.getTime()) {
    return currentStreak + 1;
  }
  
  // Streak broken, start fresh
  return 1;
};