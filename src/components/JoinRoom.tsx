import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface JoinRoomProps {
  onRoomJoined?: (roomCode: string) => void;
}

const JoinRoom: React.FC<JoinRoomProps> = ({ onRoomJoined }) => {
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!joinCode.trim()) {
      setError("Enter a room code");
      return;
    }

    try {
      const response = await fetch("api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim() }),
      });
      if (!response.ok) {
        const errData = await response.json();
        setError(errData.error || "Error joining room");
        return;
      }
      const data = await response.json();

      if (onRoomJoined) {
        onRoomJoined(data.code);
      }
      navigate(`/room/${data.code}`);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Join a Room</h2>
      <input
        type="text"
        value={joinCode}
        onChange={(e) => setJoinCode(e.target.value)}
        placeholder="Enter 5-digit code"
      />
      <button onClick={handleJoin} style={{ marginLeft: "1rem" }}>
        Join
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default JoinRoom;
