import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GAME_PHASES } from "../config/constants";
import { getRandomQuestion } from "../config/debateQuestions";
import { useGame } from "../context/GameContext";
import { GameState } from "../types/game";

const RoomPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { setGameState, playerId } = useGame();
  const [roomData, setRoomData] = useState<any>(null);
  const [error, setError] = useState("");
  const [question] = useState(getRandomQuestion());

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!code) return;
      try {
        const response = await fetch(`https://hack-at-brown-2025.onrender.com/api/lobby/${code}`);
        
        if (!response.ok) {
          const errData = await response.json();
          setError(errData.error || "Could not find room");
          return;
        }

        const data = await response.json();
        setRoomData(data);

        if (data.players === 2 && !data.gameStarted) {
          const gameState: GameState = {
            playerIds: ["player1", "player2"],
            turn: 0,
            turnDeadline: new Date(Date.now() + 60000).toISOString(),
            prompt: question,
            gamePhase: GAME_PHASES.INTRO,
            positions: {
              player1: 'pro',
              player2: 'con'
            },
            responses: {
              opening: { pro: null, con: null },
              rebuttal: { pro: null, con: null },
              closing: { pro: null, con: null }
            }
          };

          const startGameResponse = await fetch(
            `https://hack-at-brown-2025.onrender.com/api/lobby/${code}/startGame`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ gameState })
            }
          );

          if (startGameResponse.ok) {
            const { gameId } = await startGameResponse.json();
            setGameState(gameState);
            navigate(`/game/${gameId}`);
          }
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Something went wrong");
      }
    };

    const interval = setInterval(fetchRoomData, 1000);
    fetchRoomData();

    return () => clearInterval(interval);
  }, [code, navigate, setGameState, playerId, question]);

  return (
    <div className="game-container">
      <div className="game-background">
        <div className="bg-grid"></div>
        <div className="bg-overlay"></div>
      </div>

      <div className="game-card">
        <div className="card-header">
          <div className="menu-title">WAITING ROOM</div>
          <div className="menu-divider">
            <div className="divider-line"></div>
            <div className="divider-diamond"></div>
            <div className="divider-line"></div>
          </div>
        </div>

        <div className="room-content">
          {error ? (
            <div className="error-message">{error}</div>
          ) : (
            <>
              <div className="status-item">
                <div className="status-label">ROOM CODE</div>
                <div className="status-value">{code}</div>
              </div>
              
              <div className="status-item">
                <div className="status-label">PLAYERS</div>
                <div className="status-value">
                  {roomData ? `${roomData.players}/2` : "..."}
                </div>
              </div>

              {roomData?.players < 2 && (
                <div className="status-message">
                  Waiting for opponent to join...
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomPage;