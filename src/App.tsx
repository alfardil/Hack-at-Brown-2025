import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
};

export default App;
