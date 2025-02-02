import { chatClient } from '../config/openaiConfig';
import { GameState, PlayerResponse } from '../types/game';

const BASE_URL = 'https://hack-at-brown-2025.onrender.com/api';

export const gameApi = {
  // Room Management
  createRoom: async () => {
    const response = await fetch(`${BASE_URL}/lobby/create`, {
      method: 'POST',
    });
    return response.json();
  },

  joinRoom: async (code: string) => {
    const response = await fetch(`${BASE_URL}/lobby/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    return response.json();
  },

  // Game State Management
  getGameState: async (gameId: string) => {
    const response = await fetch(`${BASE_URL}/game/${gameId}/gameState`);
    return response.json();
  },

  submitResponse: async (gameId: string, response: PlayerResponse) => {
    const res = await fetch(`${BASE_URL}/game/${gameId}/addResponse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    });
    return res.json();
  },

  nextTurn: async (gameId: string) => {
    const response = await fetch(`${BASE_URL}/game/${gameId}/nextTurn`, {
      method: 'POST',
    });
    return response.json();
  },

  getJudgment: async (gameId: string) => {
    const response = await fetch(`${BASE_URL}/game/${gameId}/judgment`);
    return response.json();
  },
};

export class JudgeService {
  static async evaluateDebate(gameState: GameState, responses: PlayerResponse[]) {
    const proResponse = responses.find(r => r.position === 'pro');
    const conResponse = responses.find(r => r.position === 'con');

    const prompt = `
      As Judge Pawsworth, evaluate this elementary school debate:
      Topic: "${gameState.prompt}"
      
      Pro argument: "${proResponse?.transcript}"
      Con argument: "${conResponse?.transcript}"
      
      Please evaluate based on:
      1. Logic and reasoning
      2. Clarity of argument
      3. Persuasiveness
      4. Respect and civility
      
      Respond in this format:
      - Winner: [pro/con]
      - Score: [1-10]
      - Feedback: [2-3 sentences with cat puns]
      - MVP Moment: [highlight best point made]
      
      Keep it fun and encouraging for elementary students!
    `;

    try {
      const response = await chatClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error getting judgment:", error);
      return "Meow! Something went wrong with the judgment!";
    }
  }

  static generateFeedback(transcript: string) {
    // Add real-time feedback during the debate
    return `Purrfect point! Keep going...`;
  }
} 