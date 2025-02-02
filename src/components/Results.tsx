import React from 'react';
import { judgeImage } from '../config/constants';
import { JudgmentResult } from '../types/game';

interface ResultsProps {
  judgment: JudgmentResult;
  onPlayAgain: () => void;
}

const Results: React.FC<ResultsProps> = ({ judgment, onPlayAgain }) => {
  return (
    <div className="game-container">
      <div className="game-background">
        <div className="bg-grid"></div>
        <div className="bg-overlay"></div>
      </div>
      
      <div className="game-card">
        <div className="card-header">
          <div className="menu-title">FINAL JUDGMENT</div>
          <div className="menu-divider">
            <div className="divider-line"></div>
            <div className="divider-diamond"></div>
            <div className="divider-line"></div>
          </div>
        </div>

        <div className="results-content">
          <div className="judge-feedback">
            <img src={judgeImage} alt="Judge Pawsworth" className="judge-image small" />
            <div className="winner-announcement">
              Winner: {judgment.winner.toUpperCase()}
            </div>
            <div className="feedback-bubble">
              <p>{judgment.feedback}</p>
            </div>
          </div>

          <div className="score-display">
            <div className="score-label">DEBATE SCORE</div>
            <div className="score-value">{judgment.score}/10</div>
          </div>

          <div className="mvp-moment">
            <div className="mvp-title">MVP MOMENT</div>
            <div className="mvp-content">{judgment.mvpMoment}</div>
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