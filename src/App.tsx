import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import GamePage from "./components/GamePage";
import Lobby from "./components/Lobby";
import RoomPage from "./components/RoomPage";
import SplashScreen from "./components/SplashScreen";
import { chatClient } from "./config/openaiConfig";

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

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
    <>
      {showSplash ? (
        <SplashScreen />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Lobby />} />
            <Route path="/lobby/:code" element={<RoomPage />} />
            <Route path="/game/:gameId" element={<GamePage />} />
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
};

export default App;

useEffect(() => {
  async function checkBackend() {
    try {
      const response = await fetch("https://hack-at-brown-2025.onrender.com/api/lobby/test");
      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }
      const data = await response.json();
      console.log("✅ Backend is reachable:", data);
    } catch (error) {
      console.error("❌ Error connecting to backend:", error);
    }
  }

  checkBackend();
}, []);