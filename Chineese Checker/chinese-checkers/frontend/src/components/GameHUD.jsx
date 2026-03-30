import React from 'react'
import './GameHUD.css'

const PLAYER_INFO = {
  0: { name: 'Player 1', icon: '🟣', color: '#a78bfa', label: 'Purple' },
  1: { name: 'AI', icon: '🤖', color: '#34d399', label: 'Green' },
}

const AI_INFO = {
  0: { name: 'AI Blue', icon: '🤖', color: '#a78bfa' },
  1: { name: 'AI Red', icon: '🤖', color: '#34d399' },
}

export default function GameHUD({
  mode, currentPlayer, stepCount, user, loading,
  paused, onRestart, onUndo, onPause, onBack
}) {
  const isAIvsAI = mode === 'ai_vs_ai'
  const p0 = isAIvsAI ? AI_INFO[0] : PLAYER_INFO[0]
  const p1 = isAIvsAI ? AI_INFO[1] : { ...PLAYER_INFO[1], name: 'AI' }

  return (
    <div className="hud">
      {/* Top bar */}
      <div className="hud-topbar">
        <button className="hud-btn" onClick={onBack} title="Back to menu">
          ‹
        </button>
        <div className="hud-title">
          {isAIvsAI ? '🤖 AI vs AI' : '🧑 vs 🤖'}
        </div>
        <div className="hud-controls">
          <button className="hud-btn" onClick={onUndo} title="Restart">↺</button>
          <button className="hud-btn" onClick={onPause} title={paused ? 'Resume' : 'Pause'}>
            {paused ? '▶' : '⏸'}
          </button>
          <button className="hud-btn hud-restart" onClick={onRestart} title="New game">⟳</button>
        </div>
      </div>

      {/* Player status bar */}
      <div className="hud-players">
        <div className={`player-card ${currentPlayer === 0 ? 'active' : ''}`}>
          <div className="pc-avatar" style={{ background: p0.color + '33', borderColor: p0.color }}>
            {isAIvsAI ? '🤖' : '🧑'}
          </div>
          <div className="pc-info">
            <div className="pc-name" style={{ color: p0.color }}>
              {isAIvsAI ? 'AI 1' : user?.username || 'You'}
            </div>
            <div className="pc-label">Purple</div>
          </div>
          {currentPlayer === 0 && (
            <div className="turn-indicator" style={{ background: p0.color }}>
              {loading ? '⏳' : '▶'}
            </div>
          )}
        </div>

        <div className="step-counter">
          <div className="step-num">{stepCount}</div>
          <div className="step-label">moves</div>
        </div>

        <div className={`player-card ${currentPlayer === 1 ? 'active' : ''}`}>
          {currentPlayer === 1 && (
            <div className="turn-indicator" style={{ background: p1.color }}>
              {loading ? '⏳' : '▶'}
            </div>
          )}
          <div className="pc-info" style={{ textAlign: 'right' }}>
            <div className="pc-name" style={{ color: p1.color }}>AI</div>
            <div className="pc-label">Green</div>
          </div>
          <div className="pc-avatar" style={{ background: p1.color + '33', borderColor: p1.color }}>
            🤖
          </div>
        </div>
      </div>

      {paused && (
        <div className="paused-banner">⏸ Game Paused — tap resume to continue</div>
      )}
    </div>
  )
}
