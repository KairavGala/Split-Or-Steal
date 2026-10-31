import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Play, Trophy, Sparkles, UserCheck } from 'lucide-react';
import { sound } from '../utils/sound';

interface HomeScreenProps {
  onStartGame: (playerNames: string[]) => void;
}

const DEFAULT_NAMES = [
  'Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Riley', 'Casey', 'Avery', 'Dakota', 'Quinn'
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartGame }) => {
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [names, setNames] = useState<string[]>(
    DEFAULT_NAMES.slice(0, 4)
  );

  const handlePlayerCountChange = (count: number) => {
    sound.playClick();
    setPlayerCount(count);
    if (names.length < count) {
      const extraNeeded = count - names.length;
      const availableDefaults = DEFAULT_NAMES.filter(n => !names.includes(n));
      const newNames = [...names];
      for (let i = 0; i < extraNeeded; i++) {
        newNames.push(availableDefaults[i] || `Player ${newNames.length + 1}`);
      }
      setNames(newNames);
    } else {
      setNames(names.slice(0, count));
    }
  };

  const handleNameChange = (index: number, val: string) => {
    const updated = [...names];
    updated[index] = val;
    setNames(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    // Validate names non-empty
    const validated = names.map((n, i) => n.trim() || `Player ${i + 1}`);
    onStartGame(validated);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-4 shadow-inner">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Pass & Play TV Game Show
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-lg">
          GOLDEN SPHERES
        </h1>
        <p className="text-amber-100/70 text-sm sm:text-base max-w-xl mx-auto mt-2 font-medium">
          A game of high stakes, cunning bluffs, jackpot building, and the ultimate Split or Steal decision.
        </p>
      </motion.div>

      {/* Main Setup Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full bg-neutral-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden"
      >
        {/* Glow accent decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {/* Step 1: Select Player Count */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-amber-300 uppercase tracking-wider mb-3">
              <Users className="w-5 h-5 text-amber-400" />
              1. Select Number of Players
            </label>
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {[4, 5, 6, 7].map((count) => {
                const isSelected = playerCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handlePlayerCountChange(count)}
                    className={`py-3 sm:py-4 rounded-2xl font-black text-lg sm:text-2xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-neutral-950 border-amber-200 shadow-lg shadow-amber-500/30 scale-105'
                        : 'bg-neutral-800/80 text-amber-200/80 border-amber-500/20 hover:border-amber-400/50 hover:bg-neutral-800'
                    }`}
                  >
                    {count}
                    <span className="block text-[10px] sm:text-xs font-semibold opacity-80 mt-0.5">
                      Players
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-neutral-400 mt-2 text-center">
              {playerCount === 4 && '4 Players = 16 Initial Balls (4 Killers + 12 Money • 4 per player)'}
              {playerCount === 5 && '5 Players = 20 Initial Balls (5 Killers + 15 Money • 4 per player)'}
              {playerCount === 6 && '6 Players = 24 Initial Balls (6 Killers + 18 Money • 4 per player)'}
              {playerCount === 7 && '7 Players = 28 Initial Balls (8 Killers + 20 Money • 4 per player)'}
            </p>
          </div>

          {/* Step 2: Contestant Names */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-amber-300 uppercase tracking-wider mb-3">
              <UserCheck className="w-5 h-5 text-amber-400" />
              2. Enter Player Names
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {Array.from({ length: playerCount }).map((_, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-500/80">
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    maxLength={16}
                    value={names[idx] || ''}
                    onChange={(e) => handleNameChange(idx, e.target.value)}
                    placeholder={`Player ${idx + 1}`}
                    required
                    className="w-full bg-neutral-950 border border-amber-500/30 rounded-xl pl-10 pr-4 py-3 text-amber-100 placeholder-neutral-600 font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-sm transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 rounded-2xl font-black text-lg sm:text-xl tracking-wider uppercase text-neutral-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-[0.99] transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Trophy className="w-6 h-6 text-neutral-950" />
              Start Game Show
              <Play className="w-5 h-5 fill-neutral-950" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
