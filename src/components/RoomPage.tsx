import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { chatClient } from "../config/openaiConfig";

interface RoomData {
  players: number;
  prompt?: string;
  playerIds?: string[];
  gameId?: string;
}

const RoomPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [error, setError] = useState("");
  const [joke, setJoke] = useState<string>("");

  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const fetchRoomData = async () => {
    if (!code) return;
    try {
      const response = await fetch(`/api/lobby/${code}`);
      if (!response.ok) {
        const errData = await response.json();
        setError(errData.error || "Could not find room");
        return;
      }
      const data = await response.json();
      setRoomData(data);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  };

  const fetchJoke = async () => {
    try {
      const response = await chatClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Tell me a short joke!" }],
        max_tokens: 50,
      });
      if (response.choices && response.choices[0].message.content) {
        setJoke(response.choices[0].message.content.trim());
      }
    } catch (error) {
      console.error("Error fetching joke:", error);
      setJoke("Couldn't fetch a joke. Try again later!");
    }
  };

  useEffect(() => {
    fetchRoomData();
    fetchJoke();

    const roomInterval = setInterval(fetchRoomData, 3000);
    const jokeInterval = setInterval(fetchJoke, 25000);

    return () => {
      clearInterval(roomInterval);
      clearInterval(jokeInterval);
    };
  }, [code]);

  useEffect(() => {
    if (
      roomData &&
      roomData.players >= 2 &&
      !isCountdownActive &&
      !gameStarted
    ) {
      setCountdown(5);
      setIsCountdownActive(true);
    }
  }, [roomData, isCountdownActive, gameStarted]);

  useEffect(() => {
    if (!isCountdownActive || countdown === null) return;

    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(intervalId);
          setGameStarted(true);

          if (roomData && roomData.gameId) {
            navigate(`/game/${roomData.gameId}`);
          } else if (roomData) {
            fetch(`/api/lobby/${code}/startGame`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ playerIds: roomData.playerIds }),
            })
              .then((res) => res.json())
              .then((data) => {
                navigate(`/game/${data.gameId}`);
              })
              .catch((err) => {
                console.error("Error starting game:", err);
                setError("Failed to start the game");
              });
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isCountdownActive, countdown, roomData, code, navigate]);

  return (
    <div className="game-container">
      <div className="game-background">
        <div className="bg-grid"></div>
        <div className="bg-overlay"></div>
      </div>

      <div className="game-card room-card">
        <div className="card-header">
          <div className="menu-title">COURTROOM {code}</div>
          <div className="menu-divider">
            <div className="divider-line"></div>
            <div className="divider-diamond"></div>
            <div className="divider-line"></div>
          </div>
        </div>

        {error ? (
          <div className="error-message">{error}</div>
        ) : roomData ? (
          <div className="room-content">
            <div className="status-display">
              <div className="status-item">
                <div className="status-label">PLAYERS PRESENT</div>
                <div className="status-value">{roomData.players}/2</div>
              </div>

              {roomData.players < 2 ? (
                <div className="waiting-section">
                  <div className="status-message">AWAITING OPPONENT</div>
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="joke-box">
                    <div className="joke-title">Wisdom:</div>
                    <div className="joke-content">
                      {joke || "Loading wisdom..."}
                    </div>
                  </div>
                </div>
              ) : (
                !gameStarted && (
                  <div className="countdown-section">
                    <div className="status-message">COURT IN SESSION</div>
                    <div className="countdown-display">
                      {countdown !== null ? countdown : "..."}
                    </div>
                  </div>
                )
              )}
            </div>

            {roomData.prompt && (
              <div className="prompt-section">
                <div className="prompt-title">CASE BRIEF</div>
                <div className="prompt-content">{roomData.prompt}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="loading-message">SUMMONING COURT DATA...</div>
        )}
      </div>
    </div>
  );
};

export default RoomPage;
