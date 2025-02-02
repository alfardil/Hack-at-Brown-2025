import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface CreateRoomProps {
  onRoomCreated?: (roomCode: string) => void;
}

const CreateRoom: React.FC<CreateRoomProps> = ({ onRoomCreated }) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createRoom = async () => {
      try {
        const response = await fetch("https://hack-at-brown-2025.onrender.com/api/lobby/create", { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to create room");
        }

        const data = await response.json();

        if (onRoomCreated) {
          onRoomCreated(data.code);
        }

        navigate(`/lobby/${data.code}`);
      } catch (error) {
        console.error("❌ Error creating room:", error);
        setError("Something went wrong. Please try again.");
      }
    };

    createRoom();
  }, [navigate, onRoomCreated]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      {error ? <p style={{ color: "red" }}>{error}</p> : <p>Creating room...</p>}
    </div>
  );
};

export default CreateRoom;