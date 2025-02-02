import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

const GamePage: React.FC<{ userId: string }> = ({ userId }) => {
  const { gameId } = useParams<{ gameId: string }>(); // ✅ Get gameId from URL

  const [gameState, setGameState] = useState<any>(null);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!gameId) {
      console.error("Game ID is missing.");
      return;
    }

    const fetchGameState = async () => {
      try {
        const res = await fetch(`/api/game/${gameId}/gameState`);
        if (res.ok) {
          const data = await res.json();
          setGameState(data);

          // Calculate remaining time
          const timeRemaining =
            new Date(data.turnDeadline).getTime() - new Date().getTime();
          setTimer(Math.max(Math.floor(timeRemaining / 1000), 0));
        } else {
          console.error("Failed to fetch game state, status:", res.status);
        }
      } catch (error) {
        console.error("Error fetching game state:", error);
      }
    };

    fetchGameState();
    const interval = setInterval(fetchGameState, 1000); // Poll every second
    return () => clearInterval(interval);
  }, [gameId]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      stopRecording();
    };

    recognition.onerror = () => {
      stopRecording();
    };

    recognitionRef.current = recognition;
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript("");
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);

    if (!gameId) return; // Prevent making requests if gameId is missing

    // Send transcript to backend
    try {
      await fetch(`/api/game/${gameId}/addResponse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: userId, transcript }),
      });

      // Trigger turn transition
      await fetch(`/api/game/${gameId}/nextTurn`, { method: "POST" });
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  if (!gameId) {
    return <div>Error: Game ID is missing.</div>;
  }

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  const isMyTurn = gameState?.playerIds[gameState?.turn || 0] === userId;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Game Page</h1>
      <p>
        <strong>Game ID:</strong> {gameId}
      </p>
      {isMyTurn ? (
        <div>
          <p className="text-green-500">Your turn! You have {timer} seconds.</p>
          <button
            onClick={startRecording}
            disabled={isRecording}
            className="bg-blue-500 text-white px-4 py-2 mt-2"
          >
            {isRecording ? "Recording..." : "Start Recording"}
          </button>
          <p className="mt-2">{transcript}</p>
        </div>
      ) : (
        <div>
          <p className="text-red-500">
            Waiting for the other player to respond...
          </p>
        </div>
      )}
    </div>
  );
};

export default GamePage;
