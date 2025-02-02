import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TURN_DURATION, judgeImage } from "../config/constants";
import { useGame } from "../context/GameContext";
import { Position } from "../types/game";
import Results from "./Results";

const JudgeIntro: React.FC<{
  prompt: string | undefined;
  position: Position;
  onReady: () => void;
}> = ({ prompt, position, onReady }) => {
  return (
    <div className="game-card">
      <div className="card-header">
        <div className="menu-title">MEET YOUR JUDGE</div>
        <div className="menu-divider">
          <div className="divider-line"></div>
          <div className="divider-diamond"></div>
          <div className="divider-line"></div>
        </div>
      </div>

      <div className="judge-intro">
        <img src={judgeImage} alt="Judge Pawsworth" className="judge-image" />
        <div className="judge-speech">
          <p>
            *adjusts whiskers* Meowvelous to meet you! I'm Judge Pawsworth, and
            I'll be purr-siding over this debate.
          </p>
          <p>Today's burning question is:</p>
          <div className="debate-question">
            {prompt || "Loading question..."}
          </div>
          <p>
            You will be arguing the{" "}
            <strong>{position === "pro" ? "FOR" : "AGAINST"}</strong> position.
          </p>
          <p>
            Remember, this is a formal purr-ceeding! Let's keep it clawsome and
            respectful.
          </p>
        </div>
        <button onClick={onReady} className="menu-button primary">
          <div className="button-content">
            <div className="button-diamond"></div>
            <span className="button-text">READY TO BEGIN</span>
          </div>
        </button>
      </div>
    </div>
  );
};

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { gameState, playerId } = useGame();
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(TURN_DURATION / 1000);
  const [showIntro, setShowIntro] = useState(true);
  const recognitionRef = useRef<any>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [myScore, setMyScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [opponentTranscript, setOpponentTranscript] = useState<string>("");
  const [showResults, setShowResults] = useState(false);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  const [feedback, setFeedback] = useState<string>("");
  const [strengths, setStrengths] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);

  const getMyPosition = (): Position => {
    if (!gameState?.positions) return "pro";
    return gameState.positions[playerId] || "pro";
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join("");
      setTranscript(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setTranscript("");
      setIsRecording(true);
      setTimer(60);
      recognitionRef.current.start();
    }
  };

  const stopRecording = async () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (timerInterval) clearInterval(timerInterval);

      setIsWaitingForOpponent(true);

      try {
        let score: number;
        let feedback: string;
        let strengths: string[];
        let improvements: string[];

        try {
          const gradeResponse = await fetch(
            "https://hack-at-brown-2025.onrender.com/api/debate/evaluate",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                argument: transcript,
                topic: gameState?.prompt,
                position: getMyPosition(),
                evaluationType: "debate",
                criteria: {
                  relevance: "How well does the argument address the topic?",
                  reasoning: "How logical and well-structured is the argument?",
                  evidence: "How well does it use examples or evidence?",
                  persuasiveness: "How convincing is the overall argument?",
                  stance: `How well does it argue the ${getMyPosition()} position?`,
                },
              }),
            }
          );

          if (gradeResponse.ok) {
            const gradeData = await gradeResponse.json();
            score = Math.round((gradeData.score || 0.75) * 100);
            feedback =
              gradeData.feedback ||
              "Judge Pawsworth is impressed with your argument!";
            strengths = gradeData.strengths || [
              "Clear presentation",
              "Good effort in addressing the topic",
            ];
            improvements = gradeData.improvements || [
              "Consider adding more specific examples",
            ];
          } else {
            throw new Error("Grading failed");
          }
        } catch (error) {
          console.warn("Grading API failed, using default score");
          score = 75;
          feedback = "Judge Pawsworth is impressed with your argument!";
          strengths = [
            "Clear presentation",
            "Good effort in addressing the topic",
          ];
          improvements = ["Consider adding more specific examples"];
        }

        setMyScore(score);
        setFeedback(feedback);
        setStrengths(strengths);
        setImprovements(improvements);

        await fetch(
          `https://hack-at-brown-2025.onrender.com/api/game/${gameId}/gameState`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              playerId,
              response: {
                transcript,
                score,
                feedback,
                strengths,
                improvements,
              },
            }),
          }
        );

        const checkOpponent = setInterval(async () => {
          const stateRes = await fetch(
            `https://hack-at-brown-2025.onrender.com/api/game/${gameId}/gameState`
          );
          if (!stateRes.ok) return;

          const gameData = await stateRes.json();
          if (gameData.responses) {
            // In the checkOpponent interval:
            const opponent = Object.values(gameData.responses).find(
              (r: any) => r.playerId !== playerId
            ) as { score: number; transcript: string } | undefined;

            if (opponent) {
              clearInterval(checkOpponent);
              setOpponentScore(opponent.score);
              setOpponentTranscript(opponent.transcript);
              setIsWaitingForOpponent(false);
              setShowResults(true);
            }
          }
        }, 1000);

        setTimeout(() => {
          clearInterval(checkOpponent);
          if (!showResults) {
            setIsWaitingForOpponent(false);
            setShowResults(true);
          }
        }, 30000);
      } catch (error) {
        console.error("Error:", error);
        setIsWaitingForOpponent(false);
        setShowResults(true);
      }
    }
  };

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 0) {
            stopRecording();
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  if (!gameId || !gameState) {
    return <div>Loading game...</div>;
  }

  if (showResults) {
    return (
      <Results
        myScore={myScore}
        opponentScore={opponentScore}
        myTranscript={transcript}
        opponentTranscript={opponentTranscript}
        feedback={feedback}
        strengths={strengths}
        improvements={improvements}
        onPlayAgain={() => navigate("/")}
      />
    );
  }

  if (showIntro) {
    return (
      <div className="game-container">
        <div className="game-background">
          <div className="bg-grid"></div>
          <div className="bg-overlay"></div>
        </div>
        <JudgeIntro
          prompt={gameState.prompt}
          position={getMyPosition()}
          onReady={() => setShowIntro(false)}
        />
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-background">
        <div className="bg-grid"></div>
        <div className="bg-overlay"></div>
      </div>

      <div className="game-card">
        <div className="card-header">
          <div className="menu-title">MAKE YOUR CASE</div>
          <div className="menu-divider">
            <div className="divider-line"></div>
            <div className="divider-diamond"></div>
            <div className="divider-line"></div>
          </div>
        </div>

        <div className="game-content">
          {gameState?.prompt && (
            <div className="prompt-section">
              <div className="prompt-title">DEBATE TOPIC</div>
              <div className="prompt-content">{gameState.prompt}</div>
              <div className="position-indicator">
                Your position: {getMyPosition() === "pro" ? "FOR" : "AGAINST"}
              </div>
            </div>
          )}

          {isWaitingForOpponent ? (
            <div className="waiting-message">
              Waiting for opponent to finish their argument...
            </div>
          ) : (
            <div className="status-display">
              <div className="status-item">
                <div className="status-label">TIME REMAINING</div>
                <div className="status-value">{timer}s</div>
              </div>
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="menu-button primary"
                >
                  <div className="button-content">
                    <div className="button-diamond"></div>
                    <span className="button-text">START SPEAKING</span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="menu-button secondary"
                >
                  <div className="button-content">
                    <div className="button-diamond"></div>
                    <span className="button-text">STOP RECORDING</span>
                  </div>
                </button>
              )}
              {transcript && (
                <div className="transcript-box">
                  <div className="transcript-title">YOUR ARGUMENT</div>
                  <div className="transcript-content">{transcript}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePage;
