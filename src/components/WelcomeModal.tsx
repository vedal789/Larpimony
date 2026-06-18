import { useState } from "react";
import { ProjectSettings, RESOLUTION_PRESETS } from "../lib/settings";

interface WelcomeModalProps {
  isClosing?: boolean;
  onClose: (settings: ProjectSettings, projectName: string) => void;
  initialSettings: ProjectSettings;
  initialProjectName: string;
}

const FPS_PRESETS = [30, 60, 120, 144, 240];

const SUBTITLES = [
  "What do you want to create today?",
  "Let's make something great.",
  "Ready when you are.",
  "Time to bring an idea to life.",
  "What's the vision?",
];

const NIGHT_GREETINGS = [
  "Good night!",
  "Late night session?",
  "Still up?",
];

const MORNING_GREETINGS = [
  "Good morning!",
  "Morning!",
  "Rise and create.",
];

const AFTERNOON_GREETINGS = [
  "Good afternoon!",
  "Afternoon!",
];

const EVENING_GREETINGS = [
  "Good evening!",
  "Evening!",
  "Winding down or just getting started?",
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
  initialSettings,
  initialProjectName,
}: WelcomeModalProps) {
  const [settings, setSettings] = useState<ProjectSettings>(initialSettings);
  const [projectName, setProjectName] = useState(initialProjectName);
  const [subtitle] = useState(pickSubtitle);

  const colors = ["#fdc700", "#ff6467", "#51a2ff"];
  const title = "ANTIMONY";

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
              placeholder="Untitled Project"
              autoFocus
              onFocus={(e) => e.target.select()}
            />
          </div>

          <div className="welcome-settings-section">
            <label>Resolution</label>
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
            <label>Framerate (FPS)</label>
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
            Start Creating
          </button>
        </div>
      </div>
    </div>
  );
}