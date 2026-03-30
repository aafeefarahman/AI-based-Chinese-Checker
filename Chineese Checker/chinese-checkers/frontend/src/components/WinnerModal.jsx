import React, { useEffect, useState } from 'react'
import './WinnerModal.css'

const CONFETTI_COLORS = ['#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#60a5fa']

function Confetti() {
  const pieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    size: 6 + Math.random() * 8,
  }))

  return (
    <div className="confetti-container">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function WinnerModal({ winner, mode, user, p1Name, p2Name, stepCount, onRestart, onMenu }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  const name1 = p1Name || user?.username || 'Player 1'
  const name2 = p2Name || 'AI'

  const winnerName = winner === 0 ? name1 : name2
  const isHumanWin = mode !== 'ai_vs_ai' && winner === 0
  const isAIWin    = mode === 'human_vs_ai' && winner === 1

  const title    = `🎉 ${winnerName} Wins!`
  const subtitle = isHumanWin ? 'Brilliant strategy!' : isAIWin ? 'Better luck next time!' : 'What a match!'

  const winnerColor = winner === 0 ? '#a78bfa' : '#34d399'

  return (
    <div className={`winner-overlay ${visible ? 'visible' : ''}`}>
      <Confetti />
      <div className="winner-modal">
        <div className="winner-glow" style={{ background: winnerColor }} />
        <div className="winner-icon">{isHumanWin ? '🏆' : isAIWin ? '🤖' : '⭐'}</div>
        <h2 className="winner-title" style={{ color: winnerColor }}>{title}</h2>
        <p className="winner-subtitle">{subtitle}</p>
        <div className="winner-stats">
          <div className="stat-item">
            <div className="stat-val">{stepCount}</div>
            <div className="stat-label">Total Moves</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-val" style={{ color: winnerColor }}>{winnerName}</div>
            <div className="stat-label">Winner</div>
          </div>
        </div>
        <div className="winner-actions">
          <button className="btn-play-again" onClick={onRestart}>
            Play Again
          </button>
          <button className="btn-menu" onClick={onMenu}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  )
}
