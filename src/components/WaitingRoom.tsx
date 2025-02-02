import React, { useEffect, useState } from "react";
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
  const [joke, setJoke] = useState<string>("");

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
        setJoke(response.choices[0].message.content);
      }
    } catch (error) {
      console.error("Error fetching joke:", error);
      setJoke("Couldn't fetch a joke. Try again later!");
    }
  };

  const [, setRefresh] = useState(0);

  useEffect(() => {
    fetchRoomData();
    fetchJoke();

    const roomInterval = setInterval(fetchRoomData, 3000);
    const jokeInterval = setInterval(() => {
      fetchJoke();
      setRefresh((prev) => prev + 1);
    }, 10000);

    return () => {
      clearInterval(roomInterval);
      clearInterval(jokeInterval);
    };
  }, [code]);

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
            <p>Both players have joined!</p>
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
