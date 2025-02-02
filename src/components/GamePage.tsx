import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { chatClient } from "../config/openaiConfig";

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();

  if (!gameId) {
    return <div>Error: Game ID is missing from the URL.</div>;
  }

  const [gameState, setGameState] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [timer, setTimer] = useState(30);
  const recognitionRef = useRef<any>(null);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);
  const userId = localStorage.getItem("userId") || `user-${Date.now()}`;

  const fetchGameState = async () => {
    try {
      const res = await fetch(`/api/game/${gameId}/gameState`);
      if (res.ok) {
        const state = await res.json();
        setGameState(state);
      } else {
        console.error("Failed to fetch game state, status:", res.status);
      }
    } catch (err) {
      console.error("Error fetching game state:", err);
    }
  };

  useEffect(() => {
    fetchGameState();
    const interval = setInterval(fetchGameState, 3000);
    return () => clearInterval(interval);
  }, [gameId]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      stopRecording();
      submitResponse(result);
    };
    recognition.onerror = (error: any) => {
      console.error("Speech recognition error:", error);
      stopRecording();
    };
    recognitionRef.current = recognition;
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript("");
      setIsRecording(true);
      setTimer(30);
      recognitionRef.current.start();
      timerIdRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            if (timerIdRef.current) {
              clearInterval(timerIdRef.current);
              timerIdRef.current = null;
            }
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    if (recognitionRef.current) {
      setIsRecording(false);
      recognitionRef.current.stop();
    }
    endTurn();
  };

  const submitResponse = async (text: string) => {
    try {
      const aiRes = await chatClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Rate this answer on a scale of 1 to 10:",
          },
          { role: "user", content: text },
        ],
        max_tokens: 50,
      });
      const rating = aiRes.choices[0]?.message?.content || "Unrated";
      await fetch(`/api/game/${gameId}/addResponse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: userId, transcript: text, rating }),
      });
      setTranscript("");
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  const endTurn = async () => {
    try {
      await fetch(`/api/game/${gameId}/endTurn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      fetchGameState();
    } catch (error) {
      console.error("Error ending turn:", error);
    }
  };

  if (!gameState) return <div>Loading game...</div>;

  if (gameState.ended) {
    return (
      <div>
        <h1>Game Over</h1>
        <p>
          <strong>Game ID:</strong> {gameId}
        </p>
        <ul>
          {gameState.responses?.map((resp: any, index: number) => (
            <li key={index}>
              <strong>{resp.playerId}:</strong> {resp.transcript} -{" "}
              {resp.rating}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const isMyTurn = gameState?.playerIds?.[gameState?.turn || 0] === userId;

  return (
    <div>
      <h1>Game Page</h1>
      <p>
        <strong>Game ID:</strong> {gameId}
      </p>
      {isMyTurn ? (
        <div>
          <p>Your turn! You have {timer} seconds.</p>
          <button onClick={startRecording} disabled={isRecording}>
            {isRecording ? "Recording..." : "Start Recording"}
          </button>
          <p>{transcript}</p>
        </div>
      ) : (
        <div>
          <p>Waiting for the other player to respond...</p>
        </div>
      )}
    </div>
  );
};

export default GamePage;
