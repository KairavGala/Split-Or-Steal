import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Trash2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Flame,
  Coins,
  Lock,
} from 'lucide-react';
import { Ball, Player } from '../types';
import { BallComponent } from './BallComponent';
import { formatRupees } from '../data/moneyValues';
import { calculateJackpotFromKeptBalls, JackpotStep } from '../utils/gameRules';
import { sound } from '../utils/sound';

interface FinalBoardSelectionProps {
  finalists: Player[];
  finalBallPool: Ball[];
  onCompleteFinalBoard: (finalJackpot: number) => void;
}

interface PickedBallRecord {
  ball: Ball;
  action: 'BIN' | 'KEEP';
  pickedBy: Player;
  pickIndex: number; // 0 to 9
}

export const FinalBoardSelection: React.FC<FinalBoardSelectionProps> = ({
  finalists,
  finalBallPool,
  onCompleteFinalBoard,
}) => {
  const [pickedRecords, setPickedRecords] = useState<PickedBallRecord[]>([]);
  const [lastRevealAlert, setLastRevealAlert] = useState<{
    type: 'BIN_MONEY' | 'BIN_KILLER' | 'KEEP_MONEY' | 'KEEP_KILLER';
    text: string;
    subtext: string;
  } | null>(null);

  const totalPickedCount = pickedRecords.length;
  const isFinished = totalPickedCount >= 10;

  // Filter binned and kept lists
  const binnedRecords = pickedRecords.filter((r) => r.action === 'BIN');
  const keptRecords = pickedRecords.filter((r) => r.action === 'KEEP');
  const pickedBallIds = pickedRecords.map((r) => r.ball.id);

  // Turn logic:
  // Pair 0 (picks 0,1): Player A (Bin, then Keep)
  // Pair 1 (picks 2,3): Player B (Bin, then Keep)
  // Pair 2 (picks 4,5): Player A (Bin, then Keep)
  // Pair 3 (picks 6,7): Player B (Bin, then Keep)
  // Pair 4 (picks 8,9): Player A (Bin, then Keep)
  const currentPairIndex = Math.floor(totalPickedCount / 2);
  const currentTurnPlayer = finalists[currentPairIndex % 2];
  const nextAction: 'BIN' | 'KEEP' = totalPickedCount % 2 === 0 ? 'BIN' : 'KEEP';

  // Calculate live running jackpot from current kept balls
  const keptBallsOnly = keptRecords.map((r) => r.ball);
  const { finalJackpot, steps: jackpotSteps } = calculateJackpotFromKeptBalls(keptBallsOnly);

  const handleSelectMysteryBall = (ball: Ball) => {
    if (pickedBallIds.includes(ball.id) || isFinished) return;

    sound.playBallFlip();

    const newRecord: PickedBallRecord = {
      ball,
      action: nextAction,
      pickedBy: currentTurnPlayer,
      pickIndex: totalPickedCount,
    };

    const updatedRecords = [...pickedRecords, newRecord];
    setPickedRecords(updatedRecords);

    // Audio & Reaction Banner
    if (nextAction === 'BIN') {
      if (ball.type === 'MONEY') {
        sound.playGroanLoss();
        setLastRevealAlert({
          type: 'BIN_MONEY',
          text: `💥 ${formatRupees(ball.value || 0)} BINNED! LOST FOREVER!`,
          subtext: `${currentTurnPlayer.name} selected this ball for the BIN. It is removed from the game.`,
        });
      } else {
        sound.playCheerCelebration();
        setLastRevealAlert({
          type: 'BIN_KILLER',
          text: `🎉 KILLER BINNED! SAFELY ELIMINATED!`,
          subtext: `Everyone celebrates! ${currentTurnPlayer.name} destroyed a Killer ball!`,
        });
      }
    } else {
      // KEEP action
      if (ball.type === 'MONEY') {
        sound.playMoneyReveal();
        setLastRevealAlert({
          type: 'KEEP_MONEY',
          text: `💰 +${formatRupees(ball.value || 0)} KEPT FOR JACKPOT!`,
          subtext: `${currentTurnPlayer.name} added this ball to the final jackpot collection!`,
        });
      } else {
        sound.playKillerReveal();
        setLastRevealAlert({
          type: 'KEEP_KILLER',
          text: `⚡ KILLER KEPT! JACKPOT SLASHED BY 10!`,
          subtext: `Disaster! ${currentTurnPlayer.name} picked a Killer to keep! The jackpot will be divided by 10!`,
        });
      }
    }
  };

  const handleProceedToSplitOrSteal = () => {
    sound.playClick();
    onCompleteFinalBoard(finalJackpot);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Title & Finalists Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-3">
          <Trophy className="w-4 h-4 text-amber-400" />
          The Final Showdown • 5 Bin / 5 Keep
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 uppercase tracking-tight">
          THE FINAL BOARD SELECTION
        </h2>
        <p className="text-amber-100/80 text-xs sm:text-sm max-w-xl mx-auto mt-2 font-medium">
          {finalists[0].name} & {finalists[1].name} take alternating turns. First ball is ALWAYS BINNED (destroyed). Second ball is ALWAYS KEPT (jackpot).
        </p>
      </motion.div>

      {/* LIVE INTERACTIVE TURN / STATUS CARD */}
      {!isFinished ? (
        <motion.div
          key={totalPickedCount}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`border-2 rounded-3xl p-5 sm:p-6 mb-8 text-center shadow-2xl relative overflow-hidden ${
            nextAction === 'BIN'
              ? 'bg-gradient-to-r from-red-950/90 via-neutral-900 to-red-950/90 border-red-500/80'
              : 'bg-gradient-to-r from-amber-950/90 via-neutral-900 to-amber-950/90 border-amber-400/80'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border ${
                  nextAction === 'BIN'
                    ? 'bg-red-900/80 border-red-500 text-red-300'
                    : 'bg-amber-900/80 border-amber-400 text-amber-200'
                }`}
              >
                {nextAction === 'BIN' ? <Trash2 className="w-6 h-6" /> : <Coins className="w-6 h-6" />}
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Pick #{totalPickedCount + 1} of 10 • {currentTurnPlayer.name}'s Turn
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-100">
                  {currentTurnPlayer.name} must select a ball to{' '}
                  <span
                    className={
                      nextAction === 'BIN'
                        ? 'text-red-400 underline font-black'
                        : 'text-yellow-400 underline font-black'
                    }
                  >
                    {nextAction === 'BIN' ? 'BIN 🗑️ (DESTROY)' : 'KEEP 🏆 (JACKPOT)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Selection Progress Counters */}
            <div className="flex items-center gap-4">
              <div className="bg-neutral-950/80 border border-red-500/40 rounded-xl px-4 py-2 text-center">
                <span className="text-[10px] font-bold text-red-400 uppercase block">Binned</span>
                <span className="text-base font-black text-red-300">{binnedRecords.length} / 5</span>
              </div>

              <div className="bg-neutral-950/80 border border-amber-500/40 rounded-xl px-4 py-2 text-center">
                <span className="text-[10px] font-bold text-yellow-400 uppercase block">Kept</span>
                <span className="text-base font-black text-yellow-300">{keptRecords.length} / 5</span>
              </div>
            </div>
          </div>

          {/* Current Running Jackpot Preview */}
          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span>
              Rule: 1st pick = <strong>BIN</strong> | 2nd pick = <strong>KEEP</strong>
            </span>
            <span className="text-amber-300 font-bold">
              Current Kept Total: {formatRupees(finalJackpot)} ({keptRecords.length}/5 balls)
            </span>
          </div>
        </motion.div>
      ) : (
        /* FINISHED SELECTION BANNER */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-950 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 text-center mb-8 shadow-2xl"
        >
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-950 border-2 border-amber-400 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>

          <div className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-4 py-1 rounded-full border border-emerald-500/40 inline-block mb-2">
            ALL 10 BALLS SELECTED (5 BINNED, 5 KEPT)
          </div>

          <h3 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400">
            FINAL JACKPOT: {formatRupees(finalJackpot)}
          </h3>

          <p className="text-amber-200/90 text-xs sm:text-sm max-w-md mx-auto my-3 font-medium">
            Calculated strictly using the 5 KEPT balls in the exact sequence they were revealed.
          </p>

          <button
            onClick={handleProceedToSplitOrSteal}
            className="px-10 py-4 rounded-2xl font-black text-lg uppercase tracking-wider bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-neutral-950 hover:brightness-110 shadow-xl shadow-amber-500/30 cursor-pointer flex items-center justify-center gap-3 mx-auto mt-4 transition-all active:scale-95"
          >
            PROCEED TO SPLIT OR STEAL ({formatRupees(finalJackpot)})
            <ArrowRight className="w-6 h-6" />
          </button>
        </motion.div>
      )}

      {/* LAST REVEAL ALERT NOTIFICATION */}
      <AnimatePresence>
        {lastRevealAlert && (
          <motion.div
            key={lastRevealAlert.text}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl border mb-8 text-center flex flex-col items-center justify-center shadow-lg ${
              lastRevealAlert.type === 'BIN_KILLER'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                : lastRevealAlert.type === 'BIN_MONEY'
                ? 'bg-red-950/90 border-red-500 text-red-200'
                : lastRevealAlert.type === 'KEEP_MONEY'
                ? 'bg-amber-950/90 border-amber-400 text-amber-100'
                : 'bg-red-950/90 border-red-500 text-red-100'
            }`}
          >
            <div className="text-lg sm:text-xl font-black">{lastRevealAlert.text}</div>
            <div className="text-xs text-neutral-300 mt-1">{lastRevealAlert.subtext}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RACKS CONTAINER: BINNED ON LEFT, KEPT ON RIGHT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* LEFT RACK: BINNED BALLS */}
        <div className="bg-neutral-900/90 border border-red-500/40 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-red-500/20 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              <span className="font-black text-base text-red-300 uppercase tracking-wider">
                BINNED SPHERES
              </span>
            </div>
            <span className="text-xs font-bold bg-red-950 px-2.5 py-1 rounded-full border border-red-500/30 text-red-300">
              {binnedRecords.length} / 5
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 min-h-[110px] bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800">
            {binnedRecords.length === 0 ? (
              <span className="text-xs text-neutral-600 font-medium italic">
                No balls binned yet. (1st pick of each turn is binned)
              </span>
            ) : (
              binnedRecords.map((r, idx) => (
                <motion.div
                  key={r.ball.id}
                  initial={{ scale: 0.5, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="flex flex-col items-center"
                >
                  <BallComponent
                    ball={r.ball}
                    isPublic={true}
                    size="md"
                    showBadge={true}
                    badgeText={`BIN #${idx + 1} 🗑️`}
                  />
                  <span className="text-[10px] text-neutral-400 font-bold mt-1">
                    by {r.pickedBy.name}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT RACK: KEPT FOR JACKPOT */}
        <div className="bg-neutral-900/90 border border-amber-500/40 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-black text-base text-amber-200 uppercase tracking-wider">
                KEPT FOR JACKPOT
              </span>
            </div>
            <span className="text-xs font-bold bg-amber-950 px-2.5 py-1 rounded-full border border-amber-500/30 text-yellow-300">
              {keptRecords.length} / 5
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 min-h-[110px] bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800">
            {keptRecords.length === 0 ? (
              <span className="text-xs text-neutral-600 font-medium italic">
                No balls kept yet. (2nd pick of each turn is kept)
              </span>
            ) : (
              keptRecords.map((r, idx) => (
                <motion.div
                  key={r.ball.id}
                  initial={{ scale: 0.5, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="flex flex-col items-center"
                >
                  <BallComponent
                    ball={r.ball}
                    isPublic={true}
                    size="md"
                    showBadge={true}
                    badgeText={`KEEP #${idx + 1} 🏆`}
                  />
                  <span className="text-[10px] text-amber-400 font-bold mt-1">
                    by {r.pickedBy.name}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* STEP-BY-STEP JACKPOT BREAKDOWN CARD (Visible when balls are kept) */}
      {keptRecords.length > 0 && (
        <motion.div
          layout
          className="bg-neutral-900/80 border border-amber-500/30 rounded-3xl p-5 mb-8 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="font-black text-sm text-amber-200 uppercase tracking-wider">
                Sequential Jackpot Calculation ({keptRecords.length}/5 Spheres Kept)
              </span>
            </div>
            <span className="text-base font-black text-yellow-400">
              Current: {formatRupees(finalJackpot)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, idx) => {
              const step = jackpotSteps[idx];
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border text-center flex flex-col justify-between ${
                    step
                      ? step.ball.type === 'KILLER'
                        ? 'bg-red-950/50 border-red-500/50 text-red-200'
                        : 'bg-neutral-800/80 border-amber-500/40 text-amber-100'
                      : 'bg-neutral-950/40 border-neutral-800 text-neutral-600'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1">
                    Sphere #{idx + 1}
                  </div>

                  {step ? (
                    <div>
                      <div className="text-lg font-black">{step.operation}</div>
                      <div className="text-xs font-bold text-amber-300 mt-1">
                        = {formatRupees(step.runningTotal)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs italic py-3 text-neutral-600">Pending Pick...</div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* MYSTERY FINAL POOL BOARD */}
      <div className="bg-neutral-900/90 border border-amber-500/30 p-6 sm:p-8 rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-black text-lg text-amber-100 uppercase tracking-wide">
              Final Spheres Pool ({finalBallPool.length} Total)
            </h3>
          </div>
          <span className="text-xs text-neutral-400">
            {isFinished
              ? 'All unpicked balls revealed face-up!'
              : 'Click any mystery sphere to reveal & assign'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-6 justify-items-center">
          {finalBallPool.map((ball, idx) => {
            const isPicked = pickedBallIds.includes(ball.id);
            const pickedRecord = pickedRecords.find((r) => r.ball.id === ball.id);

            return (
              <motion.div
                key={ball.id || idx}
                whileHover={!isPicked && !isFinished ? { scale: 1.06 } : {}}
                whileTap={!isPicked && !isFinished ? { scale: 0.95 } : {}}
                className="flex flex-col items-center"
              >
                <BallComponent
                  ball={ball}
                  isMystery={!isPicked && !isFinished}
                  isRevealed={isPicked || isFinished}
                  size="lg"
                  onClick={() => handleSelectMysteryBall(ball)}
                  disabled={isPicked || isFinished}
                  showBadge={isPicked || isFinished}
                  badgeText={
                    pickedRecord
                      ? pickedRecord.action === 'BIN'
                        ? 'BINNED 🗑️'
                        : 'KEPT 🏆'
                      : isFinished
                      ? 'UNTOUCHED'
                      : undefined
                  }
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
