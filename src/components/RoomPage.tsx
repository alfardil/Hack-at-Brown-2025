import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface RoomData {
  players: number;
  prompt?: string;
}

const RoomPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!code) return;

      try {
        const response = await fetch(`/api/lobby/${code}`);
        if (!response.ok) {
          const errData = await response.json();
          setError(errData.error || "Could not find room");
          setLoading(false);
          return;
        }
        const data = await response.json();
        setRoomData(data);
      } catch (err) {
        console.error(err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [code]);

  if (loading) {
    return <div>Loading room data...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (!roomData) {
    return <div>No data for this room</div>;
  }

  // Example: if players < 2, show waiting. If players = 2, show "ready to start" or game screen
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>Room: {code}</h2>
      <p>Players: {roomData.players}</p>

      {roomData.players < 2 ? (
        <p>Waiting for a second player to join...</p>
      ) : (
        <p>Both players have joined!</p>
      )}

      {roomData.prompt && <p>Debate Prompt: {roomData.prompt}</p>}
    </div>
  );
};

export default RoomPage;
