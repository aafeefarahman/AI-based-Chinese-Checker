import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Board from '../components/Board'
import WinnerModal from '../components/WinnerModal'
import RulesModal from '../components/RulesModal'
import {
  isAITurn,
  getTurnLabel,
  startNewGame,
  fetchValidMoves,
  executeMove,
  executeAIMove,
  HUMAN_PLAYER,
  AI_PLAYER,
} from '../utils/gameController'
import './GamePage.css'

const GAME_ID    = 'game_' + Math.random().toString(36).slice(2, 8)
const TURN_LIMIT = 150   // tie after this many total moves
const TURN_TIME  = 30    // seconds per turn (human modes)

export default function GamePage({ players }) {
  const [searchParams] = useSearchParams()
  const mode    = searchParams.get('mode') || 'human_vs_ai'
  const aiDelay = parseInt(searchParams.get('aiDelay') || '700')
  const navigate = useNavigate()

  const isAIvsAI  = mode === 'ai_vs_ai'
  const isHvH     = mode === 'human_vs_human'
  const isHvAI    = mode === 'human_vs_ai'

  const p1Name = players?.p1?.username || 'Player 1'
  const p2Name = isAIvsAI ? 'AI Two' : isHvH ? (players?.p2?.username || 'Player 2') : 'AI'

  const [gameState,    setGameState]    = useState(null)
  const [selectedCell, setSelectedCell] = useState(null)
  const [validMoves,   setValidMoves]   = useState([])
  const [lastMove,     setLastMove]     = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [paused,       setPaused]       = useState(false)
  const [showRules,    setShowRules]    = useState(false)
  const [tie,          setTie]          = useState(false)
  const [turnTime,     setTurnTime]     = useState(TURN_TIME)

  const aiTimerRef   = useRef(null)
  const turnTimerRef = useRef(null)

  // ── Init ──────────────────────────────────────────────
  useEffect(() => {
    initGame()
    return () => { clearTimeout(aiTimerRef.current); clearInterval(turnTimerRef.current) }
  }, []) // eslint-disable-line

  // ── AI trigger ────────────────────────────────────────
  useEffect(() => {
    clearTimeout(aiTimerRef.current)
    if (!gameState || gameState.winner != null || paused || loading || tie) return
    if (isAITurn(gameState, mode)) {
      aiTimerRef.current = setTimeout(triggerAI, aiDelay)
    }
    return () => clearTimeout(aiTimerRef.current)
  }, [gameState?.current_player, gameState?.step_count, paused, loading]) // eslint-disable-line

  // ── Turn timer (human modes only) ─────────────────────
  useEffect(() => {
    clearInterval(turnTimerRef.current)
    if (!gameState || gameState.winner != null || tie || paused || isAIvsAI) return
    if (isAITurn(gameState, mode)) return  // don't count down on AI turn

    setTurnTime(TURN_TIME)
    turnTimerRef.current = setInterval(() => {
      setTurnTime(t => {
        if (t <= 1) {
          clearInterval(turnTimerRef.current)
          // Auto-skip turn on timeout
          skipTurn()
          return TURN_TIME
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(turnTimerRef.current)
  }, [gameState?.current_player, gameState?.step_count, paused]) // eslint-disable-line

  // ── Tie check ─────────────────────────────────────────
  useEffect(() => {
    if (gameState?.step_count >= TURN_LIMIT) setTie(true)
  }, [gameState?.step_count])

  const initGame = async () => {
    clearTimeout(aiTimerRef.current)
    clearInterval(turnTimerRef.current)
    setLoading(false); setSelectedCell(null)
    setValidMoves([]); setLastMove(null)
    setTie(false); setTurnTime(TURN_TIME)
    try {
      const state = await startNewGame(GAME_ID, mode)
      setGameState(state)
    } catch (e) { console.error('initGame failed:', e) }
  }

  const skipTurn = () => {
    setGameState(prev => prev ? {
      ...prev,
      current_player: 1 - prev.current_player,
      step_count: prev.step_count + 1,
    } : prev)
    setSelectedCell(null)
    setValidMoves([])
  }

  const triggerAI = async () => {
    if (loading) return
    setLoading(true)
    try {
      const data = await executeAIMove(GAME_ID, 3)
      setLastMove(data.move)
      setGameState(data)
    } catch (e) { console.error('AI move failed:', e) }
    finally { setLoading(false) }
  }

  // ── Human click ───────────────────────────────────────
  const handleCellClick = useCallback(async (row, col) => {
    if (!gameState || loading || paused || isAIvsAI || tie) return
    if (gameState.winner != null) return

    // In HvH both players are human; in HvAI only player 0 is human
    const cp = gameState.current_player
    if (isHvAI && cp !== HUMAN_PLAYER) return

    const cell = gameState.board.cells.find(c => c.row === row && c.col === col)
    const isOwn = cell?.player === cp

    if (isOwn) {
      if (selectedCell?.row === row && selectedCell?.col === col) {
        setSelectedCell(null); setValidMoves([]); return
      }
      setSelectedCell({ row, col })
      try {
        const moves = await fetchValidMoves(GAME_ID, row, col)
        setValidMoves(moves)
      } catch (e) { console.error(e) }
      return
    }

    if (selectedCell && validMoves.some(m => m[0] === row && m[1] === col)) {
      setLoading(true)
      clearInterval(turnTimerRef.current)
      try {
        const data = await executeMove(GAME_ID, [selectedCell.row, selectedCell.col], [row, col])
        setLastMove([[selectedCell.row, selectedCell.col], [row, col]])
        setGameState(data)
        setSelectedCell(null); setValidMoves([])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
  }, [gameState, selectedCell, validMoves, loading, paused, isAIvsAI, isHvAI, mode, tie])

  // ── Derived ───────────────────────────────────────────
  const cp          = gameState?.current_player
  const p1Active    = cp === 0 && !gameState?.winner && !tie
  const p2Active    = cp === 1 && !gameState?.winner && !tie
  const turnLabel   = getTurnLabel(gameState, mode, p1Name)
  const isHumanTurn = isHvH || (isHvAI && cp === HUMAN_PLAYER)
  const timerPct    = (turnTime / TURN_TIME) * 100
  const timerColor  = turnTime > 10 ? '#22c55e' : turnTime > 5 ? '#f59e0b' : '#ef4444'

  if (!gameState) return (
    <div className="game-loading">
      <div className="loading-spinner"/>
      <p>Loading board...</p>
    </div>
  )

  return (
    <div className="game-page">

      {/* Top bar */}
      <header className="game-topbar">
        <button className="topbar-btn" onClick={() => navigate('/')}>← Menu</button>
        <div className="topbar-title">
          <span className="topbar-star">⭐</span>
          Chinese Checkers
          <span className="topbar-mode">
            {isAIvsAI ? 'AI vs AI' : isHvH ? 'Human vs Human' : 'Human vs AI'}
          </span>
        </div>
        <div className="topbar-controls">
          <button className="topbar-btn" onClick={() => setShowRules(true)}>📜 Rules</button>
          <button className="topbar-btn" onClick={initGame}>↺ Restart</button>
          <button className="topbar-btn" onClick={() => setPaused(p => !p)}>
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
        </div>
      </header>

      <main className="game-main">

        {/* Left panel — Player 1 / Purple */}
        <aside className="side-panel left-panel">
          <div className={`player-panel ${p1Active ? 'active-panel' : ''}`}>
            <div className="pp-avatar purple-avatar">
              {isAIvsAI ? '🤖' : '👤'}
            </div>
            <div className="pp-name">{isAIvsAI ? 'AI One' : p1Name}</div>
            <div className="pp-label">Purple · Top</div>
            {p1Active && (
              <div className="pp-turn-badge">
                {loading && isAIvsAI ? 'Thinking...' : isAIvsAI ? 'AI Turn' : 'Your Turn'}
              </div>
            )}
          </div>

          <div className="panel-divider"/>

          <div className="info-block">
            <div className="info-label">Goal</div>
            <div className="info-value">Reach bottom ↓</div>
          </div>
          <div className="info-block">
            <div className="info-label">Color</div>
            <div className="info-value" style={{ color: '#8b5cf6', fontWeight: 800 }}>Purple</div>
          </div>

          {/* Turn timer — only show on human's turn */}
          {!isAIvsAI && p1Active && isHumanTurn && (
            <div className="timer-block">
              <div className="timer-label">Time Left</div>
              <div className="timer-bar-wrap">
                <div className="timer-bar" style={{ width: `${timerPct}%`, background: timerColor }}/>
              </div>
              <div className="timer-num" style={{ color: timerColor }}>{turnTime}s</div>
            </div>
          )}
        </aside>

        {/* Board */}
        <div className="board-center">
          {paused && (
            <div className="paused-overlay">
              <div className="paused-box">
                <div style={{ fontSize: 40 }}>⏸</div>
                <div>Game Paused</div>
                <button onClick={() => setPaused(false)}>Resume</button>
              </div>
            </div>
          )}
          <Board
            boardData={gameState.board}
            selectedCell={selectedCell}
            validMoves={validMoves}
            lastMove={lastMove}
            onCellClick={handleCellClick}
            playerName={p1Name}
            isAIvsAI={isAIvsAI}
          />
        </div>

        {/* Right panel — Player 2 / Green */}
        <aside className="side-panel right-panel">
          <div className={`player-panel ${p2Active ? 'active-panel ai-active' : ''}`}>
            <div className="pp-avatar green-avatar">
              {isHvH ? '👤' : '🤖'}
            </div>
            <div className="pp-name">{p2Name}</div>
            <div className="pp-label">Green · Bottom</div>
            {p2Active && (
              <div className="pp-turn-badge ai-badge">
                {loading ? 'Thinking...' : isHvH ? 'Your Turn' : 'AI Turn'}
              </div>
            )}
          </div>

          <div className="panel-divider"/>

          <div className="info-block">
            <div className="info-label">Goal</div>
            <div className="info-value">Reach top ↑</div>
          </div>
          <div className="info-block">
            <div className="info-label">Color</div>
            <div className="info-value" style={{ color: '#22c55e', fontWeight: 800 }}>Green</div>
          </div>

          {/* Turn timer for P2 in HvH */}
          {isHvH && p2Active && (
            <div className="timer-block">
              <div className="timer-label">Time Left</div>
              <div className="timer-bar-wrap">
                <div className="timer-bar" style={{ width: `${timerPct}%`, background: timerColor }}/>
              </div>
              <div className="timer-num" style={{ color: timerColor }}>{turnTime}s</div>
            </div>
          )}

          <div className="panel-divider"/>

          <div className="info-block">
            <div className="info-label">Total Moves</div>
            <div className="info-value big-value">{gameState.step_count}</div>
          </div>
          <div className="info-block">
            <div className="info-label">Turn Limit</div>
            <div className="info-value">{gameState.step_count} / {TURN_LIMIT}</div>
          </div>
          <div className="info-block">
            <div className="info-label">Current Turn</div>
            <div className="info-value turn-text">{turnLabel}</div>
          </div>
        </aside>
      </main>

      {/* Tie modal */}
      {tie && !gameState.winner && (
        <div className="tie-overlay">
          <div className="tie-modal">
            <div style={{ fontSize: 52 }}>🤝</div>
            <h2>It's a Tie!</h2>
            <p>Move limit of {TURN_LIMIT} reached — no winner this time.</p>
            <div className="winner-actions">
              <button className="btn-play-again" onClick={initGame}>Play Again</button>
              <button className="btn-menu" onClick={() => navigate('/')}>Main Menu</button>
            </div>
          </div>
        </div>
      )}

      {/* Winner modal */}
      {gameState.winner != null && (
        <WinnerModal
          winner={gameState.winner}
          mode={mode}
          user={players?.p1}
          p1Name={p1Name}
          p2Name={p2Name}
          stepCount={gameState.step_count}
          onRestart={initGame}
          onMenu={() => navigate('/')}
        />
      )}

      {/* Rules modal (in-game) */}
      {showRules && (
        <RulesModal mode={mode} onStart={() => setShowRules(false)} />
      )}
    </div>
  )
}
