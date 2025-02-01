import React from "react";

interface ChooseRoomProps {
  onSelect: (mode: "create" | "join") => void;
}

const ChooseRoom: React.FC<ChooseRoomProps> = ({ onSelect }) => {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Paw & Order </h1>
      <button
        onClick={() => onSelect("create")}
        style={{ marginRight: "1rem" }}
      >
        Create Room
      </button>
      <button onClick={() => onSelect("join")}>Join Room</button>
    </div>
  );
};

export default ChooseRoom;
