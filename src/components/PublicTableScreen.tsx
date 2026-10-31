import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  UserX,
  AlertTriangle,
  MessageCircle,
  Trash2,
  ArrowRight,
  Eye,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Ball, Player } from '../types';
import { BallComponent } from './BallComponent';
import { sound } from '../utils/sound';

interface PublicTableScreenProps {
  activePlayers: Player[];
  allBalls: Ball[];
  roundNumber: number;
  onEliminateAndProceed: (eliminatedPlayer: Player, survivors: Player[]) => void;
}

type RevealStep =
  | 'IDLE'
  | 'ELIMINATED_REVEAL'
  | 'SURVIVOR_SELECT'
  | 'SURVIVOR_REVEAL'
  | 'ALL_COMPLETE';

export const PublicTableScreen: React.FC<PublicTableScreenProps> = ({
  activePlayers,
  allBalls,
  roundNumber,
  onEliminateAndProceed,
}) => {
  const [selectedForElimination, setSelectedForElimination] = useState<Player | null>(null);

  // Sequential Reveal State Machine
  const [revealStep, setRevealStep] = useState<RevealStep>('IDLE');
  const [eliminatedPlayer, setEliminatedPlayer] = useState<Player | null>(null);
  const [revealedSurvivorIds, setRevealedSurvivorIds] = useState<string[]>([]);
  const [currentRevealingSurvivor, setCurrentRevealingSurvivor] = useState<Player | null>(null);

  const survivors = eliminatedPlayer
    ? activePlayers.filter((p) => p.id !== eliminatedPlayer.id)
    : [];

  const unrevealedSurvivors = survivors.filter((p) => !revealedSurvivorIds.includes(p.id));

  // 1. Host selects candidate for elimination
  const handleSelectEliminate = (player: Player) => {
    sound.playClick();
    setSelectedForElimination(player);
  };

  // 2. Host confirms elimination -> Step 1: Reveal eliminated player's hand first
  const handleConfirmElimination = () => {
    if (!selectedForElimination) return;
    sound.playKillerReveal();
    setEliminatedPlayer(selectedForElimination);
    setSelectedForElimination(null);
    setRevealedSurvivorIds([]);
    setCurrentRevealingSurvivor(null);
    setRevealStep('ELIMINATED_REVEAL');
  };

  // 3. Eliminated player's hand binned -> Proceed to surviving players' hand reviews
  const handleFinishEliminatedReveal = () => {
    sound.playBinDrop();
    setRevealStep('SURVIVOR_SELECT');
  };

  // 4. Host selects a specific surviving player to reveal
  const handleSelectSurvivorToReveal = (player: Player) => {
    sound.playMoneyReveal();
    setCurrentRevealingSurvivor(player);
    setRevealStep('SURVIVOR_REVEAL');
  };

  // Quick action: Reveal the next unrevealed survivor in sequence
  const handleRevealNextSurvivorAuto = () => {
    if (unrevealedSurvivors.length > 0) {
      handleSelectSurvivorToReveal(unrevealedSurvivors[0]);
    }
  };

  // 5. Host finishes inspecting currently selected survivor
  const handleFinishSurvivorReveal = () => {
    sound.playClick();
    if (!currentRevealingSurvivor) return;

    const newRevealed = [...revealedSurvivorIds, currentRevealingSurvivor.id];
    setRevealedSurvivorIds(newRevealed);
    setCurrentRevealingSurvivor(null);

    // Check if any survivors are still unrevealed
    const remainingCount = survivors.filter((p) => !newRevealed.includes(p.id)).length;

    if (remainingCount > 0) {
      setRevealStep('SURVIVOR_SELECT');
    } else {
      setRevealStep('ALL_COMPLETE');
    }
  };

  // 6. Complete entire reveal sequence and advance round
  const handleCompleteAllReveals = () => {
    sound.playClick();
    if (eliminatedPlayer) {
      onEliminateAndProceed(eliminatedPlayer, survivors);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Table Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-neutral-900 via-amber-950/60 to-neutral-900 border border-amber-500/30 rounded-3xl p-6 mb-8 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <MessageCircle className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-400">
            TV Game Show Table • Round {roundNumber}
          </span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 uppercase tracking-tight">
          THE PUBLIC DISCUSSION
        </h2>
        <p className="text-amber-100/80 text-xs sm:text-sm max-w-2xl mx-auto mt-2 font-medium">
          Public balls are exposed. Hidden balls 🔒 remain locked during discussion. Every player's entire hand will be revealed one-by-one after elimination!
        </p>
      </motion.div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {activePlayers.map((player) => {
          const playerBalls = allBalls.filter((b) => b.ownerId === player.id);
          const publicBalls = playerBalls.filter((b) => b.isPublic === true);
          const hiddenBalls = playerBalls.filter((b) => b.isPublic !== true);
          const isSelected = selectedForElimination?.id === player.id;

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-neutral-900/90 border rounded-3xl p-5 shadow-xl transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-red-500 ring-4 ring-red-500/50 bg-red-950/20 scale-[1.02]'
                  : 'border-amber-500/30 hover:border-amber-400/60'
              }`}
            >
              {/* Player Top Banner */}
              <div>
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-300 text-xs">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-xl font-black text-amber-100 tracking-wide">
                      {player.name}
                    </h3>
                  </div>

                  <div className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/30">
                    {playerBalls.length} Balls Total
                  </div>
                </div>

                {/* Ball List Display */}
                <div className="space-y-3">
                  {/* Public Balls */}
                  <div>
                    <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider block mb-2">
                      Public Balls ({publicBalls.length})
                    </span>
                    <div className="flex flex-wrap gap-3 items-center">
                      {publicBalls.map((b) => (
                        <BallComponent key={b.id} ball={b} isPublic={true} size="md" />
                      ))}
                    </div>
                  </div>

                  {/* Hidden Balls - Strictly Locked During Discussion */}
                  <div className="pt-2 border-t border-neutral-800">
                    <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-wider block mb-2">
                      Hidden Balls ({hiddenBalls.length})
                    </span>
                    <div className="flex flex-wrap gap-3 items-center">
                      {hiddenBalls.map((ball, idx) => (
                        <BallComponent
                          key={ball.id || `hidden_${idx}`}
                          ball={ball}
                          isPublic={false}
                          isMystery={true}
                          size="md"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Host Eliminate Trigger for this player */}
              <div className="mt-6 pt-4 border-t border-amber-500/20">
                <button
                  onClick={() => handleSelectEliminate(player)}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/40'
                      : 'bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-500/30'
                  }`}
                >
                  <UserX className="w-4 h-4 text-red-400" />
                  {isSelected ? 'SELECTED FOR ELIMINATION' : `Eliminate ${player.name}`}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Host Confirmation Bar */}
      {selectedForElimination && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl bg-red-950 border-2 border-red-500 rounded-2xl p-4 shadow-2xl z-40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 text-red-100">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 animate-bounce" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-red-400">
                Host Action • Eliminate Player
              </div>
              <div className="text-base font-black">
                Eliminate <span className="text-yellow-300 underline">{selectedForElimination.name}</span> from the game?
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setSelectedForElimination(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-900 text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmElimination}
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/40 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Flame className="w-4 h-4 fill-white" />
              CONFIRM ELIMINATION
            </button>
          </div>
        </motion.div>
      )}

      {/* SEQUENTIAL POST-ELIMINATION ENTIRE HAND REVEAL MODAL */}
      <AnimatePresence>
        {revealStep !== 'IDLE' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            {/* STEP 1: REVEAL ELIMINATED PLAYER'S ENTIRE HAND FIRST */}
            {revealStep === 'ELIMINATED_REVEAL' && eliminatedPlayer && (
              <motion.div
                key="reveal_eliminated"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-neutral-900 border-2 border-red-500/80 rounded-3xl p-6 sm:p-10 max-w-2xl w-full text-center shadow-2xl relative overflow-hidden"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-950 border border-red-500 flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>

                <div className="text-xs font-black uppercase tracking-widest text-red-400 bg-red-950/80 px-4 py-1 rounded-full border border-red-500/40 inline-block mb-3">
                  STEP 1 • ELIMINATED PLAYER'S ENTIRE HAND REVEALED
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-amber-100">
                  {eliminatedPlayer.name}'s Entire Collection
                </h2>

                <p className="text-neutral-400 text-xs sm:text-sm my-3">
                  All balls belonging to {eliminatedPlayer.name} are revealed face-up before being discarded to the bin.
                </p>

                <div className="flex flex-wrap justify-center gap-6 my-8">
                  {allBalls
                    .filter((b) => b.ownerId === eliminatedPlayer.id)
                    .map((ball) => (
                      <motion.div
                        key={ball.id}
                        initial={{ rotateY: 180, scale: 0.5 }}
                        animate={{ rotateY: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        <BallComponent
                          ball={ball}
                          isPublic={true}
                          size="lg"
                          showBadge={true}
                          badgeText={ball.isPublic ? 'WAS PUBLIC 👁️' : 'WAS HIDDEN 🔒'}
                        />
                      </motion.div>
                    ))}
                </div>

                <button
                  onClick={handleFinishEliminatedReveal}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-base uppercase tracking-wider bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-neutral-950 hover:brightness-110 shadow-xl shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2 mx-auto"
                >
                  Bin Hand & Reveal Surviving Players' Hands 👁️
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* STEP 2: HOST CHOOSES WHICH SURVIVING PLAYER'S HAND TO REVEAL NEXT */}
            {revealStep === 'SURVIVOR_SELECT' && (
              <motion.div
                key="select_survivor"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-neutral-900 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-10 max-w-2xl w-full text-center shadow-2xl relative overflow-hidden"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-950 border border-amber-500/60 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-yellow-400 animate-pulse" />
                </div>

                <div className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-950/80 px-4 py-1 rounded-full border border-amber-500/40 inline-block mb-3">
                  STEP 2 • SURVIVING PLAYERS' ENTIRE HAND REVIEWS
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-amber-100">
                  Who Should Be Revealed Next?
                </h2>

                <p className="text-neutral-400 text-xs sm:text-sm my-3 max-w-md mx-auto">
                  Every surviving player's full hand is reviewed one at a time. The host chooses who to inspect next for group discussion!
                </p>

                {/* Primary Quick Action Button */}
                {unrevealedSurvivors.length > 0 && (
                  <button
                    onClick={handleRevealNextSurvivorAuto}
                    className="w-full py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-neutral-950 hover:brightness-110 shadow-lg shadow-amber-500/20 my-3 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    Reveal Next: {unrevealedSurvivors[0].name}'s Entire Hand
                  </button>
                )}

                {/* List of surviving players to choose from */}
                <div className="space-y-3 my-4 max-h-56 overflow-y-auto">
                  {survivors.map((survivor) => {
                    const isRevealed = revealedSurvivorIds.includes(survivor.id);
                    return (
                      <div
                        key={survivor.id}
                        className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                          isRevealed
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-neutral-800/80 border-amber-500/30 text-amber-100 hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-black text-lg">{survivor.name}</span>
                          {isRevealed && (
                            <span className="text-xs font-bold bg-emerald-900/80 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Entire Hand Reviewed
                            </span>
                          )}
                        </div>

                        {!isRevealed ? (
                          <button
                            onClick={() => handleSelectSurvivorToReveal(survivor)}
                            className="px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-neutral-800 text-amber-300 hover:bg-amber-500 hover:text-neutral-950 border border-amber-500/40 cursor-pointer flex items-center gap-1.5 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                            Reveal Hand
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-neutral-400">
                            Already Checked ✓
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="text-xs text-amber-400/80 font-medium flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    {revealedSurvivorIds.length} of {survivors.length} surviving hands reviewed
                  </span>
                </div>
              </motion.div>
            )}

            {/* STEP 3: DISPLAY REVEALED SURVIVING PLAYER'S ENTIRE HAND & PAUSE FOR DISCUSSION */}
            {revealStep === 'SURVIVOR_REVEAL' && currentRevealingSurvivor && (
              <motion.div
                key="reveal_survivor"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-neutral-900 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-10 max-w-2xl w-full text-center shadow-2xl relative overflow-hidden"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-950 border border-amber-500/60 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </div>

                <div className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-4 py-1 rounded-full border border-emerald-500/40 inline-block mb-3">
                  TRUTH CHECK • ENTIRE HAND REVEALED
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-amber-100">
                  {currentRevealingSurvivor.name}'s Entire Hand
                </h2>

                <p className="text-amber-200/90 text-xs sm:text-sm my-3 font-semibold bg-amber-950/40 p-3 rounded-xl border border-amber-500/20 max-w-md mx-auto">
                  💬 GROUP DISCUSSION PAUSE: Compare {currentRevealingSurvivor.name}'s claims during discussion against their actual hand!
                </p>

                {/* Display all balls (public + hidden) face up for this survivor */}
                <div className="flex flex-wrap justify-center gap-6 my-8">
                  {allBalls
                    .filter((b) => b.ownerId === currentRevealingSurvivor.id)
                    .map((ball) => (
                      <motion.div
                        key={ball.id}
                        initial={{ rotateY: 180, scale: 0.5 }}
                        animate={{ rotateY: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        <BallComponent
                          ball={ball}
                          isPublic={true}
                          size="lg"
                          showBadge={true}
                          badgeText={ball.isPublic ? 'WAS PUBLIC 👁️' : 'WAS HIDDEN 🔒'}
                        />
                      </motion.div>
                    ))}
                </div>

                <button
                  onClick={handleFinishSurvivorReveal}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-base uppercase tracking-wider bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-neutral-950 hover:brightness-110 shadow-xl shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2 mx-auto"
                >
                  {unrevealedSurvivors.length > 1 ? (
                    <>
                      Checked {currentRevealingSurvivor.name} • Select Next Player
                      <ArrowRight className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      All Hands Reviewed • Complete Round
                      <CheckCircle2 className="w-5 h-5 text-neutral-950" />
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* STEP 4: ALL PLAYERS' ENTIRE HANDS REVEALED FOR THIS ROUND */}
            {revealStep === 'ALL_COMPLETE' && (
              <motion.div
                key="reveal_complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-neutral-900 border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-10 max-w-2xl w-full text-center shadow-2xl relative overflow-hidden"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center">
                  <ShieldCheck className="w-10 h-10 text-emerald-400" />
                </div>

                <div className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-4 py-1 rounded-full border border-emerald-500/40 inline-block mb-3">
                  EVERY PLAYER'S ENTIRE HAND REVEALED
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-amber-100">
                  Round {roundNumber} Truth Check Complete!
                </h2>

                <p className="text-neutral-300 text-xs sm:text-sm my-4 max-w-md mx-auto">
                  Every player in this round (eliminated player and all {survivors.length} survivors) has had their full collection verified face-up.
                </p>

                {/* Summary of surviving players */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6 max-h-48 overflow-y-auto text-left">
                  {survivors.map((survivor) => {
                    const survivorBalls = allBalls.filter((b) => b.ownerId === survivor.id);
                    return (
                      <div
                        key={survivor.id}
                        className="bg-neutral-800/80 border border-amber-500/30 rounded-xl p-3"
                      >
                        <div className="text-xs font-bold text-amber-200 mb-2 flex items-center justify-between">
                          <span>{survivor.name}</span>
                          <span className="text-emerald-400 text-[10px]">Verified ✓</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {survivorBalls.map((b) => (
                            <BallComponent key={b.id} ball={b} isPublic={true} size="sm" />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleCompleteAllReveals}
                  className="w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-lg uppercase tracking-wider bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-neutral-950 hover:brightness-110 shadow-xl shadow-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-3 mx-auto"
                >
                  Proceed To {survivors.length === 2 ? 'The Final Two' : `Round ${roundNumber + 1}`}
                  <ArrowRight className="w-6 h-6" />
                </button>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
