import { useMemo } from 'react'
import { ROW_COLS, getZone, ZONE_STYLE } from '../utils/boardConstants'
import './Board.css'

/**
 * Board — pure display component
 *
 * Hex geometry (equilateral, all 6 neighbors equidistant = D):
 *   D     = 52px  (cell spacing)
 *   HSTEP = D/2   = 26   → px = col * HSTEP
 *   VSTEP = D*√3/2 ≈ 45  → py = row * VSTEP
 *
 * Portrait canvas: W = 12*26 + 2*PAD, H = 16*45 + 2*PAD
 * Rotated 90° CCW to produce a wide landscape star.
 */

const D     = 52
const HSTEP = D / 2
const VSTEP = D * Math.sqrt(3) / 2
const R     = 13
const PAD   = 56

const RAW_W = 12 * HSTEP + PAD * 2   // 424
const RAW_H = 16 * VSTEP + PAD * 2   // 832

// After 90° CCW rotation: displayed W = RAW_H, H = RAW_W
const SVG_W = RAW_H
const SVG_H = RAW_W

export default function Board({
  boardData,
  selectedCell,
  validMoves,
  lastMove,
  onCellClick,
  playerName,
  isAIvsAI,
}) {
  const cellMap = useMemo(() => {
    const map = {}
    if (!boardData?.cells) return map
    for (const c of boardData.cells) map[`${c.row},${c.col}`] = c.player
    return map
  }, [boardData])

  const cells = useMemo(() => {
    const list = []
    for (const [rowStr, cols] of Object.entries(ROW_COLS)) {
      const row = parseInt(rowStr)
      for (const col of cols) {
        const px0 = col * HSTEP + PAD
        const py0 = row * VSTEP + PAD
        // 90° CCW: (x,y) → (y, RAW_W - x)
        list.push({ row, col, px: py0, py: RAW_W - px0 })
      }
    }
    return list
  }, [])

  const posMap = useMemo(() => {
    const m = {}
    for (const c of cells) m[`${c.row},${c.col}`] = c
    return m
  }, [cells])

  const isSelected  = (r, c) => selectedCell?.row === r && selectedCell?.col === c
  const isValidMove = (r, c) => validMoves.some(m => m[0] === r && m[1] === c)
  const isLastMove  = (r, c) => {
    if (!lastMove) return false
    return (lastMove[0][0] === r && lastMove[0][1] === c) ||
           (lastMove[1][0] === r && lastMove[1][1] === c)
  }

  const topTip    = posMap['0,4']
  const bottomTip = posMap['16,4']

  return (
    <div className="board-wrap">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="board-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Board background — rich dark slate */}
          <radialGradient id="bg-board" cx="50%" cy="50%" r="70%">
            <stop offset="0%"   stopColor="#2d2850" />
            <stop offset="55%"  stopColor="#231f3d" />
            <stop offset="100%" stopColor="#1a1728" />
          </radialGradient>

          {/* Human marble — vibrant purple */}
          <radialGradient id="m-human" cx="32%" cy="28%" r="68%">
            <stop offset="0%"   stopColor="#f5f3ff" />
            <stop offset="25%"  stopColor="#c4b5fd" />
            <stop offset="65%"  stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#3b0764" />
          </radialGradient>

          {/* AI marble — vibrant emerald */}
          <radialGradient id="m-ai" cx="32%" cy="28%" r="68%">
            <stop offset="0%"   stopColor="#ecfdf5" />
            <stop offset="25%"  stopColor="#6ee7b7" />
            <stop offset="65%"  stopColor="#059669" />
            <stop offset="100%" stopColor="#064e3b" />
          </radialGradient>

          {/* Marble drop shadow */}
          <filter id="f-marble" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.5"/>
          </filter>

          {/* Selected piece glow */}
          <filter id="f-sel" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Valid move glow */}
          <filter id="f-valid" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Last-move amber glow */}
          <filter id="f-last" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Hole inner shadow */}
          <filter id="f-hole" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.4"/>
          </filter>

          {/* CSS animations for valid-move rings */}
          <style>{`
            @keyframes dash-spin {
              to { stroke-dashoffset: -24; }
            }
            @keyframes ring-pulse {
              0%,100% { opacity:1; r:${R + 6}; }
              50%      { opacity:0.6; r:${R + 8}; }
            }
            @keyframes dot-pulse {
              0%,100% { opacity:1; r:5; }
              50%      { opacity:0.7; r:3.5; }
            }
            @keyframes sel-pulse {
              0%,100% { opacity:1; }
              50%      { opacity:0.7; }
            }
            .valid-ring-anim {
              animation: dash-spin 0.7s linear infinite, ring-pulse 1.2s ease-in-out infinite;
            }
            .valid-dot-anim {
              animation: dot-pulse 1.2s ease-in-out infinite;
            }
            .sel-ring-anim {
              animation: sel-pulse 1.5s ease-in-out infinite;
            }
            .marble-g { cursor: pointer; }
            .marble-g:hover .marble-circle {
              filter: url(#f-sel);
            }
          `}</style>
        </defs>

        {/* Board background */}
        <rect x="0" y="0" width={SVG_W} height={SVG_H} rx="24" fill="url(#bg-board)"/>
        <rect x="2" y="2" width={SVG_W - 4} height={SVG_H - 4} rx="22"
          fill="none" stroke="rgba(167,139,250,0.18)" strokeWidth="1.5"/>

        {/* Connection lines */}
        {cells.map(({ row, col, px, py }) =>
          [[row, col + 2], [row + 1, col + 1], [row + 1, col - 1]].map(([nr, nc]) => {
            const nb = posMap[`${nr},${nc}`]
            if (!nb) return null
            return (
              <line key={`l-${row}-${col}-${nr}-${nc}`}
                x1={px} y1={py} x2={nb.px} y2={nb.py}
                stroke="rgba(100,120,180,0.12)" strokeWidth="1"
              />
            )
          })
        )}

        {/* Cells */}
        {cells.map(({ row, col, px, py }) => {
          const key      = `${row},${col}`
          const player   = cellMap[key] ?? null
          const zs       = ZONE_STYLE[getZone(row, col)]
          const selected = isSelected(row, col)
          const valid    = isValidMove(row, col)
          const lastMv   = isLastMove(row, col)
          const hasMarble = player !== null

          return (
            <g key={key}
              onClick={() => onCellClick(row, col)}
              style={{ cursor: (hasMarble || valid) ? 'pointer' : 'default' }}
              className={hasMarble ? 'marble-g' : ''}
            >
              {/* Hole */}
              <circle cx={px} cy={py} r={R + 3}
                fill={zs.hole}
                stroke={zs.stroke}
                strokeWidth="1.5"
                filter="url(#f-hole)"
                opacity="0.9"
              />

              {/* Empty hole inner detail */}
              {!hasMarble && !valid && (
                <circle cx={px} cy={py} r={R - 2}
                  fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.06)" strokeWidth="1"
                />
              )}

              {/* Last-move amber ring */}
              {lastMv && (
                <circle cx={px} cy={py} r={R + 9}
                  fill="none"
                  stroke="rgba(251,191,36,0.85)"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  filter="url(#f-last)"
                />
              )}

              {/* Valid move — empty cell: animated dashed ring + pulsing dot */}
              {valid && !hasMarble && (
                <>
                  <circle cx={px} cy={py} r={R + 6}
                    fill="rgba(255,224,130,0.2)"
                    stroke="rgba(255,179,0,0.85)"
                    strokeWidth="2.5" strokeDasharray="6 4"
                    filter="url(#f-valid)" className="valid-ring-anim"
                  />
                  <circle cx={px} cy={py} r={5}
                    fill="rgba(255,193,7,0.9)" className="valid-dot-anim"
                  />
                </>
              )}
              {/* Valid move — occupied cell */}
              {valid && hasMarble && (
                <circle cx={px} cy={py} r={R + 8}
                  fill="none" stroke="rgba(255,179,0,0.85)"
                  strokeWidth="2.5" strokeDasharray="6 4"
                  filter="url(#f-valid)" className="valid-ring-anim"
                />
              )}
              {/* Selected piece ring */}
              {selected && (
                <circle cx={px} cy={py} r={R + 8}
                  fill="rgba(255,255,255,0.25)"
                  stroke="rgba(255,255,255,0.95)"
                  strokeWidth="2.5" filter="url(#f-sel)" className="sel-ring-anim"
                />
              )}

              {/* Marble */}
              {hasMarble && (
                <>
                  {/* Marble body */}
                  <circle cx={px} cy={py} r={R}
                    fill={player === 0 ? 'url(#m-human)' : 'url(#m-ai)'}
                    filter="url(#f-marble)"
                    className="marble-circle"
                  />
                  {/* Primary shine */}
                  <circle
                    cx={px - R * 0.28} cy={py - R * 0.32}
                    r={R * 0.34}
                    fill="rgba(255,255,255,0.5)"
                  />
                  {/* Specular highlight */}
                  <circle
                    cx={px - R * 0.1} cy={py - R * 0.52}
                    r={R * 0.15}
                    fill="rgba(255,255,255,0.92)"
                  />
                  {/* Bottom rim reflection */}
                  <ellipse
                    cx={px + R * 0.1} cy={py + R * 0.55}
                    rx={R * 0.35} ry={R * 0.12}
                    fill="rgba(255,255,255,0.12)"
                  />
                </>
              )}
            </g>
          )
        })}

        {topTip && (
          <g>
            <circle cx={topTip.px - 42} cy={topTip.py}
              r={22} fill="#2d2850" stroke="#a78bfa" strokeWidth="2" filter="url(#f-sel)"
            />
            <text x={topTip.px - 42} y={topTip.py + 1}
              textAnchor="middle" fontSize="19" dominantBaseline="middle">
              {isAIvsAI ? '🤖' : '👩'}
            </text>
            <text x={topTip.px - 42} y={topTip.py + 32}
              textAnchor="middle" fontSize="10"
              fontFamily="system-ui, sans-serif" fontWeight="800" fill="#c4b5fd">
              {isAIvsAI ? 'AI One' : (playerName || 'You')}
            </text>
          </g>
        )}
        {bottomTip && (
          <g>
            <circle cx={bottomTip.px + 42} cy={bottomTip.py}
              r={22} fill="#1a2e28" stroke="#34d399" strokeWidth="2" filter="url(#f-sel)"
            />
            <text x={bottomTip.px + 42} y={bottomTip.py + 1}
              textAnchor="middle" fontSize="19" dominantBaseline="middle">
              🤖
            </text>
            <text x={bottomTip.px + 42} y={bottomTip.py + 32}
              textAnchor="middle" fontSize="10"
              fontFamily="system-ui, sans-serif" fontWeight="800" fill="#6ee7b7">
              {isAIvsAI ? 'AI Two' : 'AI'}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
