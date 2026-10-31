import React, { useState } from 'react';
import { Ball, GamePhase, Player } from './types';
import { createInitialBalls } from './utils/gameRules';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { PublicRevealScreen } from './components/PublicRevealScreen';
import { PrivateHiddenScreen } from './components/PrivateHiddenScreen';
import { PublicTableScreen } from './components/PublicTableScreen';
import { ScrambleTumblerScreen } from './components/ScrambleTumblerScreen';
import { FinalBoardSelection } from './components/FinalBoardSelection';
import { SplitOrStealScreen } from './components/SplitOrStealScreen';
import { GameRulesModal } from './components/GameRulesModal';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('HOME');
  const [roundNumber, setRoundNumber] = useState<number>(1);

  // Player & Ball State
  const [players, setPlayers] = useState<Player[]>([]);
  const [initialPlayerCount, setInitialPlayerCount] = useState<number>(4);
  const [allBalls, setAllBalls] = useState<Ball[]>([]);
  const [survivingBallsForScramble, setSurvivingBallsForScramble] = useState<Ball[]>([]);

  // Final Round Data
  const [finalJackpot, setFinalJackpot] = useState<number>(0);

  // UI Modals
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);

  // Active (surviving) players
  const activePlayers = players.filter((p) => !p.isEliminated);

  // 1. Start new game setup (CHANGE 1: 4 balls per player)
  const handleStartGame = (playerNames: string[]) => {
    const newPlayers: Player[] = playerNames.map((name, idx) => ({
      id: `p_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      isEliminated: false,
    }));

    // Generate initial 4 balls per player with random public/hidden assignment
    const initialBalls = createInitialBalls(newPlayers);

    setPlayers(newPlayers);
    setInitialPlayerCount(newPlayers.length);
    setAllBalls(initialBalls);
    setRoundNumber(1);
    setPhase('PUBLIC_REVEAL');
  };

  // 2. Phase 1 (Public Reveal) complete -> Move to Phase 2 (Private Check)
  const handleCompletePublicReveal = () => {
    setPhase('PRIVATE_REVEAL');
  };

  // 3. Phase 2 (Private Check) complete -> Move to Discussion Table
  const handleCompletePrivateCheck = () => {
    setPhase('ROUND_TABLE_DISCUSSION');
  };

  // 4. Host completes elimination & manual survivor reviews -> Move to Scramble Tumbler or Final Showdown
  const handleEliminateAndProceed = (
    eliminatedPlayer: Player,
    survivors: Player[]
  ) => {
    // Mark eliminated player
    const updatedPlayers = players.map((p) =>
      p.id === eliminatedPlayer.id
        ? { ...p, isEliminated: true, eliminatedRound: roundNumber }
        : p
    );

    setPlayers(updatedPlayers);

    // Remove ONLY eliminated player's balls from active pool
    const survivingBalls = allBalls.filter((b) => b.ownerId !== eliminatedPlayer.id);

    if (survivors.length === 2) {
      // Reached the Final Two! All remaining balls form the final pool!
      setAllBalls(survivingBalls);
      setPhase('FINAL_BOARD_SELECTION');
    } else {
      // Step 2-5: Transition to Golden Spheres Tumbler Screen for Scrambling & Random Redistribution
      setSurvivingBallsForScramble(survivingBalls);
      setPhase('ROUND_SCRAMBLE');
    }
  };

  // 5. Scramble Tumbler finished -> Start next round's Public Reveal
  const handleScrambleComplete = (
    redistributedBalls: Ball[],
    nextRoundNumber: number
  ) => {
    setAllBalls(redistributedBalls);
    setRoundNumber(nextRoundNumber);
    setPhase('PUBLIC_REVEAL');
  };

  // 6. Final board jackpot selection completed (CHANGE 2: 5 BIN / 5 KEEP Showdown)
  const handleCompleteFinalBoard = (jackpot: number) => {
    setFinalJackpot(jackpot);
    setPhase('FINAL_SPLIT_STEAL_PASS1');
  };

  // Reset / Start fresh game
  const handleResetGame = () => {
    if (phase !== 'HOME') {
      if (
        window.confirm(
          'Are you sure you want to restart? Current game progress will be reset.'
        )
      ) {
        setPhase('HOME');
        setRoundNumber(1);
        setPlayers([]);
        setAllBalls([]);
        setSurvivingBallsForScramble([]);
      }
    } else {
      setPhase('HOME');
    }
  };

  const getPhaseText = (): string => {
    switch (phase) {
      case 'HOME':
        return 'Game Setup';
      case 'PUBLIC_REVEAL':
        return 'Phase 1 • Public Ball Reveal';
      case 'PRIVATE_REVEAL':
        return 'Phase 2 • Private Ball Check';
      case 'ROUND_TABLE_DISCUSSION':
        return 'Public Discussion Table';
      case 'ROUND_SCRAMBLE':
        return 'The Golden Spheres Tumbler • Ball Scramble';
      case 'FINAL_BOARD_SELECTION':
        return 'The Final Showdown • 5 Bin / 5 Keep';
      case 'FINAL_SPLIT_STEAL_PASS1':
      case 'FINAL_SPLIT_STEAL_PASS2':
      case 'FINAL_SPLIT_STEAL_COUNTDOWN':
      case 'FINAL_RESULTS':
        return 'Split or Steal';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-amber-50 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950">
      {/* Top Navigation Header */}
      <Header
        onResetGame={handleResetGame}
        onOpenRules={() => setIsRulesOpen(true)}
        currentPhaseText={getPhaseText()}
        roundNumber={
          phase !== 'HOME' &&
          phase !== 'FINAL_BOARD_SELECTION' &&
          !phase.startsWith('FINAL_SPLIT')
            ? roundNumber
            : undefined
        }
      />

      {/* Main View Container */}
      <main className="flex-1 flex flex-col justify-center items-center relative z-10 py-4">
        {phase === 'HOME' && <HomeScreen onStartGame={handleStartGame} />}

        {phase === 'PUBLIC_REVEAL' && (
          <PublicRevealScreen
            activePlayers={activePlayers}
            allBalls={allBalls}
            roundNumber={roundNumber}
            onCompletePublicReveal={handleCompletePublicReveal}
          />
        )}

        {phase === 'PRIVATE_REVEAL' && (
          <PrivateHiddenScreen
            activePlayers={activePlayers}
            allBalls={allBalls}
            roundNumber={roundNumber}
            onCompletePrivateCheck={handleCompletePrivateCheck}
          />
        )}

        {phase === 'ROUND_TABLE_DISCUSSION' && (
          <PublicTableScreen
            activePlayers={activePlayers}
            allBalls={allBalls}
            roundNumber={roundNumber}
            onEliminateAndProceed={handleEliminateAndProceed}
          />
        )}

        {phase === 'ROUND_SCRAMBLE' && (
          <ScrambleTumblerScreen
            survivors={activePlayers}
            survivingBalls={survivingBallsForScramble}
            initialPlayerCount={initialPlayerCount}
            currentRoundNumber={roundNumber}
            onScrambleComplete={handleScrambleComplete}
          />
        )}

        {phase === 'FINAL_BOARD_SELECTION' && (
          <FinalBoardSelection
            finalists={activePlayers}
            finalBallPool={allBalls}
            onCompleteFinalBoard={handleCompleteFinalBoard}
          />
        )}

        {(phase === 'FINAL_SPLIT_STEAL_PASS1' ||
          phase === 'FINAL_SPLIT_STEAL_PASS2' ||
          phase === 'FINAL_SPLIT_STEAL_COUNTDOWN' ||
          phase === 'FINAL_RESULTS') && (
          <SplitOrStealScreen
            finalists={activePlayers}
            finalJackpot={finalJackpot}
            onRestartGame={() => setPhase('HOME')}
          />
        )}
      </main>

      {/* Rules Modal */}
      <GameRulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
}
