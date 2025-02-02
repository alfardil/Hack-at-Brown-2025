import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import GamePage from "./components/GamePage";
import Lobby from "./components/Lobby";
import RoomPage from "./components/RoomPage";
import { chatClient } from "./config/openaiConfig";
import { GameProvider } from "./context/GameContext";

const App: React.FC = () => {
  const [, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function testPrompt() {
      try {
        const response = await chatClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "Tell me a joke!" }],
          max_tokens: 50,
        });

        console.log("Response:", response.choices[0].message.content);
      } catch (error) {
        console.error("Error:", error);
      }
    }

    testPrompt();
  }, []);

  return (
    <BrowserRouter>
      <GameProvider>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/lobby/:code" element={<RoomPage />} />
          <Route path="/game/:gameId" element={<GamePage />} />
        </Routes>
      </GameProvider>
    </BrowserRouter>
  );
};

export default App;
