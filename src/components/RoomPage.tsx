import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { chatClient } from "../config/openaiConfig";

interface RoomData {
  players: number;
  prompt?: string;
}

const RoomPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [error, setError] = useState("");
  const [joke, setJoke] = useState<string>(""); // For the waiting room joke
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  // Refs for intervals so we can clear them properly
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch the current room data from the server
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

  // Fetch a joke from OpenAI
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

  // Initial fetch and setup periodic updates
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

  // When roomData updates, if there are 2 or more players and no countdown yet, start the countdown.
  useEffect(() => {
    if (
      roomData &&
      roomData.players >= 2 &&
      countdown === null &&
      !gameStarted
    ) {
      // Start a countdown of 10 seconds (or any duration you choose)
      setCountdown(10);
    }
  }, [roomData, countdown, gameStarted]);

  // Handle the countdown timer
  useEffect(() => {
    // If countdown is set and above zero, start an interval
    if (countdown !== null && countdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev !== null && prev > 0) {
            return prev - 1;
          }
          return prev;
        });
      }, 1000);
    } else if (countdown === 0) {
      // When countdown reaches 0, mark the game as started
      setGameStarted(true);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [countdown]);

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
          ) : gameStarted ? (
            // Once the game has started, switch the UI (you can replace this with your game screen)
            <div>
              <p>The game has started!</p>
              {/* Here you can add microphone input and AI transcription/game logic */}
            </div>
          ) : (
            <>
              <p>Both players have joined!</p>
              <p>Game starts in: {countdown} seconds</p>
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
