import React from 'react';
import { judgeImage } from '../config/constants';

interface ResultsProps {
  myScore: number;
  opponentScore: number;
  myTranscript: string;
  opponentTranscript: string;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  onPlayAgain: () => void;
}

const Results: React.FC<ResultsProps> = ({ 
  myScore, 
  opponentScore, 
  myTranscript, 
  opponentTranscript,
  feedback,
  strengths,
  improvements,
  onPlayAgain 
}) => {
  const amIWinner = myScore > opponentScore;

  return (
    <div className="game-container">
      <div className="game-background">
        <div className="bg-grid"></div>
        <div className="bg-overlay"></div>
      </div>
      
      <div className="game-card">
        <div className="card-header">
          <div className="menu-title">DEBATE RESULTS</div>
          <div className="menu-divider">
            <div className="divider-line"></div>
            <div className="divider-diamond"></div>
            <div className="divider-line"></div>
          </div>
        </div>

        <div className="results-content">
          <img src={judgeImage} alt="Judge Pawsworth" className="judge-image small" />
          <div className="winner-announcement">
            {amIWinner ? "YOU WIN! 🎉" : "YOUR OPPONENT WINS 🏆"}
          </div>

          <div className="feedback-section">
            <h3>Judge's Feedback</h3>
            <p>{feedback}</p>
            
            {strengths && strengths.length > 0 && (
              <div className="strengths">
                <h4>Strengths</h4>
                <ul>
                  {strengths.map((strength, i) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {improvements && improvements.length > 0 && (
              <div className="improvements">
                <h4>Areas for Improvement</h4>
                <ul>
                  {improvements.map((improvement, i) => (
                    <li key={i}>{improvement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="scores-container">
            <div className="score-box">
              <div className="score-label">YOUR SCORE</div>
              <div className="score-value">{myScore}/100</div>
              <div className="transcript-box">
                <div className="transcript-title">Your Argument</div>
                <div className="transcript-content">{myTranscript}</div>
              </div>
            </div>

            <div className="score-box">
              <div className="score-label">OPPONENT'S SCORE</div>
              <div className="score-value">{opponentScore}/100</div>
              <div className="transcript-box">
                <div className="transcript-title">Opponent's Argument</div>
                <div className="transcript-content">{opponentTranscript}</div>
              </div>
            </div>
          </div>

          <button onClick={onPlayAgain} className="menu-button primary">
            <div className="button-content">
              <div className="button-diamond"></div>
              <span className="button-text">DEBATE AGAIN</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results; 