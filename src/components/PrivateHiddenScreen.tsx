import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Lock, Eye, ArrowRight, Sparkles } from 'lucide-react';
import { Ball, Player } from '../types';
import { BallComponent } from './BallComponent';
import { sound } from '../utils/sound';

interface PrivateHiddenScreenProps {
  activePlayers: Player[];
  allBalls: Ball[];
  roundNumber: number;
  onCompletePrivateCheck: () => void;
}

export const PrivateHiddenScreen: React.FC<PrivateHiddenScreenProps> = ({
  activePlayers,
  allBalls,
  roundNumber,
  onCompletePrivateCheck,
}) => {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [isDevicePassed, setIsDevicePassed] = useState<boolean>(false);

  const currentPlayer = activePlayers[currentPlayerIndex];

  // STRICT RULE: Filter ONLY balls where isPublic === false.
  // Public balls MUST NOT be rendered or shown on this private screen.
  const hiddenBalls = allBalls.filter(
    (b) => b.ownerId === currentPlayer.id && b.isPublic === false
  );

  const isLastPlayer = currentPlayerIndex === activePlayers.length - 1;
  const nextPlayer = !isLastPlayer ? activePlayers[currentPlayerIndex + 1] : null;

  const handleRevealClick = () => {
    sound.playClick();
    setIsDevicePassed(true);
  };

  const handleNextPlayerClick = () => {
    sound.playClick();
    if (!isLastPlayer) {
      setCurrentPlayerIndex((prev) => prev + 1);
      setIsDevicePassed(false);
    } else {
      onCompletePrivateCheck();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {!isDevicePassed ? (
          /* Privacy Cover Interstitial Screen */
          <motion.div
            key="cover"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full bg-neutral-900 border border-amber-500/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />

            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-950/80 border-2 border-red-500/60 flex items-center justify-center shadow-lg shadow-red-900/40">
              <ShieldAlert className="w-10 h-10 text-red-400 animate-pulse" />
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/30">
              Phase 2 • Private Ball Check • Round {roundNumber}
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-amber-100 uppercase tracking-tight mt-4 mb-2">
              Pass Device To:
            </h2>
            <div className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-md my-4">
              {currentPlayer.name}
            </div>

            <p className="text-red-300/90 text-sm sm:text-base max-w-md mx-auto mb-8 font-semibold bg-red-950/40 p-3 rounded-xl border border-red-500/20">
              🔒 SECRET ZONE: Other players must look away! You are about to view your private hidden ball{hiddenBalls.length > 1 ? 's' : ''}.
            </p>

            <button
              onClick={handleRevealClick}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-wider text-neutral-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3 mx-auto cursor-pointer"
            >
              <Eye className="w-6 h-6 text-neutral-950" />
              I Am {currentPlayer.name} • View My Private Ball{hiddenBalls.length > 1 ? 's' : ''}
            </button>

            <div className="text-xs text-neutral-500 mt-6 font-medium">
              Player {currentPlayerIndex + 1} of {activePlayers.length}
            </div>
          </motion.div>
        ) : (
          /* Private Hidden Ball Viewer Screen */
          <motion.div
            key="viewer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl"
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-amber-500/20 pb-6 mb-8 gap-4 text-center sm:text-left">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30">
                  Private Check • Player {currentPlayerIndex + 1}/{activePlayers.length}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-amber-100 mt-2">
                  {currentPlayer.name}'s Hidden Ball{hiddenBalls.length > 1 ? 's' : ''}
                </h2>
              </div>

              <div className="bg-red-950/80 px-4 py-2.5 rounded-2xl border border-red-500/40 text-center text-xs font-bold text-red-300">
                🔒 ONLY YOU CAN SEE THIS SCREEN
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 mb-8 text-center text-sm font-medium text-amber-200/90">
              💡 Remember what you hold! You can use this knowledge to tell the truth or bluff during the public table discussion.
            </div>

            {/* HIDDEN BALLS DISPLAY ONLY - NO PUBLIC BALLS RENDERED */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 my-10 min-h-[140px]">
              {hiddenBalls.map((ball) => (
                <div key={ball.id} className="flex flex-col items-center gap-3">
                  <BallComponent
                    ball={ball}
                    isPublic={true} // Shown face-up to the owner privately!
                    size="xl"
                    showBadge={true}
                    badgeText="HIDDEN 🔒 (Secret)"
                  />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-amber-400/80 font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Keep your hidden ball(s) secret from all other players!</span>
              </div>

              <button
                onClick={handleNextPlayerClick}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-neutral-950 hover:brightness-110 shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <Lock className="w-5 h-5" />
                {isLastPlayer ? (
                  'I Have Seen My Private Ball • Go to Table Discussion'
                ) : (
                  <>
                    I've Seen My Private Ball • Pass To {nextPlayer?.name}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
