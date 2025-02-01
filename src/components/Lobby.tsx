// src/components/Lobby.tsx
import React, { useState } from "react";
import ChooseRoom from "./ChooseRoom";
import CreateRoom from "./CreateRoom";
import JoinRoom from "./JoinRoom";

const Lobby: React.FC = () => {
  const [mode, setMode] = useState<"create" | "join" | null>(null);

  if (!mode) {
    return <ChooseRoom onSelect={(selected) => setMode(selected)} />;
  }

  if (mode === "create") {
    return <CreateRoom />;
  }

  return <JoinRoom />;
};

export default Lobby;
