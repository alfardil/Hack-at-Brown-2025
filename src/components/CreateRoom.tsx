import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface CreateRoomProps {
  onRoomCreated?: (roomCode: string) => void;
}

const CreateRoom: React.FC<CreateRoomProps> = ({ onRoomCreated }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const createRoom = async () => {
      try {
        const response = await fetch("/api/lobby/create", {
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

        navigate(`/room/${data.code}`);
      } catch (error) {
        console.error(error);
      }
    };

    createRoom();
  }, [navigate, onRoomCreated]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <p>Creating room...</p>
    </div>
  );
};

export default CreateRoom;
