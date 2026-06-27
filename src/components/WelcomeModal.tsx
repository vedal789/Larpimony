import { useState } from "react";
import { ProjectSettings, RESOLUTION_PRESETS } from "../lib/settings";

interface WelcomeModalProps {
  isClosing?: boolean;
  onClose: (settings: ProjectSettings, projectName: string) => void;
  onLoad: () => void;
  initialSettings: ProjectSettings;
  initialProjectName: string;
}

const FPS_PRESETS = [30, 60, 120, 144, 240];

const SUBTITLES = [
  "what DONT you want to create today",
  "Let's make something absolutely shit.",
  "He made an antimony so good even his devs larped it",
  "Marisa stole the precious Antimony",
  "Larpimony Jockey 😂😂 - Joke by: vedal",
];

const NIGHT_GREETINGS = [
  "go to sleep bro its night time"
];

const MORNING_GREETINGS = [
 "gm twin"
];

const AFTERNOON_GREETINGS = [
  "go eat lunch!"
];

const EVENING_GREETINGS = [
  "go play on your swing and edit at the same time!"
];

function getTimeGreeting() {
  const hour = new Date().getHours();
  const greetings =
    hour < 5
      ? NIGHT_GREETINGS
      : hour < 12
      ? MORNING_GREETINGS
      : hour < 18
      ? AFTERNOON_GREETINGS
      : EVENING_GREETINGS;
  return greetings[Math.floor(Math.random() * greetings.length)];
}

function pickSubtitle() {
  const pool = [...SUBTITLES, getTimeGreeting()];
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function WelcomeModal({
  isClosing = false,
  onClose,
  onLoad,
  initialSettings,
  initialProjectName,
}: WelcomeModalProps) {
  const [settings, setSettings] = useState<ProjectSettings>(initialSettings);
  const [projectName, setProjectName] = useState(initialProjectName);
  const [subtitle] = useState(pickSubtitle);

  const colors = ["#0238ff", "#009b98", "#ae5d00"];
  const title = "LARPIMONY";

  return (
    <div
      className={`modal-overlay welcome-modal-overlay ${isClosing ? "is-closing" : ""}`}
    >
      <div
        className="modal-content welcome-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="welcome-modal-header">
          <p className="welcome-subtitle-top">Welcome to</p>
          <h1 className="welcome-title">
            {title.split("").map((char, i) => (
              <span
                key={i}
                style={{
                  color: colors[i % colors.length],
                  animationDelay: `${i * 0.05}s, ${0.6 + i * 0.15}s`,
                  textShadow: `
                    0 0 10px ${colors[i % colors.length]}33,
                    0 0 20px ${colors[i % colors.length]}22
                  `,
                }}
              >
                {char}
              </span>
            ))}
          </h1>
          <p className="welcome-subtitle-bottom">{subtitle}</p>
        </div>

        <div className="welcome-modal-body">
          <div className="welcome-settings-section">
            <label>Project Name</label>
            <input
              type="text"
              className="welcome-name-input"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="you can simply just larp around it"
            />
          </div>

          <div className="welcome-settings-section">
            <label>My lalla Resolution</label>
            <div className="welcome-presets-grid">
              {RESOLUTION_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  className={`welcome-preset-btn ${
                    settings.width === preset.width && settings.height === preset.height
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setSettings({ ...settings, width: preset.width, height: preset.height })
                  }
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="welcome-settings-section">
            <label>Framerate (FPS) (oh wait yeah you have a bad pc you will be at 1fps)</label>
            <div className="welcome-presets-grid">
              {FPS_PRESETS.map((fps) => (
                <button
                  key={fps}
                  className={`welcome-preset-btn ${
                    settings.fps === fps ? "active" : ""
                  }`}
                  onClick={() => setSettings({ ...settings, fps })}
                >
                  {fps}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn primary welcome-start-btn"
            onClick={() => onClose(settings, projectName)}
          >
            Start Larp Creating
          </button>
          <button
            className="btn welcome-load-btn"
            onClick={onLoad}
          >
            Load Existing Larp
          </button>
        </div>
      </div>
    </div>
  );
}