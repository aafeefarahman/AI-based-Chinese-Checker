import { useEffect, useState } from 'react'
import './RulesModal.css'

const RULES = {
  human_vs_human: {
    title: 'Human vs Human',
    icon: '👥',
    sections: [
      {
        heading: 'Gameplay',
        items: ['Two players take turns moving their pieces', 'Player 1 (Purple) moves first'],
      },
      {
        heading: 'Moves',
        items: [
          'Single step to any adjacent empty hole',
          'Jump over any adjacent piece into the empty hole beyond',
          'Chain multiple jumps in one turn',
          'No pieces are captured or removed',
          'Only one piece per turn',
        ],
      },
      {
        heading: 'Win Condition',
        items: ['Move all 10 pieces into the opponent\'s starting triangle'],
      },
      {
        heading: 'Lose Condition',
        items: ['The other player fills their goal triangle first'],
      },
      {
        heading: 'Tie Condition',
        items: ['Maximum move limit reached (150 turns)', 'No progress made for several turns'],
      },
    ],
  },
  human_vs_ai: {
    title: 'Human vs AI',
    icon: '👤🤖',
    sections: [
      {
        heading: 'Gameplay',
        items: ['You (Purple) play against the AI (Green)', 'You move first'],
      },
      {
        heading: 'Moves',
        items: [
          'Single step to any adjacent empty hole',
          'Jump over any piece into the empty hole beyond',
          'Chain multiple jumps in one turn',
          'No pieces are captured',
          'Only one piece per turn',
        ],
      },
      {
        heading: 'AI Strategy',
        items: ['AI uses Minimax algorithm with heuristic evaluation', 'AI looks 3 moves ahead'],
      },
      {
        heading: 'Win Condition',
        items: ['First player to fill the opponent\'s triangle wins'],
      },
      {
        heading: 'Tie Condition',
        items: ['Maximum move limit reached', 'Repeated board states detected (loop)'],
      },
    ],
  },
  ai_vs_ai: {
    title: 'AI vs AI',
    icon: '🤖🤖',
    sections: [
      {
        heading: 'Gameplay',
        items: ['Both players are controlled by AI', 'Game runs automatically — sit back and watch'],
      },
      {
        heading: 'Moves',
        items: [
          'Same movement rules apply',
          'AI evaluates positions using Minimax + heuristics',
        ],
      },
      {
        heading: 'Win Condition',
        items: ['AI that fills the opponent\'s triangle first wins'],
      },
      {
        heading: 'Tie Condition',
        items: [
          'Repeated moves detected (loop)',
          'Maximum move limit reached',
          'No positional improvement (stagnation)',
        ],
      },
    ],
  },
}

const COMMON = [
  'Single-step moves allowed',
  'Jump moves allowed',
  'Multiple jumps allowed in one turn',
  'No capturing of pieces',
  'Only one piece can be moved per turn',
]

export default function RulesModal({ mode, onStart, onBack }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 30) }, [])

  const rules = RULES[mode]
  if (!rules) return null

  return (
    <div className={`rules-overlay ${visible ? 'visible' : ''}`}>
      <div className="rules-modal">
        {onBack && (
          <button className="rules-back-btn" onClick={onBack}>← Back</button>
        )}
        <div className="rules-header">
          <span className="rules-icon">{rules.icon}</span>
          <h2>{rules.title}</h2>
          <p>Read the rules before you start</p>
        </div>

        <div className="rules-body">
          {rules.sections.map(s => (
            <div className="rules-section" key={s.heading}>
              <div className="rules-section-title">{s.heading}</div>
              <ul>
                {s.items.map((item, i) => (
                  <li key={i}><span className="rules-dot">▸</span>{item}</li>
                ))}
              </ul>
            </div>
          ))}

          <div className="rules-section common-section">
            <div className="rules-section-title">Common Rules (All Modes)</div>
            <ul>
              {COMMON.map((item, i) => (
                <li key={i}><span className="rules-dot">▸</span>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <button className="rules-start-btn" onClick={onStart}>
          Start Game →
        </button>
      </div>
    </div>
  )
}
