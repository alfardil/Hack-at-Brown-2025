import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lobby from "./components/Lobby";
import RoomPage from "./components/RoomPage";
import SplashScreen from "./components/SplashScreen";

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
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
