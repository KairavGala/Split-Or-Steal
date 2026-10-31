import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Shuffle,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  RotateCw,
  Eye,
  Lock,
  Layers,
} from 'lucide-react';
import { Ball, Player } from '../types';
import { BallComponent } from './BallComponent';
import {
  generateNewBallsBatch,
  scrambleAndRedistributeBalls,
  getPublicAndHiddenCounts,
} from '../utils/gameRules';
import { sound } from '../utils/sound';

interface ScrambleTumblerScreenProps {
  survivors: Player[];
  survivingBalls: Ball[];
  initialPlayerCount: number;
  currentRoundNumber: number;
  onScrambleComplete: (redistributedBalls: Ball[], nextRoundNumber: number) => void;
}

type ScrambleStep =
  | 'INTRO_ADD_BALLS'   // Step 2: Show surviving balls & new balls arriving
  | 'TUMBLER_MIXING'    // Step 3 & 4: Lottery cage tumbler animation mixing all balls
  | 'REDISTRIBUTED';    // Step 5: Balls dealt & randomly redistributed to survivors

export const ScrambleTumblerScreen: React.FC<ScrambleTumblerScreenProps> = ({
  survivors,
  survivingBalls,
  initialPlayerCount,
  currentRoundNumber,
  onScrambleComplete,
}) => {
  const nextRoundNumber = currentRoundNumber + 1;

  // Generate new balls batch for this round
  const [newBalls] = useState<Ball[]>(() =>
    generateNewBallsBatch(initialPlayerCount, survivors.length, nextRoundNumber)
  );

  const [step, setStep] = useState<ScrambleStep>('INTRO_ADD_BALLS');
  const [combinedPool, setCombinedPool] = useState<Ball[]>([
    ...survivingBalls,
    ...newBalls,
  ]);
  const [finalRedistributedBalls, setFinalRedistributedBalls] = useState<Ball[]>([]);
  const [isTumbling, setIsTumbling] = useState<boolean>(false);
  const [tumbleProgress, setTumbleProgress] = useState<number>(0);

  const totalPoolCount = combinedPool.length;
  const ballsPerPlayer = Math.floor(totalPoolCount / survivors.length);
  const { requiredPublic, requiredHidden } = getPublicAndHiddenCounts(ballsPerPlayer);

  const killerCountNew = newBalls.filter((b) => b.type === 'KILLER').length;
  const moneyCountNew = newBalls.filter((b) => b.type === 'MONEY').length;

  // Trigger Tumbler Scramble Animation
  const handleStartScramble = () => {
    sound.playClick();
    sound.playScrambleTumbler();
    setStep('TUMBLER_MIXING');
    setIsTumbling(true);
    setTumbleProgress(0);
  };

  // Tumbler Timer and sound loop
  useEffect(() => {
    if (step === 'TUMBLER_MIXING' && isTumbling) {
      const interval = setInterval(() => {
        setTumbleProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsTumbling(false);
            // Execute actual full scramble and redistribution
            const redistributed = scrambleAndRedistributeBalls(
              survivingBalls,
              newBalls,
              survivors
            );
            setFinalRedistributedBalls(redistributed);
            setStep('REDISTRIBUTED');
            sound.playMoneyReveal();
            return 100;
          }
          if (prev % 30 === 0) {
            sound.playScrambleTumbler();
          }
          return prev + 5;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [step, isTumbling, survivingBalls, newBalls, survivors]);

  const handleProceedToPublicReveal = () => {
    sound.playClick();
    if (finalRedistributedBalls.length > 0) {
      onScrambleComplete(finalRedistributedBalls, nextRoundNumber);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-3">
          <Shuffle className="w-4 h-4 text-amber-400" />
          Round {nextRoundNumber} Transition • Ball Scramble
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 uppercase tracking-tight">
          THE GOLDEN SPHERES TUMBLER
        </h2>
        <p className="text-amber-100/80 text-xs sm:text-sm max-w-xl mx-auto mt-2 font-medium">
          Balls survive. Ball ownership does not! All surviving and new balls mix into one giant pool and are randomly redistributed.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* STEP 2: INTRODUCE NEW BALLS */}
        {step === 'INTRO_ADD_BALLS' && (
          <motion.div
            key="step_intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-neutral-900/90 border border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden"
          >
            <div className="text-center mb-8">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-500/40 inline-block mb-3">
                STEP 2 • NEW BALLS GENERATED
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-amber-100">
                {newBalls.length} New Balls Generated for Round {nextRoundNumber}
              </h3>
              <p className="text-neutral-400 text-xs sm:text-sm max-w-md mx-auto mt-2">
                With {survivors.length} surviving contestants, the vault introduces {moneyCountNew} Money ball{moneyCountNew !== 1 ? 's' : ''} and {killerCountNew} Killer ball{killerCountNew !== 1 ? 's' : ''}.
              </p>
            </div>

            {/* Clean summary breakdown without leaking values or ball identities */}
            <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-6 mb-8 text-center max-w-2xl mx-auto">
              <div className="text-xs font-bold uppercase tracking-widest text-amber-300 mb-4 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                NEW BALLS GENERATED
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-xs font-bold text-emerald-400 uppercase">Money Balls Added</div>
                    <div className="text-[11px] text-neutral-400">Random vault values</div>
                  </div>
                  <div className="text-3xl font-black text-emerald-300">
                    +{moneyCountNew}
                  </div>
                </div>

                <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-xs font-bold text-red-400 uppercase">Killer Balls Added</div>
                    <div className="text-[11px] text-neutral-400">Vault danger spheres</div>
                  </div>
                  <div className="text-3xl font-black text-red-400">
                    +{killerCountNew}
                  </div>
                </div>
              </div>
            </div>

            {/* Total Pool Equation summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-center">
              <div className="bg-neutral-800/80 border border-amber-500/20 rounded-2xl p-4">
                <div className="text-xs font-bold text-neutral-400 uppercase">SURVIVING BALLS</div>
                <div className="text-2xl font-black text-amber-300 mt-1">{survivingBalls.length} Balls</div>
                <div className="text-[10px] text-neutral-500">From Round {currentRoundNumber} survivors</div>
              </div>

              <div className="bg-neutral-800/80 border border-amber-500/20 rounded-2xl p-4">
                <div className="text-xs font-bold text-yellow-400 uppercase">+ NEW BALLS</div>
                <div className="text-2xl font-black text-yellow-400 mt-1">+{newBalls.length} Balls</div>
                <div className="text-[10px] text-neutral-500">{moneyCountNew} Money, {killerCountNew} Killer</div>
              </div>

              <div className="bg-gradient-to-br from-amber-900/60 to-neutral-800 border border-amber-400/50 rounded-2xl p-4">
                <div className="text-xs font-bold text-amber-200 uppercase">= TOTAL POOL AFTER SCRAMBLE</div>
                <div className="text-2xl font-black text-amber-100 mt-1">{totalPoolCount} Balls</div>
                <div className="text-[10px] text-amber-400/80 font-bold">
                  {ballsPerPlayer} balls per player ({requiredPublic} Public, {requiredHidden} Hidden)
                </div>
              </div>
            </div>

            {/* Host Action: Trigger Scramble */}
            <div className="text-center">
              <button
                onClick={handleStartScramble}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-lg uppercase tracking-wider bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-neutral-950 hover:brightness-110 shadow-xl shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-3 mx-auto transition-all active:scale-95"
              >
                <Shuffle className="w-6 h-6" />
                SCRAMBLE ALL {totalPoolCount} BALLS
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3 & 4: LOTTERY CAGE TUMBLER ANIMATION */}
        {step === 'TUMBLER_MIXING' && (
          <motion.div
            key="step_tumbling"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-neutral-900/95 border-2 border-amber-400 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden"
          >
            <div className="text-xs font-black uppercase tracking-widest text-yellow-400 bg-amber-950/80 px-4 py-1.5 rounded-full border border-amber-500/40 inline-block mb-3">
              STEP 4 • LOTTERY CAGE MIXING & OWNERSHIP RANDOMIZATION
            </div>

            <h3 className="text-3xl sm:text-4xl font-black text-amber-100 mb-2">
              Tumbler Spinning & Scrambling...
            </h3>
            <p className="text-amber-200/80 text-xs sm:text-sm max-w-md mx-auto mb-8 font-medium">
              Every surviving ball and new ball is mixed together inside the golden cage drum. Ownership is being completely dissolved!
            </p>

            {/* 3D LOTTERY CAGE / TUMBLER DRUM */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto my-6 flex items-center justify-center">
              {/* Outer Golden Ring Frame */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-4 border-dashed border-amber-400/60 shadow-[0_0_50px_rgba(245,158,11,0.3)]"
              />

              {/* Glass Drum Sphere */}
              <div className="absolute inset-4 rounded-full bg-radial from-amber-500/10 via-neutral-900/90 to-neutral-950 border-2 border-amber-300/40 backdrop-blur-md flex items-center justify-center overflow-hidden">
                {/* Cage wireframe lines */}
                <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />

                {/* Tumbling Balls inside drum */}
                <div className="relative w-full h-full p-4 flex flex-wrap items-center justify-center gap-2">
                  {combinedPool.map((ball, idx) => {
                    const randomX = (idx % 4) * 15 - 25;
                    const randomY = Math.sin(idx) * 20;
                    return (
                      <motion.div
                        key={ball.id || idx}
                        animate={{
                          x: [randomX, -randomX, randomX],
                          y: [randomY, -randomY, randomY],
                          rotate: [0, 180, 360],
                          scale: [0.85, 1.1, 0.85],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8 + (idx % 5) * 0.2,
                          ease: 'easeInOut',
                        }}
                        className="relative"
                      >
                        <BallComponent ball={ball} isMystery={true} size="sm" />
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Center Glow Spinner */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                className="absolute w-20 h-20 rounded-full border-2 border-amber-300/30 flex items-center justify-center pointer-events-none"
              >
                <RotateCw className="w-8 h-8 text-yellow-400 animate-spin" />
              </motion.div>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto mt-6">
              <div className="w-full bg-neutral-950 rounded-full h-3.5 border border-amber-500/30 overflow-hidden p-0.5">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-full"
                  style={{ width: `${tumbleProgress}%` }}
                />
              </div>
              <div className="text-xs font-bold text-amber-400 mt-2 flex items-center justify-between">
                <span>Randomizing Pool</span>
                <span>{tumbleProgress}%</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 5: REDISTRIBUTION COMPLETE */}
        {step === 'REDISTRIBUTED' && (
          <motion.div
            key="step_complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-neutral-900/90 border border-emerald-500/50 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>

              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-500/40 inline-block mb-3">
                STEP 5 • RANDOM REDISTRIBUTION COMPLETE
              </span>

              <h3 className="text-3xl sm:text-4xl font-black text-amber-100">
                All {totalPoolCount} Balls Redistributed Randomly!
              </h3>

              <p className="text-neutral-300 text-xs sm:text-sm max-w-md mx-auto mt-2">
                Every contestant now holds <strong>{ballsPerPlayer} random balls</strong> ({requiredPublic} Public, {requiredHidden} Hidden). Previous ownership has been completely erased.
              </p>
            </div>

            {/* Hand Allocation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {survivors.map((survivor) => {
                const playerBalls = finalRedistributedBalls.filter(
                  (b) => b.ownerId === survivor.id
                );
                const publicCount = playerBalls.filter((b) => b.isPublic).length;
                const hiddenCount = playerBalls.filter((b) => !b.isPublic).length;

                return (
                  <motion.div
                    key={survivor.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-neutral-800/80 border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between border-b border-neutral-700 pb-2.5 mb-3">
                      <span className="font-black text-amber-100 text-base">
                        {survivor.name}
                      </span>
                      <span className="text-xs font-bold bg-amber-950 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        {playerBalls.length} Balls Total
                      </span>
                    </div>

                    <div className="flex items-center justify-around bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-xs font-bold text-yellow-400">
                          <Eye className="w-3.5 h-3.5" />
                          {publicCount} Public
                        </div>
                        <div className="text-[10px] text-neutral-400">Exposed on table</div>
                      </div>

                      <div className="w-px h-8 bg-neutral-700" />

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-xs font-bold text-amber-400">
                          <Lock className="w-3.5 h-3.5" />
                          {hiddenCount} Hidden
                        </div>
                        <div className="text-[10px] text-neutral-400">Secret pass-check</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Proceed to Public Reveal Button */}
            <div className="text-center">
              <button
                onClick={handleProceedToPublicReveal}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-lg uppercase tracking-wider bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-neutral-950 hover:brightness-110 shadow-xl shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-3 mx-auto transition-all active:scale-95"
              >
                <Eye className="w-6 h-6" />
                START ROUND {nextRoundNumber} • PUBLIC REVEAL 👁️
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
