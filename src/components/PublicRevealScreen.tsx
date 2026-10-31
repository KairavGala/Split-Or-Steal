import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, ArrowRight, Sparkles, Users } from 'lucide-react';
import { Ball, Player } from '../types';
import { BallComponent } from './BallComponent';
import { sound } from '../utils/sound';

interface PublicRevealScreenProps {
  activePlayers: Player[];
  allBalls: Ball[];
  roundNumber: number;
  onCompletePublicReveal: () => void;
}

export const PublicRevealScreen: React.FC<PublicRevealScreenProps> = ({
  activePlayers,
  allBalls,
  roundNumber,
  onCompletePublicReveal,
}) => {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);

  const currentPlayer = activePlayers[currentPlayerIndex];

  // STRICT RULE: Filter ONLY balls where isPublic === true.
  // Hidden balls MUST NOT be rendered or referenced on this screen at all.
  const publicBalls = allBalls.filter(
    (b) => b.ownerId === currentPlayer.id && b.isPublic === true
  );

  const isLastPlayer = currentPlayerIndex === activePlayers.length - 1;
  const nextPlayer = !isLastPlayer ? activePlayers[currentPlayerIndex + 1] : null;

  const handleNextClick = () => {
    sound.playClick();
    if (!isLastPlayer) {
      setCurrentPlayerIndex((prev) => prev + 1);
    } else {
      onCompletePublicReveal();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPlayer.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-12 text-center shadow-2xl backdrop-blur-xl relative overflow-hidden"
        >
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Users className="w-4 h-4 text-yellow-400" />
            Phase 1 • Public Ball Reveal • Round {roundNumber}
          </div>

          <div className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-500/40 inline-block mb-6">
            👁️ EVERYONE IN THE ROOM MAY WATCH THIS REVEAL
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-amber-100 uppercase tracking-tight">
            {currentPlayer.name}'s Public Ball{publicBalls.length > 1 ? 's' : ''}
          </h2>

          <p className="text-neutral-400 text-xs sm:text-sm max-w-md mx-auto mt-2 mb-8 font-medium">
            Player {currentPlayerIndex + 1} of {activePlayers.length}. The game has randomly assigned the public ball{publicBalls.length > 1 ? 's' : ''} shown below.
          </p>

          {/* PUBLIC BALLS DISPLAY - NO HIDDEN BALLS AT ALL */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 my-10 min-h-[140px]">
            {publicBalls.map((ball) => (
              <motion.div
                key={ball.id}
                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex flex-col items-center gap-2"
              >
                <BallComponent
                  ball={ball}
                  isPublic={true}
                  size="xl"
                  showBadge={true}
                  badgeText="PUBLIC 👁️"
                />
              </motion.div>
            ))}
          </div>

          {/* Action Button */}
          <div className="pt-6 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Everyone sees these public ball(s). Hidden balls remain locked.</span>
            </div>

            <button
              onClick={handleNextClick}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-neutral-950 hover:brightness-110 shadow-xl shadow-amber-500/20 active:scale-95"
            >
              {isLastPlayer ? (
                <>
                  <Eye className="w-5 h-5" />
                  All Public Reveals Done • Proceed to Private Check 🔒
                </>
              ) : (
                <>
                  Pass To {nextPlayer?.name}'s Public Reveal
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
