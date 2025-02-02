export type GamePhase = 'intro' | 'opening' | 'rebuttal' | 'closing' | 'judgment';
export type Position = 'pro' | 'con';

export interface GameState {
  playerIds: string[];
  turn: number;
  turnDeadline: string;
  prompt: string;
  gamePhase: GamePhase;
  positions: {
    [key: string]: Position;
  };
  responses?: {
    opening: { pro: string | null; con: string | null; };
    rebuttal: { pro: string | null; con: string | null; };
    closing: { pro: string | null; con: string | null; };
  };
}

export interface PlayerResponse {
  transcript: string;
  phase: GamePhase;
  position: Position;
}

export interface JudgmentResult {
  winner: Position;
  score: number;
  feedback: string;
  mvpMoment: string;
} 