import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { chatClient } from "../config/openaiConfig";

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [rating, setRating] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionInstance =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionInstance) {
      alert("Your browser does not support speech recognition.");
      return;
    }
    const recognition = new SpeechRecognitionInstance();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      // Optionally, rate the answer after transcription
      rateAnswer(result);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript("");
      setRating(null);
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const rateAnswer = async (answer: string) => {
    try {
      const response = await chatClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert debate judge. Rate the following answer on a scale of 1 to 10 and provide a brief explanation:",
          },
          { role: "user", content: answer },
        ],
        max_tokens: 100,
      });
      if (response.choices && response.choices[0].message.content) {
        setRating(response.choices[0].message.content.trim());
      }
    } catch (error) {
      console.error("Error rating answer:", error);
      setRating("Error rating answer");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>Game: {gameId}</h2>
      <div>
        <button onClick={startRecording} disabled={isRecording}>
          {isRecording ? "Recording..." : "Start Recording"}
        </button>
        <button onClick={stopRecording} disabled={!isRecording}>
          Stop Recording
        </button>
      </div>
      <div style={{ marginTop: "1rem" }}>
        <h3>Your Answer:</h3>
        <p>{transcript || "Your transcribed answer will appear here."}</p>
      </div>
      <div style={{ marginTop: "1rem" }}>
        <h3>Rating:</h3>
        <p>{rating ? rating : "No rating yet."}</p>
      </div>
    </div>
  );
};

export default GamePage;
