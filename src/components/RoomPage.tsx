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
    const jokeInterval = setInterval(fetchJoke, 10000);

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
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>Room: {code}</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {roomData ? (
        <>
          <p>Players: {roomData.players}</p>
          {roomData.players < 2 ? (
            <>
              <p>Waiting for a second player to join...</p>
              <h3>🤖 AI Joke:</h3>
              <p>{joke || "Loading a joke..."}</p>
            </>
          ) : (
            <>
              {!gameStarted && (
                <>
                  <p>Both players have joined!</p>
                  <p>
                    Game starts in: {countdown !== null ? countdown : "..."}{" "}
                    seconds
                  </p>
                </>
              )}
            </>
          )}
          {roomData.prompt && <p>Debate Prompt: {roomData.prompt}</p>}
        </>
      ) : (
        <p>Loading room data...</p>
      )}
    </div>
  );
};

export default RoomPage;
