import React from 'react';
import { X, ShieldAlert, Award, Eye, Flame, Coins, Lock, Sparkles } from 'lucide-react';

interface GameRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameRulesModal: React.FC<GameRulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-neutral-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 text-amber-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-amber-400 hover:text-white bg-neutral-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4 mb-6">
          <Award className="w-8 h-8 text-amber-400" />
          <h2 className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
            GOLDEN SPHERES: OFFICIAL RULES
          </h2>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-neutral-300">
          <section className="bg-neutral-800/60 p-4 rounded-xl border border-amber-500/20">
            <h3 className="font-bold text-amber-400 text-base flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5" /> 1. Starting Setup (4 Balls Per Player)
            </h3>
            <p>
              Every player starts with <strong>4 balls</strong> (2 Public, 2 Hidden). Balls are either <strong>MONEY</strong> (₹0.25 to ₹500) or <strong>KILLER</strong>:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-neutral-300 text-xs">
              <li><strong>4 Players:</strong> 16 balls total (4 Killers + 12 Money)</li>
              <li><strong>5 Players:</strong> 20 balls total (5 Killers + 15 Money)</li>
              <li><strong>6 Players:</strong> 24 balls total (6 Killers + 18 Money)</li>
              <li><strong>7 Players:</strong> 28 balls total (8 Killers + 20 Money)</li>
            </ul>
          </section>

          <section className="bg-neutral-800/60 p-4 rounded-xl border border-amber-500/20">
            <h3 className="font-bold text-amber-400 text-base flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5" /> 2. Public & Hidden Assignment (RNG)
            </h3>
            <p>
              The game automatically and randomly assigns which balls are <strong>PUBLIC</strong> (seen by everyone on the table) and which are <strong>HIDDEN</strong> (checked secretly in private pass-and-play):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-xs">
              <div className="bg-neutral-900/80 p-2 rounded border border-amber-500/30">
                <strong>4 balls:</strong> 2 Public, 2 Hidden
              </div>
              <div className="bg-neutral-900/80 p-2 rounded border border-amber-500/30">
                <strong>5 balls:</strong> 2 Public, 3 Hidden
              </div>
              <div className="bg-neutral-900/80 p-2 rounded border border-amber-500/30">
                <strong>6 balls:</strong> 3 Public, 3 Hidden
              </div>
              <div className="bg-neutral-900/80 p-2 rounded border border-amber-500/30">
                <strong>7 balls:</strong> 3 Public, 4 Hidden
              </div>
              <div className="bg-neutral-900/80 p-2 rounded border border-amber-500/30">
                <strong>8 balls:</strong> 4 Public, 4 Hidden
              </div>
              <div className="bg-neutral-900/80 p-2 rounded border border-amber-500/30">
                <strong>9 balls:</strong> 4 Public, 5 Hidden
              </div>
            </div>
          </section>

          <section className="bg-neutral-800/60 p-4 rounded-xl border border-amber-500/20">
            <h3 className="font-bold text-amber-400 text-base flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5" /> 3. Discussion, Elimination & Truth Checks
            </h3>
            <p>
              Contestants bluff or tell the truth during discussion. The host eliminates 1 player.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-neutral-300">
              <li>The eliminated contestant's entire hand is revealed and <strong>BINNED</strong>.</li>
              <li>Every surviving contestant's entire hand is reviewed one-by-one to expose bluffs!</li>
            </ul>
          </section>

          <section className="bg-neutral-800/60 p-4 rounded-xl border border-amber-500/20">
            <h3 className="font-bold text-amber-400 text-base flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" /> 4. Scramble Tumbler & Random Redistribution
            </h3>
            <p>
              <strong>Balls survive. Ball ownership does NOT.</strong>
            </p>
            <p className="mt-1 text-xs">
              All surviving balls + newly generated batch mix into one giant pool inside the lottery cage tumbler. The pool is completely randomized and redistributed equally among survivors with fresh RNG public/hidden status!
            </p>
          </section>

          <section className="bg-neutral-800/60 p-4 rounded-xl border border-amber-500/20">
            <h3 className="font-bold text-amber-400 text-base flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5" /> 5. Final Showdown (5 BIN / 5 KEEP)
            </h3>
            <p>
              When 2 finalists remain, all surviving balls form one final mystery pool. Finalists alternate taking 2 picks per turn:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
              <li><strong>1st Pick:</strong> ALWAYS BINNED (Permanently destroyed).</li>
              <li><strong>2nd Pick:</strong> ALWAYS KEPT (Added to final jackpot).</li>
              <li>Repeats until exactly <strong>5 BINNED</strong> and <strong>5 KEPT</strong> balls exist.</li>
            </ul>
            <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-500/40 mt-3 text-xs">
              <strong className="text-yellow-300">Sequential Jackpot Formula:</strong><br />
              • Money: Adds to jackpot.<br />
              • Killer: Immediately divides current jackpot by 10 (rounded down).
            </div>
          </section>

          <section className="bg-neutral-800/60 p-4 rounded-xl border border-amber-500/20">
            <h3 className="font-bold text-amber-400 text-base flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5" /> 6. Split or Steal
            </h3>
            <p>Both finalists secretly choose SPLIT or STEAL:</p>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div className="p-2 bg-neutral-900 rounded border border-green-500/30">
                <span className="font-bold text-green-400">SPLIT + SPLIT:</span> 50% / 50%
              </div>
              <div className="p-2 bg-neutral-900 rounded border border-amber-500/30">
                <span className="font-bold text-amber-400">STEAL + SPLIT:</span> Stealer takes 100%
              </div>
              <div className="p-2 bg-neutral-900 rounded border border-amber-500/30">
                <span className="font-bold text-amber-400">SPLIT + STEAL:</span> Stealer takes 100%
              </div>
              <div className="p-2 bg-neutral-900 rounded border border-red-500/30">
                <span className="font-bold text-red-400">STEAL + STEAL:</span> Both get ₹0
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-600 text-neutral-950 hover:brightness-110 shadow-lg cursor-pointer"
          >
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
