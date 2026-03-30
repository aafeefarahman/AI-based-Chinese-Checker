/**
 * Game Controller — turn handling, ownership validation, game flow
 * Keeps all game logic OUT of UI components
 */
import axios from 'axios'

export const HUMAN_PLAYER = 0
export const AI_PLAYER    = 1

/**
 * Returns true if it's the human's turn to move
 */
export function isHumanTurn(gameState, mode) {
  if (!gameState) return false
  if (mode === 'ai_vs_ai') return false
  return gameState.current_player === HUMAN_PLAYER
}

/**
 * Returns true if it's the AI's turn
 * In human_vs_human mode, AI never plays
 */
export function isAITurn(gameState, mode) {
  if (!gameState) return false
  if (mode === 'human_vs_human') return false
  if (mode === 'ai_vs_ai') return true
  return gameState.current_player === AI_PLAYER
}

/**
 * Validates that a clicked piece belongs to the current human player
 */
export function isOwnPiece(cell, gameState) {
  if (!cell || !gameState) return false
  return cell.player === HUMAN_PLAYER && gameState.current_player === HUMAN_PLAYER
}

/**
 * Returns current turn label string
 */
export function getTurnLabel(gameState, mode, playerName) {
  if (!gameState) return ''
  if (gameState.winner !== null && gameState.winner !== undefined) return 'Game Over'
  if (mode === 'ai_vs_ai') return `AI ${gameState.current_player + 1}'s Turn`
  return gameState.current_player === HUMAN_PLAYER
    ? `${playerName}'s Turn`
    : "AI's Turn"
}

/**
 * Start a new game — returns game state or throws
 */
export async function startNewGame(gameId, mode) {
  const res = await axios.post('/api/game/new', { mode, game_id: gameId })
  return res.data
}

/**
 * Fetch valid moves for a piece
 */
export async function fetchValidMoves(gameId, row, col) {
  const res = await axios.post('/api/game/moves', { game_id: gameId, row, col })
  return res.data.moves
}

/**
 * Execute a human move — returns updated game state or throws
 */
export async function executeMove(gameId, from, to) {
  const res = await axios.post('/api/game/move', { game_id: gameId, from, to })
  return res.data
}

/**
 * Execute an AI move — returns updated game state + move or throws
 */
export async function executeAIMove(gameId, depth = 3) {
  const res = await axios.post('/api/game/ai_move', { game_id: gameId, depth })
  return res.data
}
