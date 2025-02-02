import { GameState, JudgmentResult } from '../types/game';

export class JudgeService {
  static async evaluateDebate(gameState: GameState): Promise<JudgmentResult> {
    try {
      const proOpening = gameState.responses?.opening.pro;
      const conOpening = gameState.responses?.opening.con;
      const proRebuttal = gameState.responses?.rebuttal.pro;
      const conRebuttal = gameState.responses?.rebuttal.con;
      const proClosing = gameState.responses?.closing.pro;
      const conClosing = gameState.responses?.closing.con;

      // Construct debate summary
      const debateSummary = `
        Topic: ${gameState.prompt}
        
        PRO Arguments:
        Opening: ${proOpening}
        Rebuttal: ${proRebuttal}
        Closing: ${proClosing}
        
        CON Arguments:
        Opening: ${conOpening}
        Rebuttal: ${conRebuttal}
        Closing: ${conClosing}
      `;

      // Make API call to judge
      const response = await fetch('https://hack-at-brown-2025.onrender.com/api/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debate: debateSummary })
      });

      if (!response.ok) {
        throw new Error('Failed to get judgment');
      }

      const judgment = await response.json();
      return {
        winner: judgment.winner,
        score: judgment.score,
        feedback: judgment.feedback,
        mvpMoment: judgment.mvpMoment
      };
    } catch (error) {
      console.error('Error in judge service:', error);
      return {
        winner: 'pro',
        score: 5,
        feedback: "Due to technical difficulties, both debaters showed great spirit!",
        mvpMoment: "Everyone participated enthusiastically!"
      };
    }
  }
} 