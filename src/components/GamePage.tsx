import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TURN_DURATION, judgeImage } from '../config/constants';
import { useGame } from '../context/GameContext';
import { Position } from '../types/game';
import Results from './Results';

const JudgeIntro: React.FC<{ prompt: string | undefined, position: Position, onReady: () => void }> = ({ prompt, position, onReady }) => {
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
          <p>*adjusts whiskers* Meowvelous to meet you! I'm Judge Pawsworth, and I'll be purr-siding over this debate.</p>
          <p>Today's burning question is:</p>
          <div className="debate-question">{prompt || "Loading question..."}</div>
          <p>You will be arguing the <strong>{position.toUpperCase()}</strong> position.</p>
          <p>Remember, this is a formal purr-ceeding! Let's keep it clawsome and respectful.</p>
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
  const { gameState, setGameState } = useGame();
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(TURN_DURATION / 1000);
  const [showIntro, setShowIntro] = useState(true);
  const [judgment, setJudgment] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [phase, setPhase] = useState<'intro' | 'opening' | 'rebuttal' | 'closing' | 'judgment'>('intro');
  const [opponentResponse, setOpponentResponse] = useState<string | null>(null);

  const getPhaseTime = () => {
    switch (phase) {
      case 'opening': return 60;
      case 'rebuttal': return 45;
      case 'closing': return 30;
      default: return 60;
    }
  };

  const getMyPosition = (): Position => {
    if (!gameState?.positions || !gameState.playerIds[0]) return 'pro';
    return gameState.positions[gameState.playerIds[0]];
  };

  useEffect(() => {
    if (!gameId) return;

    const fetchGameState = async () => {
      try {
        const res = await fetch(`https://hack-at-brown-2025.onrender.com/api/game/${gameId}/gameState`);
        if (res.ok) {
          const data = await res.json();
          setGameState(data);

          // Check for opponent's response
          if (data.responses) {
            const myPos = getMyPosition();
            const oppositePos = myPos === 'pro' ? 'con' : 'pro';
            const currentPhaseResponses = data.responses[phase];
            if (currentPhaseResponses && currentPhaseResponses[oppositePos]) {
              setOpponentResponse(currentPhaseResponses[oppositePos]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching game state:", error);
      }
    };

    fetchGameState();
    const interval = setInterval(fetchGameState, 1000);
    return () => clearInterval(interval);
  }, [gameId, setGameState, phase]);

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

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map(result => result.transcript)
        .join('');
      
      setTranscript(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
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
      setTimer(getPhaseTime());
      recognitionRef.current.start();
    }
  };

  const stopRecording = async () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (timerInterval) {
        clearInterval(timerInterval);
      }

      try {
        const myPosition = getMyPosition();
        const response = await fetch(`https://hack-at-brown-2025.onrender.com/api/game/${gameId}/addResponse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            transcript,
            phase,
            position: myPosition
          })
        });

        if (!response.ok) {
          console.error("Failed to add response:", await response.text());
          return;
        }

        // Check if both players have submitted for this phase
        const gameStateRes = await fetch(`https://hack-at-brown-2025.onrender.com/api/game/${gameId}/gameState`);
        const updatedState = await gameStateRes.json();
        const currentPhaseResponses = updatedState.responses[phase];
        
        if (currentPhaseResponses?.pro && currentPhaseResponses?.con) {
          // Both players have submitted, move to next phase
          switch (phase) {
            case 'opening':
              setPhase('rebuttal');
              break;
            case 'rebuttal':
              setPhase('closing');
              break;
            case 'closing':
              const result = await fetch(`https://hack-at-brown-2025.onrender.com/api/game/${gameId}/judge`, {
                method: 'POST'
              });
              if (result.ok) {
                const judgmentText = await result.json();
                setJudgment(judgmentText);
                setPhase('judgment');
              }
              break;
          }
        }
      } catch (error) {
        console.error("Error submitting response:", error);
      }
    }
  };

  if (!gameId || !gameState) {
    return <div>Loading game...</div>;
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
          onReady={() => {
            setShowIntro(false);
            setPhase('opening');
          }}
        />
      </div>
    );
  }

  if (phase === 'judgment' && judgment) {
    return <Results judgment={judgment} onPlayAgain={() => navigate('/')} />;
  }

  return (
    <div className="game-container">
      <div className="game-background">
        <div className="bg-grid"></div>
        <div className="bg-overlay"></div>
      </div>

      <div className="game-card">
        <div className="card-header">
          <div className="menu-title">COURT IN SESSION</div>
          <div className="phase-indicator">{phase.toUpperCase()}</div>
          <div className="menu-divider">
            <div className="divider-line"></div>
            <div className="divider-diamond"></div>
            <div className="divider-line"></div>
          </div>
        </div>

        <div className="game-content">
          {gameState.prompt && (
            <div className="prompt-section">
              <div className="prompt-title">DEBATE TOPIC</div>
              <div className="prompt-content">{gameState.prompt}</div>
              <div className="position-indicator">
                Your position: {getMyPosition().toUpperCase()}
              </div>
            </div>
          )}

          {opponentResponse && phase !== 'opening' && (
            <div className="opponent-response">
              <div className="response-title">Opponent's Previous Argument</div>
              <div className="response-content">{opponentResponse}</div>
            </div>
          )}

          <div className="phase-instructions">
            {phase === 'opening' && 'Present your main argument (60 seconds)'}
            {phase === 'rebuttal' && 'Address your opponent\'s points (45 seconds)'}
            {phase === 'closing' && 'Make your final statement (30 seconds)'}
          </div>

          <div className="status-display">
            <div className="status-item">
              <div className="status-label">YOUR TURN</div>
              <div className="status-value">{timer}s</div>
            </div>
            {!isRecording ? (
              <button onClick={startRecording} className="menu-button primary">
                <div className="button-content">
                  <div className="button-diamond"></div>
                  <span className="button-text">START SPEAKING</span>
                </div>
              </button>
            ) : (
              <button onClick={stopRecording} className="menu-button secondary">
                <div className="button-content">
                  <div className="button-diamond"></div>
                  <span className="button-text">STOP RECORDING</span>
                </div>
              </button>
            )}
            {transcript && (
              <div className="transcript-box">
                <div className="transcript-title">YOUR RESPONSE</div>
                <div className="transcript-content">{transcript}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;