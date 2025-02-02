import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface RoomData {
  players: number;
  prompt?: string;
}

const RoomPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [error, setError] = useState("");

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

  useEffect(() => {
    fetchRoomData(); // Initial fetch

    // Start interval to fetch data every 3 seconds
    const interval = setInterval(fetchRoomData, 3000);

    return () => clearInterval(interval);
  }, [code]);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>Room: {code}</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}

      {roomData ? (
        <>
          <p>Players: {roomData.players}</p>
          {roomData.players < 2 ? (
            <p>Waiting for a second player to join...</p>
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
