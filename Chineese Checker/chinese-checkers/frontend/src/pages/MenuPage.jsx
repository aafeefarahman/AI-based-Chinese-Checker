import { useState } from "react"
import { useNavigate } from "react-router-dom"
import RulesModal from "../components/RulesModal"
import "./MenuPage.css"

function PlayerForm({ label, color, value, onChange, status }) {
  const [touched, setTouched] = useState(false)
  const err = touched && !value.trim() ? "Required" : ""
  return (
    <div className="player-form" style={{ "--fc": color }}>
      <div className="pf-head">
        <span className="pf-label" style={{ color }}>👤 {label}</span>
        {status?.ok  && <span className="pf-badge ok">✓ {status.msg}</span>}
        {status?.err && <span className="pf-badge err">✗ {status.msg}</span>}
      </div>
      <div className={err ? "mf mf-err" : "mf"}>
        <label>Player Name</label>
        <input type="text" placeholder="Enter your name"
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          autoComplete="off"
        />
        {err && <span className="mf-hint">{err}</span>}
      </div>
    </div>
  )
}

export default function MenuPage({ players, setPlayers }) {
  const navigate = useNavigate()
  const [step,    setStep]    = useState("mode")
  const [mode,    setMode]    = useState("")
  const [aiSpeed, setAiSpeed] = useState("medium")
  const [p1Name,  setP1Name]  = useState("")
  const [p2Name,  setP2Name]  = useState("")
  const [s1,      setS1]      = useState(null)
  const [s2,      setS2]      = useState(null)

  const pickMode = (m) => {
    setMode(m); setP1Name(""); setP2Name("")
    setS1(null); setS2(null); setStep("setup")
  }

  const handleContinue = (e) => {
    e.preventDefault()
    setS1(null); setS2(null)

    if (mode === "ai_vs_ai") {
      setPlayers({ p1: { username: "AI One" }, p2: { username: "AI Two" } })
      setStep("rules")
      return
    }

    if (mode === "human_vs_ai") {
      if (!p1Name.trim()) { setS1({ err: true, msg: "Name required" }); return }
      setPlayers({ p1: { username: p1Name.trim() }, p2: { username: "AI" } })
      setStep("rules")
      return
    }

    if (mode === "human_vs_human") {
      let ok = true
      if (!p1Name.trim()) { setS1({ err: true, msg: "Name required" }); ok = false }
      if (!p2Name.trim()) { setS2({ err: true, msg: "Name required" }); ok = false }
      if (!ok) return
      if (p1Name.trim().toLowerCase() === p2Name.trim().toLowerCase()) {
        setS2({ err: true, msg: "Must be different from Player 1" }); return
      }
      setPlayers({ p1: { username: p1Name.trim() }, p2: { username: p2Name.trim() } })
      setStep("rules")
    }
  }

  const handleStart = () => {
    const delays = { slow: 1500, medium: 700, fast: 150 }
    navigate("/game?mode=" + mode + "&aiDelay=" + (delays[aiSpeed] || 700))
  }

  const goBack = () => {
    if (step === "setup") setStep("mode")
    if (step === "rules") setStep("setup")
  }

  return (
    <div className="menu-page">
      <div className="menu-bg">
        <div className="bg-orb orb1" />
        <div className="bg-orb orb2" />
        <div className="bg-orb orb3" />
      </div>

      <div className="menu-content">

        {/* ── Mode Selection ── */}
        {step === "mode" && (
          <>
            <div className="menu-header">
              <span className="menu-star">⭐</span>
              <h1>Chinese Checkers</h1>
              <p>Choose a mode to begin</p>
            </div>
            <div className="mode-grid">
              <div className="mode-card mc-hvh" onClick={() => pickMode("human_vs_human")}>
                <span className="mc-icon">👥</span>
                <div className="mc-body"><h2>Human vs Human</h2><p>Two players, same device.</p></div>
                <span className="mc-arrow">→</span>
              </div>
              <div className="mode-card mc-hvai" onClick={() => pickMode("human_vs_ai")}>
                <span className="mc-icon">🧑‍💻</span>
                <div className="mc-body"><h2>Human vs AI</h2><p>Play against Minimax AI.</p></div>
                <span className="mc-arrow">→</span>
              </div>
              <div className="mode-card mc-avai" onClick={() => pickMode("ai_vs_ai")}>
                <span className="mc-icon">🤖</span>
                <div className="mc-body"><h2>AI vs AI</h2><p>Watch two AIs compete.</p></div>
                <span className="mc-arrow">→</span>
              </div>
            </div>
          </>
        )}

        {/* ── Setup ── */}
        {step === "setup" && (
          <div className="setup-card">
            <button className="back-btn" onClick={goBack}>← Back</button>
            <div className="setup-header">
              <span className="setup-icon">
                {mode === "human_vs_human" ? "👥" : mode === "human_vs_ai" ? "🧑‍💻" : "🤖"}
              </span>
              <h2>{mode === "human_vs_human" ? "Player Setup" : mode === "human_vs_ai" ? "Your Name" : "AI vs AI Setup"}</h2>
              <p>{mode === "ai_vs_ai" ? "Pick a speed and start" : "Enter player names to continue"}</p>
            </div>

            <form onSubmit={handleContinue} className="setup-form">
              {mode === "human_vs_human" && (
                <div className="two-col">
                  <PlayerForm label="Player 1" color="#9575cd" value={p1Name} onChange={setP1Name} status={s1} />
                  <PlayerForm label="Player 2" color="#26a69a" value={p2Name} onChange={setP2Name} status={s2} />
                </div>
              )}

              {mode === "human_vs_ai" && (
                <div className="one-col">
                  <PlayerForm label="Your Name" color="#9575cd" value={p1Name} onChange={setP1Name} status={s1} />
                  <div className="ai-badge">🤖 AI will be your opponent</div>
                </div>
              )}

              {mode === "ai_vs_ai" && (
                <div className="speed-section">
                  <p className="speed-title">AI Move Speed</p>
                  <div className="speed-row">
                    {[
                      { k: "slow",   l: "🐢 Slow",   h: "1.5s / move" },
                      { k: "medium", l: "🚶 Medium", h: "0.7s / move" },
                      { k: "fast",   l: "⚡ Fast",   h: "0.15s / move" },
                    ].map(s => (
                      <button key={s.k} type="button"
                        className={"spd-btn" + (aiSpeed === s.k ? " spd-active" : "")}
                        onClick={() => setAiSpeed(s.k)}>
                        <span>{s.l}</span><small>{s.h}</small>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" className="continue-btn">Continue →</button>
            </form>
          </div>
        )}
      </div>

      {step === "rules" && <RulesModal mode={mode} onStart={handleStart} onBack={goBack} />}
    </div>
  )
}
