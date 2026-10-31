export type BallType = 'MONEY' | 'KILLER';

export interface Ball {
  id: string;
  type: BallType;
  value?: number; // Only present if type === 'MONEY'
  ownerId: string;
  isPublic?: boolean; // Set during pass-and-play selection
}

export interface Player {
  id: string;
  name: string;
  isEliminated: boolean;
  eliminatedRound?: number;
}

export type GamePhase =
  | 'HOME'                     // Setup players & count
  | 'PUBLIC_REVEAL'            // Public ball reveal (everyone watches)
  | 'PRIVATE_REVEAL'           // Private pass-and-play hidden ball check
  | 'ROUND_TABLE_DISCUSSION'   // Main table discussion & elimination
  | 'ROUND_SCRAMBLE'           // Lottery tumbler scramble and random redistribution
  | 'FINAL_BOARD_SELECTION'    // Final 2 players 10-ball selection (5 BIN / 5 KEEP)
  | 'FINAL_SPLIT_STEAL_PASS1'  // Finalist 1 secret choice
  | 'FINAL_SPLIT_STEAL_PASS2'  // Finalist 2 secret choice
  | 'FINAL_SPLIT_STEAL_COUNTDOWN' // 3-2-1 dramatic countdown
  | 'FINAL_RESULTS';           // Split/Steal reveal and winner screen

export type Choice = 'SPLIT' | 'STEAL';

export interface GameLog {
  id: string;
  timestamp: string;
  text: string;
  type?: 'elimination' | 'killer' | 'money' | 'jackpot';
}
