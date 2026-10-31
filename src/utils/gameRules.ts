import { Ball, BallType, Player } from '../types';
import { getRandomMoneyValues, formatRupees } from '../data/moneyValues';

/**
 * Returns exact public and hidden counts according to official rules:
 * 4 balls: 2 public, 2 hidden
 * 5 balls: 2 public, 3 hidden
 * 6 balls: 3 public, 3 hidden
 * 7 balls: 3 public, 4 hidden
 * 8 balls: 4 public, 4 hidden
 * 9 balls: 4 public, 5 hidden
 */
export function getPublicAndHiddenCounts(totalBalls: number): {
  requiredPublic: number;
  requiredHidden: number;
} {
  const requiredPublic = Math.floor(totalBalls / 2);
  const requiredHidden = totalBalls - requiredPublic;
  return { requiredPublic, requiredHidden };
}

/**
 * Randomly determines which balls are PUBLIC and which are HIDDEN for every player.
 * Player does NOT choose. Required public count = Math.floor(total / 2).
 */
export function assignRandomPublicStatus(balls: Ball[], players: Player[]): Ball[] {
  const updatedBalls = [...balls];

  players.forEach((player) => {
    // Find indices of player's balls
    const playerBallIndices = updatedBalls
      .map((b, idx) => (b.ownerId === player.id ? idx : -1))
      .filter((idx) => idx !== -1);

    const total = playerBallIndices.length;
    if (total === 0) return;

    const { requiredPublic } = getPublicAndHiddenCounts(total);

    // Shuffle indices to pick requiredPublic random ones
    const shuffledIndices = [...playerBallIndices].sort(() => Math.random() - 0.5);
    const publicIndices = new Set(shuffledIndices.slice(0, requiredPublic));

    playerBallIndices.forEach((idx) => {
      updatedBalls[idx] = {
        ...updatedBalls[idx],
        isPublic: publicIndices.has(idx),
      };
    });
  });

  return updatedBalls;
}

/**
 * Creates initial balls for game setup (CHANGE 1 - 4 balls per player):
 * 4 players: 16 balls = 4 Killers + 12 Money
 * 5 players: 20 balls = 5 Killers + 15 Money
 * 6 players: 24 balls = 6 Killers + 18 Money
 * 7 players: 28 balls = 8 Killers + 20 Money
 */
export function createInitialBalls(players: Player[]): Ball[] {
  const numPlayers = players.length;
  let numKillers = 0;
  let numMoney = 0;

  if (numPlayers === 4) {
    numKillers = 4;
    numMoney = 12;
  } else if (numPlayers === 5) {
    numKillers = 5;
    numMoney = 15;
  } else if (numPlayers === 6) {
    numKillers = 6;
    numMoney = 18;
  } else if (numPlayers === 7) {
    numKillers = 8;
    numMoney = 20;
  } else {
    // Fallback for safety
    numKillers = numPlayers;
    numMoney = numPlayers * 3;
  }

  const moneyValues = getRandomMoneyValues(numMoney);
  const rawBallTypes: { type: BallType; value?: number }[] = [];

  for (let i = 0; i < numKillers; i++) {
    rawBallTypes.push({ type: 'KILLER' });
  }
  for (let i = 0; i < numMoney; i++) {
    rawBallTypes.push({ type: 'MONEY', value: moneyValues[i] });
  }

  // Shuffle all balls completely
  const shuffledRaw = [...rawBallTypes].sort(() => Math.random() - 0.5);

  // Distribute 4 balls per player
  const balls: Ball[] = [];
  let ballIndex = 0;

  players.forEach((player) => {
    for (let b = 0; b < 4; b++) {
      const item = shuffledRaw[ballIndex++];
      balls.push({
        id: `ball_init_${player.id}_${b}_${Math.random().toString(36).substring(2, 7)}`,
        type: item.type,
        value: item.value,
        ownerId: player.id,
        isPublic: undefined,
      });
    }
  });

  // Automatically and randomly assign public/hidden status (2 public, 2 hidden for 4 balls)
  return assignRandomPublicStatus(balls, players);
}

export interface NewBallComposition {
  killers: number;
  money: number;
}

/**
 * Get exact new ball composition based on surviving count.
 * If even: 50/50 split (e.g. 6 -> 3M/3K, 4 -> 2M/2K, 2 -> 1M/1K)
 * If odd: Money > Killer (e.g. 5 -> 3M/2K, 3 -> 2M/1K)
 */
export function getNewBallComposition(
  _initialPlayerCount: number,
  survivorCount: number
): NewBallComposition {
  if (survivorCount % 2 === 0) {
    const split = survivorCount / 2;
    return { money: split, killers: split };
  } else {
    const money = Math.ceil(survivorCount / 2);
    const killers = Math.floor(survivorCount / 2);
    return { money, killers };
  }
}

/**
 * Generate a fresh batch of new balls according to survivor count.
 */
export function generateNewBallsBatch(
  initialPlayerCount: number,
  survivorCount: number,
  roundNumber: number
): Ball[] {
  const comp = getNewBallComposition(initialPlayerCount, survivorCount);
  const moneyValues = getRandomMoneyValues(comp.money);
  const newBalls: Ball[] = [];

  for (let k = 0; k < comp.killers; k++) {
    newBalls.push({
      id: `ball_new_r${roundNumber}_k_${k}_${Math.random().toString(36).substring(2, 7)}`,
      type: 'KILLER',
      ownerId: '',
      isPublic: undefined,
    });
  }

  for (let m = 0; m < comp.money; m++) {
    newBalls.push({
      id: `ball_new_r${roundNumber}_m_${m}_${Math.random().toString(36).substring(2, 7)}`,
      type: 'MONEY',
      value: moneyValues[m],
      ownerId: '',
      isPublic: undefined,
    });
  }

  // Return shuffled batch
  return newBalls.sort(() => Math.random() - 0.5);
}

/**
 * BUG FIX: SCRAMBLE ALL SURVIVING BALLS & REDISTRIBUTE EVERY ROUND.
 *
 * BALLS SURVIVE. BALL OWNERSHIP DOES NOT.
 * Combines all surviving balls + newly generated balls into one giant pool.
 * Fully randomizes ownership across all surviving players equally.
 */
export function scrambleAndRedistributeBalls(
  survivingBalls: Ball[],
  newBalls: Ball[],
  survivors: Player[]
): Ball[] {
  // Giant combined pool
  const combinedPool = [...survivingBalls, ...newBalls];

  // Full random shuffle
  const shuffledPool = [...combinedPool].sort(() => Math.random() - 0.5);

  const totalBalls = shuffledPool.length;
  const ballsPerPlayer = Math.floor(totalBalls / survivors.length);
  const redistributedBalls: Ball[] = [];

  let poolIdx = 0;
  survivors.forEach((survivor) => {
    for (let b = 0; b < ballsPerPlayer; b++) {
      const ball = shuffledPool[poolIdx++];
      redistributedBalls.push({
        ...ball,
        ownerId: survivor.id,
        isPublic: undefined, // Will be assigned randomly below
      });
    }
  });

  // Automatically assign random public / hidden status based on hand size
  return assignRandomPublicStatus(redistributedBalls, survivors);
}

export interface JackpotStep {
  stepNum: number;
  ball: Ball;
  operation: string;
  previousTotal: number;
  runningTotal: number;
  explanation: string;
}

/**
 * Calculates jackpot using ONLY the 5 KEPT balls in sequential order.
 * Money: adds to jackpot
 * Killer: divides current jackpot by 10 immediately (Math.floor).
 */
export function calculateJackpotFromKeptBalls(keptBalls: Ball[]): {
  finalJackpot: number;
  steps: JackpotStep[];
} {
  let runningTotal = 0;
  const steps: JackpotStep[] = [];

  keptBalls.forEach((ball, idx) => {
    const previousTotal = runningTotal;
    let operation = '';
    let explanation = '';

    if (ball.type === 'MONEY') {
      const val = ball.value || 0;
      runningTotal = previousTotal + val;
      operation = `+${formatRupees(val)}`;
      explanation = `Added ${formatRupees(val)} to current jackpot.`;
    } else {
      runningTotal = Math.floor(previousTotal / 10);
      operation = `÷ 10`;
      explanation = `⚡ KILLER HIT! Divided ${formatRupees(previousTotal)} by 10.`;
    }

    steps.push({
      stepNum: idx + 1,
      ball,
      operation,
      previousTotal,
      runningTotal,
      explanation,
    });
  });

  return { finalJackpot: runningTotal, steps };
}
