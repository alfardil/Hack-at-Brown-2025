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
      const response = await fetch("https://hack-at-brown-2025.onrender.com/api/lobby/create", {
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
      navigate(`/lobby/${data.code}`);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  };

  return (
    <div className="game-container">
      <div className="game-background">
        <div className="bg-grid"></div>
        <div className="bg-overlay"></div>
      </div>

      <div className="game-card join-card">
        <div className="card-header">
          <div className="menu-title">ENTER COURT CODE</div>
          <div className="menu-divider">
            <div className="divider-line"></div>
            <div className="divider-diamond"></div>
            <div className="divider-line"></div>
          </div>
        </div>

        <div className="join-content">
          <div className="input-container">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="XXXXX"
              className="court-input"
              maxLength={5}
            />
            <div className="input-line"></div>
          </div>

          <button className="menu-button primary" onClick={handleJoin}>
            <div className="button-content">
              <div className="button-diamond"></div>
              <span className="button-text">ENTER COURT</span>
            </div>
            <div className="button-glow"></div>
          </button>

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
