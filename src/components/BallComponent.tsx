import React from 'react';
import { motion } from 'motion/react';
import { Lock, Skull, Coins, EyeOff } from 'lucide-react';
import { Ball } from '../types';
import { formatRupees } from '../data/moneyValues';

interface BallComponentProps {
  ball?: Ball;
  isMystery?: boolean; // Face-down mystery ball
  isPublic?: boolean;
  isRevealed?: boolean; // Force reveal even if hidden
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  className?: string;
}

export const BallComponent: React.FC<BallComponentProps> = ({
  ball,
  isMystery = false,
  isPublic = false,
  isRevealed = false,
  size = 'md',
  onClick,
  selected = false,
  disabled = false,
  showBadge = false,
  badgeText,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-14 h-14 text-xs',
    md: 'w-20 h-20 text-sm',
    lg: 'w-28 h-28 text-base',
    xl: 'w-36 h-36 text-xl',
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  }[size];

  // Determine appearance
  const showContent = !isMystery && (isPublic || isRevealed);

  if (!showContent || !ball) {
    // Hidden or Mystery Ball
    return (
      <div className="relative inline-block">
        <motion.button
          whileHover={!disabled && onClick ? { scale: 1.06, translateY: -3 } : {}}
          whileTap={!disabled && onClick ? { scale: 0.95 } : {}}
          onClick={disabled ? undefined : onClick}
          disabled={disabled}
          className={`relative rounded-full flex flex-col items-center justify-center font-bold shadow-2xl transition-all cursor-pointer border-2 ${
            selected
              ? 'border-amber-400 ring-4 ring-amber-400/50 scale-105'
              : 'border-amber-600/60 hover:border-amber-400'
          } bg-gradient-to-br from-amber-700 via-amber-900 to-yellow-950 text-amber-200 ${sizeClasses} ${className}`}
          style={{
            boxShadow: selected
              ? '0 0 25px rgba(245, 158, 11, 0.6), inset 0 2px 8px rgba(255, 255, 255, 0.4)'
              : '0 10px 20px rgba(0, 0, 0, 0.6), inset 0 2px 6px rgba(255, 215, 0, 0.3)',
          }}
        >
          {/* Sphere shine overlay */}
          <div className="absolute top-1 left-3 w-1/3 h-1/3 rounded-full bg-white/20 blur-[1px] pointer-events-none" />
          <Lock className={`${iconSizes} text-amber-300 drop-shadow`} />
          <span className="text-[10px] tracking-wider uppercase text-amber-300/80 mt-1 font-semibold">
            LOCKED
          </span>
        </motion.button>
        {showBadge && badgeText && (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-900/90 text-amber-300 border border-amber-500/50 shadow-md whitespace-nowrap">
            {badgeText}
          </span>
        )}
      </div>
    );
  }

  if (ball.type === 'KILLER') {
    return (
      <div className="relative inline-block">
        <motion.button
          whileHover={!disabled && onClick ? { scale: 1.06, translateY: -3 } : {}}
          whileTap={!disabled && onClick ? { scale: 0.95 } : {}}
          onClick={disabled ? undefined : onClick}
          disabled={disabled}
          className={`relative rounded-full flex flex-col items-center justify-center font-black shadow-2xl transition-all cursor-pointer border-2 ${
            selected
              ? 'border-red-400 ring-4 ring-red-500/60 scale-105'
              : 'border-red-600/80 hover:border-red-400'
          } bg-gradient-to-br from-red-800 via-neutral-900 to-black text-red-100 ${sizeClasses} ${className}`}
          style={{
            boxShadow: '0 0 20px rgba(220, 38, 38, 0.5), inset 0 2px 6px rgba(255, 100, 100, 0.4)',
          }}
        >
          {/* Sphere shine overlay */}
          <div className="absolute top-1 left-3 w-1/3 h-1/3 rounded-full bg-red-400/20 blur-[1px] pointer-events-none" />
          <Skull className={`${iconSizes} text-red-500 animate-pulse drop-shadow-md`} />
          <span className="text-[10px] sm:text-xs font-black tracking-widest text-red-400 uppercase mt-0.5">
            KILLER
          </span>
        </motion.button>
        {showBadge && badgeText && (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-red-950 text-red-300 border border-red-600/60 shadow-md whitespace-nowrap">
            {badgeText}
          </span>
        )}
      </div>
    );
  }

  // MONEY ball
  return (
    <div className="relative inline-block">
      <motion.button
        whileHover={!disabled && onClick ? { scale: 1.06, translateY: -3 } : {}}
        whileTap={!disabled && onClick ? { scale: 0.95 } : {}}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={`relative rounded-full flex flex-col items-center justify-center font-extrabold shadow-2xl transition-all cursor-pointer border-2 ${
          selected
            ? 'border-amber-200 ring-4 ring-amber-300/80 scale-105'
            : 'border-yellow-400/90 hover:border-amber-200'
        } bg-gradient-to-br from-yellow-300 via-amber-500 to-amber-700 text-yellow-950 ${sizeClasses} ${className}`}
        style={{
          boxShadow: '0 10px 25px rgba(234, 179, 8, 0.4), inset 0 3px 8px rgba(255, 255, 255, 0.7)',
        }}
      >
        {/* Sphere shine overlay */}
        <div className="absolute top-1 left-3 w-1/3 h-1/3 rounded-full bg-white/50 blur-[1px] pointer-events-none" />
        <Coins className={`${iconSizes} text-amber-950 drop-shadow-sm mb-0.5`} />
        <span className="text-xs sm:text-sm font-black tracking-tight text-amber-950 drop-shadow-sm leading-none px-1 text-center">
          {ball.value !== undefined ? formatRupees(ball.value) : 'MONEY'}
        </span>
      </motion.button>
      {showBadge && badgeText && (
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-950 text-yellow-300 border border-yellow-500/60 shadow-md whitespace-nowrap">
          {badgeText}
        </span>
      )}
    </div>
  );
};
