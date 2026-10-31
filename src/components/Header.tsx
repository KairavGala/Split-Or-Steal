import React, { useState } from 'react';
import { Volume2, VolumeX, HelpCircle, RefreshCw, Trophy } from 'lucide-react';
import { sound } from '../utils/sound';

interface HeaderProps {
  onResetGame: () => void;
  onOpenRules: () => void;
  currentPhaseText?: string;
  roundNumber?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onResetGame,
  onOpenRules,
  currentPhaseText,
  roundNumber,
}) => {
  const [soundOn, setSoundOn] = useState(sound.soundEnabled);

  const toggleSound = () => {
    sound.soundEnabled = !soundOn;
    setSoundOn(!soundOn);
    if (!soundOn) {
      sound.playClick();
    }
  };

  return (
    <header className="w-full bg-neutral-950/90 border-b border-amber-500/30 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between shadow-xl sticky top-0 z-40">
      {/* Title / Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-200">
          <Trophy className="w-5 h-5 text-neutral-950" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
            GOLDEN SPHERES
          </h1>
          {currentPhaseText && (
            <p className="text-[11px] font-semibold text-amber-400/80 tracking-wide uppercase">
              {roundNumber ? `Round ${roundNumber} • ` : ''}
              {currentPhaseText}
            </p>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleSound}
          title={soundOn ? 'Mute Audio' : 'Unmute Audio'}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
        >
          {soundOn ? (
            <>
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Sound ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-neutral-500" />
              <span className="hidden sm:inline text-neutral-400">Muted</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenRules}
          title="Game Rules"
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Rules</span>
        </button>

        <button
          onClick={onResetGame}
          title="New Game"
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/30 text-red-300 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-red-400" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </header>
  );
};
