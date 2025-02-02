import React, { useEffect } from "react";

interface ChooseRoomProps {
  onSelect: (mode: "create" | "join") => void;
}

const ChooseRoom: React.FC<ChooseRoomProps> = ({ onSelect }) => {
  useEffect(() => {
    // Ensure correct event types for `mousemove`
    const buttons = document.querySelectorAll(
      ".menu-button"
    ) as NodeListOf<HTMLElement>;

    buttons.forEach((button) => {
      const mouseMoveListener = (e: MouseEvent) => {
        const rect = button.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        button.style.setProperty("--x", `${x}%`);
        button.style.setProperty("--y", `${y}%`);
      };

      button.addEventListener("mousemove", mouseMoveListener as EventListener);

      return () => {
        button.removeEventListener(
          "mousemove",
          mouseMoveListener as EventListener
        );
      };
    });
  }, []);

  return (
    <div className="game-container">
      <div className="game-background">
        <div className="bg-grid"></div>
        <div className="bg-overlay"></div>
      </div>

      <div className="game-logo">
        <div className="logo-container">
          <div className="logo-badge">
            <svg className="badge-icon" viewBox="0 0 24 24">
              <path
                d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8L20 9v6l-8 4-8-4V9l8-4.2z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1>PAW & ORDER</h1>
          <div className="subtitle">
            <span className="highlight">SUPERIOR COURT</span>
            <span className="version">BETA v0.01</span>
          </div>
          <div className="court-line">WHERE JUSTICE IS PURR-FECT</div>
        </div>
      </div>

      <div className="game-card">
        <div className="card-header">
          <div className="menu-title">SELECT START</div>
          <div className="menu-divider">
            <div className="divider-line"></div>
            <div className="divider-diamond"></div>
            <div className="divider-line"></div>
          </div>
        </div>

        <div className="menu-options">
          <button
            className="menu-button primary"
            onClick={() => onSelect("create")}
          >
            <div className="button-content">
              <div className="button-diamond"></div>
              <span className="button-text">CREATE COURT</span>
            </div>
            <div className="button-glow"></div>
          </button>

          <button
            className="menu-button secondary"
            onClick={() => onSelect("join")}
          >
            <div className="button-content">
              <div className="button-diamond"></div>
              <span className="button-text">JOIN COURT</span>
            </div>
          </button>
        </div>
      </div>

      <div className="footer">
        <a href="#" className="footer-link">
          Legal Procedures
        </a>
        <span className="footer-separator">•</span>
        <a href="#" className="footer-link">
          About The Court
        </a>
      </div>
    </div>
  );
};

export default ChooseRoom;
