import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { ShieldAlert, Lock, Eye, Sparkles, RefreshCw, Trophy, Skull } from 'lucide-react';
import { Choice, Player } from '../types';
import { formatRupees } from '../data/moneyValues';
import { sound } from '../utils/sound';

interface SplitOrStealScreenProps {
  finalists: Player[];
  finalJackpot: number;
  onRestartGame: () => void;
}

export const SplitOrStealScreen: React.FC<SplitOrStealScreenProps> = ({
  finalists,
  finalJackpot,
  onRestartGame,
}) => {
  const [stage, setStage] = useState<'P1_PASS' | 'P1_CHOICE' | 'P2_PASS' | 'P2_CHOICE' | 'COUNTDOWN' | 'REVEAL'>('P1_PASS');
  const [p1Choice, setP1Choice] = useState<Choice | null>(null);
  const [p2Choice, setP2Choice] = useState<Choice | null>(null);
  const [countdown, setCountdown] = useState<number>(3);

  const player1 = finalists[0];
  const player2 = finalists[1];

  // Countdown timer for reveal
  useEffect(() => {
    if (stage === 'COUNTDOWN') {
      if (countdown > 0) {
        sound.playCountdownTick();
        const timer = setTimeout(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // Countdown finished! Trigger reveal
        sound.playSplitStealFanfare();
        setStage('REVEAL');

        // Confetti if anyone won money
        if (p1Choice === 'SPLIT' && p2Choice === 'SPLIT') {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        } else if (p1Choice === 'STEAL' || p2Choice === 'STEAL') {
          if (!(p1Choice === 'STEAL' && p2Choice === 'STEAL')) {
            confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
          }
        }
      }
    }
  }, [stage, countdown, p1Choice, p2Choice]);

  const handleP1Confirm = (choice: Choice) => {
    sound.playClick();
    setP1Choice(choice);
    setStage('P2_PASS');
  };

  const handleP2Confirm = (choice: Choice) => {
    sound.playClick();
    setP2Choice(choice);
    setCountdown(3);
    setStage('COUNTDOWN');
  };

  // Outcome calculation
  let p1Payout = 0;
  let p2Payout = 0;
  let outcomeTitle = '';
  let outcomeDesc = '';

  if (p1Choice === 'SPLIT' && p2Choice === 'SPLIT') {
    p1Payout = finalJackpot / 2;
    p2Payout = finalJackpot / 2;
    outcomeTitle = 'BOTH SPLIT! EQUAL SHARE!';
    outcomeDesc = `${player1.name} and ${player2.name} both chose SPLIT and walk away with ${formatRupees(p1Payout)} each!`;
  } else if (p1Choice === 'STEAL' && p2Choice === 'SPLIT') {
    p1Payout = finalJackpot;
    p2Payout = 0;
    outcomeTitle = `${player1.name.toUpperCase()} STOLE THE ENTIRE JACKPOT!`;
    outcomeDesc = `${player1.name} chose STEAL while ${player2.name} chose SPLIT. ${player1.name} takes all ${formatRupees(finalJackpot)}!`;
  } else if (p1Choice === 'SPLIT' && p2Choice === 'STEAL') {
    p1Payout = 0;
    p2Payout = finalJackpot;
    outcomeTitle = `${player2.name.toUpperCase()} STOLE THE ENTIRE JACKPOT!`;
    outcomeDesc = `${player2.name} chose STEAL while ${player1.name} chose SPLIT. ${player2.name} takes all ${formatRupees(finalJackpot)}!`;
  } else if (p1Choice === 'STEAL' && p2Choice === 'STEAL') {
    p1Payout = 0;
    p2Payout = 0;
    outcomeTitle = 'BOTH STOLE! BOTH WALK AWAY WITH ₹0!';
    outcomeDesc = `Both ${player1.name} and ${player2.name} chose STEAL! Greed wins nothing — the jackpot of ${formatRupees(finalJackpot)} is lost!`;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {/* PLAYER 1 PASS COVER */}
        {stage === 'P1_PASS' && (
          <motion.div
            key="p1_pass"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full bg-neutral-900 border border-amber-500/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-950/80 border-2 border-red-500 flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-10 h-10 text-red-400 animate-pulse" />
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-950 px-3 py-1 rounded-full border border-amber-500/30">
              The Final Decision • Jackpot: {formatRupees(finalJackpot)}
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-amber-100 uppercase my-4">
              Pass Device To:
            </h2>
            <div className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 my-4">
              {player1.name}
            </div>

            <p className="text-red-300/90 text-sm max-w-md mx-auto mb-8 font-semibold bg-red-950/40 p-3 rounded-xl border border-red-500/20">
              🔒 SECRET ZONE: {player2.name} must look away! Choose SPLIT or STEAL in secret.
            </p>

            <button
              onClick={() => {
                sound.playClick();
                setStage('P1_CHOICE');
              }}
              className="px-8 py-4 rounded-2xl font-black text-lg uppercase tracking-wider text-neutral-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:brightness-110 shadow-xl cursor-pointer"
            >
              <Eye className="w-5 h-5 inline mr-2" />
              I Am {player1.name} • Make My Secret Choice
            </button>
          </motion.div>
        )}

        {/* PLAYER 1 SECRET CHOICE */}
        {stage === 'P1_CHOICE' && (
          <motion.div
            key="p1_choice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full bg-neutral-900 border border-amber-500/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl"
          >
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-950 px-3 py-1 rounded-full border border-amber-500/30">
              Jackpot At Stake: {formatRupees(finalJackpot)}
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-amber-100 uppercase my-4">
              {player1.name}, Choose Your Fate
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8">
              <button
                onClick={() => handleP1Confirm('SPLIT')}
                className="p-8 rounded-3xl border-2 border-emerald-500/60 bg-gradient-to-br from-emerald-950 via-neutral-900 to-emerald-950 hover:border-emerald-400 hover:scale-105 transition-all text-center group cursor-pointer shadow-xl shadow-emerald-900/30"
              >
                <div className="text-3xl font-black text-emerald-400 uppercase tracking-wide mb-2 group-hover:text-emerald-300">
                  SPLIT 🤝
                </div>
                <p className="text-xs text-emerald-200/80 font-medium">
                  If both split, you share the {formatRupees(finalJackpot)} jackpot equally!
                </p>
              </button>

              <button
                onClick={() => handleP1Confirm('STEAL')}
                className="p-8 rounded-3xl border-2 border-amber-500/60 bg-gradient-to-br from-amber-950 via-neutral-900 to-amber-950 hover:border-amber-400 hover:scale-105 transition-all text-center group cursor-pointer shadow-xl shadow-amber-900/30"
              >
                <div className="text-3xl font-black text-amber-400 uppercase tracking-wide mb-2 group-hover:text-amber-300">
                  STEAL 👑
                </div>
                <p className="text-xs text-amber-200/80 font-medium">
                  If they split, you steal 100%! If both steal, both walk away with ₹0!
                </p>
              </button>
            </div>
          </motion.div>
        )}

        {/* PLAYER 2 PASS COVER */}
        {stage === 'P2_PASS' && (
          <motion.div
            key="p2_pass"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full bg-neutral-900 border border-amber-500/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-950/80 border-2 border-red-500 flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-10 h-10 text-red-400 animate-pulse" />
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-950 px-3 py-1 rounded-full border border-amber-500/30">
              {player1.name} Has Chosen & Locked Selection!
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-amber-100 uppercase my-4">
              Pass Device To:
            </h2>
            <div className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 my-4">
              {player2.name}
            </div>

            <p className="text-red-300/90 text-sm max-w-md mx-auto mb-8 font-semibold bg-red-950/40 p-3 rounded-xl border border-red-500/20">
              🔒 SECRET ZONE: {player1.name} must look away! Choose SPLIT or STEAL in secret.
            </p>

            <button
              onClick={() => {
                sound.playClick();
                setStage('P2_CHOICE');
              }}
              className="px-8 py-4 rounded-2xl font-black text-lg uppercase tracking-wider text-neutral-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:brightness-110 shadow-xl cursor-pointer"
            >
              <Eye className="w-5 h-5 inline mr-2" />
              I Am {player2.name} • Make My Secret Choice
            </button>
          </motion.div>
        )}

        {/* PLAYER 2 SECRET CHOICE */}
        {stage === 'P2_CHOICE' && (
          <motion.div
            key="p2_choice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full bg-neutral-900 border border-amber-500/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl"
          >
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-950 px-3 py-1 rounded-full border border-amber-500/30">
              Jackpot At Stake: {formatRupees(finalJackpot)}
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-amber-100 uppercase my-4">
              {player2.name}, Choose Your Fate
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8">
              <button
                onClick={() => handleP2Confirm('SPLIT')}
                className="p-8 rounded-3xl border-2 border-emerald-500/60 bg-gradient-to-br from-emerald-950 via-neutral-900 to-emerald-950 hover:border-emerald-400 hover:scale-105 transition-all text-center group cursor-pointer shadow-xl shadow-emerald-900/30"
              >
                <div className="text-3xl font-black text-emerald-400 uppercase tracking-wide mb-2 group-hover:text-emerald-300">
                  SPLIT 🤝
                </div>
                <p className="text-xs text-emerald-200/80 font-medium">
                  If both split, you share the {formatRupees(finalJackpot)} jackpot equally!
                </p>
              </button>

              <button
                onClick={() => handleP2Confirm('STEAL')}
                className="p-8 rounded-3xl border-2 border-amber-500/60 bg-gradient-to-br from-amber-950 via-neutral-900 to-amber-950 hover:border-amber-400 hover:scale-105 transition-all text-center group cursor-pointer shadow-xl shadow-amber-900/30"
              >
                <div className="text-3xl font-black text-amber-400 uppercase tracking-wide mb-2 group-hover:text-amber-300">
                  STEAL 👑
                </div>
                <p className="text-xs text-amber-200/80 font-medium">
                  If they split, you steal 100%! If both steal, both walk away with ₹0!
                </p>
              </button>
            </div>
          </motion.div>
        )}

        {/* DRAMATIC COUNTDOWN */}
        {stage === 'COUNTDOWN' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="w-full bg-neutral-950 border-2 border-amber-500/60 rounded-3xl p-12 text-center shadow-2xl my-8"
          >
            <div className="text-xs font-black uppercase tracking-widest text-amber-400 mb-2">
              CHOICES LOCKED • PREPARE FOR SIMULTANEOUS REVEAL
            </div>

            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 my-6 drop-shadow-2xl"
            >
              {countdown > 0 ? countdown : 'REVEAL!'}
            </motion.div>
          </motion.div>
        )}

        {/* SIMULTANEOUS REVEAL & RESULT */}
        {stage === 'REVEAL' && (
          <motion.div
            key="reveal_result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-neutral-900/90 border border-amber-500/40 rounded-3xl p-6 sm:p-10 text-center shadow-2xl backdrop-blur-xl"
          >
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-950 px-4 py-1.5 rounded-full border border-amber-500/40">
              Final Game Show Result
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 uppercase my-4">
              {outcomeTitle}
            </h2>

            <p className="text-amber-100/90 text-sm sm:text-base max-w-xl mx-auto mb-8 font-semibold">
              {outcomeDesc}
            </p>

            {/* Final Player Decision Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8">
              {/* Player 1 Card */}
              <div
                className={`p-6 rounded-3xl border-2 text-center shadow-2xl flex flex-col items-center justify-between ${
                  p1Choice === 'SPLIT'
                    ? 'border-emerald-500/60 bg-emerald-950/30'
                    : 'border-amber-500/60 bg-amber-950/30'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Finalist 1
                  </span>
                  <h3 className="text-2xl font-black text-amber-100">{player1.name}</h3>
                </div>

                <div className="my-6">
                  <span
                    className={`text-4xl font-black uppercase tracking-widest px-6 py-2 rounded-2xl border ${
                      p1Choice === 'SPLIT'
                        ? 'bg-emerald-900/80 text-emerald-300 border-emerald-500'
                        : 'bg-amber-900/80 text-amber-300 border-amber-500'
                    }`}
                  >
                    {p1Choice === 'SPLIT' ? 'SPLIT 🤝' : 'STEAL 👑'}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-neutral-400 font-semibold uppercase block">
                    Payout
                  </span>
                  <span className="text-3xl font-black text-yellow-400">
                    {formatRupees(p1Payout)}
                  </span>
                </div>
              </div>

              {/* Player 2 Card */}
              <div
                className={`p-6 rounded-3xl border-2 text-center shadow-2xl flex flex-col items-center justify-between ${
                  p2Choice === 'SPLIT'
                    ? 'border-emerald-500/60 bg-emerald-950/30'
                    : 'border-amber-500/60 bg-amber-950/30'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Finalist 2
                  </span>
                  <h3 className="text-2xl font-black text-amber-100">{player2.name}</h3>
                </div>

                <div className="my-6">
                  <span
                    className={`text-4xl font-black uppercase tracking-widest px-6 py-2 rounded-2xl border ${
                      p2Choice === 'SPLIT'
                        ? 'bg-emerald-900/80 text-emerald-300 border-emerald-500'
                        : 'bg-amber-900/80 text-amber-300 border-amber-500'
                    }`}
                  >
                    {p2Choice === 'SPLIT' ? 'SPLIT 🤝' : 'STEAL 👑'}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-neutral-400 font-semibold uppercase block">
                    Payout
                  </span>
                  <span className="text-3xl font-black text-yellow-400">
                    {formatRupees(p2Payout)}
                  </span>
                </div>
              </div>
            </div>

            {/* Restart Button */}
            <div className="pt-6 border-t border-amber-500/20">
              <button
                onClick={() => {
                  sound.playClick();
                  onRestartGame();
                }}
                className="px-10 py-4 rounded-2xl font-black text-lg uppercase tracking-wider text-neutral-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:brightness-110 shadow-xl flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <RefreshCw className="w-5 h-5" />
                Play New Game
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
