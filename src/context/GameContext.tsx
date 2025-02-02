import React, { createContext, useContext, useState } from 'react';
import { GameState } from '../types/game';

interface GameContextType {
  gameState: GameState | null;
  setGameState: (state: GameState | null) => void;
  playerId: string;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId] = useState(() => {
    const storedId = sessionStorage.getItem('playerId');
    if (storedId) return storedId;
    const newId = `player${Date.now()}`;
    sessionStorage.setItem('playerId', newId);
    return newId;
  });

  return (
    <GameContext.Provider value={{ gameState, setGameState, playerId }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 