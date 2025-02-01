import React, { useEffect, useState } from "react";

interface RoomData {
  count: number;
  startTime: number | null;
}

const COUNTDOWN_DURATION = 5;

const ChooseRoom: React.FC<{ onSelect: (mode: "create" | "join") => void }> = ({
  onSelect,
}) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1
        style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}
      >
        Welcome
      </h1>
      <div>
        <button
          onClick={() => onSelect("create")}
          style={{
            marginRight: "1rem",
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            backgroundColor: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "0.25rem",
            cursor: "pointer",
          }}
        >
          Create Room
        </button>
        <button
          onClick={() => onSelect("join")}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            backgroundColor: "#10b981",
            color: "#fff",
            border: "none",
            borderRadius: "0.25rem",
            cursor: "pointer",
          }}
        >
          Join Room
        </button>
      </div>
    </div>
  );
};

const CreateRoom: React.FC<{ onRoomCreated: (roomCode: string) => void }> = ({
  onRoomCreated,
}) => {
  const generateRoomCode = () =>
    Math.floor(10000 + Math.random() * 90000).toString();

  useEffect(() => {
    const roomCode = generateRoomCode();
    const key = `room_${roomCode}`;
    const room: RoomData = { count: 1, startTime: null };
    localStorage.setItem(key, JSON.stringify(room));
    onRoomCreated(roomCode);
  }, [onRoomCreated]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p style={{ fontSize: "1.25rem" }}>Creating room...</p>
    </div>
  );
};

const JoinRoom: React.FC<{ onRoomJoined: (roomCode: string) => void }> = ({
  onRoomJoined,
}) => {
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  const handleJoin = () => {
    if (!joinCode.trim()) {
      setError("Enter a room code");
      return;
    }
    const key = `room_${joinCode}`;
    const roomStr = localStorage.getItem(key);
    if (!roomStr) {
      setError("Room not found");
      return;
    }
    const room: RoomData = JSON.parse(roomStr);
    if (room.count >= 2) {
      setError("Room is full");
      return;
    }
    room.count = 2;
    if (!room.startTime) {
      room.startTime = Date.now();
    }
    localStorage.setItem(key, JSON.stringify(room));
    onRoomJoined(joinCode);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1
        style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}
      >
        Join Room
      </h1>
      <input
        type="text"
        value={joinCode}
        onChange={(e) => setJoinCode(e.target.value)}
        placeholder="Enter 5-digit code"
        style={{
          padding: "0.5rem",
          fontSize: "1rem",
          marginBottom: "1rem",
          border: "1px solid #ccc",
          borderRadius: "0.25rem",
        }}
      />
      <button
        onClick={handleJoin}
        style={{
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          backgroundColor: "#10b981",
          color: "#fff",
          border: "none",
          borderRadius: "0.25rem",
          cursor: "pointer",
        }}
      >
        Join
      </button>
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </div>
  );
};

const WaitingRoom: React.FC<{ roomCode: string }> = ({ roomCode }) => {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const key = `room_${roomCode}`;
    const interval = setInterval(() => {
      const roomStr = localStorage.getItem(key);
      if (roomStr) {
        const room: RoomData = JSON.parse(roomStr);
        setRoomData(room);
        if (room.count === 2 && room.startTime) {
          const elapsed = Math.floor((Date.now() - room.startTime) / 1000);
          const timeLeft = COUNTDOWN_DURATION - elapsed;
          if (timeLeft <= 0) {
            setCountdown(0);
            setGameStarted(true);
            clearInterval(interval);
          } else {
            setCountdown(timeLeft);
          }
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [roomCode]);

  if (gameStarted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#d1fae5",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2
          style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}
        >
          Game Started!
        </h2>
        <p style={{ fontSize: "1.25rem" }}>Room Code: {roomCode}</p>
      </div>
    );
  }

  if (roomData && roomData.count < 2) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f9fafb",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
          }}
        >
          Waiting for another player to join...
        </h2>
        <p style={{ fontSize: "1rem" }}>Room Code: {roomCode}</p>
      </div>
    );
  }

  if (roomData && roomData.count === 2) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#e6ffed",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
          }}
        >
          Both players have joined!
        </h2>
        <p style={{ fontSize: "1.25rem" }}>
          Game starting in: {countdown} seconds
        </p>
      </div>
    );
  }

  return null;
};

const Lobby: React.FC = () => {
  const [mode, setMode] = useState<null | "create" | "join">(null);
  const [roomCode, setRoomCode] = useState("");
  const [joined, setJoined] = useState(false);

  const handleRoomCreated = (code: string) => {
    setRoomCode(code);
    setJoined(true);
  };

  const handleRoomJoined = (code: string) => {
    setRoomCode(code);
    setJoined(true);
  };

  if (!mode) return <ChooseRoom onSelect={(m) => setMode(m)} />;
  if (!joined) {
    if (mode === "create")
      return <CreateRoom onRoomCreated={handleRoomCreated} />;
    if (mode === "join") return <JoinRoom onRoomJoined={handleRoomJoined} />;
  }
  return <WaitingRoom roomCode={roomCode} />;
};

export default Lobby;
