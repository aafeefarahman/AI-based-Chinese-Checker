/**
 * Chinese Checkers Board Constants
 *
 * Coordinate system: row/col grid where cols are always even or always odd per row.
 * Col step = 2 between adjacent cells in the same row.
 *
 * True hex geometry pixel mapping:
 *   S  = base spacing unit (px per col-index unit)
 *   px = col * S
 *   py = row * S * (√3 / 2)
 *
 * With col step=2 between neighbors:
 *   horizontal gap  = 2 * S
 *   diagonal gap    = sqrt((2S)² - (S*√3/2 * 1)²) ... actually:
 *   diagonal neighbors differ by (±1 row, ±1 col)
 *   Δx = 1*S, Δy = 1*S*(√3/2)  → dist = S*√(1 + 3/4) = S*√(7/4) ≠ 2S
 *
 * To get equilateral triangles (all 6 neighbors equidistant = D):
 *   horizontal neighbors: Δcol=2 → Δx = 2S  → D = 2S
 *   diagonal neighbors:   Δcol=1, Δrow=1 → Δx=S, Δy=S*(√3/2)
 *   dist = sqrt(S² + S²*3/4) = S*sqrt(7/4)  ← NOT equal to 2S
 *
 * Fix: use separate HSTEP and VSTEP derived from equilateral constraint:
 *   HSTEP = D/2  (half horizontal gap, since col step=2)
 *   VSTEP = D * (√3/2)  (row gap = height of equilateral triangle with side D)
 *   → HSTEP = D/2, VSTEP = D*0.866
 *   → px = col * HSTEP,  py = row * VSTEP
 *
 * With D=52 (cell diameter):
 *   HSTEP = 26,  VSTEP = 45
 */

// Full 121-node Chinese Checkers board
// Each entry: row → array of col indices
export const ROW_COLS = {
  0:  [4],
  1:  [3, 5],
  2:  [2, 4, 6],
  3:  [1, 3, 5, 7],
  4:  [0, 2, 4, 6, 8, 10, 12],
  5:  [1, 3, 5, 7, 9, 11],
  6:  [2, 4, 6, 8, 10],
  7:  [3, 5, 7, 9],
  8:  [4, 6, 8],
  9:  [3, 5, 7, 9],
  10: [2, 4, 6, 8, 10],
  11: [1, 3, 5, 7, 9, 11],
  12: [0, 2, 4, 6, 8, 10, 12],
  13: [1, 3, 5, 7],
  14: [2, 4, 6],
  15: [3, 5],
  16: [4],
}

// Player home rows
export const PLAYER_HOME = {
  0: [0, 1, 2, 3],       // top triangle — Human
  1: [13, 14, 15, 16],   // bottom triangle — AI
}

export const PLAYER_COLORS = {
  0: { primary: '#8b5cf6', light: '#c4b5fd', dark: '#5b21b6', name: 'Purple' },
  1: { primary: '#22c55e', light: '#bbf7d0', dark: '#15803d', name: 'Green'  },
}

/**
 * Zone classification for coloring the 6 arms + center.
 *
 * Central hexagon col bounds per row (cells inside these bounds = center):
 *   rows 4,12: cols [4..8]
 *   rows 5,11: cols [3..9]
 *   rows 6,10: cols [4..8]
 *   rows 7,9:  cols [3..9]
 *   row  8:    cols [4..8]
 */
const CENTER_BOUNDS = {
  4:  [4, 8],
  5:  [3, 9],
  6:  [4, 8],
  7:  [3, 9],
  8:  [4, 8],
  9:  [3, 9],
  10: [4, 8],
  11: [3, 9],
  12: [4, 8],
}

export function getZone(row, col) {
  if (row <= 3)  return 'top'
  if (row >= 13) return 'bottom'
  const [cMin, cMax] = CENTER_BOUNDS[row]
  if (col < cMin) return row <= 8 ? 'top-left'     : 'bottom-left'
  if (col > cMax) return row <= 8 ? 'top-right'    : 'bottom-right'
  return 'center'
}

export const ZONE_STYLE = {
  'top':          { hole: '#4c1d95', stroke: '#7c3aed' },
  'bottom':       { hole: '#064e3b', stroke: '#059669' },
  'top-left':     { hole: '#831843', stroke: '#be185d' },
  'top-right':    { hole: '#7c2d12', stroke: '#c2410c' },
  'bottom-left':  { hole: '#7f1d1d', stroke: '#b91c1c' },
  'bottom-right': { hole: '#134e4a', stroke: '#0f766e' },
  'center':       { hole: '#312e5a', stroke: '#6366f1' },
}
