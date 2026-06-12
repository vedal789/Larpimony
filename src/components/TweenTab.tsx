import { useState, useEffect, useRef } from "react";
import { useSprites } from "../lib/sprites";
import {
  TWEEN_MODE_OPTIONS,
  TWEENABLE_PROPERTY_OPTIONS,
  applyTweenMode,
  type TweenMode,
  type TweenableProperty,
} from "../lib/tween";
import { Spline, RefreshCw } from "lucide-react";

const PAD = 20;

function drawGraph(
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  mode: TweenMode,
  t: number,
  easedT: number,
  isPlaying: boolean,
) {
  const dpr = window.devicePixelRatio ?? 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  const toX = (p: number) => PAD + p * (w - PAD * 2);
  const toY = (e: number) => h - PAD - e * (h - PAD * 2);

  ctx.clearRect(0, 0, w, h);

  const cs = getComputedStyle(canvas);
  const gridColor =
    cs.getPropertyValue("--graph-grid").trim() || "rgba(255,255,255,0.08)";
  const axisColor =
    cs.getPropertyValue("--graph-axis").trim() || "rgba(255,255,255,0.2)";
  const curveColor = cs.getPropertyValue("--graph-curve").trim() || "#7c6dfa";
  const curveShadowColor =
    cs.getPropertyValue("--graph-curve-shadow").trim() ||
    "rgba(124,109,250,0.15)";
  const dotColor = cs.getPropertyValue("--graph-dot").trim() || "#fff";
  const dotGlowColor =
    cs.getPropertyValue("--graph-dot-glow").trim() || "rgba(124,109,250,0.35)";
  const indicatorLineColor =
    cs.getPropertyValue("--graph-indicator").trim() || "rgba(255,255,255,0.15)";

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);

  ctx.beginPath();
  ctx.moveTo(PAD, PAD);
  ctx.lineTo(w - PAD, PAD);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w - PAD, PAD);
  ctx.lineTo(w - PAD, h - PAD);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(PAD, h / 2);
  ctx.lineTo(w - PAD, h / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w / 2, PAD);
  ctx.lineTo(w / 2, h - PAD);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.strokeStyle = axisColor;
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(PAD, h - PAD);
  ctx.lineTo(w - PAD, h - PAD);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(PAD, PAD);
  ctx.lineTo(PAD, h - PAD);
  ctx.stroke();

  const STEPS = 240;

  const fillPath = new Path2D();
  for (let i = 0; i <= STEPS; i++) {
    const p = i / STEPS;
    const e = applyTweenMode(p, mode);
    if (i === 0) fillPath.moveTo(toX(p), toY(e));
    else fillPath.lineTo(toX(p), toY(e));
  }
  fillPath.lineTo(toX(1), h - PAD);
  fillPath.lineTo(toX(0), h - PAD);
  fillPath.closePath();
  ctx.fillStyle = curveShadowColor;
  ctx.fill(fillPath);

  ctx.beginPath();
  for (let i = 0; i <= STEPS; i++) {
    const p = i / STEPS;
    const e = applyTweenMode(p, mode);
    if (i === 0) ctx.moveTo(toX(p), toY(e));
    else ctx.lineTo(toX(p), toY(e));
  }
  ctx.strokeStyle = curveColor;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.stroke();

  if (isPlaying) {
    const ix = toX(t);
    const iy = toY(easedT);

    ctx.strokeStyle = indicatorLineColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(ix, PAD);
    ctx.lineTo(ix, h - PAD);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(ix, iy, 10, 0, Math.PI * 2);
    ctx.fillStyle = dotGlowColor;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ix, iy, 5, 0, Math.PI * 2);
    ctx.fillStyle = dotColor;
    ctx.fill();
  }
}

function TweenGraph({
  mode,
  t,
  easedT,
  isPlaying,
}: {
  mode: TweenMode;
  t: number;
  easedT: number;
  isPlaying: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      const w = entry.contentRect.width;
      const h = entry.contentRect.height;
      if (w === 0 || h === 0) return;
      sizeRef.current = { w, h };
      drawGraph(canvas, w, h, mode, t, easedT, isPlaying);
    });

    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const { w, h } = sizeRef.current;
    if (!canvas || w === 0 || h === 0) return;
    drawGraph(canvas, w, h, mode, t, easedT, isPlaying);
  }, [mode, t, easedT, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="tween-graph-canvas"
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

export default function TweenTab() {
  const { state, dispatch } = useSprites();
  const sprite = state.sprites.find((s) => s.id === state.selectedSpriteId);

  const [activeProperty, setActiveProperty] = useState<
    TweenableProperty | "default"
  >("default");
  const [t, setT] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const duration = 1800;
    const pauseDuration = 600;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(1, elapsed / duration);
      setT(progress);
      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        timeoutRef.current = window.setTimeout(() => {
          startTimeRef.current = null;
          requestRef.current = requestAnimationFrame(animate);
        }, pauseDuration);
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isPlaying, activeProperty]);

  if (!sprite) {
    return (
      <div className="tween-tab-empty">
        <Spline size={40} className="tween-tab-empty-icon" />
        <h3 className="tween-tab-empty-title">No Sprite Selected</h3>
        <p className="tween-tab-empty-desc">
          Select a sprite to configure its tweening.
        </p>
      </div>
    );
  }

  const updateSprite = (changes: Record<string, unknown>) => {
    dispatch({ type: "UPDATE_SPRITE", id: sprite.id, changes });
  };

  const getActiveMode = (): TweenMode => {
    if (activeProperty === "default") return sprite.tweenMode;
    return sprite.tweenModes[activeProperty] ?? sprite.tweenMode;
  };

  const activeMode = getActiveMode();
  const easedT = applyTweenMode(t, activeMode);

  return (
    <div className="tween-tab-container">
      <div className="tween-tab-sidebar">
        <div className="tween-sidebar-header">
          <span className="tween-sidebar-title">Tween Settings</span>
          <button
            className={`tween-play-btn ${isPlaying ? "active" : ""}`}
            onClick={() => {
              setIsPlaying(!isPlaying);
              if (!isPlaying) {
                startTimeRef.current = null;
                setT(0);
              }
            }}
          >
            <RefreshCw size={12} className={isPlaying ? "spin" : ""} />
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>

        <div className="tween-config-section">
          <div
            className={`tween-default-card ${activeProperty === "default" ? "active" : ""}`}
            onClick={() => setActiveProperty("default")}
          >
            <div className="tween-default-card-top">
              <span className="tween-default-label">Default</span>
            </div>
            <select
              className="tween-select"
              value={sprite.tweenMode}
              onChange={(e) =>
                updateSprite({ tweenMode: e.target.value as TweenMode })
              }
              onClick={(e) => e.stopPropagation()}
            >
              {TWEEN_MODE_OPTIONS.map(([label, mode]) => (
                <option key={mode} value={mode}>
                  {label}
                </option>
              ))}
            </select>
            <span className="tween-default-hint">
              (applies to every property)
            </span>
          </div>

          <div className="tween-overrides-label">Overrides</div>

          <div className="tween-properties-list">
            {TWEENABLE_PROPERTY_OPTIONS.map(([label, prop]) => {
              const hasOverride = sprite.tweenModes[prop] !== undefined;
              const propMode = sprite.tweenModes[prop] ?? sprite.tweenMode;
              const isActive = activeProperty === prop;

              return (
                <div
                  key={prop}
                  className={`tween-prop-row ${isActive ? "active" : ""} ${hasOverride ? "overridden" : ""}`}
                  onClick={() => setActiveProperty(prop)}
                >
                  <div className="tween-prop-row-top">
                    <div className="tween-prop-left">
                      <span className="tween-prop-name">{label}</span>
                    </div>
                    <button
                      className={`tween-override-toggle ${hasOverride ? "on" : "off"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = { ...sprite.tweenModes };
                        if (hasOverride) {
                          delete next[prop];
                        } else {
                          next[prop] = sprite.tweenMode;
                        }
                        updateSprite({ tweenModes: next });
                      }}
                    >
                      {hasOverride ? "On" : "Off"}
                    </button>
                  </div>
                  {hasOverride && (
                    <select
                      className="tween-select"
                      value={propMode}
                      onChange={(e) => {
                        updateSprite({
                          tweenModes: {
                            ...sprite.tweenModes,
                            [prop]: e.target.value as TweenMode,
                          },
                        });
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {TWEEN_MODE_OPTIONS.map(([modeLabel, mode]) => (
                        <option key={mode} value={mode}>
                          {modeLabel}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="tween-tab-visualizer">
        <div className="visualizer-header">
          <div className="visualizer-title-group">
            <span className="visualizer-title">
              {activeProperty === "default" ? "Default" : activeProperty}
            </span>
            <span className="mode-label">{activeMode}</span>
          </div>
        </div>

        <div className="graph-container">
          <TweenGraph
            mode={activeMode}
            t={t}
            easedT={easedT}
            isPlaying={isPlaying}
          />
        </div>

        <div className="previews-section">
          <span className="previews-label">Preview</span>
          <div className="previews-grid">
            <div className="preview-card">
              <span className="preview-title">Translate</span>
              <div className="preview-stage">
                <div className="preview-track" />
                <div
                  className="preview-element"
                  style={{
                    transform: `translateX(calc(${easedT * 100}% - 50%))`,
                  }}
                />
              </div>
            </div>
            <div className="preview-card">
              <span className="preview-title">Scale</span>
              <div className="preview-stage">
                <div
                  className="preview-element preview-circle"
                  style={{ transform: `scale(${0.25 + easedT * 0.75})` }}
                />
              </div>
            </div>
            <div className="preview-card">
              <span className="preview-title">Rotate</span>
              <div className="preview-stage">
                <div
                  className="preview-element preview-square"
                  style={{ transform: `rotate(${easedT * 360}deg)` }}
                />
              </div>
            </div>
            <div className="preview-card">
              <span className="preview-title">Opacity</span>
              <div className="preview-stage">
                <div
                  className="preview-element preview-circle"
                  style={{ opacity: 0.05 + easedT * 0.95 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
